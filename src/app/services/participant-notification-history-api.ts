import { buildApiUrl } from "@/app/config/api";
import { ParticipantAccessError } from "@/app/services/participant-api";
import type { ParticipantBrowserSession } from "@/app/utils/participant-session";

export interface HistoryItem {
  id: string;
  kind: "REHEARSAL" | "SIMULATION" | "NOTIFICATION";
  channel: string;
  status: string;
  status_label: string;
  explanation: string;
  recorded_at: string;
  authorized_at: string | null;
  finished_at: string | null;
}
export interface NotificationHistory {
  subscriber_id: number;
  organization_id: number;
  items: HistoryItem[];
  has_more: boolean;
  limit: number;
}

export async function getNotificationHistory(
  session: ParticipantBrowserSession, signal: AbortSignal,
): Promise<NotificationHistory> {
  const response = await fetch(buildApiUrl("/api/v1/participant/me/notification-history"), {
    headers: { Accept: "application/json", Authorization: `Bearer ${session.accessToken}` },
    signal, credentials: "omit", cache: "no-store", redirect: "error", referrerPolicy: "no-referrer",
  });
  if (!response.ok) throw new ParticipantAccessError([401, 403].includes(response.status));
  const data = await response.json();
  const text = (v: unknown, max: number) => typeof v === "string" && v.length > 0 && v.length <= max;
  const date = (v: unknown) => typeof v === "string" && v.length <= 40 && /(?:Z|[+-]\d{2}:\d{2})$/.test(v) && Number.isFinite(Date.parse(v));
  if (!data || data.subscriber_id !== session.subscriberId || data.organization_id !== session.organizationId
      || data.limit !== 50 || typeof data.has_more !== "boolean" || !Array.isArray(data.items) || data.items.length > 50
      || !data.items.every((item: HistoryItem) => item && text(item.id, 80)
        && ["REHEARSAL", "SIMULATION", "NOTIFICATION"].includes(item.kind)
        && text(item.channel, 32) && text(item.status, 32) && text(item.status_label, 80)
        && text(item.explanation, 500) && date(item.recorded_at)
        && (item.authorized_at === null || date(item.authorized_at))
        && (item.finished_at === null || date(item.finished_at)))
      || new Set(data.items.map((item: HistoryItem) => item.id)).size !== data.items.length) {
    throw new ParticipantAccessError(false);
  }
  return data as NotificationHistory;
}
