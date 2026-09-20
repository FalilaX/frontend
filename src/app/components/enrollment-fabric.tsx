import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowRight,
  BellRing,
  Check,
  CheckCircle2,
  Clock3,
  Fingerprint,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
  Waves,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import logoImage from "@/assets/falilax-logo.png";
import { API_CONFIG } from "@/app/config/api";
import {
  acceptEnrollmentInvitation,
  createEnrollmentWorkspaceSession,
  EnrollmentApiError,
  getEnrollmentActivationStatus,
  getEnrollmentConsentDocument,
  getEnrollmentNotificationPreferences,
  getEnrollmentSession,
  issueEnrollmentChallenge,
  recordEnrollmentConsent,
  recordEnrollmentIdentity,
  recordEnrollmentNotificationPreferences,
  requestEnrollmentTopology,
  verifyEnrollmentChannel,
} from "@/app/services/enrollment-api";
import type {
  EnrollmentActivationStatusResponse,
  EnrollmentChallengeResponse,
  EnrollmentChannel,
  EnrollmentConsentDocument,
  EnrollmentIdentityRequest,
  EnrollmentMinimumSeverity,
  EnrollmentNotificationPreferenceRequest,
  EnrollmentStage,
  EnrollmentSubscriberType,
  EnrollmentTopologyResponse,
} from "@/app/types/enrollment";
import {
  clearEnrollmentSession,
  getEnrollmentBrowserContext,
  getEnrollmentSessionPublicId,
  storeEnrollmentBrowserContext,
} from "@/app/utils/enrollment-session";
import { storeParticipantSession } from "@/app/utils/participant-session";

const journey = [
  { key: "INVITATION", label: "Invitation", description: "Secure entry" },
  { key: "IDENTITY", label: "Identity", description: "About you" },
  { key: "VERIFICATION", label: "Verification", description: "Confirm & consent" },
  { key: "PREFERENCES", label: "Preferences", description: "How we reach you" },
  { key: "ACTIVATION", label: "Activation", description: "Join your network" },
] as const;

const subscriberOptions: Array<{
  value: EnrollmentSubscriberType;
  label: string;
}> = [
  { value: "RESIDENT", label: "Resident or household" },
  { value: "EMPLOYEE", label: "Employee" },
  { value: "FACILITY", label: "Facility representative" },
  { value: "UTILITY_ADMIN", label: "Utility administrator" },
  { value: "REGULATOR", label: "Regulatory partner" },
];

const severityOptions: Array<{
  value: EnrollmentMinimumSeverity;
  label: string;
  description: string;
}> = [
  { value: "LOW", label: "All safety updates", description: "Low, moderate, high and critical" },
  { value: "MODERATE", label: "Meaningful changes", description: "Moderate, high and critical" },
  { value: "HIGH", label: "Important alerts", description: "High and critical only" },
  { value: "CRITICAL", label: "Critical only", description: "Immediate danger notifications" },
];

function normalizeError(error: unknown): string {
  if (error instanceof EnrollmentApiError) return error.message;
  return "We could not complete that step. Please try again.";
}

function stageIndex(stage: EnrollmentStage): number {
  if (stage === "INVITATION") return 0;
  if (stage === "IDENTITY") return 1;
  if (stage === "VERIFICATION" || stage === "CONSENT") return 2;
  if (stage === "PREFERENCES") return 3;
  return 4;
}

function stageFromCurrentStep(step: string): EnrollmentStage {
  const normalized = step.toUpperCase();
  if (normalized === "IDENTITY") return "IDENTITY";
  if (normalized === "VERIFICATION") return "VERIFICATION";
  if (normalized === "CONSENT") return "CONSENT";
  if (normalized === "PREFERENCES") return "PREFERENCES";
  if (normalized === "COMPLETE") return "COMPLETE";
  if (normalized === "ACTIVATION") return "ACTIVATION";
  if (normalized === "TOPOLOGY") return "PREFERENCES";
  return "IDENTITY";
}

function ErrorNotice({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-rose-300/20 bg-rose-300/[0.07] px-4 py-3 text-sm leading-6 text-rose-100"
    >
      <TriangleAlert className="mt-1 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function PrimaryButton({
  busy,
  disabled,
  children,
  type = "submit",
  onClick,
}: {
  busy?: boolean;
  disabled?: boolean;
  children: ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2f80ed] to-[#20b8d2] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(47,128,237,0.22)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-45"
    >
      {busy ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <ShieldCheck className="h-4 w-4" />
      )}
      {children}
      {!busy && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
    </button>
  );
}

