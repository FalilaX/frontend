import { buildApiUrl } from "@/app/config/api";
import { ParticipantAccessError } from "@/app/services/participant-api";
import type { ParticipantBrowserSession } from "@/app/utils/participant-session";

export type ParticipantWaterContextKind = "DEMONSTRATION" | "RECORDED";

export interface ParticipantWaterParameter {
  parameter_code: string;
  risk_level: string;
}

export interface ParticipantWaterIntelligence {
  context_kind: ParticipantWaterContextKind;
  status: string;
  headline: string;
  summary: string;
  overall_risk_score: number;
  dominant_parameters: string[];
  elevated_parameters: string[];
  possible_explanations: string[];
  parameters: ParticipantWaterParameter[];
  generated_at: string;
  disclaimer: string | null;
}

export class ParticipantWaterIntelligenceUnavailable extends Error {
  constructor() {
    super("Water intelligence is not available for this participant context.");
    this.name = "ParticipantWaterIntelligenceUnavailable";
  }
}

function isShortText(value: unknown, max = 1000): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

function isTextArray(
  value: unknown,
  maxItems: number,
  maxLength = 300,
): value is string[] {
  return Array.isArray(value)
    && value.length <= maxItems
    && value.every(item => isShortText(item, maxLength));
}

function isGeneratedAt(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && value.length <= 64
    && Number.isFinite(Date.parse(value));
}

export async function getParticipantWaterIntelligence(
  session: ParticipantBrowserSession,
  signal: AbortSignal,
): Promise<ParticipantWaterIntelligence> {
  const response = await fetch(
    buildApiUrl("/api/v1/participant/me/water-intelligence"),
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      signal,
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      referrerPolicy: "no-referrer",
    },
  );

  if (response.status === 404) {
    throw new ParticipantWaterIntelligenceUnavailable();
  }

  if (response.status === 401 || response.status === 403) {
    throw new ParticipantAccessError(true);
  }

  if (!response.ok) {
    throw new Error("FalilaX could not load water intelligence.");
  }

  const data = await response.json() as unknown;

  if (!data || typeof data !== "object") {
    throw new Error("FalilaX returned invalid water intelligence.");
  }

  const value = data as Record<string, unknown>;

  if (
    !["DEMONSTRATION", "RECORDED"].includes(String(value.context_kind))
    || !isShortText(value.status, 100)
    || !isShortText(value.headline, 500)
    || !isShortText(value.summary, 2000)
    || typeof value.overall_risk_score !== "number"
    || !Number.isFinite(value.overall_risk_score)
    || value.overall_risk_score < 0
    || value.overall_risk_score > 1
    || !isTextArray(value.dominant_parameters, 20, 100)
    || !isTextArray(value.elevated_parameters, 20, 100)
    || !isTextArray(value.possible_explanations, 20, 1000)
    || !Array.isArray(value.parameters)
    || value.parameters.length > 100
    || !value.parameters.every(item => {
      if (!item || typeof item !== "object") return false;
      const parameter = item as Record<string, unknown>;
      return (
        isShortText(parameter.parameter_code, 100)
        && isShortText(parameter.risk_level, 100)
      );
    })
    || !isGeneratedAt(value.generated_at)
    || !(value.disclaimer === null || isShortText(value.disclaimer, 2000))
  ) {
    throw new Error("FalilaX returned invalid water intelligence.");
  }

  return value as unknown as ParticipantWaterIntelligence;
}
