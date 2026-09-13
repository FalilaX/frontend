import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  Database,
  Gauge,
  MapPinned,
  RefreshCw,
  ShieldCheck,
  Waves,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { API_ENDPOINTS, buildApiUrl } from "@/app/config/api";
import type { UtilityReadinessResponse } from "@/app/types/api";
import logoImage from "@/assets/falilax-logo.png";

type LoadState = "loading" | "ready" | "unauthenticated" | "not_found" | "error";

const TOKEN_STORAGE_KEY = "falilax_notification_session_token";

function safeUtilityId(value: string | null): number {
  if (!value || !/^\d+$/.test(value)) return 1;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

function statusStyle(status: UtilityReadinessResponse["status"]) {
  if (status === "ready") return "border-emerald-400/25 bg-emerald-400/[.07] text-emerald-200";
  if (status === "partial") return "border-amber-300/25 bg-amber-300/[.07] text-amber-200";
  return "border-red-400/25 bg-red-400/[.07] text-red-200";
}

function formatStatus(status: UtilityReadinessResponse["status"]) {
  return status === "needs_data" ? "Needs data" : status[0].toUpperCase() + status.slice(1);
}

export default function UtilityReadiness() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const utilityId = useMemo(() => safeUtilityId(searchParams.get("utilityId")), [searchParams]);
  const [report, setReport] = useState<UtilityReadinessResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [message, setMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async (signal: AbortSignal) => {
    const token = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setReport(null);
      setLoadState("unauthenticated");
      return;
    }

    setLoadState("loading");
    setMessage("");
    try {
      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.UTILITY_READINESS, { utility_id: utilityId }),
        {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal,
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setReport(null);
        setLoadState("unauthenticated");
        return;
      }
      if (response.status === 404) {
        setReport(null);
        setLoadState("not_found");
        return;
      }
      if (!response.ok) throw new Error(`Readiness service returned ${response.status}.`);
      setReport(payload as UtilityReadinessResponse);
      setLoadState("ready");
    } catch (error) {
      if (signal.aborted) return;
      setReport(null);
      setMessage(error instanceof Error ? error.message : "Unable to load readiness information.");
      setLoadState("error");
    }
  }, [utilityId]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  return (
    <div className="fx-app-shell min-h-screen bg-[#03131f] text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-cyan-300/10 bg-[#03131f]/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <button type="button" onClick={() => navigate("/")} aria-label="Return to FalilaX home">
            <img src={logoImage} alt="FalilaX" className="fx-brand-logo" />
          </button>
          <Button variant="ghost" onClick={() => navigate("/dashboard/utility")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-[1440px] px-6 py-8">
        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[.24em] text-cyan-300">Deployment assurance</p>
            <h1 className="flex items-center gap-3 text-3xl font-semibold">
              <ShieldCheck className="h-7 w-7 text-cyan-300" /> Demonstration Readiness
            </h1>
            <p className="mt-2 max-w-3xl text-zinc-400">
              Verify that the authorized utility, its water-system components, geography, and evidence sources are represented before presenting operational intelligence.
            </p>
          </div>
          {report && (
            <span className={`inline-flex w-fit rounded-full border px-3 py-2 text-xs font-semibold ${statusStyle(report.status)}`}>
              {formatStatus(report.status)} · {report.score}%
            </span>
          )}
        </div>

        {loadState === "loading" && <StatePanel icon={<RefreshCw className="animate-spin" />} title="Checking readiness" body="Loading the tenant-scoped utility representation report…" />}
        {loadState === "unauthenticated" && <StatePanel icon={<ShieldCheck />} title="Secure sign-in required" body="Sign in from the dashboard, then return to this readiness view in the same browser tab." action={<Button onClick={() => navigate("/dashboard/utility")}>Go to secure dashboard</Button>} />}
        {loadState === "not_found" && <StatePanel icon={<AlertTriangle />} title="Utility not available" body="This utility does not exist or is outside your authorized account scope." />}
        {loadState === "error" && <StatePanel icon={<AlertTriangle />} title="Readiness service unavailable" body={message} action={<Button variant="outline" onClick={() => setReloadKey((value) => value + 1)}><RefreshCw className="mr-2 h-4 w-4" />Try again</Button>} />}

        {loadState === "ready" && report && (
          <>
            <section className="mb-6 grid overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[#061a29] lg:grid-cols-[.78fr_1.22fr]">
              <div className="flex flex-col justify-center border-b border-cyan-300/10 p-7 lg:border-b-0 lg:border-r">
                <p className="text-xs uppercase tracking-[.2em] text-zinc-500">{report.utility_name}</p>
                <div className="mt-5 flex items-end gap-3"><span className="text-6xl font-semibold tracking-tight text-white">{report.score}</span><span className="pb-2 text-xl text-zinc-500">/ 100</span></div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#03131f]" aria-label={`Readiness score ${report.score} percent`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${report.score}%` }} />
                </div>
                <p className="mt-4 text-sm text-zinc-400">Generated {new Date(report.generated_at).toLocaleString()}</p>
              </div>
              <div className="grid sm:grid-cols-2">
                <Metric icon={<MapPinned />} label="Represented jurisdictions" value={report.geography.represented_jurisdictions} />
                <Metric icon={<Waves />} label="Total sites" value={report.geography.total_sites} />
                <Metric icon={<MapPinned />} label="Geocoded sites" value={report.geography.geocoded_sites} />
                <Metric icon={<Database />} label="Healthy data sources" value={`${report.data_trust.healthy_sources}/${report.data_trust.total_sources}`} />
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
              <section className="rounded-[28px] border border-cyan-300/15 bg-[#061a29] p-6">
                <div className="flex items-center gap-3"><Gauge className="h-5 w-5 text-cyan-300" /><div><h2 className="text-xl font-semibold">Water-system representation</h2><p className="mt-1 text-sm text-zinc-500">Every component is counted from the authorized utility record.</p></div></div>
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {report.components.map((component) => (
                    <div key={component.key} className={`flex items-center justify-between rounded-2xl border p-4 ${component.represented ? "border-emerald-400/15 bg-emerald-400/[.04]" : "border-amber-300/15 bg-amber-300/[.04]"}`}>
                      <div className="flex min-w-0 items-center gap-3">{component.represented ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" /> : <CircleDashed className="h-5 w-5 shrink-0 text-amber-300" />}<span className="truncate text-sm font-medium">{component.label}</span></div>
                      <span className="ml-4 rounded-full border border-white/10 bg-black/15 px-2.5 py-1 text-xs text-zinc-300">{component.count}</span>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="space-y-6">
                <section className="rounded-[24px] border border-cyan-300/15 bg-[#061a29] p-6"><h2 className="font-semibold">Data trust</h2><div className="mt-4 grid grid-cols-2 gap-3"><Detail label="Healthy" value={report.data_trust.healthy_sources} /><Detail label="Stale" value={report.data_trust.stale_sources} /></div><p className="mt-4 text-xs uppercase tracking-[.16em] text-zinc-500">Evidence modes</p><div className="mt-2 flex flex-wrap gap-2">{report.data_trust.modes.length ? report.data_trust.modes.map((mode) => <span key={mode} className="rounded-full border border-cyan-300/15 bg-cyan-300/[.05] px-3 py-1 text-xs capitalize text-cyan-200">{mode}</span>) : <span className="text-sm text-zinc-500">No evidence mode reported</span>}</div></section>
                <section className="rounded-[24px] border border-amber-300/15 bg-amber-300/[.04] p-6"><h2 className="font-semibold text-amber-100">Gaps to resolve</h2>{report.missing_components.length ? <ul className="mt-3 space-y-2 text-sm text-zinc-300">{report.missing_components.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />{item}</li>)}</ul> : <p className="mt-3 text-sm text-emerald-200">All required components are represented.</p>}</section>
              </aside>
            </div>

            <section className="mt-6 rounded-[24px] border border-cyan-300/15 bg-[#061a29] p-6"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" /><div><h2 className="font-semibold">Evidence disclosure</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{report.disclosure}</p></div></div></section>
          </>
        )}
      </main>
    </div>
  );
}

function StatePanel({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return <section className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-cyan-300/15 bg-[#061a29] p-8 text-center"><div className="max-w-xl"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[.05] text-cyan-300 [&>svg]:h-6 [&>svg]:w-6">{icon}</div><h2 className="mt-5 text-2xl font-semibold">{title}</h2><p className="mt-3 text-zinc-400">{body}</p>{action && <div className="mt-6">{action}</div>}</div></section>;
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return <div className="border-b border-cyan-300/10 p-6 odd:border-r"><div className="flex items-center gap-2 text-sm text-zinc-500"><span className="text-cyan-300 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>{label}</div><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div>;
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-xl border border-cyan-300/10 bg-[#03131f] p-4"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-lg font-semibold text-zinc-200">{value}</p></div>;
}
