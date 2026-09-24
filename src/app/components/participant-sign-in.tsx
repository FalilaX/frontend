import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestSigninCode, verifySigninCode, SigninError } from "@/app/services/participant-signin-api";
import type { SigninChallenge } from "@/app/services/participant-signin-api";
import { storeParticipantSession } from "@/app/utils/participant-session";

const inputClass = "mt-2 w-full rounded-xl border border-cyan-300/20 bg-slate-950/40 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20 disabled:opacity-60";

export default function ParticipantSignIn() {
  const navigate = useNavigate();
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<SigninChallenge | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [waitUntil, setWaitUntil] = useState(0);
  const [clock, setClock] = useState(Date.now());
  const active = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const waiting = Math.max(0, Math.ceil((waitUntil - clock) / 1000));

  useEffect(() => {
    mounted.current = true;
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => { mounted.current = false; active.current?.abort(); clearInterval(timer); };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (active.current || waiting) return;
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setMessage("");
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      if (!challenge) {
        const issued = await requestSigninCode(organization.trim(), email.trim(), controller.signal);
        if (!mounted.current) return;
        setChallenge(issued);
        setMessage("If your email is eligible for this workspace, a code will arrive shortly. Check your inbox and spam folder.");
      } else {
        const session = await verifySigninCode(challenge, code, controller.signal);
        if (!mounted.current) return;
        storeParticipantSession(session);
        setCode("");
        setChallenge(null);
        navigate("/participant/home", { replace: true });
      }
    } catch (error) {
      if (!mounted.current) return;
      setMessage(error instanceof SigninError ? error.message : "We could not complete the request. Please check your connection before trying again.");
      if (error instanceof SigninError && error.retryAfter) setWaitUntil(Date.now() + error.retryAfter * 1000);
      setCode("");
    } finally {
      clearTimeout(timeout);
      active.current = null;
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <main className="fx-app-shell flex min-h-screen items-center justify-center px-6 py-12 text-slate-100">
      <section aria-labelledby="signin-title" className="w-full max-w-lg rounded-3xl border border-cyan-300/15 bg-[#071b2a] p-8 shadow-2xl sm:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">FalilaX participant workspace</p>
        <h1 id="signin-title" className="mt-4 text-3xl font-semibold tracking-tight">{challenge ? "Check your email" : "Welcome back"}</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">{challenge ? "Enter the six-digit code in the browser where you requested it. It expires within 10 minutes." : "Sign in to your existing workspace with your verified email."}</p>
        <form className="mt-8 space-y-5" onSubmit={submit} aria-busy={busy}>
          {!challenge ? <>
            <label className="block text-sm font-medium" htmlFor="workspace-code">Workspace code
              <input id="workspace-code" required maxLength={100} pattern="[A-Za-z0-9_-]+" autoComplete="off" spellCheck={false} value={organization} onChange={event => setOrganization(event.target.value)} disabled={busy} className={inputClass} aria-describedby="workspace-help" />
            </label>
            <p id="workspace-help" className="text-xs leading-5 text-slate-400">Use the workspace code supplied by your organizer.</p>
            <label className="block text-sm font-medium" htmlFor="participant-email">Email address
              <input id="participant-email" required type="email" maxLength={255} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} disabled={busy} className={inputClass} />
            </label>
          </> : <label className="block text-sm font-medium" htmlFor="signin-code">Sign-in code
            <input id="signin-code" required type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))} disabled={busy} className={`${inputClass} text-center text-2xl tracking-[0.35em]`} />
          </label>}
          <p role="status" aria-live="polite" className="text-sm leading-6 text-slate-300">{message}{waiting > 0 ? ` Try again in ${waiting} seconds.` : ""}</p>
          <button type="submit" disabled={busy || waiting > 0} className="w-full rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:opacity-50">{busy ? "Please wait…" : challenge ? "Open my workspace" : "Send sign-in code"}</button>
          {challenge && <button type="button" disabled={busy || waiting > 0} onClick={() => { setChallenge(null); setCode(""); setMessage("You can request a new code after the 60-second resend interval."); }} className="text-sm text-cyan-300 underline disabled:opacity-50">Request another code or change details</button>}
        </form>
        <Link className="mt-8 inline-block text-sm text-slate-400 underline hover:text-cyan-300" to="/">Return to FalilaX</Link>
      </section>
    </main>
  );
}
