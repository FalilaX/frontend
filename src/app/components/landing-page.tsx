import { Localize, useLanguage, translate } from "@/app/i18n/language";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Droplets,
  GitBranch,
  MapPinned,
  Radio,
  ShieldCheck,
  Sparkles,
  Waves,
  Eye,
  ClipboardCheck,
  CircleDot,
  ArrowUpRight,
} from "lucide-react";

import logoImage from "@/assets/falilax-logo.png";

// All values in this landing-page preview are illustrative, not live telemetry.
const previewSignals = [
  { label: "Chlorine", value: "0.10 mg/L", note: "Illustrative event" },
  { label: "Turbidity", value: "8.0 NTU", note: "Illustrative event" },
  { label: "Evidence path", value: "11 stages", note: "Feature preview" },
];

const capabilities = [
  {
    icon: GitBranch,
    eyebrow: "Trace",
    title: "Understand where risk may originate",
    description: "Bring water observations and infrastructure context together with source-oriented intelligence.",
    accent: "text-cyan-300",
  },
  {
    icon: BellRing,
    eyebrow: "Inform",
    title: "Keep the right people informed",
    description: "Translate relevant water events into understandable status updates and targeted alerts.",
    accent: "text-sky-300",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Respond",
    title: "Move from evidence to action",
    description: "Support investigation, recommended next steps, acknowledgements, and an inspectable record.",
    accent: "text-emerald-300",
  },
];

const journey = [
  { number: "01", title: "Observe", detail: "Measurements and context", icon: Droplets },
  { number: "02", title: "Interpret", detail: "Risk and source intelligence", icon: Activity },
  { number: "03", title: "Decide", detail: "Incident and response guidance", icon: GitBranch },
  { number: "04", title: "Communicate", detail: "Water status and alerts", icon: BellRing },
];

