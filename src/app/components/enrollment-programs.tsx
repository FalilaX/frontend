import { useEffect, useState } from "react";
import { Localize } from "@/app/i18n/language";
import { authenticatedFetch } from "@/app/utils/auth-session";
import { API_BASE_URL } from "@/app/config/api";
import {
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Loader2,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useNavigate } from "react-router-dom";

type EnrollmentProgram = {
  id: number;
  organization_id: number;
  utility_id: number | null;
  code: string;
  name: string;
  pathway: string;
  status: string;
  is_demo: boolean;
  public_enrollment_enabled: boolean;
  participant_intelligence_enabled: boolean;
  participant_intelligence_location_id: number | null;
  participant_intelligence_context_kind: string | null;
};

type ToggleState = Record<number, boolean>;

export default function EnrollmentPrograms() {
  const navigate = useNavigate();

  const [programs, setPrograms] = useState<EnrollmentProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [publicEnrollment, setPublicEnrollment] = useState<ToggleState>({});
  const [participantIntelligence, setParticipantIntelligence] =
    useState<ToggleState>({});

  const [saving, setSaving] = useState<number | null>(null);

  const loadPrograms = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/enrollment/programs`
      );

      if (!response.ok) {
        throw new Error(`Enrollment Programs API error: ${response.status}`);
      }

      const result: EnrollmentProgram[] = await response.json();
      setPrograms(result);

      const initialPublicState: ToggleState = {};
      const initialIntelligenceState: ToggleState = {};

      result.forEach((program) => {
        initialPublicState[program.id] =
          program.public_enrollment_enabled === true;

        initialIntelligenceState[program.id] =
          program.participant_intelligence_enabled === true;
      });

      setPublicEnrollment(initialPublicState);
      setParticipantIntelligence(initialIntelligenceState);
    } catch (err) {
      console.error(err);
      setError("Unable to load enrollment programs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const togglePublicEnrollment = async (
    program: EnrollmentProgram,
    enabled: boolean
  ) => {
    setSaving(program.id);
    setError(null);

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/enrollment/programs/${program.id}/public-enrollment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.detail || `Unable to update program: ${response.status}`
        );
      }

      const updated = await response.json();

      setPublicEnrollment((current) => ({
        ...current,
        [program.id]: updated.public_enrollment_enabled === true,
      }));

      setPrograms((current) =>
        current.map((item) =>
          item.id === program.id
            ? {
                ...item,
                public_enrollment_enabled:
                  updated.public_enrollment_enabled === true,
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update public enrollment."
      );
    } finally {
      setSaving(null);
    }
  };

  const toggleParticipantIntelligence = async (
    program: EnrollmentProgram,
    enabled: boolean
  ) => {
    setSaving(program.id);
    setError(null);

    try {
      /*
       * The demonstration deployment uses the configured Montgomery
       * demonstration location. Once a location has already been stored,
       * preserve that value. For a first enable, use the existing demo
       * location ID 2.
       */
      const locationId =
        program.participant_intelligence_location_id ?? 2;

      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/enrollment/programs/${program.id}/participant-intelligence`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enabled,
            location_id: enabled ? locationId : null,
          }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(
          body?.detail ||
            `Unable to update participant intelligence: ${response.status}`
        );
      }

      const updated = await response.json();

      setParticipantIntelligence((current) => ({
        ...current,
        [program.id]: updated.participant_intelligence_enabled === true,
      }));

      setPrograms((current) =>
        current.map((item) =>
          item.id === program.id
            ? {
                ...item,
                participant_intelligence_enabled:
                  updated.participant_intelligence_enabled === true,
                participant_intelligence_location_id:
                  updated.location_id ?? null,
                participant_intelligence_context_kind:
                  updated.context_kind ?? null,
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update participant intelligence."
      );
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="fx-app-shell min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                <Localize>{"FalilaX Administration"}</Localize>
              </p>

              <h1 className="mt-1 text-2xl font-semibold">
                <Localize>{"Enrollment Programs"}</Localize>
              </h1>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <Localize>{"Back to Dashboard"}</Localize>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-zinc-400 leading-6">
            <Localize>
              {
                "Manage trusted participant enrollment programs and demonstration enrollment configuration."
              }
            </Localize>
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/30 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <Localize>{"Loading enrollment programs..."}</Localize>
          </div>
        ) : programs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold">
                <Localize>{"No enrollment programs available"}</Localize>
              </h2>
            </div>

            <p className="text-sm text-zinc-400">
              <Localize>
                {
                  "No enrollment programs are currently available to this administrator's organization."
                }
              </Localize>
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {programs.map((program) => {
              const isSaving = saving === program.id;

              const publicEnabled =
                publicEnrollment[program.id] === true;

              const intelligenceEnabled =
                participantIntelligence[program.id] === true;

              const isDemoParticipant =
                program.pathway === "DEMO_PARTICIPANT" &&
                program.is_demo;

              return (
                <section
                  key={program.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-semibold">
                            {program.name}
                          </h2>

                          <span className="rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-[11px] font-medium text-zinc-400">
                            {program.code}
                          </span>

                          {program.is_demo && (
                            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300">
                              <Localize>{"DEMO"}</Localize>
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-500">
                          <span>
                            <Localize>{"Pathway:"}</Localize>{" "}
                            {program.pathway}
                          </span>

                          <span>
                            <Localize>{"Status:"}</Localize>{" "}
                            {program.status}
                          </span>

                          <span>
                            <Localize>{"Organization:"}</Localize>{" "}
                            {program.organization_id}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                          program.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-300 border border-green-500/20"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {program.status}
                      </div>
                    </div>

                    <div className="mt-6 grid md:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
                        <div className="flex items-start gap-3">
                          <Globe2 className="w-5 h-5 text-cyan-400 mt-0.5" />

                          <div className="flex-1">
                            <h3 className="font-medium">
                              <Localize>{"Public Enrollment"}</Localize>
                            </h3>

                            <p className="mt-1 text-sm text-zinc-500">
                              <Localize>
                                {
                                  "Allow eligible demonstration participants to begin enrollment without an administrator-issued invitation."
                                }
                              </Localize>
                            </p>

                            {isDemoParticipant ? (
                              <div className="mt-4 flex items-center justify-between gap-4">
                                <span
                                  className={`text-sm ${
                                    publicEnabled
                                      ? "text-green-300"
                                      : "text-zinc-500"
                                  }`}
                                >
                                  {publicEnabled
                                    ? "Enabled"
                                    : "Disabled"}
                                </span>

                                <button
                                  type="button"
                                  disabled={
                                    isSaving ||
                                    program.status !== "ACTIVE"
                                  }
                                  onClick={() =>
                                    togglePublicEnrollment(
                                      program,
                                      !publicEnabled
                                    )
                                  }
                                  className={`relative h-7 w-12 rounded-full transition ${
                                    publicEnabled
                                      ? "bg-cyan-500"
                                      : "bg-zinc-700"
                                  } ${
                                    isSaving ||
                                    program.status !== "ACTIVE"
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer"
                                  }`}
                                  aria-label={
                                    publicEnabled
                                      ? "Disable public enrollment"
                                      : "Enable public enrollment"
                                  }
                                >
                                  <span
                                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                                      publicEnabled
                                        ? "left-6"
                                        : "left-1"
                                    }`}
                                  />
                                </button>
                              </div>
                            ) : (
                              <p className="mt-4 text-xs text-zinc-600">
                                <Localize>
                                  {
                                    "Public enrollment configuration is available only for demonstration participant programs."
                                  }
                                </Localize>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-cyan-400 mt-0.5" />

                          <div className="flex-1">
                            <h3 className="font-medium">
                              <Localize>
                                {"Participant Intelligence"}
                              </Localize>
                            </h3>

                            <p className="mt-1 text-sm text-zinc-500">
                              <Localize>
                                {
                                  "Connect enrolled participants to the configured demonstration intelligence context."
                                }
                              </Localize>
                            </p>

                            {isDemoParticipant ? (
                              <>
                                <div className="mt-4 flex items-center justify-between gap-4">
                                  <div>
                                    <span
                                      className={`text-sm ${
                                        intelligenceEnabled
                                          ? "text-green-300"
                                          : "text-zinc-500"
                                      }`}
                                    >
                                      {intelligenceEnabled
                                        ? "Enabled"
                                        : "Disabled"}
                                    </span>

                                    {intelligenceEnabled &&
                                      program.participant_intelligence_location_id !==
                                        null && (
                                        <div className="mt-1 text-xs text-zinc-600">
                                          Demonstration location #
                                          {
                                            program.participant_intelligence_location_id
                                          }
                                          {program.participant_intelligence_context_kind
                                            ? ` · ${program.participant_intelligence_context_kind}`
                                            : ""}
                                        </div>
                                      )}
                                  </div>

                                  <button
                                    type="button"
                                    disabled={
                                      isSaving ||
                                      program.status !== "ACTIVE"
                                    }
                                    onClick={() =>
                                      toggleParticipantIntelligence(
                                        program,
                                        !intelligenceEnabled
                                      )
                                    }
                                    className={`relative h-7 w-12 rounded-full transition ${
                                      intelligenceEnabled
                                        ? "bg-cyan-500"
                                        : "bg-zinc-700"
                                    } ${
                                      isSaving ||
                                      program.status !== "ACTIVE"
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                                    aria-label={
                                      intelligenceEnabled
                                        ? "Disable participant intelligence"
                                        : "Enable participant intelligence"
                                    }
                                  >
                                    <span
                                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                                        intelligenceEnabled
                                          ? "left-6"
                                          : "left-1"
                                      }`}
                                    />
                                  </button>
                                </div>

                                {!intelligenceEnabled && (
                                  <div className="mt-3 text-xs text-zinc-600">
                                    Demonstration intelligence will use the
                                    configured Montgomery demonstration
                                    location when enabled.
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="mt-4 text-xs text-zinc-600">
                                <Localize>
                                  {
                                    "Participant intelligence configuration is available only for demonstration participant programs."
                                  }
                                </Localize>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
