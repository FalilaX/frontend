import { buildApiUrl } from "@/app/config/api";
import type { ParticipantBrowserSession } from "@/app/utils/participant-session";

export const PREFERENCES_WRITE_SCOPE = "participant:preferences:write";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export interface PreferenceChoices {
  email_enabled: boolean;
  minimum_severity: Severity;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  quiet_hours_timezone: string | null;
  emergency_override_enabled: boolean;
}
export interface EditablePreferences extends PreferenceChoices {
  subscriber_id: number;
  organization_id: number;
  version: number;
  email_verified: boolean;
  is_active: boolean;
}
export class PreferenceRequestError extends Error {
  constructor(public readonly status: number) {
    super(status === 401 ? "Your session has ended. Please sign in again."
      : status === 403 ? "Editing is unavailable for this session. Sign in again; if this continues, contact your organizer to check consent and email verification."
      : status === 409 ? "These preferences changed or need review. Reload the saved choices before trying again."
      : status === 422 ? "Check the times and timezone, then try again."
      : status === 429 ? "Please wait a moment before saving again."
      : "We could not confirm the result. Reload the saved choices before trying again.");
  }
}

export async function requestPreferences(
  session: ParticipantBrowserSession, signal: AbortSignal,
  update?: PreferenceChoices & { expected_version: number },
): Promise<EditablePreferences> {
  const response = await fetch(buildApiUrl("/api/v1/participant/me/preferences"), {
    method: update ? "PUT" : "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${session.accessToken}`,
      ...(update ? { "Content-Type": "application/json" } : {}) },
    body: update ? JSON.stringify(update) : undefined,
    credentials: "omit", cache: "no-store", redirect: "error", referrerPolicy: "no-referrer", signal,
  });
  if (!response.ok) throw new PreferenceRequestError(response.status);
  const data = await response.json() as EditablePreferences;
  const nullableString = (v: unknown) => v === null || typeof v === "string";
  if (!data || data.subscriber_id !== session.subscriberId || data.organization_id !== session.organizationId
    || !Number.isInteger(data.version) || data.version < 0
    || !["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(data.minimum_severity)
    || ![data.email_enabled, data.email_verified, data.is_active, data.quiet_hours_enabled,
      data.emergency_override_enabled].every(v => typeof v === "boolean")
    || ![data.quiet_hours_start, data.quiet_hours_end, data.quiet_hours_timezone].every(nullableString)) {
    throw new PreferenceRequestError(0);
  }
  return data;
}
