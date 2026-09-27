import { AccountLanguageProvider } from "@/app/i18n/account-language";
import { Localize } from "@/app/i18n/language";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";

import { API_ENDPOINTS, buildApiUrl } from "@/app/config/api";
import {
  AUTH_SESSION_CHANGED_EVENT,
  authenticatedFetch,
  clearAccessToken,
  getAccessToken,
} from "@/app/utils/auth-session";

const OPERATIONAL_ROLES = new Set([
  "admin",
  "super_admin",
  "utility_operator",
  "analyst",
  "viewer",
]);

type GuardState = "checking" | "allowed" | "denied";

export function OperatorRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [attempt, setAttempt] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [state, setState] = useState<GuardState>("checking");

  useEffect(() => {
    const changed = () => { setUserId(null); setState("checking"); setAttempt(value => value + 1); };
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, changed);
    return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, changed);
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setState("denied");
      return;
    }

    const controller = new AbortController();
    async function validate() {
      try {
        const response = await authenticatedFetch(
          buildApiUrl(API_ENDPOINTS.AUTH_ME),
          { signal: controller.signal },
        );
        const payload = await response.json().catch(() => ({})) as {
          id?: number;
          role?: string;
          is_active?: boolean;
        };
        if (controller.signal.aborted || getAccessToken() !== token) return;
        const role = payload.role?.trim().toLowerCase();
        if (
          !response.ok
          || !Number.isSafeInteger(payload.id) || (payload.id ?? 0) <= 0
          || payload.is_active === false
          || !role
          || !OPERATIONAL_ROLES.has(role)
        ) {
          clearAccessToken();
          setState("denied");
          return;
        }
        setUserId(payload.id!);
        setState("allowed");
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError") {
          setState("denied");
        }
      }
    }

    void validate();
    return () => controller.abort();
  }, [attempt]);

  if (state === "checking") {
    return (
      <div className="fx-app-shell grid min-h-screen place-items-center text-slate-300">
        <div className="flex items-center gap-3 text-sm">
          <LoaderCircle className="h-5 w-5 animate-spin text-cyan-300" /><Localize>{" Verifying operator access… "}</Localize></div>
      </div>
    );
  }

  if (state === "denied") {
    const next = `${location.pathname}${location.search}${location.hash}`;
    return (
      <Navigate
        to={`/operator/sign-in?next=${encodeURIComponent(next)}`}
        replace
      />
    );
  }

  if (userId === null) return null;
  return <AccountLanguageProvider account={{ kind: "operator", userId }}>{children}</AccountLanguageProvider>;
}
