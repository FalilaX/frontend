import { Localize, useLanguage } from "@/app/i18n/language";
import { ParticipantNotificationHistory } from "@/app/components/participant-notification-history";
import { ParticipantEmailRehearsal } from "@/app/components/participant-email-rehearsal";
import { ParticipantPreferencesEditor } from "@/app/components/participant-preferences-editor";
import { ParticipantMyWater } from "@/app/components/participant-my-water";
import { useEffect, useState } from "react";
import { getParticipantContext, ParticipantAccessError } from "@/app/services/participant-api";
import type { ParticipantContext } from "@/app/services/participant-api";
import { getParticipantSession } from "@/app/utils/participant-session";
import { BellRing, CheckCircle2, LogOut, ShieldCheck, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";

import logoImage from "@/assets/falilax-logo.png";
import {
  clearParticipantSession,
} from "@/app/utils/participant-session";

import { useParticipantProfile } from "@/app/components/participant-route";

export function ParticipantHome() {
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const profile = useParticipantProfile();

  const [context, setContext] = useState<ParticipantContext | null>(null);
  const [contextError, setContextError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    setContext(null);
    setContextError(false);
    const session = getParticipantSession();
    if (!session) {
      navigate("/participant/sign-in", { replace: true });
      return;
    }
    const timeout = setTimeout(() => controller.abort(), 30000);
    void getParticipantContext(session, controller.signal).then(result => {
      if (disposed) return;
      if (getParticipantSession()?.accessToken !== session.accessToken) {
        navigate("/participant/sign-in", { replace: true });
        return;
      }
      setContext(result);
    }).catch(error => {
      if (disposed) return;
      if (error instanceof ParticipantAccessError && error.expired) {
        if (getParticipantSession()?.accessToken === session.accessToken) clearParticipantSession();
        navigate("/participant/sign-in", { replace: true });
      } else {
        setContextError(true);
      }
    }).finally(() => clearTimeout(timeout));
    return () => { disposed = true; clearTimeout(timeout); controller.abort(); };
  }, [attempt, navigate, profile.subscriber_id, profile.organization_id]);

  const preference = context?.preferences;
  const readable = (value: string) => value.toLowerCase().replaceAll("_", " ");
  const channelNames: Record<string, string> = { EMAIL: "Email", SMS: "SMS", WHATSAPP: "WhatsApp", IN_APP: "In-app", PUSH: "Push" };

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
            <LogOut className="h-4 w-4" /><Localize>{" End secure session "}</Localize></button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16">
        <section className="overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-[#071b2a]/90 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-200">
                <CheckCircle2 className="h-4 w-4" /><Localize>{" Protected participant workspace "}</Localize></div>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300"><Localize>{"Water-safety connection"}</Localize></p>
              <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-5xl"><Localize>{" Your FalilaX connection is active. "}</Localize></h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base"><Localize>{" Welcome, "}</Localize>{profile.full_name}<Localize>{". Your participant profile has been verified. "}</Localize></p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6">
              <ShieldCheck className="h-7 w-7 text-emerald-300" />
              <p className="mt-4 text-sm font-medium text-white"><Localize>{"Secure session active"}</Localize></p>
              <p className="mt-2 text-xs leading-5 text-slate-500"><Localize>{" Participant reference "}</Localize>{profile.subscriber_id}<Localize>{". This session cannot access operator or administrative controls. "}</Localize></p>
            </div>
          </div>
        </section>

        <ParticipantMyWater />

        {!context && <div role="status" className="mt-6 rounded-3xl border border-white/10 p-6 text-sm text-slate-300">
          <Localize>{contextError ? "Your profile is verified, but we could not load your saved preferences and service context." : "Loading your saved preferences and service context…"}</Localize>
          {contextError && <button type="button" onClick={() => setAttempt(value => value + 1)} className="ml-3 rounded-xl border border-cyan-300/30 px-4 py-2 text-cyan-200"><Localize>{"Try again"}</Localize></button>}
        </div>}
        {context && <section className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6">
            <BellRing className="h-6 w-6 text-cyan-300" />
            <h2 className="mt-4 text-lg font-semibold text-white"><Localize>{"Safety notifications"}</Localize></h2>
            <p className="mt-2 text-sm leading-6 text-slate-400"><Localize>{"Your saved notification choices."}</Localize></p>
            {preference ? <>
              <p className="mt-4 text-sm text-cyan-200"><Localize>{!preference.is_active ? "Preferences inactive" : preference.paused ? "Notifications paused" : "Preferences active"}</Localize></p>
              <dl className="mt-4 space-y-4 text-sm">
                <div><dt className="text-slate-400"><Localize>{"Selected channels"}</Localize></dt><dd className="mt-1 text-slate-100"><Localize>{preference.channels.map(channel => channelNames[channel]).join(" · ") || "No channels selected"}</Localize></dd></div>
                <div><dt className="text-slate-400"><Localize>{"Minimum severity"}</Localize></dt><dd className="mt-1 capitalize"><Localize>{readable(preference.minimum_severity)}</Localize></dd></div>
                <div><dt className="text-slate-400"><Localize>{"Quiet hours"}</Localize></dt><dd className="mt-1"><Localize>{preference.quiet_hours_enabled ? `${preference.quiet_hours_start?.slice(0, 5)}–${preference.quiet_hours_end?.slice(0, 5)} (${preference.quiet_hours_timezone})` : "Not enabled"}</Localize></dd></div>
                {preference.paused && <div><dt className="text-slate-400"><Localize>{"Paused until"}</Localize></dt><dd className="mt-1"><Localize>{preference.paused_until ? new Date(preference.paused_until).toLocaleString(locale) : "Not specified"}</Localize><Localize>{" (your device time)"}</Localize></dd></div>}
                <div><dt className="text-slate-400"><Localize>{"Emergency quiet-hours override"}</Localize></dt><dd className="mt-1"><Localize>{preference.emergency_override_enabled ? "Enabled" : "Not enabled"}</Localize></dd></div>
                <div><dt className="text-slate-400"><Localize>{"Acknowledgement"}</Localize></dt><dd className="mt-1"><Localize>{preference.acknowledgement_required ? `Requested within ${preference.acknowledgement_timeout_minutes} minutes` : "Not requested"}</Localize></dd></div>
                <div><dt className="text-slate-400"><Localize>{"Escalation"}</Localize></dt><dd className="mt-1"><Localize>{preference.escalation_enabled ? `Configured after ${preference.escalation_timeout_minutes} minutes` : "Not enabled"}</Localize></dd></div>
              </dl>
            </> : <p className="mt-4 text-sm text-slate-300"><Localize>{"No notification preferences have been saved for your participant profile."}</Localize></p>}
            <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400"><Localize>{"Saved choices do not confirm delivery eligibility or that an alert was sent. Recorded notification activity appears below."}</Localize></p>
            {savedMessage && <p role="status" className="mt-4 text-sm text-emerald-200"><Localize>{savedMessage}</Localize></p>}
            {!editing && <button type="button" onClick={() => { setSavedMessage(""); setEditing(true); }} className="mt-5 rounded-xl border border-cyan-300/30 px-4 py-3 text-sm font-medium text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><Localize>{"Manage notification choices"}</Localize></button>}
            {editing && <ParticipantPreferencesEditor onCancel={() => setEditing(false)} onSaved={() => {
              setEditing(false); setSavedMessage("Your notification choices have been saved."); setAttempt(value => value + 1);
            }} />}
          </article>
          <article className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6">
            <Waves className="h-6 w-6 text-sky-300" />
            <h2 className="mt-4 text-lg font-semibold text-white"><Localize>{"Trusted service context"}</Localize></h2>
            <p className="mt-2 text-sm leading-6 text-slate-400"><Localize>{"Approved associations recorded during your completed enrollment."}</Localize></p>
            {context.assignments.length ? <ul className="mt-5 space-y-3">
              {context.assignments.map(assignment => <li key={assignment.assignment_id} className="rounded-2xl border border-white/10 p-4">
                <p className="text-xs font-medium text-cyan-200"><Localize>{assignment.context_kind === "DEMONSTRATION" ? "Demonstration association" : "Recorded association"}</Localize></p>
                <p className="mt-2 text-sm capitalize"><Localize>{readable(assignment.scope_type)}</Localize><Localize>{" · Reference "}</Localize>{assignment.scope_id}</p>
                <p className="mt-1 text-xs capitalize text-slate-400"><Localize>{readable(assignment.relationship_type)}</Localize></p>
              </li>)}
            </ul> : <p className="mt-4 text-sm text-slate-300"><Localize>{"No approved service associations from completed enrollment are available."}</Localize></p>}
            {context.assignments_truncated && <p className="mt-3 text-xs text-slate-400"><Localize>{"Showing the 100 most recent associations."}</Localize></p>}
            <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400"><Localize>{"Demonstration associations are synthetic. These records do not establish current water quality, safety, or active alert routing."}</Localize></p>
          </article>
        </section>}

        <ParticipantEmailRehearsal />
        <ParticipantNotificationHistory />
      </main>
    </div>
  );
}

export default ParticipantHome;
