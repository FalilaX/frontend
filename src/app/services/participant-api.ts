import { buildApiUrl } from "@/app/config/api";
import type { ParticipantBrowserSession } from "@/app/utils/participant-session";

export interface ParticipantProfile {
  subscriber_id: number;
  organization_id: number;
  full_name: string;
  status: "ACTIVE";
  is_verified: true;
  language: string;
  timezone: string;
}

export class ParticipantAccessError extends Error {
  constructor(public readonly expired: boolean) {
    super(expired ? "Your participant session has ended." : "We could not verify your connection. Please try again.");
  }
}

export async function getParticipantProfile(
  session: ParticipantBrowserSession, signal: AbortSignal,
): Promise<ParticipantProfile> {
  const response = await fetch(buildApiUrl("/api/v1/participant/me"), {
    headers: { Accept: "application/json", Authorization: `Bearer ${session.accessToken}` },
    signal, credentials: "omit", cache: "no-store", redirect: "error",
    referrerPolicy: "no-referrer",
  });
  if (!response.ok) throw new ParticipantAccessError([401, 403].includes(response.status));
  const profile = await response.json() as ParticipantProfile;
  if (!profile || !Number.isInteger(profile.subscriber_id)
      || !Number.isInteger(profile.organization_id)
      || profile.subscriber_id !== session.subscriberId
      || profile.organization_id !== session.organizationId
      || profile.status !== "ACTIVE" || profile.is_verified !== true
      || typeof profile.full_name !== "string"
      || typeof profile.language !== "string" || typeof profile.timezone !== "string") {
    throw new ParticipantAccessError(true);
  }
  return profile;
}

export interface ParticipantContext {
  subscriber_id: number;
  organization_id: number;
  preferences: {
    channels: string[];
    minimum_severity: string;
    is_active: boolean;
    paused: boolean;
    paused_until: string | null;
    quiet_hours_enabled: boolean;
    quiet_hours_start: string | null;
    quiet_hours_end: string | null;
    quiet_hours_timezone: string | null;
    emergency_override_enabled: boolean;
    acknowledgement_required: boolean;
    acknowledgement_timeout_minutes: number | null;
    escalation_enabled: boolean;
    escalation_timeout_minutes: number | null;
  } | null;
  assignments: {
    assignment_id: number;
    scope_type: string;
    scope_id: number;
    relationship_type: string;
    context_kind: "DEMONSTRATION" | "RECORDED";
  }[];
  assignments_truncated: boolean;
}

export async function getParticipantContext(
  session: ParticipantBrowserSession, signal: AbortSignal,
): Promise<ParticipantContext> {
  const response = await fetch(buildApiUrl("/api/v1/participant/me/context"), {
    headers: { Accept: "application/json", Authorization: `Bearer ${session.accessToken}` },
    signal, credentials: "omit", cache: "no-store", redirect: "error", referrerPolicy: "no-referrer",
  });
  if (!response.ok) throw new ParticipantAccessError([401, 403].includes(response.status));
  const data = await response.json() as ParticipantContext;
  const positiveInt = (value: unknown) => typeof value === "number" && Number.isInteger(value) && value > 0;
  if (!data || data.subscriber_id !== session.subscriberId || data.organization_id !== session.organizationId
    || !Array.isArray(data.assignments) || data.assignments.length > 100
    || typeof data.assignments_truncated !== "boolean"
    || !data.assignments.every(item => item && positiveInt(item.assignment_id) && positiveInt(item.scope_id)
      && typeof item.scope_type === "string" && typeof item.relationship_type === "string"
      && ["DEMONSTRATION", "RECORDED"].includes(item.context_kind))) throw new ParticipantAccessError(false);
  const pref = data.preferences;
  if (pref !== null) {
    if (!pref || !Array.isArray(pref.channels)
      || !pref.channels.every(channel => ["EMAIL", "SMS", "WHATSAPP", "IN_APP", "PUSH"].includes(channel))
      || typeof pref.minimum_severity !== "string"
      || ![pref.is_active, pref.paused, pref.quiet_hours_enabled, pref.emergency_override_enabled,
        pref.acknowledgement_required, pref.escalation_enabled].every(value => typeof value === "boolean")
      || ![pref.paused_until, pref.quiet_hours_start, pref.quiet_hours_end, pref.quiet_hours_timezone]
        .every(value => value === null || typeof value === "string")
      || ![pref.acknowledgement_timeout_minutes, pref.escalation_timeout_minutes]
        .every(value => value === null || positiveInt(value))) throw new ParticipantAccessError(false);
  }
  return data;
}
