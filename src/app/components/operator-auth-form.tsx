import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { API_ENDPOINTS, buildApiUrl } from "../config/api";
import { storeAccessToken } from "../utils/auth-session";

type Enrollment = { manual_secret: string; recovery_codes: string[] };
type Stage =
  | { kind: "password" }
  | { kind: "setup"; token: string; expires: number; enrollment?: Enrollment }
  | { kind: "verify"; token: string; expires: number };
const inputStyle = "mt-2 w-full rounded-xl border border-white/15 bg-[#031421] px-4 py-3 text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20";
const buttonStyle = "rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50";

export function OperatorAuthForm({ onAuthenticated, submitLabel = "Sign in" }: {
  onAuthenticated: (token: string) => void;
  submitLabel?: string;
}) {
  const id = useId();
  const [stage, setStage] = useState<Stage>({ kind: "password" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const request = useRef<AbortController | null>(null);
  const locked = useRef(false);
  useEffect(() => () => { request.current?.abort(); }, []);

  function reset(message = "") {
    request.current?.abort();
    request.current = null;
    locked.current = false;
    setBusy(false);
    setStage({ kind: "password" });
    setPassword(""); setCode(""); setSaved(false); setError(""); setNotice(message);
  }
  const expires = stage.kind === "password" ? null : stage.expires;
  useEffect(() => {
    if (expires === null) return;
    const timer = window.setTimeout(() => reset("Verification expired. Sign in again to continue."), Math.max(0, expires - Date.now()));
    return () => window.clearTimeout(timer);
  }, [expires]);

  async function post(path: string, body: object, signal: AbortSignal) {
    const response = await fetch(buildApiUrl(path), {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body), credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer", signal,
    });
    const payload = response.status === 204 ? {} : await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 429) throw new Error("Too many attempts. Wait before trying again; restarting does not clear the server limit.");
      if (response.status >= 500) throw new Error("The authentication service could not complete this step. Please try again later.");
      throw new Error(typeof payload?.detail === "string" ? payload.detail : "Unable to complete this authentication step.");
    }
    return payload;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    setBusy(true); setError(""); setNotice("");
    try {
      if (stage.kind !== "password" && stage.expires <= Date.now()) {
        reset("Verification expired. Sign in again to continue."); return;
      }
      if (stage.kind === "password") {
        const payload = await post(API_ENDPOINTS.AUTH_LOGIN, { email: email.trim(), password }, controller.signal);
        if (controller.signal.aborted) return;
        setPassword("");
        const lifetime = typeof payload.expires_in === "number" && payload.expires_in > 0 ? Math.min(payload.expires_in, 300) : 300;
        const expires = Date.now() + lifetime * 1000;
        if (payload.mfa_setup_required === true && typeof payload.setup_token === "string" && payload.setup_token) {
          setStage({ kind: "setup", token: payload.setup_token, expires });
        } else if (payload.mfa_required === true && typeof payload.challenge_token === "string" && payload.challenge_token) {
          setStage({ kind: "verify", token: payload.challenge_token, expires });
        } else if (!payload.mfa_setup_required && !payload.mfa_required && typeof payload.access_token === "string" && payload.access_token.trim()) {
          storeAccessToken(payload.access_token); onAuthenticated(payload.access_token);
        } else throw new Error("The server returned an unsupported authentication response.");
      } else if (stage.kind === "setup" && !stage.enrollment) {
        const payload = await post("/api/v1/auth/mfa/setup/enroll", { setup_token: stage.token }, controller.signal);
        if (controller.signal.aborted) return;
        if (typeof payload.manual_secret !== "string" || !/^[A-Z2-7]{32}$/.test(payload.manual_secret) || !Array.isArray(payload.recovery_codes) || payload.recovery_codes.length !== 8 || !payload.recovery_codes.every((value: unknown) => typeof value === "string" && /^[A-F0-9]{10}$/.test(value))) {
          throw new Error("The server returned an invalid enrollment response. Restart sign-in.");
        }
        setStage({ ...stage, enrollment: { manual_secret: payload.manual_secret, recovery_codes: payload.recovery_codes } });
      } else if (stage.kind === "setup") {
        if (!saved) throw new Error("Save your recovery codes before continuing.");
        await post("/api/v1/auth/mfa/setup/confirm", { setup_token: stage.token, code: code.trim() }, controller.signal);
        if (controller.signal.aborted) return;
        reset("Authenticator enabled. Sign in again, then use the next fresh authenticator code.");
      } else {
        const payload = await post("/api/v1/auth/mfa/verify", { challenge_token: stage.token, code: code.trim() }, controller.signal);
        if (controller.signal.aborted) return;
        if (typeof payload.access_token !== "string" || !payload.access_token.trim()) throw new Error("Verification did not return a session. Restart sign-in.");
        setStage({ kind: "password" }); setCode("");
        storeAccessToken(payload.access_token); onAuthenticated(payload.access_token);
      }
    } catch (caught) {
      if (request.current !== controller) return;
      setPassword(""); setCode("");
      setError(controller.signal.aborted ? "The request timed out. Sign in again if the previous step completed on the server." : caught instanceof Error ? caught.message : "Unable to complete sign-in.");
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null; locked.current = false; setBusy(false);
      }
    }
  }

  return <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-cyan-300/15 bg-[#071b2a]/80 p-5 text-slate-100" aria-busy={busy}>
    {notice && <p role="status" className="text-sm leading-6 text-cyan-100">{notice}</p>}
    <fieldset disabled={busy} className="space-y-5">
      {stage.kind === "password" ? <>
        <label htmlFor={`${id}-email`} className="block text-sm">FalilaX email<input id={`${id}-email`} className={inputStyle} type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></label>
        <label htmlFor={`${id}-password`} className="block text-sm">Password<input id={`${id}-password`} className={inputStyle} type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
      </> : <>
        <h2 className="text-xl font-semibold">{stage.kind === "setup" ? "Set up your authenticator" : "Verify your identity"}</h2>
        {stage.kind === "setup" && !stage.enrollment && <p className="text-sm leading-6 text-slate-300">Your password was accepted. Add FalilaX to your authenticator app to protect this administrative account. Setup expires after five minutes.</p>}
        {stage.kind === "setup" && stage.enrollment && <>
          <p className="text-sm leading-6 text-slate-300">In your authenticator app, add a time-based account named FalilaX using this setup key. Keep the key and recovery codes private.</p>
          <code className="block break-all rounded-xl bg-black/30 p-4 font-mono text-cyan-100 select-all">{stage.enrollment.manual_secret}</code>
          <h3 className="font-semibold">Save your recovery codes</h3>
          <p className="text-sm text-slate-300">Store these in a password manager or another private, secure place. Each code works once if you lose access to your authenticator.</p>
          <ul className="grid grid-cols-2 gap-2 rounded-xl bg-black/30 p-4 font-mono text-sm select-all">{stage.enrollment.recovery_codes.map(value => <li key={value}>{value}</li>)}</ul>
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={saved} onChange={event => setSaved(event.target.checked)} required />I have saved my recovery codes securely.</label>
        </>}
        {stage.kind === "verify" && <p className="text-sm leading-6 text-slate-300">Enter a fresh six-digit authenticator code, or one unused recovery code.</p>}
        {(stage.kind === "verify" || stage.enrollment) && <label htmlFor={`${id}-code`} className="block text-sm">{stage.kind === "setup" ? "Authenticator code" : "Authenticator or recovery code"}<input id={`${id}-code`} className={inputStyle} type="text" inputMode={stage.kind === "setup" ? "numeric" : "text"} autoComplete="one-time-code" autoCapitalize="characters" spellCheck={false} required minLength={6} maxLength={stage.kind === "setup" ? 6 : 64} pattern={stage.kind === "setup" ? "[0-9]{6}" : undefined} value={code} onChange={event => setCode(event.target.value)} /></label>}
      </>}
      {error && <p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p>}
      <button type="submit" className={buttonStyle} disabled={busy || (stage.kind === "setup" && Boolean(stage.enrollment) && !saved)}>{busy ? "Please wait..." : stage.kind === "password" ? submitLabel : stage.kind === "verify" ? "Verify and sign in" : stage.enrollment ? "Enable authenticator" : "Begin authenticator setup"}</button>
    </fieldset>
    {stage.kind !== "password" && <button type="button" onClick={() => reset()} className="block text-sm text-slate-300 underline underline-offset-4">Cancel and return to sign-in</button>}
    <p className="text-xs leading-5 text-slate-400">Passwords and MFA setup details are not saved by this form. Your signed-in session stays in this browser tab.</p>
  </form>;
}
