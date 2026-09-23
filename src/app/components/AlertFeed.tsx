import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  API_ENDPOINTS,
  buildApiUrl,
} from "../config/api";
import {
  authenticatedFetch,
  clearAccessToken,
  getAccessToken,
} from "../utils/auth-session";

import { OperatorAuthForm } from "./operator-auth-form";

import { simulationEvidence } from "../utils/notification-evidence";

type NotificationContext = {
  simulation?: boolean | string | Record<string, unknown>;
  data_mode?: string;
  simulation_location?: string;
  location_label?: string;
  parameter?: string;
  observed_value?: string | number;
  unit?: string;
  threshold?: string | number;
  regulatory_basis?: string;
  reason?: string;
  notification_reason?: string;
  likely_source?: string;
  source?: string;
  source_name?: string;
  source_type?: string;
  source_confidence?: number | null;
  confidence?: number | null;
  evidence?: unknown[];
  affected_assets?: unknown[];
  affected_areas?: unknown[];
  recommended_actions?: unknown[];
};

type InboxNotification = {
  id: number;
  incident_id?: string | null;
  event_id?: string | null;
  event_type?: string | null;
  source_asset_id?: number | null;
  notification_type: string;
  channel: string;
  severity: string;
  priority: string;
  is_emergency: boolean;
  subject?: string | null;
  body?: string | null;
  status: string;
  attempt_count: number;
  maximum_attempts: number;
  scheduled_for?: string | null;
  queued_at?: string | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  acknowledgement_required: boolean;
  acknowledgement_deadline?: string | null;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  should_escalate: boolean;
  escalation_deadline?: string | null;
  escalation_level: number;
  created_at: string;
  updated_at: string;
  context: NotificationContext;
};

type InboxResponse = {
  count: number;
  total: number;
  limit: number;
  offset: number;
  notifications: InboxNotification[];
};

function responseMessage(
  payload: unknown,
  fallback: string,
): string {
  if (
    payload &&
    typeof payload === "object" &&
    "detail" in payload
  ) {
    const detail = (payload as { detail?: unknown }).detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
  }

  return fallback;
}

function formatTime(value?: string | null): string {
  if (!value) {
    return "Not yet";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

function displayList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (
        item &&
        typeof item === "object" &&
        "name" in item &&
        typeof (item as { name?: unknown }).name === "string"
      ) {
        return String((item as { name: string }).name).trim();
      }

      return "";
    })
    .filter(Boolean);
}

function formatConfidence(
  context: NotificationContext,
): string {
  const value =
    context.source_confidence ?? context.confidence;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Not available";
  }

  const percentage = value <= 1 ? value * 100 : value;

  return `${Math.round(percentage)}%`;
}

function severityStyles(severity: string) {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return {
        border: "border-red-500/70",
        surface: "bg-red-950/30",
        badge: "bg-red-500 text-white",
      };

    case "HIGH":
    case "ACTION":
      return {
        border: "border-orange-500/70",
        surface: "bg-orange-950/25",
        badge: "bg-orange-500 text-black",
      };

    case "WARNING":
    case "MEDIUM":
    case "NOTICE":
      return {
        border: "border-amber-400/60",
        surface: "bg-amber-950/20",
        badge: "bg-amber-400 text-black",
      };

    default:
      return {
        border: "border-cyan-500/50",
        surface: "bg-cyan-950/20",
        badge: "bg-cyan-500 text-black",
      };
  }
}

