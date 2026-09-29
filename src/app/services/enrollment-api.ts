import { API_ENDPOINTS, buildApiUrl } from "@/app/config/api";

import type {
  EnrollmentActivationStatusResponse,
  EnrollmentChallengeRequest,
  EnrollmentChallengeResponse,
  EnrollmentConsentDocument,
  EnrollmentConsentResponse,
  EnrollmentIdentityRequest,
  EnrollmentIdentityResponse,
  EnrollmentInvitationAcceptResponse,
  EnrollmentNotificationPreferenceRequest,
  EnrollmentNotificationPreferenceResponse,
  EnrollmentSessionResponse,
  EnrollmentTopologyResponse,
  EnrollmentVerificationResponse,
  EnrollmentWorkspaceSessionResponse,
  ExistingIdentityProofRequest,
  ExistingIdentityProofRequestedResponse,
  ExistingIdentityProofVerifyRequest,
  ExistingIdentityProofVerifiedResponse,
  PublicProgramEnrollmentStartResponse,
} from "@/app/types/enrollment";

import {
  clearEnrollmentSession,
  getEnrollmentAccessToken,
  storeEnrollmentSession,
} from "@/app/utils/enrollment-session";

interface FastApiErrorBody {
  detail?: string | Array<{ msg?: string }>;
  message?: string;
  error?: string;
}

interface EnrollmentRequestOptions extends RequestInit {
  authenticated?: boolean;

  /**
   * Most authenticated 401 responses mean the enrollment bearer is no
   * longer valid and the local session should be cleared.
   *
   * Some endpoints, such as identity-proof verification, deliberately use
   * 401 for an incorrect one-time code. Those requests must opt out so a
   * mistyped code does not destroy an otherwise valid enrollment session.
   */
  clearSessionOnUnauthorized?: boolean;
}

export class EnrollmentApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "EnrollmentApiError";
    this.status = status;
  }
}

