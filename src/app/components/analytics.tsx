import { useEffect, useState } from "react";
import { BarChart3, Building2, MapPin, Users, Activity, Globe2 } from "lucide-react";

import { authenticatedFetch } from "@/app/utils/auth-session";
import { API_BASE_URL } from "@/app/config/api";
import { Localize } from "@/app/i18n/language";

type AnalyticsData = {
  scope: string;
  population?: {
    enrollment_sessions?: number;
    unique_participants?: number;
    assigned_participants?: number;
  };
  deployments?: {
    deployment_count?: number;
    deployments?: Array<{
      utility_id: number;
      utility_name: string;
      utility_code: string;
      unique_participants: number;
      enrollment_sessions: number;
    }>;
  };
  localities?: {
    locality_count?: number;
    localities?: Array<{
      country: string | null;
      state_region: string | null;
      city: string | null;
      utility_count: number;
      unique_participants: number;
      enrollment_sessions: number;
    }>;
  };
  notifications?: {
    total?: number;
    by_channel?: Record<string, number>;
  };
  engagement?: {
    total_events?: number;
    unique_users?: number;
    events_by_type?: Array<{
      event_type: string;
      count: number;
    }>;
  };
};

type Utility = {
  id: number;
  name?: string;
  code?: string;
};

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [selectedUtility, setSelectedUtility] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalAccess, setGlobalAccess] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const globalResponse = await authenticatedFetch(
          `${API_BASE_URL}/api/v1/participant-analytics/dashboard?level=GLOBAL`
        );

        if (globalResponse.ok) {
          const globalData = await globalResponse.json();
          setData(globalData);
          setGlobalAccess(true);
          return;
        }

        const utilitiesResponse = await authenticatedFetch(
          `${API_BASE_URL}/api/v1/utilities?limit=100`
        );

        if (!utilitiesResponse.ok) {
          throw new Error(`Unable to resolve analytics scope: ${utilitiesResponse.status}`);
        }

        const utilityData: Utility[] = await utilitiesResponse.json();
        setUtilities(utilityData);

        const firstUtility = utilityData[0]?.id ?? null;
        setSelectedUtility(firstUtility);

        if (firstUtility !== null) {
          const utilityResponse = await authenticatedFetch(
            `${API_BASE_URL}/api/v1/participant-analytics/dashboard?level=UTILITY&utility_id=${firstUtility}`
          );

          if (!utilityResponse.ok) {
            throw new Error(`Analytics API error: ${utilityResponse.status}`);
          }

          setData(await utilityResponse.json());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const loadUtility = async (utilityId: number) => {
    setSelectedUtility(utilityId);
    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/participant-analytics/dashboard?level=UTILITY&utility_id=${utilityId}`
      );

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load utility analytics.");
    } finally {
      setLoading(false);
    }
  };

  const population = data?.population ?? {};
  const deployments = data?.deployments?.deployments ?? [];
  const localities = data?.localities?.localities ?? [];
  const notifications = data?.notifications ?? {};
  const engagement = data?.engagement ?? {};

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-cyan-300" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                <Localize>{"FalilaX Analytics"}</Localize>
              </h1>
              <p className="text-xs text-zinc-500">
                <Localize>{"Population, adoption, usage, and deployment intelligence"}</Localize>
              </p>
            </div>
          </div>

          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
            {globalAccess ? "GLOBAL · FALILAX OVERSEER" : "AUTHORIZED UTILITY SCOPE"}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading && (
          <p className="animate-pulse text-zinc-500">
            <Localize>{"Loading analytics..."}</Localize>
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-red-900/60 bg-red-950/20 p-5 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            {!globalAccess && utilities.length > 0 && (
              <section className="mb-8">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  <Localize>{"Authorized utility"}</Localize>
                </p>

                <select
                  value={selectedUtility ?? ""}
                  onChange={(event) => loadUtility(Number(event.target.value))}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none"
                >
                  {utilities.map((utility) => (
                    <option key={utility.id} value={utility.id}>
                      {utility.name ?? utility.code ?? `Utility ${utility.id}`}
                    </option>
                  ))}
                </select>
              </section>
            )}

            <section className="mb-8">
              <div className="mb-2 flex items-center gap-3">
                <Globe2 className="h-5 w-5 text-cyan-300" />
                <h2 className="text-2xl font-semibold">
                  {globalAccess ? "FalilaX Network Overview" : "Utility Overview"}
                </h2>
              </div>
              <p className="text-sm text-zinc-500">
                {globalAccess
                  ? "System-wide analytics across authorized FalilaX deployments."
                  : "Analytics for the currently authorized utility scope."}
              </p>
            </section>

            <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Enrolled", population.enrollment_sessions ?? 0, Users],
                ["Unique People", population.unique_participants ?? 0, Users],
                ["Assigned", population.assigned_participants ?? 0, MapPin],
                ["Active Users", engagement.unique_users ?? 0, Activity],
              ].map(([label, value, Icon]) => (
                <div
                  key={String(label)}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  <div className="mb-4 flex items-center gap-3 text-zinc-500">
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium uppercase tracking-[0.14em]">
                      {label}
                    </span>
                  </div>
                  <p className="text-3xl font-semibold tracking-tight">
                    {Number(value).toLocaleString()}
                  </p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-lg font-semibold">Deployments</h2>
                </div>

                <p className="mb-5 text-3xl font-semibold">
                  {data.deployments?.deployment_count ?? 0}
                </p>

                <div className="space-y-3">
                  {deployments.map((deployment) => (
                    <div
                      key={deployment.utility_id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{deployment.utility_name}</p>
                          <p className="text-xs text-zinc-500">
                            {deployment.utility_code}
                          </p>
                        </div>
                        <div className="text-right text-xs text-zinc-400">
                          <p>{deployment.unique_participants} people</p>
                          <p>{deployment.enrollment_sessions} sessions</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-5 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-cyan-300" />
                  <h2 className="text-lg font-semibold">Localities</h2>
                </div>

                <p className="mb-5 text-3xl font-semibold">
                  {data.localities?.locality_count ?? 0}
                </p>

                <div className="space-y-3">
                  {localities.map((locality, index) => (
                    <div
                      key={`${locality.country}-${locality.city}-${index}`}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                    >
                      <p className="font-medium">
                        {[locality.city, locality.state_region, locality.country]
                          .filter(Boolean)
                          .join(", ") || "Unspecified locality"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {locality.utility_count} utilities ·{" "}
                        {locality.unique_participants} people
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <h2 className="mb-5 text-lg font-semibold">System Usage</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-zinc-950 p-4">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Experience Events
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {engagement.total_events ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl bg-zinc-950 p-4">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Active Users
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {engagement.unique_users ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <h2 className="mb-5 text-lg font-semibold">Notifications</h2>
                <p className="mb-4 text-3xl font-semibold">
                  {notifications.total ?? 0}
                </p>

                <div className="space-y-2">
                  {Object.entries(notifications.by_channel ?? {}).map(
                    ([channel, count]) => (
                      <div
                        key={channel}
                        className="flex items-center justify-between border-b border-zinc-800 py-2 text-sm"
                      >
                        <span className="text-zinc-400">{channel}</span>
                        <span>{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
