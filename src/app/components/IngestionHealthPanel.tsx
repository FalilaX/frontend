import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Database, XCircle } from "lucide-react";

type HealthStatus = "healthy" | "warning" | "failed" | "inactive" | string;

type IngestionHealthItem = {
  source_id: number;
  source_name: string;
  source_type?: string | null;
  parser_type?: string | null;
  is_active: boolean;
  polling_frequency_minutes?: number | null;
  last_run_status?: string | null;
  last_run_started_at?: string | null;
  last_run_finished_at?: string | null;
  last_successful_pull_at?: string | null;
  last_failed_pull_at?: string | null;
  failed_pull_count: number;
  stale: boolean;
  stale_reason?: string | null;
  health_status: HealthStatus;
};

function formatTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

function HealthBadge({ status }: { status: HealthStatus }) {
  if (status === "healthy") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Healthy
      </span>
    );
  }

  if (status === "warning") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        Warning
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-400">
        <XCircle className="h-3.5 w-3.5" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
      <Clock3 className="h-3.5 w-3.5" />
      Inactive
    </span>
  );
}

export default function IngestionHealthPanel() {
  const [items, setItems] = useState<IngestionHealthItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8001/api/v1/ingestion/health");

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("Failed to load ingestion health:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
    const timer = setInterval(loadHealth, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-amber-400" />
          <h2 className="text-lg font-medium">Ingestion Health</h2>
        </div>
        <div className="text-xs text-zinc-500">Auto-refresh every 15s</div>
      </div>

      {loading ? (
        <div className="px-6 py-6 text-sm text-zinc-400 animate-pulse">
          Loading ingestion status...
        </div>
      ) : items.length === 0 ? (
        <div className="px-6 py-6 text-sm text-zinc-500">
          No ingestion sources available
        </div>
      ) : (
        <div className="divide-y divide-zinc-800">
          {items.map((item) => (
            <div key={item.source_id} className="px-6 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-zinc-100">{item.source_name}</p>
                    <HealthBadge status={item.health_status} />
                    {item.stale ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
                        <Activity className="h-3.5 w-3.5" />
                        Stale
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-zinc-400">
                    <span>Type: {item.source_type || "—"}</span>
                    <span>Parser: {item.parser_type || "—"}</span>
                    <span>
                      Polling:{" "}
                      {item.polling_frequency_minutes
                        ? `${item.polling_frequency_minutes} min`
                        : "—"}
                    </span>
                    <span>Failures: {item.failed_pull_count}</span>
                  </div>

                  {item.stale_reason ? (
                    <p className="mt-2 text-xs text-amber-400">{item.stale_reason}</p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs min-w-[320px]">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                    <p className="text-zinc-500 mb-1">Last Success</p>
                    <p className="text-zinc-200">{formatTime(item.last_successful_pull_at)}</p>
                  </div>

                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                    <p className="text-zinc-500 mb-1">Last Failure</p>
                    <p className="text-zinc-200">{formatTime(item.last_failed_pull_at)}</p>
                  </div>

                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                    <p className="text-zinc-500 mb-1">Last Run Status</p>
                    <p className="text-zinc-200">{item.last_run_status || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}