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

export function ParticipantMyWater() {
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
            <Localize>{"FalilaX is building your water intelligence view..."}</Localize>
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
        <h2 id="my-water-title" className="mt-3 text-2xl font-semibold text-white">
          <Localize>{"Water intelligence is not available yet."}</Localize>
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          <Localize>
            {"Your participant connection is active, but FalilaX does not currently have an authorized water-intelligence view for this connection. No safety conclusion should be inferred from this message."}
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
        <h2 id="my-water-title" className="mt-3 text-2xl font-semibold text-white">
          <Localize>{"We could not load your water intelligence."}</Localize>
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          <Localize>
            {"Your participant profile remains active. This loading problem does not indicate that your water is safe or unsafe."}
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

  return (
    <section
      aria-labelledby="my-water-title"
      className="mt-6 overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[#071b2a]/95 shadow-[0_30px_100px_rgba(0,0,0,0.22)]"
    >
      <div className="p-7 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07]">
                <Droplets className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  <Localize>{"My Water"}</Localize>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  <Localize>{demonstration ? "Demonstration intelligence" : "Recorded intelligence"}</Localize>
                </p>
              </div>
            </div>

            <h2
              id="my-water-title"
              className="mt-6 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl"
            >
              <Localize>{intelligence.headline}</Localize>
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              <Localize>{intelligence.summary}</Localize>
            </p>
          </div>

          <div
            className="min-w-[170px] rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] px-5 py-4 text-cyan-50"
          >
            <p className="text-xs uppercase tracking-[0.16em] opacity-70">
              <Localize>{"Current status"}</Localize>
            </p>
            <p className="mt-2 text-lg font-semibold">
              <Localize>{readable(intelligence.status)}</Localize>
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-cyan-300" />
              <h3 className="text-lg font-semibold text-white">
                <Localize>{"What FalilaX detected"}</Localize>
              </h3>
            </div>

            {intelligence.elevated_parameters.length > 0 ? (
              <>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  <Localize>
                    {"These parameters are contributing to the current multi-parameter assessment."}
                  </Localize>
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {intelligence.elevated_parameters.map(parameter => (
                    <span
                      key={parameter}
                      className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-1.5 text-xs font-medium text-amber-100"
                    >
                      {readable(parameter)}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-400">
                <Localize>
                  {"No elevated parameter is identified in the participant-safe intelligence currently returned by FalilaX."}
                </Localize>
              </p>
            )}

            {intelligence.dominant_parameters.length > 0 && (
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  <Localize>{"Dominant signals"}</Localize>
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {intelligence.dominant_parameters.map(readable).join(" · ")}
                </p>
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-sky-300" />
              <h3 className="text-lg font-semibold text-white">
                <Localize>{"What this may mean"}</Localize>
              </h3>
            </div>

            {intelligence.possible_explanations.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {intelligence.possible_explanations.map((explanation, index) => (
                  <li
                    key={`${index}-${explanation}`}
                    className="flex gap-3 text-sm leading-6 text-slate-300"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300"
                    />
                    <Localize>{explanation}</Localize>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-400">
                <Localize>
                  {"FalilaX is not presenting a participant-safe explanation for this assessment at this time."}
                </Localize>
              </p>
            )}
          </article>
        </div>

        {intelligence.parameters.length > 0 && (
          <article className="mt-5 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-cyan-300" />
              <h3 className="text-lg font-semibold text-white">
                <Localize>{"Parameters in this assessment"}</Localize>
              </h3>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {intelligence.parameters.map(parameter => (
                <div
                  key={parameter.parameter_code}
                  className="rounded-2xl border border-white/[0.08] bg-black/10 p-4"
                >
                  <p className="text-sm font-medium text-white">
                    {readable(parameter.parameter_code)}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    <Localize>{"Risk level: "}</Localize>
                    <span className="text-slate-200">
                      <Localize>{readable(parameter.risk_level)}</Localize>
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </article>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
            <Localize>{"Generated "}</Localize>{generated}
            <Localize>{" using your authorized participant context."}</Localize>
          </div>

          <button
            type="button"
            onClick={() => setAttempt(value => value + 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <Localize>{"Refresh My Water"}</Localize>
          </button>
        </div>
      </div>

      {(demonstration || intelligence.disclaimer) && (
        <div className="border-t border-amber-300/15 bg-amber-300/[0.045] px-7 py-5 sm:px-9">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <p className="text-sm font-medium text-amber-100">
                <Localize>
                  {demonstration ? "Demonstration context" : "Important information"}
                </Localize>
              </p>
              <p className="mt-1 text-xs leading-6 text-amber-100/70">
                <Localize>
                  {intelligence.disclaimer
                    || "This demonstration does not establish the current safety or quality of your actual drinking water."}
                </Localize>
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ParticipantMyWater;
