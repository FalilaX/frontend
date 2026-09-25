import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearParticipantSession, getParticipantSession } from "@/app/utils/participant-session";
import { PREFERENCES_WRITE_SCOPE, PreferenceRequestError, requestPreferences } from "@/app/services/participant-preferences-api";
import type { EditablePreferences, PreferenceChoices, Severity } from "@/app/services/participant-preferences-api";

const control = "mt-2 w-full rounded-xl border border-white/15 bg-[#041521] px-3 py-3 text-sm text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/30";
const secondary = "rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-50";

function choices(data: EditablePreferences): PreferenceChoices {
  return {
    email_enabled: data.email_enabled, minimum_severity: data.minimum_severity,
    quiet_hours_enabled: data.quiet_hours_enabled, quiet_hours_start: data.quiet_hours_start,
    quiet_hours_end: data.quiet_hours_end, quiet_hours_timezone: data.quiet_hours_timezone,
    emergency_override_enabled: data.emergency_override_enabled,
  };
}

export function ParticipantPreferencesEditor({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<EditablePreferences | null>(null);
  const [draft, setDraft] = useState<PreferenceChoices | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [canEdit, setCanEdit] = useState(true);
  const active = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  const busy = useRef(false);
  const token = useRef("");
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    mounted.current = true;
    heading.current?.focus();
    return () => { mounted.current = false; active.current?.abort(); };
  }, []);

  useEffect(() => {
    const session = getParticipantSession();
    if (!session) { navigate("/participant/sign-in", { replace: true }); return; }
    if (!session.scopes.includes(PREFERENCES_WRITE_SCOPE)) {
      setCanEdit(false); setLoading(false); return;
    }
    token.current = session.accessToken;
    const controller = new AbortController();
    active.current = controller;
    let disposed = false;
    setLoading(true); setError("");
    const timeout = setTimeout(() => controller.abort(), 30000);
    void requestPreferences(session, controller.signal).then(data => {
      if (disposed) return;
      if (getParticipantSession()?.accessToken !== session.accessToken) {
        navigate("/participant/sign-in", { replace: true }); return;
      }
      setSaved(data); setDraft(choices(data)); setNeedsReload(false);
    }).catch(cause => {
      if (disposed) return;
      if (cause instanceof PreferenceRequestError && cause.status === 401) {
        if (getParticipantSession()?.accessToken === session.accessToken) clearParticipantSession();
        navigate("/participant/sign-in", { replace: true });
      } else {
        setError(cause instanceof PreferenceRequestError ? cause.message : "We could not load your preferences. Please try again.");
      }
    }).finally(() => { clearTimeout(timeout); if (!disposed) setLoading(false); });
    return () => { disposed = true; clearTimeout(timeout); controller.abort(); };
  }, [attempt, navigate]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || !saved || busy.current || needsReload) return;
    const session = getParticipantSession();
    if (!session || session.accessToken !== token.current) {
      navigate("/participant/sign-in", { replace: true }); return;
    }
    if (draft.quiet_hours_enabled && draft.quiet_hours_start === draft.quiet_hours_end) {
      setError("Choose different start and end times for quiet hours."); return;
    }
    busy.current = true; setSaving(true); setError("");
    const controller = new AbortController();
    active.current = controller;
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      await requestPreferences(session, controller.signal, { ...draft, expected_version: saved.version });
      if (!mounted.current) return;
      if (getParticipantSession()?.accessToken !== session.accessToken) {
        navigate("/participant/sign-in", { replace: true }); return;
      }
      onSaved();
    } catch (cause) {
      if (!mounted.current) return;
      if (cause instanceof PreferenceRequestError && cause.status === 401) {
        if (getParticipantSession()?.accessToken === session.accessToken) clearParticipantSession();
        navigate("/participant/sign-in", { replace: true });
      } else {
        setError(cause instanceof PreferenceRequestError ? cause.message : "We could not confirm whether your changes were saved. Reload the saved choices before trying again.");
        setNeedsReload(!(cause instanceof PreferenceRequestError) || ![403, 422, 429].includes(cause.status));
      }
    } finally {
      clearTimeout(timeout); busy.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  function quietHours(enabled: boolean) {
    setDraft(current => current ? { ...current, quiet_hours_enabled: enabled,
      quiet_hours_start: enabled ? "22:00" : null, quiet_hours_end: enabled ? "07:00" : null,
      quiet_hours_timezone: enabled ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : null,
    } : current);
  }

  return <section aria-labelledby="preference-editor-heading" className="mt-6 rounded-2xl border border-cyan-300/20 bg-[#071b2a] p-5">
    <h3 ref={heading} tabIndex={-1} id="preference-editor-heading" className="text-base font-semibold text-white">Your notification choices</h3>
    {!canEdit ? <p className="mt-3 text-sm leading-6 text-slate-300">Please <Link to="/participant/sign-in" className="text-cyan-200 underline">sign in again</Link> to enable preference editing.</p> : <>
      {loading && <p role="status" className="mt-3 text-sm text-slate-300">Loading saved choices...</p>}
      {error && <p role="alert" className="mt-3 text-sm leading-6 text-amber-200">{error}</p>}
      {!loading && (!saved || needsReload) && <button type="button" className={`${secondary} mt-3`} onClick={() => setAttempt(value => value + 1)}>Reload saved choices{draft ? " (discard edits)" : ""}</button>}
      {!loading && saved && draft && <form onSubmit={save} className="mt-5 space-y-5">
        {!saved.is_active && <p className="text-sm text-amber-200">These preferences are inactive. Saving choices will not reactivate delivery. Contact your organizer.</p>}
        <fieldset disabled={saving || needsReload} className="space-y-5 disabled:opacity-60">
          <legend className="sr-only">Notification preferences</legend>
          <label className="flex items-start gap-3 text-sm text-slate-100">
            <input type="checkbox" checked={draft.email_enabled} disabled={!saved.email_verified && !draft.email_enabled}
              onChange={e => setDraft({ ...draft, email_enabled: e.target.checked })} className="mt-1 h-4 w-4 accent-cyan-300" />
            <span>Email notifications<span className="mt-1 block text-xs leading-5 text-slate-400">{saved.email_verified ? "Use the email verified during your enrollment." : "Your current email needs verification before email notifications can be enabled."}</span></span>
          </label>
          <label className="block text-sm text-slate-300">Minimum severity
            <select value={draft.minimum_severity} onChange={e => setDraft({ ...draft, minimum_severity: e.target.value as Severity })} className={control}>
              <option value="LOW">Low and above</option><option value="MEDIUM">Medium and above</option>
              <option value="HIGH">High and critical</option><option value="CRITICAL">Critical only</option>
            </select>
          </label>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={draft.quiet_hours_enabled} onChange={e => quietHours(e.target.checked)} className="h-4 w-4 accent-cyan-300" />Use quiet hours</label>
          {draft.quiet_hours_enabled && <div className="space-y-4 rounded-xl border border-white/10 p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-slate-300">From<input required type="time" value={draft.quiet_hours_start || ""} onChange={e => setDraft({ ...draft, quiet_hours_start: e.target.value })} className={control} /></label>
              <label className="text-sm text-slate-300">Until<input required type="time" value={draft.quiet_hours_end || ""} onChange={e => setDraft({ ...draft, quiet_hours_end: e.target.value })} className={control} /></label>
            </div>
            <label className="block text-sm text-slate-300">Timezone<input required maxLength={64} value={draft.quiet_hours_timezone || ""} onChange={e => setDraft({ ...draft, quiet_hours_timezone: e.target.value })} placeholder="America/Chicago" className={control} />
              <span className="mt-2 block text-xs text-slate-400">Use an IANA timezone, such as America/Chicago or Africa/Accra. Quiet hours may cross midnight.</span>
            </label>
          </div>}
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={draft.emergency_override_enabled} onChange={e => setDraft({ ...draft, emergency_override_enabled: e.target.checked })} className="mt-1 h-4 w-4 accent-cyan-300" /><span>Allow emergency notifications during quiet hours</span></label>
          <p className="text-xs leading-5 text-slate-400">These choices apply to eligible notifications. Saving does not send an alert. Other channels, pauses, acknowledgement, and escalation settings remain unchanged.</p>
          <button type="submit" className="w-full rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200">{saving ? "Saving choices..." : "Save choices"}</button>
        </fieldset>
      </form>}
    </>}
    <button type="button" disabled={saving} onClick={onCancel} className={`${secondary} mt-4`}>Close editor</button>
  </section>;
}
