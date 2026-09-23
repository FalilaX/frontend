import { useEffect } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import logoImage from "@/assets/falilax-logo.png";
import { OperatorAuthForm } from "./operator-auth-form";
import { getAccessToken } from "@/app/utils/auth-session";

function safeDestination(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return "/dashboard/utility";
  const url = new URL(value, window.location.origin);
  if (url.origin !== window.location.origin || url.pathname === "/operator/sign-in") return "/dashboard/utility";
  return `${url.pathname}${url.search}${url.hash}`;
}

export function OperatorSignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destination = safeDestination(searchParams.get("next"));

  useEffect(() => {
    if (getAccessToken()) navigate(destination, { replace: true });
  }, [destination, navigate]);

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

          <OperatorAuthForm submitLabel="Enter operations workspace" onAuthenticated={() => navigate(destination, { replace: true })} />
        </section>
      </main>
    </div>
  );
}

export default OperatorSignIn;
