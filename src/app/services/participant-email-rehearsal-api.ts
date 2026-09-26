import { buildApiUrl } from "@/app/config/api";
import type { ParticipantBrowserSession } from "@/app/utils/participant-session";

export interface Rehearsal {
  id: string; status: "READY" | "CLAIMED" | "ACCEPTED" | "UNKNOWN" | "SKIPPED" | "BLOCKED";
  subject: string; body: string; destination_hint: string; content_hash: string;
  preview_version: number; expires_at: string; can_send: boolean; outcome_code: string | null;
}
export interface RehearsalState {
  available: boolean; subscriber_id: number; organization_id: number; rehearsal: Rehearsal | null;
}
export async function requestRehearsal(session: ParticipantBrowserSession, signal: AbortSignal,
  action: "status" | "preview" | "send" = "status", preview?: Rehearsal): Promise<RehearsalState> {
  if (action === "send" && !preview) throw new Error("Prepare a preview first.");
  const response = await fetch(buildApiUrl("/api/v1/participant/me/email-rehearsal" + (action === "status" ? "" : "/" + action)), {
    method: action === "status" ? "GET" : "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${session.accessToken}`,
      ...(action === "send" ? { "Content-Type": "application/json" } : {}) },
    body: action === "send" && preview ? JSON.stringify({ rehearsal_id: preview.id,
      content_hash: preview.content_hash, preview_version: preview.preview_version, confirmed: true }) : undefined,
    credentials: "omit", cache: "no-store", redirect: "error", referrerPolicy: "no-referrer", signal,
  });
  if (!response.ok) throw new Error(response.status === 401 ? "Your session has ended. Sign in again."
    : response.status === 403 ? "Current consent, verified email, and active demonstration enrollment are required."
    : response.status === 404 ? "Email rehearsal is not enabled for this participant."
    : response.status === 409 ? "The preview or your preferences have changed, or sending is restricted now. Check your choices and prepare a fresh preview."
    : response.status === 429 ? "Please wait one minute before preparing another preview."
    : "The result could not be confirmed. Check status before doing anything else.");
  const data = await response.json() as RehearsalState;
  if (!data || typeof data.available !== "boolean" || data.subscriber_id !== session.subscriberId
      || data.organization_id !== session.organizationId || !(data.rehearsal === null || valid(data.rehearsal))) {
    throw new Error("The rehearsal response could not be verified. Check status before doing anything else.");
  }
  return data;
}
function valid(r: Rehearsal): boolean {
  return !!r && typeof r.id === "string" && /^[0-9a-f-]{36}$/.test(r.id)
    && ["READY", "CLAIMED", "ACCEPTED", "UNKNOWN", "SKIPPED", "BLOCKED"].includes(r.status)
    && [r.subject, r.body, r.destination_hint].every(v => typeof v === "string")
    && typeof r.content_hash === "string" && /^[0-9a-f]{64}$/.test(r.content_hash)
    && Number.isInteger(r.preview_version) && r.preview_version > 0
    && typeof r.expires_at === "string" && Number.isFinite(Date.parse(r.expires_at))
    && typeof r.can_send === "boolean" && (r.outcome_code === null || typeof r.outcome_code === "string");
}
