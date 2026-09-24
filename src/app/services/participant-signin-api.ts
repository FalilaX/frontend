import { buildApiUrl } from "@/app/config/api";

export interface SigninChallenge {
  challenge_id: string;
  capability: string;
  expires_in: number;
}
export interface SigninSession {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  subscriber_id: number;
  organization_id: number;
  scopes: string[];
}
export class SigninError extends Error {
  constructor(message: string, public retryAfter = 0) { super(message); }
}

async function post(path: string, body: object, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(buildApiUrl(`/api/v1/participant/sign-in/${path}`), {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body), signal, credentials: "omit", cache: "no-store",
    redirect: "error", referrerPolicy: "no-referrer",
  });
  if (!response.ok) {
    if (response.status === 429) {
      const retry = Number(response.headers.get("Retry-After"));
      throw new SigninError("Please wait before trying again.", Number.isFinite(retry) && retry > 0 ? Math.min(retry, 3600) : 60);
    }
    if (response.status === 401) throw new SigninError("The code is invalid, expired, or already used. Check your latest email.");
    if (response.status === 422) throw new SigninError("Please check the information you entered.");
    throw new SigninError("Sign-in is temporarily unavailable. Please try again later.");
  }
  return response.json();
}

export async function requestSigninCode(organization: string, email: string, signal: AbortSignal): Promise<SigninChallenge> {
  const data = await post("request", { organization_code: organization, email }, signal) as SigninChallenge;
  if (!data || typeof data.challenge_id !== "string" || !/^[0-9a-f-]{36}$/i.test(data.challenge_id)
      || typeof data.capability !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(data.capability)
      || data.expires_in !== 600) throw new SigninError("An unexpected sign-in response was received.");
  return data;
}
export async function verifySigninCode(challenge: SigninChallenge, code: string, signal: AbortSignal): Promise<SigninSession> {
  const data = await post("verify", { challenge_id: challenge.challenge_id, capability: challenge.capability, code }, signal) as SigninSession;
  if (!data || typeof data.access_token !== "string" || !data.access_token.trim()
      || data.token_type !== "bearer" || !Number.isInteger(data.expires_in)
      || data.expires_in <= 0 || data.expires_in > 1800
      || !Number.isInteger(data.subscriber_id) || data.subscriber_id <= 0
      || !Number.isInteger(data.organization_id) || data.organization_id <= 0
      || !Array.isArray(data.scopes) || data.scopes.length !== 1
      || data.scopes[0] !== "participant:profile:read") throw new SigninError("An unexpected sign-in response was received.");
  return data;
}
