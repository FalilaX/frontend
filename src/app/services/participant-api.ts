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
