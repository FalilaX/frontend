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

function errorMessage(body: FastApiErrorBody, status: number): string {
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail)) {
    const messages = body.detail
      .map((item) => item.msg)
      .filter((item): item is string => Boolean(item));
    if (messages.length) return messages.join(" ");
  }
  if (body.message) return body.message;
  if (body.error) return body.error;
  if (status === 401) return "This secure enrollment session is no longer valid.";
  if (status === 409) return "This step cannot be completed yet.";
  if (status === 429) return "Too many attempts. Please wait before trying again.";
  return "FalilaX could not complete this enrollment step.";
}

async function enrollmentRequest<T>(
  endpoint: string,
  options: RequestInit & { authenticated?: boolean } = {},
): Promise<T> {
  const { authenticated = true, ...init } = options;
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
    const body = (await response.json().catch(() => ({}))) as FastApiErrorBody;
    if (response.status === 401) clearEnrollmentSession();
    throw new EnrollmentApiError(errorMessage(body, response.status), response.status);
  }

  return (await response.json()) as T;
}

function sessionEndpoint(template: string, sessionPublicId: string): string {
  return template.replace("{session_public_id}", encodeURIComponent(sessionPublicId));
}

export async function acceptEnrollmentInvitation(
  token: string,
): Promise<EnrollmentInvitationAcceptResponse> {
  const response = await enrollmentRequest<EnrollmentInvitationAcceptResponse>(
    API_ENDPOINTS.ENROLLMENT_ACCEPT_INVITATION,
    {
      method: "POST",
      authenticated: false,
      body: JSON.stringify({ token: token.trim(), session_ttl_minutes: 120 }),
    },
  );
  storeEnrollmentSession(response.session_public_id, response.access_token);
  return response;
}

export function getEnrollmentSession(sessionPublicId: string) {
  return enrollmentRequest<EnrollmentSessionResponse>(
    sessionEndpoint(API_ENDPOINTS.ENROLLMENT_SESSION, sessionPublicId),
  );
}

export function recordEnrollmentIdentity(
  sessionPublicId: string,
  payload: EnrollmentIdentityRequest,
) {
  return enrollmentRequest<EnrollmentIdentityResponse>(
    sessionEndpoint(API_ENDPOINTS.ENROLLMENT_IDENTITY, sessionPublicId),
    { method: "PUT", body: JSON.stringify(payload) },
  );
}

export function issueEnrollmentChallenge(
  sessionPublicId: string,
  payload: EnrollmentChallengeRequest,
) {
  return enrollmentRequest<EnrollmentChallengeResponse>(
    sessionEndpoint(API_ENDPOINTS.ENROLLMENT_CHALLENGES, sessionPublicId),
    { method: "POST", body: JSON.stringify(payload) },
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
  ).replace("{verification_id}", encodeURIComponent(String(verificationId)));

  return enrollmentRequest<EnrollmentVerificationResponse>(endpoint, {
    method: "POST",
    body: JSON.stringify({ challenge: challenge.trim() }),
  });
}

export function getEnrollmentConsentDocument(sessionPublicId: string) {
  return enrollmentRequest<EnrollmentConsentDocument>(
    sessionEndpoint(API_ENDPOINTS.ENROLLMENT_CONSENT_DOCUMENT, sessionPublicId),
  );
}

export function recordEnrollmentConsent(
  sessionPublicId: string,
  consentDocumentId: number,
) {
  return enrollmentRequest<EnrollmentConsentResponse>(
    sessionEndpoint(API_ENDPOINTS.ENROLLMENT_CONSENTS, sessionPublicId),
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
    sessionEndpoint(API_ENDPOINTS.ENROLLMENT_NOTIFICATION_PREFERENCES, sessionPublicId),
    { method: "PUT", body: JSON.stringify(payload) },
  );
}

export function getEnrollmentNotificationPreferences(sessionPublicId: string) {
  return enrollmentRequest<EnrollmentNotificationPreferenceResponse>(
    sessionEndpoint(API_ENDPOINTS.ENROLLMENT_NOTIFICATION_PREFERENCES, sessionPublicId),
  );
}

export function requestEnrollmentTopology(sessionPublicId: string) {
  return enrollmentRequest<EnrollmentTopologyResponse>(
    sessionEndpoint(API_ENDPOINTS.ENROLLMENT_TOPOLOGY_REQUEST, sessionPublicId),
    { method: "POST" },
  );
}

export function getEnrollmentActivationStatus(sessionPublicId: string) {
  return enrollmentRequest<EnrollmentActivationStatusResponse>(
    sessionEndpoint(API_ENDPOINTS.ENROLLMENT_ACTIVATION_STATUS, sessionPublicId),
  );
}

export function createEnrollmentWorkspaceSession(sessionPublicId: string) {
  return enrollmentRequest<EnrollmentWorkspaceSessionResponse>(
    sessionEndpoint(API_ENDPOINTS.ENROLLMENT_WORKSPACE_SESSION, sessionPublicId),
    { method: "POST" },
  );
}

export type {
  EnrollmentIdentityRequest,
  EnrollmentSubscriberType,
} from "@/app/types/enrollment";
