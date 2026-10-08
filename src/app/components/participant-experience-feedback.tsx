import { useEffect, useState } from "react";
import { ArrowLeft, ClipboardCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Localize } from "@/app/i18n/language";
import {
  getParticipantQuestionnaire,
  ParticipantAccessError,
  type ParticipantQuestionnaire as ParticipantQuestionnaireData,
} from "@/app/services/participant-api";
import { getParticipantSession } from "@/app/utils/participant-session";
import { ParticipantQuestionnaire } from "@/app/components/participant-questionnaire";

export function ParticipantExperienceFeedback() {
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] =
    useState<ParticipantQuestionnaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;

    const session = getParticipantSession();

    if (!session) {
      navigate("/participant/sign-in", { replace: true });
      return () => controller.abort();
    }

    void getParticipantQuestionnaire(session, controller.signal)
      .then(result => {
        if (disposed) return;

        if (getParticipantSession()?.accessToken !== session.accessToken) {
          navigate("/participant/sign-in", { replace: true });
          return;
        }

        if (!result) {
          setUnavailable(true);
          return;
        }

        setQuestionnaire(result);
      })
      .catch(caught => {
        if (disposed) return;

        if (
          caught instanceof ParticipantAccessError &&
          caught.expired
        ) {
          navigate("/participant/sign-in", { replace: true });
          return;
        }

        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }

        setError(
          caught instanceof Error
            ? caught.message
            : "We could not load the experience feedback questionnaire.",
        );
      })
      .finally(() => {
        if (!disposed) setLoading(false);
      });

    return () => {
      disposed = true;
      controller.abort();
    };
  }, [navigate]);

  if (loading) {
    return (
      <main className="fx-app-shell flex min-h-screen items-center justify-center px-6 text-slate-100">
        <section className="w-full max-w-2xl rounded-3xl border border-cyan-300/15 bg-[#071b2a] p-8">
          <div className="flex items-center gap-3 text-cyan-200">
            <Loader2 className="h-5 w-5 animate-spin" />
            <Localize>
              {"Preparing your after-experience feedback form…"}
            </Localize>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="fx-app-shell flex min-h-screen items-center justify-center px-6 text-slate-100">
        <section className="w-full max-w-2xl rounded-3xl border border-amber-300/15 bg-[#071b2a] p-8">
          <ClipboardCheck className="h-7 w-7 text-amber-200" />
          <h1 className="mt-5 text-2xl font-semibold text-white">
            <Localize>{"Feedback is temporarily unavailable"}</Localize>
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            <Localize>{error}</Localize>
          </p>
          <button
            type="button"
            onClick={() => navigate("/participant/home")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 px-4 py-3 text-sm font-medium text-cyan-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <Localize>{"Return to my workspace"}</Localize>
          </button>
        </section>
      </main>
    );
  }

  if (unavailable || !questionnaire) {
    return (
      <main className="fx-app-shell flex min-h-screen items-center justify-center px-6 text-slate-100">
        <section className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#071b2a] p-8">
          <ClipboardCheck className="h-7 w-7 text-cyan-300" />
          <h1 className="mt-5 text-2xl font-semibold text-white">
            <Localize>{"Experience feedback"}</Localize>
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            <Localize>
              {"There is no feedback questionnaire available for this experience at the moment."}
            </Localize>
          </p>
          <button
            type="button"
            onClick={() => navigate("/participant/home")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 px-4 py-3 text-sm font-medium text-cyan-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <Localize>{"Return to my workspace"}</Localize>
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="fx-app-shell min-h-screen px-5 py-10 text-slate-100 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 rounded-3xl border border-cyan-300/15 bg-[#071b2a]/90 p-7 sm:p-9">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                <Localize>{"After-experience evaluation"}</Localize>
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                <Localize>{"Help us improve FalilaX"}</Localize>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                <Localize>
                  {"Your water-intelligence experience is complete. This separate feedback form helps us evaluate and improve the participant experience."}
                </Localize>
              </p>
            </div>
            <ClipboardCheck className="h-7 w-7 shrink-0 text-cyan-300" />
          </div>
        </header>

        <ParticipantQuestionnaire
          questionnaire={questionnaire}
          open={true}
          onOpenChange={open => {
            if (!open) navigate("/participant/home");
          }}
          onSubmitted={() => {
            navigate("/participant/home", { replace: true });
          }}
        />
      </div>
    </main>
  );
}

export default ParticipantExperienceFeedback;
