import type { EnrollmentWorkspaceSessionResponse } from "@/app/types/enrollment";

const PARTICIPANT_SESSION_KEY = "falilax_participant_workspace_session";

export interface ParticipantBrowserSession {
  accessToken: string;
  expiresAt: number;
  subscriberId: number;
  organizationId: number;
  scopes: string[];
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function storeParticipantSession(
  response: EnrollmentWorkspaceSessionResponse,
): void {
  const target = storage();
  if (!target) throw new Error("Secure browser storage is unavailable.");
  if (
    !response.access_token?.trim()
    || response.token_type !== "bearer"
    || response.expires_in <= 0
    || response.subscriber_id <= 0
    || response.organization_id <= 0
  ) {
    throw new Error("FalilaX returned an invalid participant session.");
  }

  const session: ParticipantBrowserSession = {
    accessToken: response.access_token.trim(),
    expiresAt: Date.now() + response.expires_in * 1000,
    subscriberId: response.subscriber_id,
    organizationId: response.organization_id,
    scopes: [...response.scopes],
  };
  target.setItem(PARTICIPANT_SESSION_KEY, JSON.stringify(session));
}

export function clearParticipantSession(): void {
  storage()?.removeItem(PARTICIPANT_SESSION_KEY);
}

export function getParticipantSession(): ParticipantBrowserSession | null {
  const target = storage();
  const raw = target?.getItem(PARTICIPANT_SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as ParticipantBrowserSession;
    const valid = Boolean(
      session
      && typeof session.accessToken === "string"
      && session.accessToken.trim()
      && Number.isFinite(session.expiresAt)
      && session.expiresAt > Date.now() + 30_000
      && Number.isInteger(session.subscriberId)
      && session.subscriberId > 0
      && Number.isInteger(session.organizationId)
      && session.organizationId > 0
      && Array.isArray(session.scopes),
    );
    if (!valid) {
      target?.removeItem(PARTICIPANT_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    target?.removeItem(PARTICIPANT_SESSION_KEY);
    return null;
  }
}
