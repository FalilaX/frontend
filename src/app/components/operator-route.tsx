import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";

import { API_ENDPOINTS, buildApiUrl } from "@/app/config/api";
import {
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
  const [state, setState] = useState<GuardState>("checking");

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
          role?: string;
          is_active?: boolean;
        };
        const role = payload.role?.trim().toLowerCase();
        if (
          !response.ok
          || payload.is_active === false
          || !role
          || !OPERATIONAL_ROLES.has(role)
        ) {
          clearAccessToken();
          setState("denied");
          return;
        }
        setState("allowed");
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError") {
          setState("denied");
        }
      }
    }

    void validate();
    return () => controller.abort();
  }, []);

  if (state === "checking") {
    return (
      <div className="fx-app-shell grid min-h-screen place-items-center text-slate-300">
        <div className="flex items-center gap-3 text-sm">
          <LoaderCircle className="h-5 w-5 animate-spin text-cyan-300" />
          Verifying operator access…
        </div>
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

  return children;
}
