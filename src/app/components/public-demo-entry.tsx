import { useState } from "react";
import { ArrowRight, Droplets, LoaderCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import logoImage from "@/assets/falilax-logo.png";
import { Localize } from "@/app/i18n/language";
import {
  EnrollmentApiError,
  startPublicProgramEnrollment,
} from "@/app/services/enrollment-api";

const PUBLIC_DEMO_PROGRAM =
  import.meta.env.VITE_PUBLIC_DEMO_PROGRAM_CODE ||
  "PRIVATE-EMAIL-REHEARSAL";

export default function PublicDemoEntry() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function beginDemo() {
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      await startPublicProgramEnrollment(PUBLIC_DEMO_PROGRAM);
      navigate("/enroll", { replace: true });
    } catch (caught) {
      if (caught instanceof EnrollmentApiError) {
        setError(caught.message);
      } else {
        setError(
          "FalilaX could not start the demonstration. Please try again.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-57px)] overflow-hidden bg-[#03101c] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-[-12rem] h-[38rem] w-[38rem] rounded-full bg-cyan-500/[0.10] blur-[120px]" />
        <div className="absolute -right-44 bottom-[-12rem] h-[42rem] w-[42rem] rounded-full bg-blue-600/[0.12] blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(125,211,252,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.025)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-57px)] max-w-6xl items-center px-6 py-14 lg:px-10">
        <section className="mx-auto w-full max-w-3xl text-center">
          <img
            src={logoImage}
            alt="FalilaX"
            className="mx-auto h-20 w-auto object-contain sm:h-24"
          />

          <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            <Droplets className="h-3.5 w-3.5" />
            <Localize>{" Controlled water intelligence demonstration "}</Localize>
          </div>

          <h1 className="mx-auto mt-7 max-w-2xl text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl">
            <Localize>{" Understand your water more clearly. "}</Localize>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            <Localize>
              {" Experience how FalilaX turns water information into clear, useful guidance for the people it serves. "}
            </Localize>
          </p>

          <div className="mx-auto mt-9 max-w-xl rounded-3xl border border-cyan-300/15 bg-white/[0.035] p-6 text-left shadow-[0_30px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-7">
            <div className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07]">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
              </div>

              <div>
                <p className="font-semibold text-white">
                  <Localize>{" A secure, guided demonstration "}</Localize>
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  <Localize>
                    {" You will verify your contact information, review participation details, choose how FalilaX may reach you, and enter the demonstration experience. "}
                  </Localize>
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mx-auto mt-6 max-w-xl rounded-2xl border border-rose-300/20 bg-rose-400/[0.08] px-5 py-4 text-sm leading-6 text-rose-100"
            >
              <Localize>{error}</Localize>
            </div>
          )}

          <button
            type="button"
            onClick={beginDemo}
            disabled={busy}
            className="group mx-auto mt-8 inline-flex min-w-[210px] items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2187f3] to-[#20bce5] px-7 py-4 text-base font-bold text-white shadow-[0_18px_55px_rgba(37,153,238,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_65px_rgba(37,153,238,0.38)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {busy ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" />
                <Localize>{" Starting securely... "}</Localize>
              </>
            ) : (
              <>
                <Localize>{" Get started "}</Localize>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <p className="mx-auto mt-5 max-w-md text-xs leading-5 text-slate-500">
            <Localize>
              {" This is a controlled FalilaX demonstration environment. "}
            </Localize>
          </p>
        </section>
      </div>
    </main>
  );
}
