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
} from "lucide-react";

import logoImage from "@/assets/falilax-logo.png";

const intelligenceSignals = [
  { label: "Network state", value: "Stable", tone: "text-emerald-300" },
  { label: "Active sensors", value: "12 / 12", tone: "text-white" },
  { label: "Source confidence", value: "87%", tone: "text-cyan-300" },
];

const capabilities = [
  {
    icon: GitBranch,
    eyebrow: "Trace",
    title: "Find the likely source",
    description:
      "Connect water-quality signals with infrastructure and upstream evidence to explain where risk may originate.",
    accent: "from-cyan-400/20 to-sky-500/5",
    iconColor: "text-cyan-300",
  },
  {
    icon: BellRing,
    eyebrow: "Alert",
    title: "Reach the right people",
    description:
      "Turn live events into clear, targeted notifications with severity, affected areas, and recommended actions.",
    accent: "from-blue-500/20 to-indigo-500/5",
    iconColor: "text-blue-300",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Respond",
    title: "Move from signal to action",
    description:
      "Coordinate investigation, acknowledgement, response, verification, and closure in one operational record.",
    accent: "from-emerald-400/15 to-cyan-500/5",
    iconColor: "text-emerald-300",
  },
];

function SignalNode({
  className,
  label,
  status,
  active = false,
}: {
  className: string;
  label: string;
  status: string;
  active?: boolean;
}) {
  return (
    <div
      className={`absolute z-10 min-w-[128px] rounded-xl border px-3 py-2 backdrop-blur-xl ${className} ${
        active
          ? "border-cyan-300/50 bg-cyan-300/10 shadow-[0_0_32px_rgba(34,211,238,0.18)]"
          : "border-white/10 bg-[#071827]/90"
      }`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-white">
        <span
          className={`h-2 w-2 rounded-full ${
            active ? "bg-cyan-300 shadow-[0_0_12px_#67e8f9]" : "bg-emerald-400"
          }`}
        />
        <Localize>{label}</Localize>
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
        <Localize>{status}</Localize>
      </p>
    </div>
  );
}

export function LandingPage() {
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const enterPlatform = () => navigate("/dashboard/utility");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03101c] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-48 top-0 h-[680px] w-[680px] rounded-full bg-cyan-500/[0.09] blur-[120px]" />
        <div className="absolute -right-40 top-20 h-[620px] w-[620px] rounded-full bg-blue-600/[0.12] blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(125,211,252,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.025)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      </div>

      <header className="relative z-30 border-b border-cyan-300/10 bg-[#03101c]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-24 max-w-[1500px] items-center justify-between px-6 lg:px-10">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            aria-label={translate("FalilaX home", locale)}
          >
            <img src={logoImage} alt="FalilaX" className="h-16 w-auto object-contain" />
          </button>

          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#intelligence" className="transition hover:text-white"><Localize>{"Intelligence"}</Localize></a>
            <a href="#capabilities" className="transition hover:text-white"><Localize>{"Capabilities"}</Localize></a>
            <a href="#operations" className="transition hover:text-white"><Localize>{"Operations"}</Localize></a>
          </nav>

          <button
            type="button"
            onClick={enterPlatform}
            className="group inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-white/[0.045] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
          ><Localize>{" Enter platform "}</Localize><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </header>

      <main className="relative z-10">
        <section
          id="intelligence"
          className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1500px] items-center gap-16 px-6 py-16 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:py-20"
        >
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
              <Radio className="h-3.5 w-3.5 animate-pulse" /><Localize>{" Live predictive water intelligence "}</Localize></div>

            <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-[5.35rem]"><Localize>{" See risk sooner. "}</Localize><span className="mt-2 block bg-gradient-to-r from-cyan-200 via-sky-400 to-blue-500 bg-clip-text text-transparent"><Localize>{" Know what happens next. "}</Localize></span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl"><Localize>{" FalilaX turns fragmented water, infrastructure, and public-health signals into one clear operating picture—so teams can detect, trace, and respond with confidence. "}</Localize></p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={enterPlatform}
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2187f3] to-[#20bce5] px-6 py-4 text-base font-bold text-white shadow-[0_18px_55px_rgba(37,153,238,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_65px_rgba(37,153,238,0.38)]"
              ><Localize>{" Open intelligence platform "}</Localize><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href="#capabilities"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-6 py-4 font-semibold text-slate-200 transition hover:border-cyan-300/25 hover:bg-white/[0.065]"
              ><Localize>{" See what FalilaX does "}</Localize></a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><Localize>{" Continuous monitoring"}</Localize></span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><Localize>{" Source attribution"}</Localize></span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><Localize>{" Coordinated response"}</Localize></span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[760px]">
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-cyan-400/10 via-blue-500/5 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[#061827]/85 shadow-[0_40px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-cyan-300/10 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <img
                    src={logoImage}
                    alt="FalilaX"
                    className="h-10 w-auto rounded-lg object-contain"
                  />
                  <div>
                    <p className="text-sm font-bold text-white"><Localize>{"FalilaX Network Intelligence"}</Localize></p>
                    <p className="mt-0.5 text-xs text-slate-500"><Localize>{"City water system · Live operating picture"}</Localize></p>
                  </div>
                </div>
                <span className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" /><Localize>{" Live network "}</Localize></span>
              </div>

              <div className="grid lg:grid-cols-[1fr_210px]">
                <div className="flex flex-col overflow-hidden border-cyan-300/10 bg-[#04131d] lg:border-r">
                  <div className="relative min-h-[460px] flex-1 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_45%,rgba(14,165,233,0.12),transparent_45%)]" />
                  <svg className="absolute inset-0 h-full w-full opacity-80" viewBox="0 0 560 460" fill="none" aria-hidden="true">
                    <path d="M-20 108C76 75 126 92 191 135C270 187 337 154 409 112C460 82 510 75 590 45" stroke="#12364c" strokeWidth="12" />
                    <path d="M20 385C111 348 169 405 247 371C338 331 390 281 590 330" stroke="#12364c" strokeWidth="12" />
                    <path d="M80 -30C126 75 82 161 101 262C118 352 138 390 167 490" stroke="#0d3148" strokeWidth="5" />
                    <path d="M365 -20C331 103 357 177 339 271C325 344 313 410 309 490" stroke="#0d3148" strokeWidth="5" />
                    <path d="M125 104C214 140 206 270 288 304C366 337 422 241 497 224" stroke="#1687bd" strokeWidth="3" strokeDasharray="9 12" />
                  </svg>

                  <SignalNode className="left-[7%] top-[14%]" label="North Treatment" status="Normal" />
                  <SignalNode className="left-[39%] top-[54%]" label="Junction J-17" status="Trace point" active />
                  <SignalNode className="right-[6%] top-[28%]" label="Hospital District" status="Protected" />
                  <SignalNode className="bottom-[12%] right-[10%]" label="East School Zone" status="Monitoring" />

                  </div>
                  <div className="m-5 flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-300/15 bg-[#061827]/90 p-4 backdrop-blur-xl">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-300/10">
                      <Sparkles className="h-4 w-4 text-cyan-300" />
                    </div>
                    <p className="text-xs leading-5 text-slate-300"><Localize>{"Signals correlate with an upstream change near Junction J-17."}</Localize></p>
                    <span className="ml-auto whitespace-nowrap text-xs font-bold text-emerald-300"><Localize>{"87% confidence"}</Localize></span>
                  </div>
                </div>

                <aside className="space-y-5 p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300"><Localize>{"Current assessment"}</Localize></p>
                    <h2 className="mt-2 text-lg font-bold text-white"><Localize>{"Network stable"}</Localize></h2>
                    <p className="mt-2 text-xs leading-5 text-slate-400"><Localize>{"No active public-health incident. One signal under observation."}</Localize></p>
                  </div>

                  <div className="space-y-3 border-y border-white/[0.07] py-5">
                    {intelligenceSignals.map((signal) => (
                      <div key={signal.label} className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500"><Localize>{signal.label}</Localize></span>
                        <span className={`text-xs font-bold ${signal.tone}`}><Localize>{signal.value}</Localize></span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.06] p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
                      <Activity className="h-4 w-4" /><Localize>{" Recommended action "}</Localize></div>
                    <p className="mt-3 text-xs leading-5 text-slate-300"><Localize>{"Continue monitoring and verify the upstream residual trend."}</Localize></p>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        <section id="capabilities" className="border-y border-cyan-300/10 bg-[#061421]/65">
          <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300"><Localize>{"One intelligence platform"}</Localize></p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl"><Localize>{"From detection to decision."}</Localize></h2>
              <p className="mt-5 text-lg leading-8 text-slate-400"><Localize>{"Everything needed to understand a water event and coordinate the next response—without unnecessary layers."}</Localize></p>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {capabilities.map(({ icon: Icon, eyebrow, title, description, accent, iconColor }) => (
                <article key={title} className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.04]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition duration-300 group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#071c2d]">
                        <Icon className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600"><Localize>{eyebrow}</Localize></span>
                    </div>
                    <h3 className="mt-8 text-2xl font-bold text-white"><Localize>{title}</Localize></h3>
                    <p className="mt-4 leading-7 text-slate-400"><Localize>{description}</Localize></p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="operations" className="mx-auto max-w-[1500px] px-6 py-24 lg:px-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-gradient-to-br from-[#09253a] via-[#071b2c] to-[#071522] px-7 py-14 shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-[90px]" />
            <div className="relative max-w-2xl">
              <div className="flex items-center gap-3 text-cyan-300">
                <Droplets className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]"><Localize>{"FalilaX operations"}</Localize></span>
              </div>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white"><Localize>{"A clearer view of water risk starts here."}</Localize></h2>
              <p className="mt-5 text-lg leading-8 text-slate-400"><Localize>{"Enter the live demonstration workspace directly. No context selection, no duplicate paths."}</Localize></p>
            </div>
            <button
              type="button"
              onClick={enterPlatform}
              className="group relative mt-9 inline-flex shrink-0 items-center gap-3 rounded-xl bg-white px-6 py-4 font-bold text-[#061321] transition hover:-translate-y-0.5 hover:bg-cyan-50 lg:ml-10 lg:mt-0"
            ><Localize>{" Launch dashboard "}</Localize><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-cyan-300/10">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-cyan-400" /><Localize>{" Source-to-tap water intelligence"}</Localize></div>
          <p><Localize>{"© 2026 FalilaX™ · Demonstration environment"}</Localize></p>
        </div>
      </footer>
    </div>
  );
}