function requestId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `enrollment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function errorMessage(
  body: FastApiErrorBody,
  status: number,
): string {
  if (typeof body.detail === "string") {
    return body.detail;
  }

  if (Array.isArray(body.detail)) {
    const messages = body.detail
      .map((item) => item.msg)
      .filter((item): item is string => Boolean(item));

    if (messages.length) {
      return messages.join(" ");
    }
  }

  if (body.message) {
    return body.message;
  }

  if (body.error) {
    return body.error;
  }

  if (status === 401) {
    return "This secure enrollment session is no longer valid.";
  }

  if (status === 409) {
    return "This step cannot be completed yet.";
  }

  if (status === 429) {
    return "Too many attempts. Please wait before trying again.";
  }

  return "FalilaX could not complete this enrollment step.";
}

async function enrollmentRequest<T>(
  endpoint: string,
  options: EnrollmentRequestOptions = {},
): Promise<T> {
  const {
    authenticated = true,
    clearSessionOnUnauthorized = true,
    ...init
  } = options;

  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");
  headers.set("X-Request-ID", requestId());

  if (init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const token = getEnrollmentAccessToken();

    if (!token) {
      throw new EnrollmentApiError(
        "Your secure enrollment session is unavailable. Reopen your invitation.",
        401,
      );
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(buildApiUrl(endpoint), {
      ...init,
      headers,
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
  } catch {
    throw new EnrollmentApiError(
      "The FalilaX service could not be reached. Check your connection and try again.",
      0,
    );
  }

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => ({}))) as FastApiErrorBody;

    if (
      response.status === 401 &&
      authenticated &&
      clearSessionOnUnauthorized
    ) {
      clearEnrollmentSession();
    }

    throw new EnrollmentApiError(
      errorMessage(body, response.status),
      response.status,
    );
  }

  return (await response.json()) as T;
}

function sessionEndpoint(
  template: string,
  sessionPublicId: string,
): string {
  return template.replace(
    "{session_public_id}",
    encodeURIComponent(sessionPublicId),
  );
}

export async function startPublicProgramEnrollment(
  programCode: string,
): Promise<PublicProgramEnrollmentStartResponse> {
  const response =
    await enrollmentRequest<PublicProgramEnrollmentStartResponse>(
      API_ENDPOINTS.ENROLLMENT_START_PUBLIC_PROGRAM,
      {
        method: "POST",
        authenticated: false,
        body: JSON.stringify({
          program_code: programCode.trim(),
        }),
      },
    );

  storeEnrollmentSession(
    response.session_public_id,
    response.access_token,
  );

  return response;
}

export async function acceptEnrollmentInvitation(
  token: string,
): Promise<EnrollmentInvitationAcceptResponse> {
  const response =
    await enrollmentRequest<EnrollmentInvitationAcceptResponse>(
      API_ENDPOINTS.ENROLLMENT_ACCEPT_INVITATION,
      {
        method: "POST",
        authenticated: false,
        body: JSON.stringify({
          token: token.trim(),
          session_ttl_minutes: 120,
        }),
      },
    );

  storeEnrollmentSession(
    response.session_public_id,
    response.access_token,
  );

  return response;
}

export function getEnrollmentSession(
  sessionPublicId: string,
) {
  return enrollmentRequest<EnrollmentSessionResponse>(
    sessionEndpoint(
      API_ENDPOINTS.ENROLLMENT_SESSION,
      sessionPublicId,
    ),
  );
}

export function recordEnrollmentIdentity(
  sessionPublicId: string,
  payload: EnrollmentIdentityRequest,
) {
  return enrollmentRequest<EnrollmentIdentityResponse>(
    sessionEndpoint(
      API_ENDPOINTS.ENROLLMENT_IDENTITY,
      sessionPublicId,
    ),
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Start ownership proof for an email address that may already belong to
 * an existing subscriber.
 *
 * The backend intentionally uses a non-enumerating response so this
 * function must not attempt to infer whether the email exists.
 */
export function requestExistingIdentityProof(
  sessionPublicId: string,
  payload: ExistingIdentityProofRequest,
) {
  return enrollmentRequest<ExistingIdentityProofRequestedResponse>(
    sessionEndpoint(
      API_ENDPOINTS.ENROLLMENT_IDENTITY_PROOF_REQUEST,
      sessionPublicId,
    ),
    {
      method: "POST",
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
      }),
    },
  );
}

/**
 * Verify the session-bound existing-identity challenge.
 *
 * IMPORTANT:
 * The backend deliberately returns HTTP 401 when the OTP is invalid or
 * expired. That 401 describes the proof attempt, not necessarily the
 * enrollment bearer. Therefore this request must not clear the stored
 * enrollment session on a 401 response.
 */
export function verifyExistingIdentityProof(
  sessionPublicId: string,
  payload: ExistingIdentityProofVerifyRequest,
) {
  return enrollmentRequest<ExistingIdentityProofVerifiedResponse>(
    sessionEndpoint(
      API_ENDPOINTS.ENROLLMENT_IDENTITY_PROOF_VERIFY,
      sessionPublicId,
    ),
    {
      method: "POST",
      clearSessionOnUnauthorized: false,
      body: JSON.stringify({
        challenge_id: payload.challenge_id,
        capability: payload.capability,
        code: payload.code.trim(),
      }),
    },
  );
}

export function issueEnrollmentChallenge(
  sessionPublicId: string,
  payload: EnrollmentChallengeRequest,
) {
  return enrollmentRequest<EnrollmentChallengeResponse>(
    sessionEndpoint(
      API_ENDPOINTS.ENROLLMENT_CHALLENGES,
      sessionPublicId,
    ),
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function verifyEnrollmentChannel(
  sessionPublicId: string,
  verificationId: number | string,
  challenge: string,
) {
  const endpoint = sessionEndpoint(
    API_ENDPOINTS.ENROLLMENT_VERIFY_CHANNEL,
    sessionPublicId,
  ).replace(
    "{verification_id}",
    encodeURIComponent(String(verificationId)),
  );

  return enrollmentRequest<EnrollmentVerificationResponse>(
    endpoint,
    {
      method: "POST",
      body: JSON.stringify({
        challenge: challenge.trim(),
      }),
    },
  );
}

export async function getEnrollmentConsentDocument(
  sessionPublicId: string,
  locale = "en",
) {
  const language = ["en", "es", "fr"].includes(locale)
    ? locale
    : "en";

  const endpoint = sessionEndpoint(
    API_ENDPOINTS.ENROLLMENT_CONSENT_DOCUMENT,
    sessionPublicId,
  );

  try {
    return await enrollmentRequest<EnrollmentConsentDocument>(
      `${endpoint}?locale=${language}`,
    );
  } catch (error) {
    if (
      !(error instanceof EnrollmentApiError) ||
      error.status !== 404 ||
      language === "en"
    ) {
      throw error;
    }

    return enrollmentRequest<EnrollmentConsentDocument>(
      `${endpoint}?locale=en`,
    );
  }
}

export function recordEnrollmentConsent(
  sessionPublicId: string,
  consentDocumentId: number,
) {
  return enrollmentRequest<EnrollmentConsentResponse>(
    sessionEndpoint(
      API_ENDPOINTS.ENROLLMENT_CONSENTS,
      sessionPublicId,
    ),
    {
      method: "POST",
      body: JSON.stringify({
        consent_document_id: consentDocumentId,
        decision: "ACCEPTED",
        evidence: {
          surface: "falilax-enrollment-web",
          affirmative_action: "checkbox_and_submit",
        },
      }),
    },
  );
}

export function recordEnrollmentNotificationPreferences(
  sessionPublicId: string,
  payload: EnrollmentNotificationPreferenceRequest,
) {
  return enrollmentRequest<EnrollmentNotificationPreferenceResponse>(
    sessionEndpoint(
      API_ENDPOINTS.ENROLLMENT_NOTIFICATION_PREFERENCES,
      sessionPublicId,
    ),
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function getEnrollmentNotificationPreferences(
  sessionPublicId: string,
) {
  return enrollmentRequest<EnrollmentNotificationPreferenceResponse>(
    sessionEndpoint(
      API_ENDPOINTS.ENROLLMENT_NOTIFICATION_PREFERENCES,
      sessionPublicId,
    ),
  );
}

export function requestEnrollmentTopology(
  sessionPublicId: string,
) {
  return enrollmentRequest<EnrollmentTopologyResponse>(
    sessionEndpoint(
      API_ENDPOINTS.ENROLLMENT_TOPOLOGY_REQUEST,
      sessionPublicId,
    ),
    {
      method: "POST",
    },
  );
}

export function getEnrollmentActivationStatus(
  sessionPublicId: string,
) {
  return enrollmentRequest<EnrollmentActivationStatusResponse>(
    sessionEndpoint(
      API_ENDPOINTS.ENROLLMENT_ACTIVATION_STATUS,
      sessionPublicId,
    ),
  );
}

export function createEnrollmentWorkspaceSession(
  sessionPublicId: string,
) {
  return enrollmentRequest<EnrollmentWorkspaceSessionResponse>(
    sessionEndpoint(
      API_ENDPOINTS.ENROLLMENT_WORKSPACE_SESSION,
      sessionPublicId,
    ),
    {
      method: "POST",
    },
  );
}

export type {
  EnrollmentIdentityRequest,
  EnrollmentSubscriberType,
} from "@/app/types/enrollment";