import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { getParticipantSession } from "@/app/utils/participant-session";

export function ParticipantRoute({ children }: { children: ReactNode }) {
  return getParticipantSession()
    ? children
    : <Navigate to="/enroll" replace />;
}
