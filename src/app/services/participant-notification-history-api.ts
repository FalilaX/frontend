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
  receipt_confirmed_at: string | null;
  can_confirm_receipt: boolean;
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
        && (item.receipt_confirmed_at == null || date(item.receipt_confirmed_at))
        && (item.can_confirm_receipt === undefined || typeof item.can_confirm_receipt === "boolean")
        && (item.authorized_at === null || date(item.authorized_at))
        && (item.finished_at === null || date(item.finished_at)))
      || new Set(data.items.map((item: HistoryItem) => item.id)).size !== data.items.length) {
    throw new ParticipantAccessError(false);
  }
  return { ...data, items: data.items.map((item: HistoryItem) => ({ ...item,
    receipt_confirmed_at: item.receipt_confirmed_at ?? null, can_confirm_receipt: item.can_confirm_receipt ?? false,
  })) } as NotificationHistory;
}

export class ReceiptConfirmationError extends Error {}

export async function confirmReceipt(
  session: ParticipantBrowserSession, recordId: string, signal: AbortSignal,
): Promise<string> {
  if (!/^rehearsal:[0-9a-f-]{36}$/i.test(recordId)) throw new ReceiptConfirmationError("Invalid rehearsal record.");
  const id = recordId.slice("rehearsal:".length);
  const response = await fetch(buildApiUrl(`/api/v1/participant/me/email-rehearsal/${encodeURIComponent(id)}/receipt`), {
    method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
    body: JSON.stringify({ confirmed: true }), signal, credentials: "omit", cache: "no-store", redirect: "error", referrerPolicy: "no-referrer",
  });
  if (response.status === 401) throw new ParticipantAccessError(true);
  if (response.status === 403) throw new ReceiptConfirmationError("Sign in again to enable receipt confirmation.");
  if (!response.ok) throw new ReceiptConfirmationError("Could not confirm the result. Refresh history to check whether receipt was recorded.");
  const data = await response.json();
  if (!data || data.rehearsal_id !== id || data.subscriber_id !== session.subscriberId
    || data.organization_id !== session.organizationId || typeof data.receipt_confirmed_at !== "string"
    || data.receipt_confirmed_at.length > 40 || !/(?:Z|[+-]\d{2}:\d{2})$/.test(data.receipt_confirmed_at)
    || !Number.isFinite(Date.parse(data.receipt_confirmed_at))) {
    throw new ReceiptConfirmationError("Could not verify the confirmation. Refresh history to check its status.");
  }
  return data.receipt_confirmed_at;
}
