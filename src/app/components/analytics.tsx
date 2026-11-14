import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Layers3,
  RefreshCw,
  Users,
} from "lucide-react";

import { authenticatedFetch } from "@/app/utils/auth-session";
import { API_BASE_URL } from "@/app/config/api";

type FunnelStage = {
  stage: string;
  count: number | null;
  completion_rate: number | null;
  availability?: string;
};

type BreakdownItem = {
  value: string;
  count: number;
};

type AnalyticsData = {
  population: {
    organization_id: number;
    program_id: number | null;
    joined: number;
    identity_completed: number;
    preferences_completed: number;
    unique_participants: number;
    first_joined_at: string | null;
    last_activity_at: string | null;
  };

  funnel: {
    population: number;
    stages: FunnelStage[];
    status_counts: Record<string, number>;
  };

  breakdown: {
    unique_participants: number;
    by_subscriber_type: BreakdownItem[];
    by_language: BreakdownItem[];
    by_timezone: BreakdownItem[];
  };

  notifications: {
    total_notifications: number;
    by_channel: Array<{
      channel: string;
      count: number;
    }>;
    by_status: Array<{
      status: string;
      count: number;
    }>;
    acknowledgement: {
      required: number;
      acknowledged: number;
      rate: number | null;
    };
    escalated: number;
  };

  engagement: {
    total_events: number;
    unique_active_participants: number;
    events_by_type: Array<{
      event_type: string;
      count: number;
    }>;
    first_activity_at: string | null;
    last_activity_at: string | null;
  };
};

const ORGANIZATION_ID = 1;
const PROGRAM_ID = 1;

const stageLabels: Record<string, string> = {
  joined: "Joined",
  identity_completed: "Identity completed",
  verified: "Verified",
  consented: "Consented",
  preferences_completed: "Preferences",
  activated: "Activated",
};

function fmt(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString();
}

function rate(value: number | null | undefined) {
  return value == null ? "—" : `${value}%`;
}