function StepRail({ stage }: { stage: EnrollmentStage }) {
  const activeIndex = stageIndex(stage);
  return (
    <ol aria-label="Enrollment progress" className="space-y-2">
      {journey.map((item, index) => {
        const complete = index < activeIndex || stage === "COMPLETE";
        const active = index === activeIndex && stage !== "COMPLETE";
        return (
          <li
            key={item.key}
            className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-300 ${
              active ? "border-cyan-300/30 bg-cyan-300/[0.08]" : "border-transparent"
            }`}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-xs font-semibold ${
                complete
                  ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
                  : active
                    ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                    : "border-white/10 bg-white/[0.025] text-slate-600"
              }`}
            >
              {complete ? <Check className="h-4 w-4" /> : String(index + 1).padStart(2, "0")}
            </span>
            <span>
              <span className={`block text-sm font-medium ${active ? "text-white" : complete ? "text-slate-300" : "text-slate-600"}`}>
                {item.label}
              </span>
              <span className="mt-0.5 block text-xs text-slate-600">{item.description}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function SecurityNote() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
      <p className="text-xs leading-5 text-slate-400">
        Your activation capability is encrypted in transit and kept only in this browser session.
        Invitation and verification secrets are never displayed again after use.
      </p>
    </div>
  );
}

function FieldShell({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
      {children}
    </div>
  );
}

export function EnrollmentFabric() {
  const { invitationToken } = useParams<{ invitationToken?: string }>();
  const navigate = useNavigate();
  const browserContext = useMemo(() => getEnrollmentBrowserContext(), []);
  const existingSessionId = useMemo(() => getEnrollmentSessionPublicId(), []);

  const [stage, setStage] = useState<EnrollmentStage>(
    existingSessionId ? "IDENTITY" : "INVITATION",
  );
  const [sessionPublicId, setSessionPublicId] = useState<string | null>(existingSessionId);
  const [token, setToken] = useState(invitationToken ?? "");
  const [busy, setBusy] = useState(Boolean(existingSessionId));
  const [error, setError] = useState<string | null>(null);
  const [identity, setIdentity] = useState<EnrollmentIdentityRequest>({
    full_name: "",
    email: browserContext.email ?? "",
    phone: browserContext.phone ?? null,
    subscriber_type: "RESIDENT",
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago",
    is_emergency_contact: false,
  });
  const [verificationChannel, setVerificationChannel] = useState<EnrollmentChannel>(
    browserContext.verificationChannel ?? (browserContext.email ? "EMAIL" : "SMS"),
  );
  const [challenge, setChallenge] = useState<EnrollmentChallengeResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [consentDocument, setConsentDocument] = useState<EnrollmentConsentDocument | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [topology, setTopology] = useState<EnrollmentTopologyResponse | null>(null);
  const [activation, setActivation] = useState<EnrollmentActivationStatusResponse | null>(null);
  const [preferences, setPreferences] = useState<EnrollmentNotificationPreferenceRequest>({
    email_enabled: verificationChannel === "EMAIL",
    sms_enabled: verificationChannel === "SMS",
    whatsapp_enabled: verificationChannel === "WHATSAPP",
    in_app_enabled: false,
    push_enabled: false,
    minimum_severity: "HIGH",
    quiet_hours_enabled: true,
    quiet_hours_start: "22:00:00",
    quiet_hours_end: "07:00:00",
    quiet_hours_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago",
    emergency_override_enabled: true,
    acknowledgement_required: true,
    acknowledgement_timeout_minutes: 30,
    escalation_enabled: true,
    escalation_timeout_minutes: 60,
  });

  const loadConsent = useCallback(async (id: string) => {
    const document = await getEnrollmentConsentDocument(id);
    setConsentDocument(document);
  }, []);

  useEffect(() => {
    if (!invitationToken) return;
    if (existingSessionId) {
      navigate("/enroll", { replace: true });
      return;
    }
    setToken(invitationToken);
  }, [existingSessionId, invitationToken, navigate]);

  useEffect(() => {
    if (!existingSessionId) return;
    const resumeSessionId = existingSessionId;
    let cancelled = false;

    async function resume() {
      try {
        const current = await getEnrollmentSession(resumeSessionId);
        if (cancelled) return;
        const resumedStage = stageFromCurrentStep(current.current_step);
        setStage(resumedStage);
        if (resumedStage === "CONSENT") await loadConsent(resumeSessionId);
        if (resumedStage === "PREFERENCES") {
          try {
            await getEnrollmentNotificationPreferences(resumeSessionId);
            const proposed = await requestEnrollmentTopology(resumeSessionId);
            if (!cancelled) {
              setTopology(proposed);
              setStage("ACTIVATION");
            }
          } catch (caught) {
            if (caught instanceof EnrollmentApiError && caught.status !== 404) throw caught;
          }
        }
      } catch (caught) {
        if (!cancelled) {
          setError(normalizeError(caught));
          if (caught instanceof EnrollmentApiError && caught.status === 401) {
            setSessionPublicId(null);
            setStage("INVITATION");
          }
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    void resume();
    return () => {
      cancelled = true;
    };
  }, [existingSessionId, loadConsent]);

  useEffect(() => {
    if (stage !== "ACTIVATION" || !sessionPublicId) return;
    const activationSessionId = sessionPublicId;
    let cancelled = false;

    async function poll() {
      try {
        const status = await getEnrollmentActivationStatus(activationSessionId);
        if (cancelled) return;
        setActivation(status);
        setError(null);
        if (status.activated || status.current_step.toUpperCase() === "COMPLETE") {
          setStage("COMPLETE");
        }
      } catch (caught) {
        if (!cancelled) setError(normalizeError(caught));
      }
    }

    void poll();
    const interval = window.setInterval(poll, API_CONFIG.POLLING.ENROLLMENT_ACTIVATION);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [sessionPublicId, stage]);

  async function acceptInvitation(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const accepted = await acceptEnrollmentInvitation(token);
      setSessionPublicId(accepted.session_public_id);
      setStage(stageFromCurrentStep(accepted.current_step));
      setToken("");
      navigate("/enroll", { replace: true });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setBusy(false);
    }
  }

  async function submitIdentity(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!sessionPublicId) return setStage("INVITATION");
    const email = identity.email?.trim() || null;
    const phone = identity.phone?.trim() || null;
    if (!email && !phone) {
      setError("Provide an email address or phone number for secure verification.");
      return;
    }
    setBusy(true);
    try {
      await recordEnrollmentIdentity(sessionPublicId, {
        ...identity,
        full_name: identity.full_name.trim(),
        email,
        phone,
      });
      const nextChannel: EnrollmentChannel = email ? "EMAIL" : "SMS";
      setVerificationChannel(nextChannel);
      setPreferences((current) => ({
        ...current,
        email_enabled: nextChannel === "EMAIL",
        sms_enabled: nextChannel === "SMS",
      }));
      storeEnrollmentBrowserContext({ email: email ?? undefined, phone: phone ?? undefined, verificationChannel: nextChannel });
      setStage("VERIFICATION");
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setBusy(false);
    }
  }

  function destinationFor(channel: EnrollmentChannel): string {
    if (channel === "EMAIL") return identity.email?.trim() || browserContext.email || "";
    return identity.phone?.trim() || browserContext.phone || "";
  }

  async function sendChallenge() {
    if (!sessionPublicId) return setStage("INVITATION");
    const destination = destinationFor(verificationChannel);
    if (!destination) {
      setError(`No ${verificationChannel.toLowerCase()} destination is available.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const issued = await issueEnrollmentChallenge(sessionPublicId, {
        channel: verificationChannel,
        destination,
        ttl_minutes: 10,
        max_attempts: 5,
      });
      setChallenge(issued);
      setVerificationCode("");
      storeEnrollmentBrowserContext({
        email: identity.email || browserContext.email,
        phone: identity.phone || browserContext.phone,
        verificationChannel,
      });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setBusy(false);
    }
  }

  async function submitVerification(event: FormEvent) {
    event.preventDefault();
    if (!sessionPublicId || !challenge) return;
    setBusy(true);
    setError(null);
    try {
      await verifyEnrollmentChannel(sessionPublicId, challenge.verification_id, verificationCode);
      await loadConsent(sessionPublicId);
      setVerificationCode("");
      setStage("CONSENT");
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setBusy(false);
    }
  }

  async function submitConsent(event: FormEvent) {
    event.preventDefault();
    if (!sessionPublicId || !consentDocument || !consentAccepted) return;
    setBusy(true);
    setError(null);
    try {
      await recordEnrollmentConsent(sessionPublicId, consentDocument.consent_document_id);
      setStage("PREFERENCES");
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setBusy(false);
    }
  }

  async function submitPreferences(event: FormEvent) {
    event.preventDefault();
    if (!sessionPublicId) return;
    setBusy(true);
    setError(null);
    try {
      await recordEnrollmentNotificationPreferences(sessionPublicId, preferences);
      const proposed = await requestEnrollmentTopology(sessionPublicId);
      setTopology(proposed);
      setStage("ACTIVATION");
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setBusy(false);
    }
  }

  async function openParticipantWorkspace() {
    if (!sessionPublicId) {
      setError("Your activated enrollment session is unavailable.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const workspace = await createEnrollmentWorkspaceSession(sessionPublicId);
      storeParticipantSession(workspace);
      clearEnrollmentSession();
      navigate("/participant/home", { replace: true });
    } catch (caught) {
      setError(normalizeError(caught));
    } finally {
      setBusy(false);
    }
  }

  function restartEnrollment() {
    clearEnrollmentSession();
    setSessionPublicId(null);
    setChallenge(null);
    setActivation(null);
    setError(null);
    setStage("INVITATION");
  }

  const availableChannels = [
    identity.email || browserContext.email ? "EMAIL" : null,
    identity.phone || browserContext.phone ? "SMS" : null,
  ].filter((value): value is EnrollmentChannel => value !== null);

  return (
    <div className="fx-app-shell min-h-screen">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <Link to="/" aria-label="Return to FalilaX" className="inline-flex items-center">
            <img src={logoImage} alt="FalilaX" className="object-contain" />
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[11px] font-medium tracking-wide text-emerald-100">Secure activation</span>
          </div>
        </div>
      </header>

      <main className="relative mx-auto grid min-h-[calc(100vh-89px)] max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-12">
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <div className="mb-8">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07]">
                <Fingerprint className="h-6 w-6 text-cyan-300" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Enrollment Fabric</p>
              <h2 className="mt-3 text-xl font-semibold text-white">Activate your trusted water-safety identity.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                A calm, secure connection between you, your service area, and the alerts that matter to you.
              </p>
            </div>
            <StepRail stage={stage} />
            <div className="mt-8 flex items-start gap-3 border-t border-white/[0.07] pt-6">
              <Waves className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
              <p className="text-xs leading-5 text-slate-500">
                FalilaX interprets water-safety information. It does not replace official utility,
                regulatory, or public-health instructions.
              </p>
            </div>
          </div>
        </aside>

        <section className="relative flex items-center justify-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.055] blur-3xl" />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#071827]/80 shadow-[0_35px_100px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
            <div className="p-6 sm:p-9 lg:p-11">
              <div className="mb-8 flex items-center justify-between lg:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Enrollment Fabric</p>
                <span className="text-xs text-slate-500">Step {Math.min(stageIndex(stage) + 1, 5)} of 5</span>
              </div>

              {stage === "INVITATION" && (
                <div>
                  <div className="mb-8">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-xs text-cyan-100">
                      <Sparkles className="h-3.5 w-3.5" /> Your water intelligence connection
                    </div>
                    <h1 className="max-w-xl text-3xl font-semibold leading-tight text-white sm:text-4xl">Your invitation is the beginning of a safer connection.</h1>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                      Connect your identity, notification choices, and service context so relevant water-safety information reaches you clearly and responsibly.
                    </p>
                  </div>
                  <form onSubmit={acceptInvitation} className="space-y-5">
                    <div>
                      <label htmlFor="invitation-token" className="mb-2 block text-sm font-medium text-slate-200">Secure invitation code</label>
                      <FieldShell icon={<LockKeyhole className="h-4 w-4" />}>
                        <input id="invitation-token" type="password" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="off" spellCheck={false} required minLength={32} maxLength={512} placeholder="Invitation code" className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600" />
                      </FieldShell>
                      <p className="mt-2 text-xs leading-5 text-slate-500">Personal invitation links fill this securely and remove the secret from the address after acceptance.</p>
                    </div>
                    <ErrorNotice message={error} />
                    <PrimaryButton busy={busy} disabled={token.trim().length < 32}>Verify invitation</PrimaryButton>
                    <SecurityNote />
                  </form>
                </div>
              )}

              {stage === "IDENTITY" && (
                <div>
                  <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Identity connection</p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">Let’s make the experience yours.</h1>
                    <p className="mt-3 text-sm leading-7 text-slate-400">We collect only what is needed to identify you and verify at least one notification channel.</p>
                  </div>
                  <form onSubmit={submitIdentity} className="space-y-5">
                    <div>
                      <label htmlFor="full-name" className="mb-2 block text-sm font-medium text-slate-200">Full name</label>
                      <FieldShell icon={<UserRound className="h-4 w-4" />}>
                        <input id="full-name" value={identity.full_name} onChange={(event) => setIdentity((current) => ({ ...current, full_name: event.target.value }))} autoComplete="name" required maxLength={255} placeholder="Your name" className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600" />
                      </FieldShell>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
                        <FieldShell icon={<Mail className="h-4 w-4" />}>
                          <input id="email" type="email" value={identity.email ?? ""} onChange={(event) => setIdentity((current) => ({ ...current, email: event.target.value }))} autoComplete="email" maxLength={255} placeholder="you@example.com" className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600" />
                        </FieldShell>
                      </div>
                      <div>
                        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-200">Phone</label>
                        <FieldShell icon={<Phone className="h-4 w-4" />}>
                          <input id="phone" type="tel" value={identity.phone ?? ""} onChange={(event) => setIdentity((current) => ({ ...current, phone: event.target.value }))} autoComplete="tel" maxLength={50} placeholder="+1 334 555 0100" className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600" />
                        </FieldShell>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subscriber-type" className="mb-2 block text-sm font-medium text-slate-200">How are you joining FalilaX?</label>
                      <select id="subscriber-type" value={identity.subscriber_type} onChange={(event) => setIdentity((current) => ({ ...current, subscriber_type: event.target.value as EnrollmentSubscriberType }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none">
                        {subscriberOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                      <input type="checkbox" checked={identity.is_emergency_contact} onChange={(event) => setIdentity((current) => ({ ...current, is_emergency_contact: event.target.checked }))} className="mt-0.5 h-4 w-4 accent-cyan-400" />
                      <span><span className="block text-sm font-medium text-slate-200">Emergency contact</span><span className="mt-1 block text-xs leading-5 text-slate-500">Eligible for urgent water-safety communication.</span></span>
                    </label>
                    <ErrorNotice message={error} />
                    <PrimaryButton busy={busy} disabled={!identity.full_name.trim() || (!identity.email?.trim() && !identity.phone?.trim())}>Continue securely</PrimaryButton>
                  </form>
                </div>
              )}

              {stage === "VERIFICATION" && (
                <div>
                  <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Contact verification</p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">Confirm it’s really you.</h1>
                    <p className="mt-3 text-sm leading-7 text-slate-400">We’ll send a short-lived code to a contact channel you provided. Attempts are limited for your protection.</p>
                  </div>
                  {!challenge ? (
                    <div className="space-y-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {availableChannels.map((channel) => (
                          <button key={channel} type="button" onClick={() => setVerificationChannel(channel)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${verificationChannel === channel ? "border-cyan-300/35 bg-cyan-300/[0.08]" : "border-white/[0.08] bg-white/[0.025]"}`}>
                            {channel === "EMAIL" ? <Mail className="h-5 w-5 text-cyan-300" /> : <Phone className="h-5 w-5 text-cyan-300" />}
                            <span><span className="block text-sm font-medium text-white">{channel === "EMAIL" ? "Email" : "Text message"}</span><span className="mt-1 block text-xs text-slate-500">{destinationFor(channel)}</span></span>
                          </button>
                        ))}
                      </div>
                      <ErrorNotice message={error} />
                      <PrimaryButton type="button" onClick={() => void sendChallenge()} busy={busy} disabled={!destinationFor(verificationChannel)}>Send secure code</PrimaryButton>
                    </div>
                  ) : (
                    <form onSubmit={submitVerification} className="space-y-5">
                      <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.055] p-4 text-sm text-emerald-100">
                        Code sent via {verificationChannel === "EMAIL" ? "email" : "text message"}{challenge.destination_hint ? ` to ${challenge.destination_hint}` : ""}.
                      </div>
                      <div>
                        <label htmlFor="verification-code" className="mb-2 block text-sm font-medium text-slate-200">One-time verification code</label>
                        <input id="verification-code" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\s/g, ""))} inputMode="numeric" autoComplete="one-time-code" required minLength={4} maxLength={12} placeholder="Enter code" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-center font-mono text-xl tracking-[0.35em] text-white outline-none placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-600" />
                      </div>
                      <ErrorNotice message={error} />
                      <PrimaryButton busy={busy} disabled={verificationCode.length < 4}>Verify contact</PrimaryButton>
                      <button type="button" disabled={busy} onClick={() => void sendChallenge()} className="flex w-full items-center justify-center gap-2 text-xs font-medium text-cyan-200/80 hover:text-cyan-100"><RefreshCw className="h-3.5 w-3.5" />Send a new code</button>
                    </form>
                  )}
                </div>
              )}

              {stage === "CONSENT" && (
                <div>
                  <div className="mb-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Informed participation</p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">Know what you’re joining.</h1>
                    <p className="mt-3 text-sm leading-7 text-slate-400">Review the active consent document before connecting your identity to the controlled demonstration.</p>
                  </div>
                  <form onSubmit={submitConsent} className="space-y-5">
                    <div className="max-h-64 overflow-y-auto rounded-2xl border border-white/[0.08] bg-black/20 p-5 text-sm leading-7 text-slate-300">
                      {consentDocument ? (
                        <><h2 className="mb-3 text-base font-semibold text-white">{consentDocument.title || "FalilaX enrollment consent"}</h2>{consentDocument.content.split(/\n{2,}/).map((paragraph, index) => <p key={index} className="mb-3 last:mb-0">{paragraph}</p>)}</>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400"><LoaderCircle className="h-4 w-4 animate-spin" />Loading protected document…</div>
                      )}
                    </div>
                    {consentDocument?.version && <p className="text-xs text-slate-500">Document version {consentDocument.version}</p>}
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] p-4">
                      <input type="checkbox" checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 accent-cyan-400" />
                      <span className="text-sm leading-6 text-slate-300">I have read this document and voluntarily consent to participate. I understand that FalilaX supplements—not replaces—official public-health guidance.</span>
                    </label>
                    <p className="text-xs leading-5 text-slate-500">See our <Link className="text-cyan-300 hover:text-cyan-200" to="/privacy" target="_blank">Privacy Policy</Link> and <Link className="text-cyan-300 hover:text-cyan-200" to="/terms" target="_blank">Terms</Link>.</p>
                    <ErrorNotice message={error} />
                    <PrimaryButton busy={busy} disabled={!consentDocument || !consentAccepted}>Record consent securely</PrimaryButton>
                  </form>
                </div>
              )}

              {stage === "PREFERENCES" && (
                <div>
                  <div className="mb-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Notification intelligence</p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">Choose how safety reaches you.</h1>
                    <p className="mt-3 text-sm leading-7 text-slate-400">Only verified channels can be activated. Critical alerts may override quiet hours when you permit it.</p>
                  </div>
                  <form onSubmit={submitPreferences} className="space-y-5">
                    <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4">
                      <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-300" /><div><p className="text-sm font-medium text-emerald-100">{verificationChannel === "EMAIL" ? "Email" : "Mobile contact"} verified</p><p className="mt-1 text-xs text-emerald-100/60">This is the only external channel enabled for this enrollment.</p></div></div>
                    </div>
                    <div>
                      <label htmlFor="minimum-severity" className="mb-2 block text-sm font-medium text-slate-200">Notify me starting at</label>
                      <select id="minimum-severity" value={preferences.minimum_severity} onChange={(event) => setPreferences((current) => ({ ...current, minimum_severity: event.target.value as EnrollmentMinimumSeverity }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none">
                        {severityOptions.map((option) => <option key={option.value} value={option.value}>{option.label} — {option.description}</option>)}
                      </select>
                    </div>
                    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                      <span className="flex gap-3"><Clock3 className="mt-0.5 h-4 w-4 text-cyan-300" /><span><span className="block text-sm font-medium text-slate-200">Quiet hours</span><span className="mt-1 block text-xs leading-5 text-slate-500">Pause non-emergency messages from 10 PM to 7 AM.</span></span></span>
                      <input type="checkbox" checked={preferences.quiet_hours_enabled} onChange={(event) => setPreferences((current) => ({ ...current, quiet_hours_enabled: event.target.checked }))} className="mt-0.5 h-4 w-4 accent-cyan-400" />
                    </label>
                    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                      <span className="flex gap-3"><BellRing className="mt-0.5 h-4 w-4 text-cyan-300" /><span><span className="block text-sm font-medium text-slate-200">Require acknowledgement</span><span className="mt-1 block text-xs leading-5 text-slate-500">Let FalilaX confirm important alerts were received.</span></span></span>
                      <input type="checkbox" checked={preferences.acknowledgement_required} onChange={(event) => setPreferences((current) => ({ ...current, acknowledgement_required: event.target.checked, acknowledgement_timeout_minutes: event.target.checked ? 30 : null, escalation_enabled: event.target.checked, escalation_timeout_minutes: event.target.checked ? 60 : null }))} className="mt-0.5 h-4 w-4 accent-cyan-400" />
                    </label>
                    <ErrorNotice message={error} />
                    <PrimaryButton busy={busy}>Connect service context</PrimaryButton>
                  </form>
                </div>
              )}

              {stage === "ACTIVATION" && (
                <div className="py-4 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.07] shadow-[0_0_50px_rgba(53,211,235,0.12)]"><MapPin className="h-8 w-8 text-cyan-300" /></div>
                  <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Protected network matching</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">Your place in the network is being reviewed.</h1>
                  <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400">FalilaX proposed a synthetic service context for the controlled demonstration. An authorized operator must approve it before activation.</p>
                  <div className="mx-auto mt-7 grid max-w-lg gap-3 text-left sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Assignment</p><p className="mt-2 text-sm font-medium text-white">{topology?.scope_label || topology?.scope_type || "Controlled demo network"}</p><p className="mt-1 text-xs text-slate-500">{topology?.is_synthetic ? "Synthetic • demo-safe" : "Protected context"}</p></div>
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Review status</p><p className="mt-2 flex items-center gap-2 text-sm font-medium text-white"><LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" />{activation?.topology_status || topology?.status || "PROPOSED"}</p><p className="mt-1 text-xs text-slate-500">Checked automatically</p></div>
                  </div>
                  <ErrorNotice message={error} />
                  <p className="mt-6 text-xs leading-5 text-slate-500">You can safely leave this page open. This participant capability cannot approve its own topology or activate itself.</p>
                </div>
              )}

              {stage === "COMPLETE" && (
                <div className="py-5 text-center">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] border border-emerald-300/25 bg-emerald-300/[0.08] shadow-[0_0_60px_rgba(52,211,153,0.13)]"><CheckCircle2 className="h-10 w-10 text-emerald-300" /></div>
                  <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Identity activated</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">You’re connected to FalilaX.</h1>
                  <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400">Your verified identity, consent, notification choices, and approved service context now form one auditable water-safety connection.</p>
                  <div className="mx-auto mt-7 max-w-md rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.055] p-4 text-left"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" /><div><p className="text-sm font-medium text-emerald-100">Secure activation complete</p><p className="mt-1 text-xs leading-5 text-emerald-100/60">Trust score {activation?.trust_score != null ? `${Math.round(activation.trust_score * 100)}%` : "verified"} • topology {activation?.topology_status?.toLowerCase() || "approved"}</p></div></div></div>
                  <div className="mt-7">
                    <PrimaryButton
                      type="button"
                      busy={busy}
                      onClick={() => void openParticipantWorkspace()}
                    >
                      Enter your water-safety workspace
                    </PrimaryButton>
                  </div>
                  <div className="mx-auto mt-4 max-w-md">
                    <ErrorNotice message={error} />
                  </div>
                </div>
              )}

              {stage !== "INVITATION" && stage !== "COMPLETE" && (
                <button type="button" onClick={restartEnrollment} className="mx-auto mt-7 block text-xs text-slate-600 transition hover:text-slate-400">Use a different invitation</button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default EnrollmentFabric;
