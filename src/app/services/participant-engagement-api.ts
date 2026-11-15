import { buildApiUrl } from "@/app/config/api";
import type { ParticipantBrowserSession } from "@/app/utils/participant-session";

type WaterViewEvent = "WATER_PULSE_VIEWED" | "WATER_STATUS_VIEWED";

/** Best-effort, authenticated engagement telemetry. Never block water access. */
export async function recordParticipantWaterView(
  session: ParticipantBrowserSession,
  eventType: WaterViewEvent,
): Promise<void> {
  const response = await fetch(buildApiUrl("/api/v1/participant/me/activity"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    credentials: "omit",
    cache: "no-store",
    redirect: "error",
    referrerPolicy: "no-referrer",
    body: JSON.stringify({ event_type: eventType }),
  });
  if (!response.ok) throw new Error(`Engagement event unavailable (${response.status})`);
}
