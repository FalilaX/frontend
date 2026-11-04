import { Localize } from "@/app/i18n/language";
import { ParticipantNotificationHistory } from "@/app/components/participant-notification-history";
import { ParticipantEmailRehearsal } from "@/app/components/participant-email-rehearsal";
import { ParticipantPreferencesEditor } from "@/app/components/participant-preferences-editor";
import { ParticipantMyWater } from "@/app/components/participant-my-water";
import { useEffect, useState } from "react";
import { getParticipantContext } from "@/app/services/participant-api";
import type { ParticipantContext } from "@/app/services/participant-api";
import { clearParticipantSession, getParticipantSession } from "@/app/utils/participant-session";
import { Activity, Bell, ChevronDown, ChevronRight, CircleHelp, Droplets, History, LogOut, Mail, MessageCircle, Settings2, ShieldCheck, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImage from "@/assets/falilax-logo.png";
import { useParticipantProfile } from "@/app/components/participant-route";

const surface = "rounded-[1.65rem] border border-white/[0.09] bg-[#0B2232] shadow-[0_18px_60px_rgba(0,0,0,0.14)]";
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300";

export function ParticipantHome() {
  const navigate = useNavigate();
  const profile = useParticipantProfile();
  const [context, setContext] = useState<ParticipantContext | null>(null);
  const [contextError, setContextError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [showService, setShowService] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRehearsal, setShowRehearsal] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [concernType, setConcernType] = useState("Water quality concern");
  const [concernDetails, setConcernDetails] = useState("");
  const [sessionMinutes, setSessionMinutes] = useState<number | null>(null);
  const [view, setView] = useState<"overview" | "water" | "notifications" | "help">("overview");

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    setContextError(false);
    const session = getParticipantSession();
    if (!session) {
      setContextError(true);
      return;
    }
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    void getParticipantContext(session, controller.signal)
      .then(result => { if (!disposed) setContext(result); })
      .catch(() => { if (!disposed) setContextError(true); })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  useEffect(() => {
    const update = () => {
      const session = getParticipantSession();
      setSessionMinutes(session ? Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 60_000)) : null);
    };
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  function switchView(next: "overview" | "water" | "notifications" | "help") {
    setView(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function signOut() {
    clearParticipantSession();
    navigate("/participant/sign-in", { replace: true });
  }


  const preference = context?.preferences;
  const channelLabels: Record<string, string> = { EMAIL: "Email", SMS: "SMS", WHATSAPP: "WhatsApp", IN_APP: "In-app", PUSH: "Push" };
  const channels = preference?.channels.map(x => channelLabels[x] || x).join(" · ");
  const readable = (value: string) => value.toLowerCase().replaceAll("_", " ");

  return (
    <div className="fx-app-shell min-h-screen bg-[#061724] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#071a29]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="FalilaX" className="h-10 w-auto max-w-[130px] object-contain" />
            <span className="hidden border-l border-white/15 pl-3 text-xs text-slate-400 sm:inline"><Localize>{"Participant workspace"}</Localize></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-emerald-200 sm:inline-flex"><ShieldCheck className="h-4 w-4"/><Localize>{"Secure workspace"}</Localize></span>
            <button type="button" onClick={signOut} className={`${focus} inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10`}><LogOut className="h-4 w-4"/><Localize>{"Sign out"}</Localize></button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 pb-28 sm:px-8 lg:grid-cols-[204px_minmax(0,1fr)] lg:gap-8 lg:py-10 lg:pb-10">
        <aside className="hidden lg:block">
          <nav aria-label="Participant navigation" className="sticky top-24 space-y-1 rounded-3xl border border-white/[0.07] bg-[#0A1F2E] p-3 text-sm">
            {([
              ["overview", "Overview", Activity],
              ["water", "My Water", Droplets],
              ["notifications", "Notifications", Bell],
              ["help", "Help & contact", MessageCircle],
            ] as const).map(([id, label, Icon]) => (
              <button key={id} type="button" onClick={() => switchView(id)} aria-current={view === id ? "page" : undefined}
                className={`${focus} flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${view === id ? "bg-cyan-300/10 font-medium text-cyan-200" : "text-slate-300 hover:bg-white/5"}`}>
                <Icon className="h-4 w-4"/><Localize>{label}</Localize>
              </button>
            ))}
          </nav>
        </aside>

        <main id="overview" className="min-w-0 space-y-5">
          <nav aria-label="Participant mobile navigation" className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 gap-1 rounded-2xl border border-cyan-300/20 bg-[#0A1F2E]/95 p-1 shadow-2xl backdrop-blur-xl lg:hidden">
            {(["overview", "water", "notifications", "help"] as const).map((id) => (
              <button key={id} type="button" onClick={() => switchView(id)} aria-current={view === id ? "page" : undefined}
                className={`${focus} rounded-xl px-1 py-2.5 text-center text-xs ${view === id ? "bg-cyan-300/10 font-semibold text-cyan-200" : "text-slate-300"}`}>
                <Localize>{id === "overview" ? "Overview" : id === "water" ? "My Water" : id === "notifications" ? "Alerts" : "Help"}</Localize>
              </button>
            ))}
          </nav>
          <section className="flex flex-wrap items-end justify-between gap-4 px-1 pb-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300"><Localize>{view === "overview" ? "YOUR WATER AT A GLANCE" : view === "water" ? "WATER INTELLIGENCE" : view === "notifications" ? "YOUR NOTIFICATIONS" : "WATER CONNECT"}</Localize></p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl"><Localize>{view === "overview" ? "Welcome back" : view === "water" ? "My Water" : view === "notifications" ? "Notifications" : "Help & contact"}</Localize>{view === "overview" && profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
              <p className="mt-2 text-sm text-slate-400"><Localize>{view === "overview" ? "Your water information, explained simply. Explore at your own pace." : view === "water" ? "Understand the measurements and evidence behind your assessment." : view === "notifications" ? "Review activity and manage your alert choices." : "Find the right contact for your question or concern."}</Localize></p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.05] px-3 py-1.5 text-xs text-emerald-200"><ShieldCheck className="h-3.5 w-3.5"/><Localize>{"Profile verified"}</Localize></span>
          </section>

          {sessionMinutes !== null && sessionMinutes <= 5 && <div role="status" className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100"><Localize>{`Your secure session ends in approximately ${sessionMinutes} minute${sessionMinutes === 1 ? "" : "s"}. Please save unfinished work. You may need to sign in again.`}</Localize></div>}

          {(view === "overview" || view === "water") && <div id="my-water" className="scroll-mt-24"><ParticipantMyWater key={view} detailed={view === "water"} onHelp={() => switchView("help")} /></div>}

          <div className={`grid gap-5 ${view === "overview" ? "md:grid-cols-2" : ""}`}>
            {(view === "overview" || view === "notifications") && (
            <section id="notifications" className={`${surface} scroll-mt-24 p-5 sm:p-6`}>
              <div className="flex items-center gap-3"><span className="rounded-xl bg-cyan-300/10 p-2.5 text-cyan-200"><Bell className="h-5 w-5"/></span><h2 className="text-lg font-semibold"><Localize>{"Notifications"}</Localize></h2></div>
              <p className="mt-3 text-sm leading-6 text-slate-400"><Localize>{"Your saved alert choices and recorded notification activity."}</Localize></p>
              {!context && <div role="status" className="mt-4 text-sm text-slate-400"><Localize>{contextError ? "Could not load notification preferences." : "Loading your preferences…"}</Localize>{contextError && <button type="button" onClick={() => setAttempt(x => x + 1)} className={`${focus} ml-3 text-cyan-200 underline`}><Localize>{"Retry"}</Localize></button>}</div>}
              {context && <div className="mt-5 rounded-2xl border border-white/[0.07] bg-[#071A29] p-4">
                <div className="flex items-center justify-between gap-3"><span className="text-sm text-slate-300"><Localize>{"Notification choices"}</Localize></span><span className={`text-xs font-medium ${preference?.is_active && !preference.paused ? "text-emerald-200" : "text-amber-200"}`}><Localize>{!preference ? "Not configured" : !preference.is_active ? "Inactive" : preference.paused ? "Paused" : "Active"}</Localize></span></div>
                <p className="mt-2 text-sm text-white"><Localize>{channels || "No channels selected"}</Localize></p>
                {preference && <p className="mt-1 text-xs text-slate-400"><Localize>{`Minimum severity: ${readable(preference.minimum_severity)}`}</Localize></p>}
              </div>}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setShowHistory(x => !x)} aria-expanded={showHistory} className={`${focus} inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-300/25 px-3 py-3 text-sm font-medium text-cyan-200 hover:bg-cyan-300/5`}><History className="h-4 w-4"/><Localize>{"History"}</Localize><ChevronDown className={`h-4 w-4 transition ${showHistory ? "rotate-180" : ""}`}/></button>
                <button type="button" onClick={() => setShowPreferences(x => !x)} aria-expanded={showPreferences} className={`${focus} inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 px-3 py-3 text-sm text-slate-200 hover:bg-white/5`}><Settings2 className="h-4 w-4"/><Localize>{"Settings"}</Localize><ChevronRight className="h-4 w-4"/></button>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500"><Localize>{"Saved preferences do not confirm an alert was delivered."}</Localize></p>
            </section>

            )}
            {(view === "overview" || view === "help") && (
            <section id="water-connect" className={`${surface} scroll-mt-24 p-5 sm:p-6`}>
              <div className="flex items-center gap-3"><span className="rounded-xl bg-teal-300/10 p-2.5 text-teal-200"><MessageCircle className="h-5 w-5"/></span><h2 className="text-lg font-semibold"><Localize>{"Water Connect"}</Localize></h2></div>
              <p className="mt-3 text-sm leading-6 text-slate-400"><Localize>{"Questions about FalilaX? Need to report a water concern? Start with the right contact."}</Localize></p>
              <button type="button" onClick={() => setShowContact(x => !x)} aria-expanded={showContact} className={`${focus} mt-6 inline-flex w-full items-center justify-between rounded-xl border border-cyan-300/25 px-4 py-3 text-sm font-medium text-cyan-200 hover:bg-cyan-300/5`}><Localize>{"Find help and contact options"}</Localize><ChevronRight className="h-4 w-4"/></button>
              <p className="mt-4 text-xs leading-5 text-slate-500"><Localize>{"This workspace does not operate an emergency response service."}</Localize></p>
            </section>
            )}
          </div>

          {(view === "help" || (view === "overview" && showContact)) && <section className={`${surface} p-5 sm:p-6`} aria-label="Water Connect contact options">
            <h2 className="text-lg font-semibold"><Localize>{"Who should I contact?"}</Localize></h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 p-4"><Mail className="h-5 w-5 text-cyan-200"/><h3 className="mt-3 font-medium"><Localize>{"FalilaX account & technical help"}</Localize></h3><p className="mt-2 text-sm leading-6 text-slate-400"><Localize>{"For questions about signing in, enrollment or the app."}</Localize></p><a href="mailto:info@falilax.io?subject=FalilaX%20participant%20support" className={`${focus} mt-3 inline-block text-sm font-medium text-cyan-200 underline`}>info@falilax.io</a></div>
              <div className="rounded-2xl border border-white/10 p-4"><Waves className="h-5 w-5 text-cyan-200"/><h3 className="mt-3 font-medium"><Localize>{"Water quality or service concern"}</Localize></h3><p className="mt-2 text-sm leading-6 text-slate-400"><Localize>{"Contact your actual water utility using its verified phone number or official website. Demonstration associations are not live utility contact routes."}</Localize></p></div>
            </div>
            <form className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-[#071A29] p-4" onSubmit={event => {
              event.preventDefault();
              const subject = encodeURIComponent(`FalilaX participant concern: ${concernType}`);
              const body = encodeURIComponent(`Concern category: ${concernType}\n\n${concernDetails.trim()}\n\nPlease do not include verification codes or other sensitive information.`);
              window.location.href = `mailto:info@falilax.io?subject=${subject}&body=${body}`;
            }}>
              <h3 className="text-sm font-semibold"><Localize>{"Prepare a message to FalilaX support"}</Localize></h3>
              <p className="text-xs leading-5 text-slate-400"><Localize>{"This opens your email app. It does not submit or track a report in FalilaX. Water utility incidents should be reported to your verified utility contact."}</Localize></p>
              <label className="block text-xs text-slate-300"><Localize>{"Topic"}</Localize>
                <select value={concernType} onChange={e => setConcernType(e.target.value)} className={`${focus} mt-2 block w-full rounded-xl border border-white/20 bg-[#102B3B] px-3 py-3 text-sm text-white`}>
                  <option>Water quality concern</option><option>FalilaX account support</option><option>Notification question</option><option>Participant feedback</option>
                </select>
              </label>
              <label className="block text-xs text-slate-300"><Localize>{"Your message (optional)"}</Localize>
                <textarea value={concernDetails} onChange={e => setConcernDetails(e.target.value.slice(0, 1200))} rows={3} maxLength={1200} className={`${focus} mt-2 block w-full rounded-xl border border-white/20 bg-[#102B3B] px-3 py-3 text-sm text-white`} placeholder="Describe your question without sensitive personal details"/>
              </label>
              <button type="submit" className={`${focus} rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100`}><Localize>{"Open email draft"}</Localize></button>
            </form>
            <p className="mt-4 flex gap-2 text-xs leading-5 text-amber-100/80"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0"/><Localize>{"For an urgent water-related emergency, follow your local utility's official emergency guidance. No report is submitted from this panel."}</Localize></p>
          </section>}

          {(view === "notifications" || (view === "overview" && showPreferences)) && <section className={`${surface} p-5 sm:p-6`} aria-label="Notification settings"><h2 className="text-lg font-semibold"><Localize>{"Notification settings"}</Localize></h2>
            {preference && <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-400"><Localize>{"Quiet hours"}</Localize></dt><dd className="mt-1"><Localize>{preference.quiet_hours_enabled ? `${preference.quiet_hours_start || ""}–${preference.quiet_hours_end || ""}` : "Not enabled"}</Localize></dd></div>
              <div><dt className="text-slate-400"><Localize>{"Emergency override"}</Localize></dt><dd className="mt-1"><Localize>{preference.emergency_override_enabled ? "Enabled" : "Not enabled"}</Localize></dd></div>
              <div><dt className="text-slate-400"><Localize>{"Acknowledgement"}</Localize></dt><dd className="mt-1"><Localize>{preference.acknowledgement_required ? `Requested within ${preference.acknowledgement_timeout_minutes} minutes` : "Not requested"}</Localize></dd></div>
              <div><dt className="text-slate-400"><Localize>{"Escalation"}</Localize></dt><dd className="mt-1"><Localize>{preference.escalation_enabled ? `Configured after ${preference.escalation_timeout_minutes} minutes` : "Not enabled"}</Localize></dd></div>
            </dl>}
            {savedMessage && <p role="status" className="mt-4 text-sm text-emerald-200"><Localize>{savedMessage}</Localize></p>}
            {!editing ? <button type="button" onClick={() => { setSavedMessage(""); setEditing(true); }} className={`${focus} mt-5 rounded-xl border border-cyan-300/25 px-4 py-3 text-sm font-medium text-cyan-200`}><Localize>{"Manage notification choices"}</Localize></button> : <ParticipantPreferencesEditor onCancel={() => setEditing(false)} onSaved={() => { setEditing(false); setSavedMessage("Notification choices saved."); setAttempt(x => x + 1); }} />}
          </section>}

          {(view === "notifications" || (view === "overview" && showHistory)) && <ParticipantNotificationHistory />}

          {(view === "overview" || view === "water") && <section className={`${surface} p-5 sm:p-6`}>
            <button type="button" aria-expanded={showService} onClick={() => setShowService(x => !x)} className={`${focus} flex w-full items-center justify-between gap-4 text-left`}><span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-cyan-200"/><span className="font-semibold"><Localize>{"My service connection"}</Localize></span></span><ChevronDown className={`h-4 w-4 text-slate-400 transition ${showService ? "rotate-180" : ""}`}/></button>
            <p className="mt-2 text-sm text-slate-400"><Localize>{"Your approved enrollment associations, available when you need them."}</Localize></p>
            {showService && <div className="mt-5 border-t border-white/10 pt-5">
              {!context && <p className="text-sm text-slate-400"><Localize>{contextError ? "Service context unavailable. Retry from Notifications." : "Loading service context…"}</Localize></p>}
              {context?.assignments.map(a => <div key={a.assignment_id} className="mb-3 rounded-xl border border-white/10 bg-[#071A29] p-4"><p className="text-xs text-cyan-200"><Localize>{a.context_kind === "DEMONSTRATION" ? "Demonstration association" : "Recorded association"}</Localize></p><p className="mt-1 text-sm capitalize"><Localize>{readable(a.scope_type)}</Localize> · <Localize>{"Reference"}</Localize> {a.scope_id}</p><p className="mt-1 text-xs capitalize text-slate-400"><Localize>{readable(a.relationship_type)}</Localize></p></div>)}
              {context && context.assignments.length === 0 && <p className="text-sm text-slate-400"><Localize>{"No association is recorded."}</Localize></p>}
              {context?.assignments_truncated && <p className="text-xs text-slate-400"><Localize>{"Showing up to 100 recent associations."}</Localize></p>}
              <p className="mt-3 text-xs leading-5 text-slate-400"><Localize>{"Demonstration associations are synthetic and do not establish drinking-water safety or active alert routing."}</Localize></p>
            </div>}
          </section>}

          {(view === "overview" || view === "notifications") && <section className={`${surface} p-5 sm:p-6`}><button type="button" aria-expanded={showRehearsal} onClick={() => setShowRehearsal(x => !x)} className={`${focus} flex w-full items-center justify-between gap-4 text-left`}><span className="flex items-center gap-3"><Mail className="h-5 w-5 text-cyan-200"/><span className="font-semibold"><Localize>{"Email demonstration"}</Localize></span></span><ChevronDown className={`h-4 w-4 text-slate-400 transition ${showRehearsal ? "rotate-180" : ""}`}/></button><p className="mt-2 text-sm text-slate-400"><Localize>{"Practice receiving a demonstration email, without sending a live water alert."}</Localize></p>{showRehearsal && <ParticipantEmailRehearsal />}</section>}

          <div className="flex justify-center"><a href="mailto:info@falilax.io?subject=FalilaX%20participant%20experience" className={`${focus} text-sm text-cyan-200 underline underline-offset-4`}><Localize>{"Share your experience by email"}</Localize></a></div>
          <footer className="pb-4 pt-2 text-center text-xs leading-5 text-slate-500"><Localize>{"FalilaX · Water intelligence and participant information. Demonstrations are not real-time drinking-water safety certifications."}</Localize></footer>
        </main>
      </div>
    </div>
  );
}

export default ParticipantHome;
