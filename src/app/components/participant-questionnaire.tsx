import { useState } from "react";
import { CheckCircle2, ClipboardCheck, Loader2, Send } from "lucide-react";

import { Localize } from "@/app/i18n/language";
import {
  submitParticipantQuestionnaire,
  type ParticipantQuestionnaire,
  type ParticipantQuestionnaireAnswer,
} from "@/app/services/participant-api";
import { getParticipantSession } from "@/app/utils/participant-session";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

interface ParticipantQuestionnaireProps {
  questionnaire: ParticipantQuestionnaire | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

export function ParticipantQuestionnaire({
  questionnaire,
  open,
  onOpenChange,
  onSubmitted,
}: ParticipantQuestionnaireProps) {
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!questionnaire) return null;

  function setAnswer(questionId: number, value: unknown) {
    setAnswers(current => ({
      ...current,
      [questionId]: value,
    }));
    setError(null);
  }

  function isAnswered(questionId: number): boolean {
    const value = answers[questionId];
    return value !== undefined && value !== null && String(value).trim() !== "";
  }

  async function submit() {
    const missing = questionnaire.questions.filter(
      question => question.is_required && !isAnswered(question.id),
    );

    if (missing.length > 0) {
      setError("Please complete all required questions.");
      return;
    }

    const session = getParticipantSession();

    if (!session) {
      setError("Your participant session has ended. Please sign in again.");
      return;
    }

    const payload: ParticipantQuestionnaireAnswer[] =
      questionnaire.questions
        .filter(question => isAnswered(question.id))
        .map(question => ({
          question_id: question.id,
          value_json: answers[question.id],
        }));

    setSubmitting(true);
    setError(null);

    try {
      await submitParticipantQuestionnaire(session, payload);
      setSubmitted(true);
      onSubmitted();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We could not submit your questionnaire. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function close(openState: boolean) {
    if (submitting) return;
    onOpenChange(openState);

    if (!openState && !submitted) {
      setError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-cyan-300/20 bg-[#071b2a] text-slate-100 sm:max-w-2xl">
        {submitted ? (
          <>
            <DialogHeader>
              <div className="mb-2 grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07]">
                <CheckCircle2 className="h-6 w-6 text-emerald-300" />
              </div>

              <DialogTitle className="text-2xl text-white">
                <Localize>{"Thank you for your feedback"}</Localize>
              </DialogTitle>

              <DialogDescription className="pt-2 leading-6 text-slate-400">
                <Localize>
                  {"Your responses have been recorded and will help improve the FalilaX participant experience."}
                </Localize>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                <Localize>{"Done"}</Localize>
              </button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="mb-2 grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07]">
                <ClipboardCheck className="h-6 w-6 text-cyan-300" />
              </div>

              <DialogTitle className="text-2xl text-white">
                <Localize>{questionnaire.title}</Localize>
              </DialogTitle>

              <DialogDescription className="pt-2 leading-6 text-slate-400">
                <Localize>
                  {questionnaire.description ||
                    "Tell us about your experience with FalilaX."}
                </Localize>
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-7">
              {questionnaire.questions.map(question => {
                const options = Array.isArray(question.options_json)
                  ? question.options_json
                  : [];

                return (
                  <fieldset
                    key={question.id}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
                  >
                    <legend className="max-w-full px-1 text-sm font-medium leading-6 text-white">
                      <Localize>{question.prompt}</Localize>
                      {question.is_required && (
                        <span className="ml-1 text-cyan-300" aria-label="required">
                          *
                        </span>
                      )}
                    </legend>

                    {question.help_text && (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        <Localize>{question.help_text}</Localize>
                      </p>
                    )}

                    {question.question_type === "RATING" && (
                      <div className="mt-4 grid grid-cols-5 gap-2">
                        {options.map(option => {
                          const value = String(option);
                          const selected = String(answers[question.id]) === value;

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setAnswer(question.id, Number(value))}
                              aria-pressed={selected}
                              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                selected
                                  ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                                  : "border-white/10 text-slate-300 hover:border-cyan-300/30 hover:text-white"
                              }`}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {question.question_type === "SINGLE_CHOICE" && (
                      <div className="mt-4 space-y-2">
                        {options.map(option => {
                          const value = String(option);
                          const selected = answers[question.id] === value;

                          return (
                            <label
                              key={value}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                                selected
                                  ? "border-cyan-300/40 bg-cyan-300/[0.07] text-white"
                                  : "border-white/10 text-slate-300 hover:border-white/20"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={value}
                                checked={selected}
                                onChange={() => setAnswer(question.id, value)}
                                className="h-4 w-4 accent-cyan-300"
                              />
                              <span>{value}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {question.question_type === "TEXT" && (
                      <textarea
                        value={String(answers[question.id] ?? "")}
                        onChange={event =>
                          setAnswer(question.id, event.target.value)
                        }
                        rows={4}
                        className="mt-4 w-full resize-y rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
                        placeholder="Your feedback"
                      />
                    )}
                  </fieldset>
                );
              })}
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-100"
              >
                <Localize>{error}</Localize>
              </p>
            )}

            <DialogFooter>
              <button
                type="button"
                onClick={() => close(false)}
                disabled={submitting}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
              >
                <Localize>{"Not now"}</Localize>
              </button>

              <button
                type="button"
                onClick={() => void submit()}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <Localize>
                  {submitting ? "Submitting..." : "Submit feedback"}
                </Localize>
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ParticipantQuestionnaire;
