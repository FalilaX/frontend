const ACCESS_TOKEN_STORAGE_KEY = "falilax_notification_session_token";

export const AUTH_SESSION_CHANGED_EVENT = "falilax:auth-session-changed";

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

export function getAccessToken(): string | null {
  if (!canUseSessionStorage()) return null;

  const token = window.sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)?.trim();
  return token || null;
}

export function storeAccessToken(token: string): void {
  const normalized = token.trim();

  if (!normalized) {
    throw new Error("A non-empty access token is required.");
  }

  if (!canUseSessionStorage()) return;

  window.sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, normalized);
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function clearAccessToken(): void {
  if (!canUseSessionStorage()) return;

  window.sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
    credentials: "omit",
  });

  if (response.status === 401 && token) {
    clearAccessToken();
  }

  return response;
}