function dateTime(value: string | null | undefined) {
  if (!value) return "No activity recorded";

  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Breakdown({
  items,
}: {
  items: BreakdownItem[];
}) {
  if (!items.length) {
    return (
      <p className="text-sm text-zinc-500">
        No participant data recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={`${item.value}-${item.count}`}
          className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3 last:border-0 last:pb-0"
        >
          <span className="truncate text-sm text-zinc-300">
            {item.value}
          </span>

          <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-300">
            {fmt(item.count)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">
        {value}
      </p>

      {detail && (
        <p className="mt-2 text-xs text-zinc-500">
          {detail}
        </p>
      )}
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/participant-analytics/summary` +
          `?organization_id=${ORGANIZATION_ID}` +
          `&program_id=${PROGRAM_ID}`,
      );

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(
          `Analytics request failed (${response.status})${detail ? `: ${detail}` : ""}`,
        );
      }

      const result = (await response.json()) as AnalyticsData;
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load FalilaX analytics.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <p className="animate-pulse text-sm text-zinc-500">
              Loading FalilaX analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-900/60 bg-red-950/20 p-8">
            <h1 className="text-xl font-semibold">
              Analytics unavailable
            </h1>

            <p className="mt-3 text-sm text-red-300">
              {error ?? "No analytics data was returned."}
            </p>

            <button
              type="button"
              onClick={() => void loadAnalytics(true)}
              className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { population, funnel, breakdown, notifications, engagement } =
    data;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
              <Layers3 className="h-5 w-5 text-cyan-300" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
                FalilaX Intelligence
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Participant Analytics
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Controlled demonstration analytics
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadAnalytics(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* SCOPE */}

        <section className="mb-10 rounded-2xl border border-cyan-900/40 bg-cyan-950/10 p-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
                Analytics scope
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                FalilaX Controlled Demonstration
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                Participant intelligence for the controlled demonstration
                program. This view measures participation, enrollment
                progression, participant composition, notification activity,
                and engagement.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                Program
              </p>

              <p className="mt-1 font-mono text-sm text-zinc-300">
                CONTROLLED-DEMO-2026
              </p>
            </div>
          </div>
        </section>

        {/* 01 POPULATION */}

        <section className="mb-12">
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-cyan-300" />

              <div>
                <h2 className="text-xl font-semibold">
                  01 · Population
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  The participant population entering the FalilaX system.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Enrollment sessions"
              value={fmt(population.joined)}
            />

            <Metric
              label="Identity completed"
              value={fmt(population.identity_completed)}
            />

            <Metric
              label="Unique participants"
              value={fmt(population.unique_participants)}
            />

            <Metric
              label="Preferences"
              value={fmt(population.preferences_completed)}
              detail="Historical coverage not yet complete"
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                First participant activity
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                {dateTime(population.first_joined_at)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                Latest participant activity
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                {dateTime(population.last_activity_at)}
              </p>
            </div>
          </div>
        </section>

        {/* 02 FUNNEL */}

        <section className="mb-12">
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <ChevronRight className="h-5 w-5 text-cyan-300" />

              <div>
                <h2 className="text-xl font-semibold">
                  02 · Enrollment Funnel
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Progression through the trusted participant enrollment
                  pathway.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            {funnel.stages.map((stage, index) => {
              const unavailable =
                stage.availability === "NOT_YET_COMPLETE";

              const width =
                stage.completion_rate == null
                  ? 0
                  : Math.min(stage.completion_rate, 100);

              return (
                <div
                  key={stage.stage}
                  className={`flex items-center gap-5 px-6 py-5 ${
                    index < funnel.stages.length - 1
                      ? "border-b border-zinc-800"
                      : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950">
                    {stage.count !== null && stage.count > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                    ) : (
                      <span className="text-xs text-zinc-600">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {stageLabels[stage.stage] ?? stage.stage}
                    </p>

                    {unavailable ? (
                      <p className="mt-1 text-xs text-zinc-500">
                        Historical coverage not yet complete
                      </p>
                    ) : (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold">
                      {stage.count === null ? "—" : fmt(stage.count)}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {unavailable
                        ? "not available"
                        : rate(stage.completion_rate)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 03 BREAKDOWN */}

        <section className="mb-12">
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <Globe2 className="h-5 w-5 text-cyan-300" />

              <div>
                <h2 className="text-xl font-semibold">
                  03 · Participant Breakdown
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Composition of the enrolled participant population.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-5 font-semibold">
                Subscriber type
              </h3>

              <Breakdown items={breakdown.by_subscriber_type} />
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-5 font-semibold">
                Language
              </h3>

              <Breakdown items={breakdown.by_language} />
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-5 font-semibold">
                Time zone
              </h3>

              <Breakdown items={breakdown.by_timezone} />
            </div>
          </div>
        </section>

        {/* 04 NOTIFICATIONS */}

        <section className="mb-12">
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-cyan-300" />

              <div>
                <h2 className="text-xl font-semibold">
                  04 · Notification Intelligence
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Notification routing, status, acknowledgement, and
                  escalation activity.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Notifications"
              value={fmt(notifications.total_notifications)}
            />

            <Metric
              label="Acknowledged"
              value={fmt(notifications.acknowledgement.acknowledged)}
              detail={`${rate(notifications.acknowledgement.rate)} acknowledgement rate`}
            />

            <Metric
              label="Escalated"
              value={fmt(notifications.escalated)}
            />

            <Metric
              label="Acknowledgement required"
              value={fmt(notifications.acknowledgement.required)}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-5 font-semibold">
                By channel
              </h3>

              {notifications.by_channel.length ? (
                <div className="space-y-3">
                  {notifications.by_channel.map((item) => (
                    <div
                      key={item.channel}
                      className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-0"
                    >
                      <span className="text-sm text-zinc-400">
                        {item.channel}
                      </span>

                      <span className="font-medium">
                        {fmt(item.count)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  No notification activity recorded.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-5 font-semibold">
                By status
              </h3>

              {notifications.by_status.length ? (
                <div className="space-y-3">
                  {notifications.by_status.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-0"
                    >
                      <span className="text-sm text-zinc-400">
                        {item.status}
                      </span>

                      <span className="font-medium">
                        {fmt(item.count)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  No notification activity recorded.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 05 ENGAGEMENT */}

        <section className="mb-12">
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-cyan-300" />

              <div>
                <h2 className="text-xl font-semibold">
                  05 · Participant Engagement
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Actual participant activity recorded by the FalilaX
                  experience ledger.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Metric
              label="Experience events"
              value={fmt(engagement.total_events)}
            />

            <Metric
              label="Active participants"
              value={fmt(engagement.unique_active_participants)}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-5 font-semibold">
                Event activity
              </h3>

              {engagement.events_by_type.length ? (
                <div className="space-y-3">
                  {engagement.events_by_type.map((item) => (
                    <div
                      key={item.event_type}
                      className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-0"
                    >
                      <span className="text-sm text-zinc-400">
                        {item.event_type}
                      </span>

                      <span className="font-medium">
                        {fmt(item.count)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  No participant experience events recorded yet.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-5 font-semibold">
                Activity window
              </h3>

              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                    First activity
                  </p>

                  <p className="mt-2 text-sm text-zinc-300">
                    {dateTime(engagement.first_activity_at)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                    Latest activity
                  </p>

                  <p className="mt-2 text-sm text-zinc-300">
                    {dateTime(engagement.last_activity_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DATA PROVENANCE */}

        <section className="border-t border-zinc-800 pt-6">
          <div className="flex items-start gap-3 text-xs leading-5 text-zinc-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

            <p>
              This analytics view is derived from FalilaX enrollment
              sessions, participant records, notification records, and
              the participant experience ledger. Questionnaire responses
              are intentionally excluded from the participant dashboard
              and remain part of the post-demonstration review workflow.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