export default function AlertFeed() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return getAccessToken();
  });
  const [notifications, setNotifications] = useState<
    InboxNotification[]
  >([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [refreshing, setRefreshing] = useState(false);
  const [acknowledgingId, setAcknowledgingId] = useState<
    number | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const pendingAcknowledgements = useMemo(
    () =>
      notifications.filter(
        (item) =>
          item.acknowledgement_required &&
          !item.acknowledged_at,
      ).length,
    [notifications],
  );

  const signOut = useCallback((message?: string) => {
    clearAccessToken();
    setToken(null);
    setNotifications([]);
    setLoading(false);
    setRefreshing(false);
    setError(message ?? null);
  }, []);

  const fetchNotifications = useCallback(
    async (showRefreshState = false) => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (showRefreshState) {
        setRefreshing(true);
      }

      try {
        const response = await authenticatedFetch(
          buildApiUrl(API_ENDPOINTS.NOTIFICATION_INBOX),
          {
            headers: {
            },
            cache: "no-store",
          },
        );

        const payload = await response
          .json()
          .catch(() => ({}));

        if (response.status === 401) {
          signOut(
            "Your secure session expired. Please sign in again.",
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            responseMessage(
              payload,
              `Unable to load notifications (${response.status}).`,
            ),
          );
        }

        const inbox = payload as InboxResponse;
        setNotifications(
          Array.isArray(inbox.notifications)
            ? inbox.notifications
            : [],
        );
        setError(null);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load notifications.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [signOut, token],
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    void fetchNotifications();

    const interval = window.setInterval(() => {
      void fetchNotifications();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [fetchNotifications, token]);

  const acknowledge = async (
    notificationId: number,
  ) => {
    if (!token) {
      return;
    }

    setAcknowledgingId(notificationId);
    setError(null);

    try {
      const response = await authenticatedFetch(
        buildApiUrl(
          API_ENDPOINTS.NOTIFICATION_ACKNOWLEDGE,
          { notification_id: notificationId },
        ),
        {
          method: "POST",
          cache: "no-store",
        },
      );

      const payload = await response
        .json()
        .catch(() => ({}));

      if (response.status === 401) {
        signOut(
          "Your secure session expired. Please sign in again.",
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          responseMessage(
            payload,
            `Unable to acknowledge notification (${response.status}).`,
          ),
        );
      }

      const updated = payload as InboxNotification;

      setNotifications((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to acknowledge notification.",
      );
    } finally {
      setAcknowledgingId(null);
    }
  };

  return (
    <section
      className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl"
      aria-labelledby="notification-center-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
            Secure real-time alerting
          </div>
          <h3
            id="notification-center-title"
            className="mt-2 text-2xl font-semibold text-white"
          >
            Notification Center
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            See why you were notified, the likely source,
            supporting evidence, affected areas, recommended
            actions, delivery state, escalation, and acknowledgement.
          </p>
        </div>

        {token ? (
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
              {pendingAcknowledgements} awaiting acknowledgement
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>

      {!token ? (
        <OperatorAuthForm submitLabel="Open secure inbox" onAuthenticated={(accessToken) => { setError(null); setToken(accessToken); }} />
      ) : null}

      {error ? (
        <div
          className="mt-5 rounded-lg border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {token ? (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-zinc-400">
              Your authenticated, subscriber-linked notifications
            </div>
            <button
              type="button"
              onClick={() => {
                void fetchNotifications(true);
              }}
              disabled={refreshing}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-cyan-600 hover:text-white disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh now"}
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-400">
              Loading your secure notification inbox...
            </div>
          ) : null}

          {!loading && notifications.length === 0 ? (
            <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-6">
              <div className="font-semibold text-emerald-300">
                No active notifications
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Your inbox is connected and monitoring. New eligible
                FalilaX notifications will appear here automatically.
              </p>
            </div>
          ) : null}

          <div className="space-y-5">
            {notifications.map((notification) => {
              const styles = severityStyles(
                notification.severity,
              );
              const context = notification.context ?? {};
              const { simulated, location } = simulationEvidence(notification);
              const likelySource =
                context.likely_source ??
                context.source_name ??
                context.source ??
                "Source assessment pending";
              const evidence = displayList(context.evidence);
              const affectedAreas = displayList(
                context.affected_areas,
              );
              const affectedAssets = displayList(
                context.affected_assets,
              );
              const recommendedActions = displayList(
                context.recommended_actions,
              );
              const canAcknowledge =
                notification.acknowledgement_required &&
                !notification.acknowledged_at &&
                ["sent", "delivered"].includes(
                  notification.status.toLowerCase(),
                );

              return (
                <article
                  key={notification.id}
                  className={`rounded-xl border p-5 ${styles.border} ${styles.surface}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                        <span>
                          Incident{" "}
                          {notification.incident_id ??
                            "not assigned"}
                        </span>
                        <span aria-hidden="true">/</span>
                        <span>
                          {notification.channel
                            .replace("_", " ")
                            .toUpperCase()}
                        </span>
                        <span aria-hidden="true">/</span>
                        <span>
                          {notification.status.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="mt-3 text-xl font-semibold text-white">
                        {notification.subject ??
                          notification.event_type ??
                          "FalilaX water-system notification"}
                      </h4>

                      <p className="mt-3 text-sm leading-6 text-zinc-300">
                        {notification.body ??
                          context.notification_reason ??
                          context.reason ??
                          "FalilaX detected a condition requiring review."}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${styles.badge}`}
                    >
                      {notification.severity.toUpperCase()}
                    </span>
                  </div>

                  {simulated && (
                    <p className="mt-4 rounded-lg border border-violet-500/30 bg-violet-950/30 p-3 text-sm text-violet-100">
                      Simulation — synthetic measurements. This test does not establish a contamination source or real-world affected area.
                    </p>
                  )}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-zinc-800 bg-black/20 p-3">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        {simulated ? "Simulation location" : "Likely source"}
                      </div>
                      <div className="mt-1 text-sm font-medium text-zinc-100">
                        {simulated ? location : String(likelySource)}
                      </div>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-black/20 p-3">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        {simulated ? "Source attribution" : "Confidence"}
                      </div>
                      <div className="mt-1 text-sm font-medium text-zinc-100">
                        {simulated ? "Not established" : formatConfidence(context)}
                      </div>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-black/20 p-3">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        Parameter
                      </div>
                      <div className="mt-1 text-sm font-medium text-zinc-100">
                        {context.parameter ?? "Not specified"}
                        {context.observed_value !== undefined
                          ? `: ${context.observed_value}${
                              context.unit
                                ? ` ${context.unit}`
                                : ""
                            }`
                          : ""}
                      </div>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-black/20 p-3">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        When
                      </div>
                      <div className="mt-1 text-sm font-medium text-zinc-100">
                        {formatTime(
                          notification.sent_at ??
                            notification.created_at,
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <div>
                      <h5 className="text-sm font-semibold text-zinc-100">
                        {simulated ? "Simulation evidence and scope" : "Evidence and affected scope"}
                      </h5>
                      <ul className="mt-2 space-y-1.5 text-sm text-zinc-400">
                        {simulated && <li>Network impact was not evaluated.</li>}
                        {evidence.map((item) => (
                          <li key={`evidence-${item}`}>
                            Evidence: {item}
                          </li>
                        ))}
                        {affectedAreas.map((item) => (
                          <li key={`area-${item}`}>
                            {simulated ? "Test location" : "Affected area"}: {item}
                          </li>
                        ))}
                        {affectedAssets.map((item) => (
                          <li key={`asset-${item}`}>
                            {simulated ? "Test asset" : "Affected asset"}: {item}
                          </li>
                        ))}
                        {evidence.length === 0 &&
                        affectedAreas.length === 0 &&
                        affectedAssets.length === 0 ? (
                          <li>
                            Detailed scope evidence is being assessed.
                          </li>
                        ) : null}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-zinc-100">
                        Recommended actions
                      </h5>
                      {recommendedActions.length > 0 ? (
                        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-zinc-400">
                          {recommendedActions.map((item) => (
                            <li key={`action-${item}`}>{item}</li>
                          ))}
                        </ol>
                      ) : (
                        <p className="mt-2 text-sm text-zinc-400">
                          Review the incident details and follow the
                          approved operational response procedure.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 pt-4">
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-400">
                      <span>
                        Delivery:{" "}
                        {notification.status.toUpperCase()}
                      </span>
                      <span>
                        Attempts: {notification.attempt_count}/
                        {notification.maximum_attempts}
                      </span>
                      <span>
                        Escalation:{" "}
                        {notification.should_escalate
                          ? `Level ${notification.escalation_level}; deadline ${formatTime(
                              notification.escalation_deadline,
                            )}`
                          : "No active escalation"}
                      </span>
                      <span>
                        Acknowledgement:{" "}
                        {notification.acknowledged_at
                          ? `Completed ${formatTime(
                              notification.acknowledged_at,
                            )}`
                          : notification.acknowledgement_required
                            ? `Required by ${formatTime(
                                notification.acknowledgement_deadline,
                              )}`
                            : "Not required"}
                      </span>
                    </div>

                    {canAcknowledge ? (
                      <button
                        type="button"
                        onClick={() => {
                          void acknowledge(notification.id);
                        }}
                        disabled={
                          acknowledgingId === notification.id
                        }
                        className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {acknowledgingId === notification.id
                          ? "Acknowledging..."
                          : "Acknowledge"}
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
