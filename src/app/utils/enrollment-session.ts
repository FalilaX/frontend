const ENROLLMENT_ACCESS_TOKEN_KEY = "falilax_enrollment_session_token";
const ENROLLMENT_PUBLIC_ID_KEY = "falilax_enrollment_session_public_id";
const ENROLLMENT_CONTEXT_KEY = "falilax_enrollment_context";

export const ENROLLMENT_SESSION_CHANGED_EVENT =
  "falilax:enrollment-session-changed";

export interface EnrollmentBrowserContext {
  email?: string;
  phone?: string;
  verificationChannel?: "EMAIL" | "SMS" | "WHATSAPP";
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getEnrollmentAccessToken(): string | null {
  return storage()?.getItem(ENROLLMENT_ACCESS_TOKEN_KEY)?.trim() || null;
}

export function getEnrollmentSessionPublicId(): string | null {
  return storage()?.getItem(ENROLLMENT_PUBLIC_ID_KEY)?.trim() || null;
}

export function storeEnrollmentSession(
  sessionPublicId: string,
  accessToken: string,
): void {
  const id = sessionPublicId.trim();
  const token = accessToken.trim();

  if (!id || !token) {
    throw new Error("A complete enrollment session is required.");
  }

  const target = storage();
  if (!target) return;

  target.setItem(ENROLLMENT_PUBLIC_ID_KEY, id);
  target.setItem(ENROLLMENT_ACCESS_TOKEN_KEY, token);
  window.dispatchEvent(new Event(ENROLLMENT_SESSION_CHANGED_EVENT));
}

export function getEnrollmentBrowserContext(): EnrollmentBrowserContext {
  const raw = storage()?.getItem(ENROLLMENT_CONTEXT_KEY);
  if (!raw) return {};

  try {
    const value = JSON.parse(raw) as EnrollmentBrowserContext;
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

export function storeEnrollmentBrowserContext(
  context: EnrollmentBrowserContext,
): void {
  const target = storage();
  if (!target) return;
  target.setItem(ENROLLMENT_CONTEXT_KEY, JSON.stringify(context));
}

export function clearEnrollmentSession(): void {
  const target = storage();
  if (!target) return;

  target.removeItem(ENROLLMENT_ACCESS_TOKEN_KEY);
  target.removeItem(ENROLLMENT_PUBLIC_ID_KEY);
  target.removeItem(ENROLLMENT_CONTEXT_KEY);
  window.dispatchEvent(new Event(ENROLLMENT_SESSION_CHANGED_EVENT));
}

