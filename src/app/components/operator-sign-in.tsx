import { type FormEvent, useEffect, useState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import logoImage from "@/assets/falilax-logo.png";
import { API_ENDPOINTS, buildApiUrl } from "@/app/config/api";
import { getAccessToken, storeAccessToken } from "@/app/utils/auth-session";

type LoginResponse = { access_token?: string; token_type?: string };

function safeDestination(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard/utility";
}

function detail(payload: unknown): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const value = (payload as { detail?: unknown }).detail;
    if (typeof value === "string" && value.trim()) return value;
  }
  return "Unable to sign in with those credentials.";
}

export function OperatorSignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const destination = safeDestination(searchParams.get("next"));

  useEffect(() => {
    if (getAccessToken()) navigate(destination, { replace: true });
  }, [destination, navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH_LOGIN), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(detail(payload));
      const accessToken = (payload as LoginResponse).access_token?.trim();
      if (!accessToken) throw new Error("The server did not return a secure session token.");
      storeAccessToken(accessToken);
      setPassword("");
      navigate(destination, { replace: true });
    } catch (caught) {
      setPassword("");
      setError(caught instanceof Error ? caught.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fx-app-shell min-h-screen text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <img src={logoImage} alt="FalilaX" className="object-contain" />
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-xs text-cyan-100">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
            Authorized operations
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-89px)] max-w-6xl place-items-center px-5 py-10 sm:px-8">
        <section className="w-full max-w-lg rounded-[2rem] border border-white/[0.09] bg-[#071b2a]/95 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-10">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07]">
            <LockKeyhole className="h-7 w-7 text-cyan-300" />
          </div>
          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Operations access</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to the FalilaX command workspace.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-400">This area is restricted to authorized utility, analyst, viewer, and administrative accounts.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="operator-email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
              <input id="operator-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#031421] px-4 py-3 text-white outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10" />
            </div>
            <div>
              <label htmlFor="operator-password" className="mb-2 block text-sm font-medium text-slate-200">Password</label>
              <input id="operator-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#031421] px-4 py-3 text-white outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10" />
            </div>
            {error && <div role="alert" className="rounded-xl border border-rose-300/20 bg-rose-300/[0.07] px-4 py-3 text-sm text-rose-100">{error}</div>}
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2f80ed] to-[#20b8d2] px-5 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {busy ? "Signing in…" : "Enter operations workspace"}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default OperatorSignIn;
