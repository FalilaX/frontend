import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { getParticipantProfile, ParticipantAccessError } from "@/app/services/participant-api";
import type { ParticipantProfile } from "@/app/services/participant-api";
import { clearParticipantSession, getParticipantSession } from "@/app/utils/participant-session";

const ProfileContext = createContext<ParticipantProfile | null>(null);
export function useParticipantProfile(): ParticipantProfile {
  const profile = useContext(ProfileContext);
  if (!profile) throw new Error("Participant profile has not been verified.");
  return profile;
}

export function ParticipantRoute({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [message, setMessage] = useState("");
  const [ended, setEnded] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let disposed = false;
    let active: AbortController | null = null;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    const validate = async () => {
      active?.abort();
      clearTimeout(deadline);
      const controller = new AbortController();
      active = controller;
      setProfile(null);
      setMessage("");
      setEnded(false);
      const session = getParticipantSession();
      if (!session) {
        setEnded(true);
        setMessage("Your participant session has ended.");
        return;
      }
      deadline = setTimeout(() => controller.abort(), 30000);
      try {
        const verified = await getParticipantProfile(session, controller.signal);
        if (!disposed && active === controller) {
          if (getParticipantSession()?.accessToken !== session.accessToken) {
            setEnded(true);
            setMessage("Your participant session has changed. Please reopen your workspace.");
          } else {
            setProfile(verified);
          }
        }
      } catch (error) {
        if (disposed || active !== controller) return;
        const expired = error instanceof ParticipantAccessError && error.expired;
        if (expired && getParticipantSession()?.accessToken === session.accessToken) clearParticipantSession();
        setEnded(expired);
        setMessage(expired ? "Your participant session has ended."
          : "We could not verify your connection. Please try again.");
      } finally {
        if (active === controller) clearTimeout(deadline);
      }
    };
    void validate();
    const refresh = () => { void validate(); };
    const timer = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      disposed = true;
      active?.abort();
      clearTimeout(deadline);
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [attempt]);

  if (profile) return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>;
  return (
    <main className="fx-app-shell flex min-h-screen items-center justify-center px-6 text-slate-100">
      <section className="w-full max-w-lg rounded-3xl border border-cyan-300/15 bg-[#071b2a] p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">FalilaX participant workspace</p>
        <h1 className="mt-4 text-2xl font-semibold">{ended ? "Session ended" : message ? "Connection unavailable" : "Checking your secure connection"}</h1>
        <p role="status" className="mt-4 text-sm leading-6 text-slate-300">{message || "Please wait while we verify access to your profile."}</p>
        {message && !ended && <button type="button" onClick={() => setAttempt(value => value + 1)} className="mt-6 rounded-xl bg-cyan-300 px-5 py-3 font-medium text-slate-950">Try again</button>}
        {message && <Link className="mt-6 block text-sm text-cyan-300 underline" to="/">Return to FalilaX</Link>}
      </section>
    </main>
  );
}
