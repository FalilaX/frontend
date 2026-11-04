import { Localize, useLanguage } from "@/app/i18n/language";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CircleAlert,
  Droplets,
  FlaskConical,
  Info,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  getParticipantWaterIntelligence,
  ParticipantWaterIntelligenceUnavailable,
} from "@/app/services/participant-water-intelligence-api";
import type {
  ParticipantWaterIntelligence,
} from "@/app/services/participant-water-intelligence-api";
import { ParticipantAccessError } from "@/app/services/participant-api";
import {
  clearParticipantSession,
  getParticipantSession,
} from "@/app/utils/participant-session";

function readable(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, character => character.toUpperCase());
}

export function ParticipantMyWater({ onExperienceComplete, detailed = false }: { onExperienceComplete?: () => void; detailed?: boolean }) {
  const { locale } = useLanguage();
  const navigate = useNavigate();

  const [intelligence, setIntelligence] =
    useState<ParticipantWaterIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;

    setLoading(true);
    setUnavailable(false);
    setError(false);
    setIntelligence(null);

    const session = getParticipantSession();

    if (!session) {
      navigate("/participant/sign-in", { replace: true });
      return;
    }

    const timeout = window.setTimeout(() => controller.abort(), 30000);

    void getParticipantWaterIntelligence(session, controller.signal)
      .then(result => {
        if (disposed) return;

        if (getParticipantSession()?.accessToken !== session.accessToken) {
          navigate("/participant/sign-in", { replace: true });
          return;
        }

        setIntelligence(result);
        onExperienceComplete?.();
      })
      .catch(caught => {
        if (disposed) return;

        if (getParticipantSession()?.accessToken !== session.accessToken) {
          navigate("/participant/sign-in", { replace: true });
          return;
        }

        if (caught instanceof ParticipantAccessError && caught.expired) {
          clearParticipantSession();
          navigate("/participant/sign-in", { replace: true });
          return;
        }

        if (caught instanceof ParticipantWaterIntelligenceUnavailable) {
          setUnavailable(true);
          return;
        }

        setError(true);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (!disposed) setLoading(false);
      });

    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt, navigate]);

  if (loading) {
    return (
      <section
        aria-labelledby="my-water-title"
        className="mt-6 overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[#071b2a]/90 p-7 sm:p-9"
      >
        <div className="flex items-center gap-3 text-cyan-200">
          <Activity className="h-5 w-5 animate-pulse" />
          <p className="text-sm">
            <Localize>
              {"FalilaX is building your water intelligence view..."}
            </Localize>
          </p>
        </div>
      </section>
    );
  }

  if (unavailable) {
    return (
      <section
        aria-labelledby="my-water-title"
        className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#071b2a]/90 p-7 sm:p-9"
      >
        <Droplets className="h-7 w-7 text-cyan-300" />

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
          <Localize>{"My Water"}</Localize>
        </p>

        <h2
          id="my-water-title"
          className="mt-3 text-2xl font-semibold text-white"
        >
          <Localize>
            {"Water intelligence is not available yet."}
          </Localize>
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          <Localize>
            {
              "Your participant connection is active, but FalilaX does not currently have an authorized water-intelligence view for this connection. No safety conclusion should be inferred from this message."
            }
          </Localize>
        </p>

        <button
          type="button"
          onClick={() => setAttempt(value => value + 1)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 px-4 py-3 text-sm font-medium text-cyan-200"
        >
          <RefreshCw className="h-4 w-4" />
          <Localize>{"Check again"}</Localize>
        </button>
      </section>
    );
  }

  if (error || !intelligence) {
    return (
      <section
        aria-labelledby="my-water-title"
        className="mt-6 overflow-hidden rounded-[2rem] border border-amber-300/15 bg-[#071b2a]/90 p-7 sm:p-9"
      >
        <CircleAlert className="h-7 w-7 text-amber-200" />

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
          <Localize>{"My Water"}</Localize>
        </p>

        <h2
          id="my-water-title"
          className="mt-3 text-2xl font-semibold text-white"
        >
          <Localize>
            {"We could not load your water intelligence."}
          </Localize>
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          <Localize>
            {
              "Your participant profile remains active. This loading problem does not indicate that your water is safe or unsafe."
            }
          </Localize>
        </p>

        <button
          type="button"
          onClick={() => setAttempt(value => value + 1)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 px-4 py-3 text-sm font-medium text-cyan-200"
        >
          <RefreshCw className="h-4 w-4" />
          <Localize>{"Try again"}</Localize>
        </button>
      </section>
    );
  }

  const demonstration = intelligence.context_kind === "DEMONSTRATION";
  const generated = new Date(intelligence.generated_at).toLocaleString(locale);
  const riskLevels = intelligence.parameters.map(p => p.risk_level.toUpperCase());
  const attention = intelligence.elevated_parameters.length > 0
    || riskLevels.some(r => ["HIGH", "CRITICAL", "ELEVATED", "ACTION", "ALERT"].includes(r))
    || ["HIGH", "CRITICAL", "ACTION", "ALERT"].includes(intelligence.status.toUpperCase());
  const lowSignals = !attention && (intelligence.dominant_parameters.length > 0
    || riskLevels.some(r => ["LOW", "WATCH", "NOTICE"].includes(r))
    || ["LOW", "WATCH", "NOTICE"].includes(intelligence.status.toUpperCase()));
  const baseline = !attention && !lowSignals && riskLevels.length > 0
    && riskLevels.every(r => r === "NORMAL");
  const statusTitle = attention ? "Water signals need attention" : lowSignals ? "Low-level changes detected" : baseline ? "No elevated signals detected" : "Water assessment available";
  const statusHelp = attention ? "Review the flagged signals and recommended guidance below." : lowSignals ? "Some monitored signals have changed, but none is classified as elevated." : baseline ? "The parameters assessed are classified as normal. This is not a drinking-water safety certification." : "Review the available assessment before drawing conclusions.";
  const signals = intelligence.dominant_parameters.slice(0, 4);

  return (
    <section aria-labelledby="my-water-title" className="overflow-hidden rounded-[1.75rem] border border-cyan-300/20 bg-[radial-gradient(circle_at_90%_8%,rgba(34,211,238,0.1),transparent_40%),#0A2B3B] shadow-[0_20px_70px_rgba(0,0,0,0.18)]">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200"><Activity className="h-4 w-4"/><Localize>{"Water Pulse™"}</Localize></div>
          <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${attention ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : lowSignals ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100" : "border-teal-300/20 bg-teal-300/10 text-teal-100"}`}><Localize>{attention ? "Attention" : lowSignals ? "Monitoring" : baseline ? "Normal assessed signals" : "Assessment"}</Localize></span>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${attention ? "text-amber-200" : lowSignals ? "text-cyan-200" : "text-emerald-200"}`}><Localize>{demonstration ? "DEMONSTRATION WATER STATUS" : "YOUR WATER ASSESSMENT"}</Localize></p>
            <h2 id="my-water-title" className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl"><Localize>{statusTitle}</Localize></h2>
            <p className="mt-3 text-base font-medium text-slate-200"><Localize>{statusHelp}</Localize></p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300"><Localize>{intelligence.summary}</Localize></p>
          </div>
          <div aria-hidden="true" className={`flex h-20 w-20 items-center justify-center rounded-full border sm:h-28 sm:w-28 ${attention ? "border-amber-300/30 bg-amber-300/10 text-amber-200" : lowSignals ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-200" : "border-teal-300/30 bg-teal-300/10 text-teal-200"}`}>
            {attention ? <CircleAlert className="h-11 w-11"/> : baseline ? <ShieldCheck className="h-11 w-11"/> : <Droplets className="h-11 w-11"/>}
          </div>
        </div>
        {signals.length > 0 && <div className="mt-6 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs uppercase tracking-wider text-slate-400"><Localize>{"Signals"}</Localize></span>{signals.map(p => <span key={p} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-100">{readable(p)}</span>)}{intelligence.dominant_parameters.length > signals.length && <span className="text-xs text-slate-400">+{intelligence.dominant_parameters.length - signals.length}</span>}</div>}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2 text-xs text-slate-400"><ShieldCheck className="h-4 w-4 text-cyan-200"/><Localize>{demonstration ? "Demonstration intelligence" : "Recorded intelligence"}</Localize><span aria-hidden="true">·</span>{generated}</div>
          <button type="button" onClick={() => setAttempt(x => x + 1)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/25 px-3 py-2 text-xs font-medium text-cyan-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><RefreshCw className="h-4 w-4"/><Localize>{"Refresh"}</Localize></button>
        </div>
      </div>
      {(demonstration || intelligence.disclaimer) && <div className="flex gap-3 border-t border-amber-200/15 bg-amber-300/[0.055] px-6 py-4 text-xs leading-5 text-amber-100/85 sm:px-8"><CircleAlert className="h-4 w-4 shrink-0"/><p><Localize>{intelligence.disclaimer || "Demonstration intelligence does not establish the actual safety or quality of drinking water."}</Localize></p></div>}
      <details key={detailed ? "detailed" : "summary"} open={detailed} className="group border-t border-white/10 bg-[#071E2D]/70">
        <summary className="cursor-pointer list-none px-6 py-5 text-sm font-medium text-cyan-200 outline-none hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 sm:px-8"><span className="inline-flex items-center gap-2"><Info className="h-4 w-4"/><Localize>{"Understand this assessment"}</Localize><span className="text-slate-400">·</span><Localize>{"View details"}</Localize></span></summary>
        <div className="grid gap-4 px-6 pb-7 sm:px-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><h3 className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-cyan-300"/><Localize>{"What FalilaX detected"}</Localize></h3><p className="mt-3 text-sm leading-6 text-slate-300"><Localize>{intelligence.elevated_parameters.length ? "Some parameters are classified as elevated in this assessment." : intelligence.dominant_parameters.length ? "Low-level signals were identified; no parameter is classified as elevated in this assessment." : "No elevated parameter was identified in the available assessment."}</Localize></p>{intelligence.elevated_parameters.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{intelligence.elevated_parameters.map(p => <span key={p} className="rounded-full border border-amber-300/25 px-3 py-1 text-xs text-amber-200">{readable(p)}</span>)}</div>}</article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><h3 className="flex items-center gap-2 font-semibold"><Info className="h-4 w-4 text-cyan-300"/><Localize>{"What this may mean"}</Localize></h3>{intelligence.possible_explanations.length > 0 ? <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">{intelligence.possible_explanations.map((p,i) => <li key={`${i}-${p}`}><Localize>{p}</Localize></li>)}</ul> : <p className="mt-3 text-sm leading-6 text-slate-300"><Localize>{"FalilaX did not identify a participant-safe combined explanation from the current signals."}</Localize></p>}</article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 lg:col-span-2"><h3 className="flex items-center gap-2 font-semibold"><FlaskConical className="h-4 w-4 text-cyan-300"/><Localize>{"Parameters in this assessment"}</Localize></h3><p className="mt-2 text-xs leading-5 text-slate-400"><Localize>{"These labels describe FalilaX assessment classifications, not laboratory concentrations or certification of drinking-water safety."}</Localize></p><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{intelligence.parameters.map(p => <div key={p.parameter_code} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#071925] px-4 py-3"><span className="text-sm text-white">{readable(p.parameter_code)}</span><span className={`text-xs ${["HIGH","CRITICAL"].includes(p.risk_level.toUpperCase()) ? "text-amber-200" : "text-slate-300"}`}>{readable(p.risk_level)}</span></div>)}</div>{intelligence.parameters.length === 0 && <p className="mt-4 text-sm text-slate-400"><Localize>{"No parameter classification is available."}</Localize></p>}</article>
        </div>
      </details>
    </section>
  );
}

export default ParticipantMyWater;