function PreviewNode({
  className,
  label,
  state,
  active = false,
}: {
  className: string;
  label: string;
  state: string;
  active?: boolean;
}) {
  return (
    <div className={`absolute z-10 rounded-xl border px-2.5 py-2 shadow-lg backdrop-blur-xl ${className} ${
      active ? "border-amber-300/40 bg-[#2d2518]/95" : "border-cyan-200/20 bg-[#071f30]/95"
    }`}>
      <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-100 sm:text-xs">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-amber-300" : "bg-emerald-300"}`} />
        <Localize>{label}</Localize>
      </span>
      <span className="mt-1 block text-[9px] uppercase tracking-wider text-slate-400"><Localize>{state}</Localize></span>
    </div>
  );
}

export function LandingPage() {
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const enterPlatform = () => navigate("/dashboard/utility");
  const enterParticipant = () => navigate("/participant/sign-in");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03101c] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-cyan-500/[0.08] blur-[110px]" />
        <div className="absolute -right-40 top-20 h-[600px] w-[600px] rounded-full bg-blue-600/[0.09] blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-[950px] bg-[linear-gradient(rgba(125,211,252,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.025)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <header className="relative z-30 border-b border-cyan-300/10 bg-[#04111d]/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[78px] max-w-[1360px] flex-wrap items-center justify-between gap-3 px-5 py-2 sm:px-8 lg:px-10">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            aria-label={translate("FalilaX home", locale)}>
            <img src={logoImage} alt="FalilaX" className="h-12 w-auto object-contain sm:h-14" />
          </button>
          <nav aria-label="Page sections" className="hidden items-center gap-7 text-sm text-slate-300 lg:flex">
            <a href="#intelligence" className="hover:text-cyan-200"><Localize>{"Intelligence"}</Localize></a>
            <a href="#capabilities" className="hover:text-cyan-200"><Localize>{"Capabilities"}</Localize></a>
            <a href="#operations" className="hover:text-cyan-200"><Localize>{"Operations"}</Localize></a>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={enterParticipant}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.05] px-3 py-2.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/10 sm:px-4 sm:text-sm">
              <Localize>{"Participant sign in"}</Localize><ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={enterPlatform}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 sm:px-4 sm:text-sm">
              <Localize>{"Enter platform"}</Localize><ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section id="intelligence" className="mx-auto max-w-[1360px] px-5 pb-9 pt-10 sm:px-8 sm:pt-14 lg:px-10 lg:pb-12 lg:pt-16">
          <div className="grid items-center gap-9 lg:grid-cols-[0.89fr_1.11fr] lg:gap-12">
            <div className="max-w-[620px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200 sm:text-xs">
                <Radio className="h-3.5 w-3.5" /><Localize>{"FalilaX intelligence gateway"}</Localize>
              </div>
              <h1 className="text-balance text-[clamp(2.7rem,5vw,5rem)] font-semibold leading-[1.03] tracking-[-0.055em] text-white">
                <Localize>{"See risk sooner."}</Localize>
                <span className="mt-1 block bg-gradient-to-r from-cyan-200 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                  <Localize>{"Know what happens next."}</Localize>
                </span>
              </h1>
              <p className="mt-6 max-w-[540px] text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                <Localize>{"From water observations to source intelligence, coordinated response, and the water-status information people need."}</Localize>
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={enterPlatform}
                  className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2187f3] to-[#20bce5] px-5 py-3.5 text-sm font-bold text-white shadow-[0_16px_50px_rgba(37,153,238,0.25)] transition hover:-translate-y-0.5 sm:text-base">
                  <Localize>{"Open intelligence platform"}</Localize><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <a href="#capabilities" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.035] px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07] sm:text-base">
                  <Localize>{"Explore the experience"}</Localize><ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400 sm:text-sm">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><Localize>{"Multi-parameter intelligence"}</Localize></span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><Localize>{"Evidence-based decisions"}</Localize></span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><Localize>{"Consumer-first updates"}</Localize></span>
              </div>
            </div>

            <div className="relative min-w-0">
              <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-cyan-400/10 via-blue-500/5 to-transparent blur-2xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[1.6rem] border border-cyan-300/20 bg-[#061827] shadow-[0_32px_100px_rgba(0,0,0,0.4)]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-300/10 px-4 py-3.5 sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <img src={logoImage} alt="" className="h-8 w-auto object-contain" />
                    <div>
                      <p className="text-xs font-bold text-white sm:text-sm"><Localize>{"Water intelligence preview"}</Localize></p>
                      <p className="text-[10px] text-slate-400"><Localize>{"Illustrative scenario · Synthetic network"}</Localize></p>
                    </div>
                  </div>
                  <span className="rounded-full border border-amber-300/25 bg-amber-300/[0.07] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200"><Localize>{"Illustrative demo"}</Localize></span>
                </div>
                <div className="grid min-w-0 md:grid-cols-[minmax(0,1fr)_190px] lg:grid-cols-[minmax(0,1fr)_190px]">
                  <div className="min-w-0 bg-[#04131d]">
                    <div className="relative h-[285px] overflow-hidden sm:h-[345px] lg:h-[350px]">
                      <svg className="absolute inset-0 h-full w-full opacity-90" viewBox="0 0 560 360" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
                        <defs><pattern id="gateway-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" stroke="#14364a" strokeWidth="0.6" /></pattern></defs>
                        <rect width="560" height="360" fill="url(#gateway-grid)" />
                        <path d="M-20 90 C110 40 160 162 288 124 S460 56 590 85" stroke="#143c51" strokeWidth="13" />
                        <path d="M-10 283 C105 235 196 322 288 255 S457 240 590 184" stroke="#143c51" strokeWidth="12" />
                        <path d="M90 -20 C120 98 67 183 135 390" stroke="#123347" strokeWidth="6" />
                        <path d="M385 -20 C325 112 400 245 324 390" stroke="#123347" strokeWidth="6" />
                        <path d="M115 72 C180 116 214 208 288 218 S402 164 480 144" stroke="#21a4d1" strokeWidth="2.5" strokeDasharray="7 10" />
                        <circle cx="288" cy="218" r="27" fill="#d5a34d" fillOpacity="0.08" stroke="#f7c76d" strokeOpacity="0.35" />
                        <circle cx="288" cy="218" r="6" fill="#f7c76d" />
                      </svg>
                      <PreviewNode className="left-[5%] top-[10%]" label="Treatment" state="Reference node" />
                      <PreviewNode className="left-[35%] top-[53%]" label="Junction J-17" state="Signal under review" active />
                      <PreviewNode className="right-[3%] top-[22%]" label="Hospital district" state="Network context" />
                      <PreviewNode className="bottom-[6%] right-[5%]" label="Consumer zone" state="Affected-area view" />
                    </div>
                    <div className="m-3 flex items-start gap-2.5 rounded-xl border border-cyan-300/15 bg-[#082234] p-3 sm:m-4">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                      <p className="text-xs leading-5 text-slate-300"><Localize>{"Illustrative multi-signal event: water state, source context, and recommended response shown together."}</Localize></p>
                    </div>
                  </div>
                  <aside className="grid gap-3 border-t border-cyan-300/10 p-3 md:block md:border-l md:border-t-0 md:p-4 lg:block">
                    <div className="mb-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300"><Localize>{"Scenario assessment"}</Localize></p>
                      <p className="mt-2 text-base font-bold text-white"><Localize>{"Signal requires review"}</Localize></p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-400"><Localize>{"Synthetic values for interface illustration only."}</Localize></p>
                    </div>
                    <div className="space-y-2 border-y border-white/10 py-3">
                      {previewSignals.map((signal) => (
                        <div key={signal.label}>
                          <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-slate-400"><Localize>{signal.label}</Localize></span><strong className="text-cyan-100"><Localize>{signal.value}</Localize></strong></div>
                          <span className="text-[9px] text-slate-500"><Localize>{signal.note}</Localize></span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] p-3">
                      <span className="flex items-center gap-2 text-[11px] font-bold text-cyan-200"><ClipboardCheck className="h-4 w-4" /><Localize>{"Example next step"}</Localize></span>
                      <p className="mt-2 text-[11px] leading-5 text-slate-300"><Localize>{"Confirm measurements, inspect the source context, and review affected areas."}</Localize></p>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {journey.map(({ number, title, detail, icon: Icon }) => (
              <div key={number} className="flex items-center gap-3 rounded-2xl border border-cyan-300/10 bg-[#092033]/80 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06]"><Icon className="h-5 w-5 text-cyan-300" /></div>
                <div className="min-w-0"><span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{number} · <Localize>{title}</Localize></span><p className="mt-0.5 text-xs text-slate-300"><Localize>{detail}</Localize></p></div>
              </div>
            ))}
          </div>
        </section>

        <section id="capabilities" className="relative border-y border-cyan-300/10 bg-[#061421]/75">
          <div className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8 lg:px-10 lg:py-14">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300"><Localize>{"One intelligence platform"}</Localize></p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"><Localize>{"From detection to decision."}</Localize></h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base"><Localize>{"One coordinated experience for understanding, communicating, and responding to changes in water conditions."}</Localize></p>
              </div>
              <a href="#operations" className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-200 hover:text-white"><Localize>{"Choose your workspace"}</Localize><ArrowRight className="h-4 w-4" /></a>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {capabilities.map(({ icon: Icon, eyebrow, title, description, accent }) => (
                <article key={title} className="rounded-2xl border border-white/10 bg-[#092134]/70 p-5 transition hover:border-cyan-300/25 hover:bg-[#0b293e] sm:p-6">
                  <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#0b2b42]"><Icon className={`h-5 w-5 ${accent}`} /></span><span className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-500"><Localize>{eyebrow}</Localize></span></div>
                  <h3 className="mt-5 text-lg font-semibold"><Localize>{title}</Localize></h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400"><Localize>{description}</Localize></p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="operations" className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8 lg:px-10 lg:py-14">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300"><Localize>{"Choose your FalilaX experience"}</Localize></p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"><Localize>{"Water intelligence for teams and individuals."}</Localize></h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base"><Localize>{"Operators investigate water events. Individuals can check their water status at any time and receive relevant updates when conditions change."}</Localize></p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-[1.6rem] border border-cyan-300/20 bg-gradient-to-br from-[#0c3147] to-[#071a29] p-6 sm:p-8">
              <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-cyan-300"><Waves className="h-4 w-4" /><Localize>{"Operations workspace"}</Localize></span>
                <h3 className="mt-4 text-2xl font-semibold"><Localize>{"Investigate. Understand. Respond."}</Localize></h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-slate-300"><Localize>{"Enter the demonstration dashboard to explore intelligence, incident context, recommended actions, and evidence."}</Localize></p>
                <button type="button" onClick={enterPlatform} className="mt-6 inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#061321] transition hover:bg-cyan-50"><Localize>{"Launch dashboard"}</Localize><ArrowRight className="h-4 w-4" /></button>
              </div>
            </article>
            <article className="relative overflow-hidden rounded-[1.6rem] border border-emerald-300/15 bg-gradient-to-br from-[#0b2934] to-[#071925] p-6 sm:p-8">
              <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" />
              <div className="relative">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-300"><Eye className="h-4 w-4" /><Localize>{"Individual water status"}</Localize></span>
                <h3 className="mt-4 text-2xl font-semibold"><Localize>{"Your water. Worth checking."}</Localize></h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-slate-300"><Localize>{"Like checking the weather, return whenever you want to understand your water-status information—even when no alert is active."}</Localize></p>
                <button type="button" onClick={enterParticipant} className="mt-6 inline-flex items-center gap-3 rounded-xl border border-emerald-300/30 bg-emerald-300/[0.09] px-5 py-3 text-sm font-bold text-emerald-100 transition hover:bg-emerald-300/[0.15]"><Localize>{"Participant sign in"}</Localize><ArrowRight className="h-4 w-4" /></button>
                <p className="mt-3 text-xs text-slate-500"><Localize>{"Access requires an authorized demonstration participant account."}</Localize></p>
              </div>
            </article>
          </div>
          <div className="mt-4 flex flex-wrap items-start gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-xs leading-5 text-slate-400">
            <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
            <p><Localize>{"Demo notice: the network map and example water values above are illustrative. They do not represent current water quality or official public-health guidance. FalilaX adapts its interpretation and communication to context under the Chameleon Principle."}</Localize></p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-cyan-300/10">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-cyan-400" /><Localize>{"Source-to-tap water intelligence"}</Localize></div>
          <p><Localize>{"© 2026 FalilaX™ · Controlled demonstration environment"}</Localize></p>
        </div>
      </footer>
    </div>
  );
}
