import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { History } from "lucide-react";
import { useParticipantProfile } from "@/app/components/participant-route";
import { clearParticipantSession, getParticipantSession } from "@/app/utils/participant-session";
import { ParticipantAccessError } from "@/app/services/participant-api";
import { confirmReceipt, getNotificationHistory } from "@/app/services/participant-notification-history-api";
import type { NotificationHistory } from "@/app/services/participant-notification-history-api";

const titles = { REHEARSAL: "Demonstration email rehearsal", SIMULATION: "Simulation notification", NOTIFICATION: "Notification record" };
const channels: Record<string, string> = { email: "Email", sms: "SMS", whatsapp: "WhatsApp", in_app: "In-app", push: "Push", voice: "Voice" };

export function ParticipantNotificationHistory() {
  const profile = useParticipantProfile();
  const navigate = useNavigate();
  const [history, setHistory] = useState<NotificationHistory | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [receiptMessage, setReceiptMessage] = useState("");
  const receiptRequest = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; receiptRequest.current?.abort(); receiptRequest.current = null; };
  }, [profile.subscriber_id, profile.organization_id]);

  async function recordReceipt(id: string) {
    if (receiptRequest.current || selected !== id) return;
    const session = getParticipantSession();
    if (!session || session.subscriberId !== profile.subscriber_id || session.organizationId !== profile.organization_id) {
      navigate("/participant/sign-in", { replace: true }); return;
    }
    const controller = new AbortController();
    receiptRequest.current = controller;
    setConfirming(id); setReceiptMessage("");
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const at = await confirmReceipt(session, id, controller.signal);
      if (!mounted.current || receiptRequest.current !== controller) return;
      if (getParticipantSession()?.accessToken !== session.accessToken) {
        setHistory(null); navigate("/participant/sign-in", { replace: true }); return;
      }
      setHistory(previous => previous ? { ...previous, items: previous.items.map(item => item.id === id
        ? { ...item, receipt_confirmed_at: at, can_confirm_receipt: false } : item) } : null);
      setReceiptMessage("Your receipt confirmation has been recorded.");
    } catch (error) {
      if (!mounted.current || receiptRequest.current !== controller) return;
      if (getParticipantSession()?.accessToken !== session.accessToken) {
        setHistory(null); navigate("/participant/sign-in", { replace: true }); return;
      }
      if (error instanceof ParticipantAccessError && error.expired) {
        clearParticipantSession(); navigate("/participant/sign-in", { replace: true });
      } else {
        setReceiptMessage(error instanceof Error && error.name !== "AbortError" ? error.message
          : "The result is uncertain. Refresh history to check whether receipt was recorded.");
      }
    } finally {
      clearTimeout(timeout);
      if (receiptRequest.current === controller) {
        receiptRequest.current = null;
        if (mounted.current) { setConfirming(null); setSelected(null); }
      }
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    const session = getParticipantSession();
    setHistory(null); setLoading(true); setError(false); setSelected(null); setReceiptMessage(""); setConfirming(null);
    if (!session) { navigate("/participant/sign-in", { replace: true }); return; }
    const timeout = setTimeout(() => controller.abort(), 30000);
    void getNotificationHistory(session, controller.signal).then(result => {
      if (disposed) return;
      if (getParticipantSession()?.accessToken !== session.accessToken) {
        navigate("/participant/sign-in", { replace: true }); return;
      }
      setHistory(result);
    }).catch(error => {
      if (disposed) return;
      if (getParticipantSession()?.accessToken !== session.accessToken) {
        navigate("/participant/sign-in", { replace: true }); return;
      }
      if (error instanceof ParticipantAccessError && error.expired) {
        clearParticipantSession(); navigate("/participant/sign-in", { replace: true });
      } else setError(true);
    }).finally(() => { clearTimeout(timeout); if (!disposed) setLoading(false); });
    return () => { disposed = true; clearTimeout(timeout); controller.abort(); };
  }, [attempt, navigate, profile.subscriber_id, profile.organization_id]);
  const visible = history?.subscriber_id === profile.subscriber_id && history?.organization_id === profile.organization_id ? history : null;
  const time = (value: string) => new Date(value).toLocaleString();
  return <section aria-labelledby="notification-history-title" className="mt-6 rounded-3xl border border-white/10 bg-[#071b2a]/90 p-6 sm:p-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><History aria-hidden="true" className="h-6 w-6 text-cyan-300" />
        <h2 id="notification-history-title" className="mt-3 text-xl font-semibold text-white">Notification history</h2>
      </div>
      <button type="button" disabled={loading || confirming !== null} onClick={() => setAttempt(value => value + 1)} className="rounded-xl border border-cyan-300/30 px-4 py-3 text-sm font-medium text-cyan-200 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">{loading ? "Loading…" : "Refresh history"}</button>
    </div>
    <p className="mt-3 text-sm leading-6 text-slate-400">Recent activity recorded for your participant profile. Times use your device’s local time. Sending, receipt, and reading are different outcomes.</p>
    {receiptMessage && <p role="status" className="mt-5 text-sm text-cyan-200">{receiptMessage}</p>}
    {loading && <p role="status" className="mt-5 text-sm text-slate-300">Loading your notification history…</p>}
    {error && <p role="alert" className="mt-5 text-sm text-amber-200">We could not load your history. Use Refresh history to try again.</p>}
    {visible && !visible.items.length && <p className="mt-5 text-sm text-slate-300">No notification activity is recorded here yet. This view includes participant-owned notification records and email rehearsals.</p>}
    {visible && visible.items.length > 0 && <ol className="mt-6 space-y-4">
      {visible.items.map(item => <li key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-medium text-cyan-200">{channels[item.channel] || "Other channel"}</p>
            <h3 className="mt-2 font-medium text-white">{titles[item.kind]}</h3></div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">{item.status_label}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">{item.explanation}</p>
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-xs text-slate-400">
          <div><dt>Recorded</dt><dd className="mt-1"><time dateTime={item.recorded_at}>{time(item.recorded_at)}</time></dd></div>
          {item.authorized_at && <div><dt>Send authorized</dt><dd className="mt-1"><time dateTime={item.authorized_at}>{time(item.authorized_at)}</time></dd></div>}
          {item.finished_at && <div><dt>Outcome recorded</dt><dd className="mt-1"><time dateTime={item.finished_at}>{time(item.finished_at)}</time></dd></div>}
        </dl>
        {item.receipt_confirmed_at && <p className="mt-4 text-sm text-emerald-200">Receipt confirmed by participant · <time dateTime={item.receipt_confirmed_at}>{time(item.receipt_confirmed_at)}</time><span className="mt-1 block text-xs text-slate-400">Your report of receipt; it does not confirm protective action or water safety.</span></p>}
        {item.kind === "REHEARSAL" && item.can_confirm_receipt && !item.receipt_confirmed_at && (
          getParticipantSession()?.scopes.includes("participant:notifications:acknowledge") ? <div className="mt-5 border-t border-white/10 pt-4">
            <label className="flex items-start gap-3 text-sm leading-6 text-slate-300"><input type="checkbox" className="mt-1" checked={selected === item.id} disabled={confirming !== null} onChange={event => setSelected(event.target.checked ? item.id : null)} />I received this demonstration email in my email account.</label>
            <button type="button" disabled={selected !== item.id || confirming !== null || loading} onClick={() => void recordReceipt(item.id)} className="mt-3 rounded-xl border border-cyan-300/30 px-4 py-3 text-sm font-medium text-cyan-200 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">{confirming === item.id ? "Recording…" : "Confirm email receipt"}</button>
          </div> : <p className="mt-4 text-sm text-slate-400">Sign in again to enable receipt confirmation.</p>
        )}
        <p className="mt-4 text-xs leading-5 text-slate-500">{item.kind === "REHEARSAL" ? "Communication rehearsal only. No real water-quality warning or protective action." : item.kind === "SIMULATION" ? "Recorded simulation. This does not establish a real water-quality condition." : "This activity summary does not verify whether the originating event was live or simulated."}</p>
      </li>)}
    </ol>}
    {visible?.has_more && <p className="mt-4 text-xs text-slate-400">Showing the 50 most recent records. Older records are not displayed in this view.</p>}
  </section>;
}
