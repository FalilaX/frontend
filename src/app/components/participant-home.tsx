import { BellRing, CheckCircle2, LogOut, ShieldCheck, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";

import logoImage from "@/assets/falilax-logo.png";
import {
  clearParticipantSession,
  getParticipantSession,
} from "@/app/utils/participant-session";

export function ParticipantHome() {
  const navigate = useNavigate();
  const session = getParticipantSession();

  function signOut() {
    clearParticipantSession();
    navigate("/", { replace: true });
  }

  return (
    <div className="fx-app-shell min-h-screen text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <img src={logoImage} alt="FalilaX" className="object-contain" />
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            End secure session
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16">
        <section className="overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-[#071b2a]/90 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                Protected participant workspace
              </div>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Water-safety connection</p>
              <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
                Your FalilaX connection is active.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Your verified contact preferences and approved service area are connected. Safety updates will follow the choices you made during enrollment.
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6">
              <ShieldCheck className="h-7 w-7 text-emerald-300" />
              <p className="mt-4 text-sm font-medium text-white">Secure session active</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Participant reference {session?.subscriberId ?? "verified"}. This session cannot access operator or administrative controls.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6">
            <BellRing className="h-6 w-6 text-cyan-300" />
            <h2 className="mt-4 text-lg font-semibold text-white">Safety notifications</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              FalilaX will use only your verified channels and enrollment preferences when safety information requires your attention.
            </p>
          </article>
          <article className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6">
            <Waves className="h-6 w-6 text-sky-300" />
            <h2 className="mt-4 text-lg font-semibold text-white">Trusted service context</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Your connection is scoped to the service context approved during enrollment. Operational command tools remain restricted to authorized personnel.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default ParticipantHome;
