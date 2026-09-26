import { useEffect, useRef, useState } from "react";
import { getParticipantSession } from "@/app/utils/participant-session";
import { requestRehearsal } from "@/app/services/participant-email-rehearsal-api";
import type { RehearsalState } from "@/app/services/participant-email-rehearsal-api";

export function ParticipantEmailRehearsal() {
  const [state, setState] = useState<RehearsalState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const alive = useRef(true);
  const active = useRef<AbortController | null>(null);
  const button = "rounded-xl border border-cyan-300/30 px-4 py-3 text-sm font-medium text-cyan-200 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300";
  async function run(action: "status" | "preview" | "send") {
    if (active.current) return;
    const session = getParticipantSession();
    if (!session) { setMessage("Sign in again to continue."); return; }
    const controller = new AbortController();
    active.current = controller;
    setBusy(true); setMessage(""); setConfirmed(false);
    if (action === "send") setUncertain(true);
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      const result = await requestRehearsal(session, controller.signal, action, state?.rehearsal ?? undefined);
      if (!alive.current || active.current !== controller) return;
      if (getParticipantSession()?.accessToken !== session.accessToken) {
        setState(null); setMessage("Your session changed. Reopen your workspace."); return;
      }
      setState(result); setUncertain(false);
    } catch (error) {
      if (alive.current && active.current === controller) setMessage(error instanceof Error && error.name !== "AbortError" ? error.message
        : "The result is uncertain. Check status; do not request another send.");
    } finally {
      clearTimeout(timeout);
      if (active.current === controller) {
        active.current = null;
        if (alive.current) setBusy(false);
      }
    }
  }
  useEffect(() => {
    alive.current = true;
    void run("status");
    return () => { alive.current = false; active.current?.abort(); active.current = null; };
  }, []);
  if (state?.available === false || (!state && !message)) return null;
  const row = state?.rehearsal;
  const terminal = !!row && ["CLAIMED", "ACCEPTED", "UNKNOWN", "SKIPPED"].includes(row.status);
  return <section aria-labelledby="rehearsal-title" className="mt-6 rounded-3xl border border-cyan-300/15 bg-[#071b2a] p-6 text-slate-200">
    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Private communication rehearsal</p>
    <h2 id="rehearsal-title" className="mt-3 text-xl font-semibold text-white">Try one demonstration email</h2>
    <p className="mt-3 text-sm leading-6 text-slate-400">Review the message before sending it to your verified email. This is a communication check, with no real water-quality warning or protective action. Your saved preferences apply.</p>
    {message && <p role="alert" className="mt-4 text-sm text-amber-200">{message}</p>}
    {row && <div className="mt-5 rounded-2xl border border-white/10 p-5">
      <p className="text-sm text-cyan-200">To: {row.destination_hint}</p>
      <h3 className="mt-3 font-semibold">{row.subject}</h3>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{row.body}</p>
    </div>}
    {row?.status === "ACCEPTED" && <p role="status" className="mt-4 text-emerald-200">The sending mail server accepted the rehearsal message. Check your inbox and spam folder. Inbox delivery has not been independently confirmed.</p>}
    {row && ["CLAIMED", "UNKNOWN"].includes(row.status) && <p role="status" className="mt-4 text-amber-200">The send was authorized, but its final outcome is not confirmed here. Check your inbox and status. Another send is blocked to prevent duplicates.</p>}
    {row?.status === "SKIPPED" && <p role="status" className="mt-4 text-slate-300">Email sending was disabled. No further send is available for this rehearsal.</p>}
    {!terminal && !uncertain && <button type="button" disabled={busy} onClick={() => void run("preview")} className={`${button} mt-5`}>{row ? "Prepare fresh preview" : "Preview demonstration email"}</button>}
    {row?.can_send && !terminal && !uncertain && <div className="mt-5">
      <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} className="mt-1" />I have reviewed this demonstration message and authorize one email to my verified address.</label>
      <button type="button" disabled={busy || !confirmed} onClick={() => void run("send")} className={`${button} mt-4 bg-cyan-300 text-slate-950`}>Send this demonstration email</button>
    </div>}
    <button type="button" disabled={busy} onClick={() => void run("status")} className={`${button} mt-5 ml-2`}>{busy ? "Checking…" : "Check status"}</button>
  </section>;
}
