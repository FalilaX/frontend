import { GeneratedText } from "@/app/i18n/generated-text";
import { Localize } from "@/app/i18n/language";
import { useOperationalText } from "@/app/i18n/operational-text";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Download,
  FileText,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Siren,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

import { API_BASE_URL } from "@/app/config/api";
import { authenticatedFetch } from "@/app/utils/auth-session";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import logoImage from "@/assets/falilax-logo.png";

type IncidentStatus =
  | "open"
  | "acknowledged"
  | "investigating"
  | "action_plan_ready"
  | "awaiting_approval"
  | "action_required"
  | "executing"
  | "verifying"
  | "resolved"
  | "closed"
  | "reopened"
  | "cancelled"
  | "suppressed"
  | string;

type IncidentSeverity =
  | "informational"
  | "low"
  | "medium"
  | "high"
  | "critical"
  | string;

type WorkflowSummary = {
  id: string;
  incident_id: string;
  status: IncidentStatus;
  priority: string;
  severity: string;
  acknowledged_by: string | null;
  assigned_to: string | null;
  assigned_team: string | null;
  resolution_summary: string | null;
  cancellation_reason: string | null;
  reopening_reason: string | null;
  acknowledgement_due_at: string | null;
  investigation_due_at: string | null;
  resolution_due_at: string | null;
  acknowledged_at: string | null;
  investigation_started_at: string | null;
  execution_started_at: string | null;
  verification_started_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  cancelled_at: string | null;
  reopened_at: string | null;
  action_count: number;
  execution_record_count: number;
  completed_execution_count: number;
  failed_execution_count: number;
  blocked_execution_count: number;
  execution_counter_scope?: string;
  action_plan_generation?: number;
  note_count: number;
  event_count: number;
  acknowledgement_sla_breached: boolean;
  investigation_sla_breached: boolean;
  resolution_sla_breached: boolean;
  has_sla_breach: boolean;
  metadata: unknown;
  created_at: string | null;
  updated_at: string | null;
};

type IncidentSummary = {
  id: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  title: string;
  description: string | null;
  event_type: string | null;
  source_event_id: string | null;
  source_asset_id: number | null;
  source_node_id: number | null;
  is_actionable: boolean;
  is_emergency: boolean;
  should_notify: boolean;
  assigned_to: string | null;
  assigned_team: string | null;
  acknowledged_by: string | null;
  detected_at: string | null;
  last_seen_at: string | null;
  workflow: WorkflowSummary | null;
};

type IncidentDetailRecord = IncidentSummary & {
  resolution_summary: string | null;
  affected_asset_count: number;
  affected_subscriber_count: number;
  workflow_count: number;
  action_count: number;
  execution_count: number;
  acknowledged_at: string | null;
  investigation_started_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  cancelled_at: string | null;
  impact: unknown;
  intelligence: unknown;
  context: unknown;
  metadata: unknown;
};

type WorkflowEvent = {
  id: string;
  workflow_id: string;
  incident_id: string;
  event_type: string;
  occurred_at: string | null;
  actor: string | null;
  from_status: string | null;
  to_status: string | null;
  message: string;
  metadata: unknown;
};

type WorkflowNote = {
  id: string;
  workflow_id: string;
  incident_id: string;
  author: string;
  message: string;
  authored_at: string | null;
  metadata: unknown;
};

type IncidentAction = {
  id: string;
  workflow_id: string;
  incident_id: string;
  action_type: string;
  title: string;
  description: string;
  risk: string;
  execution_mode: string | null;
  status: string;
  priority: number;
  target_asset_id: string | number | null;
  source_event_type: string | null;
  reason: string | null;
  requires_approval: boolean;
  approval_role: string | null;
  proposed_at: string | null;
  expires_at: string | null;
  plan_generation: number;
  superseded: boolean;
  superseded_at?: string | null;
  superseded_by?: string | null;
  superseded_reason?: string | null;
  status_before_supersede?: string | null;
  metadata: Record<string, unknown> | null;
};

type ActionPlanSummary = {
  count: number;
  requires_approval_count: number;
  pending_approval_count: number;
  approved_count: number;
  ready_for_execution: boolean;
  physical_execution_started: boolean;
  safety_note: string;
};

type ExecutionAggregateSummary = {
  count: number;
  executed_count: number;
  failed_count: number;
  blocked_count: number;
  skipped_count: number;
  successful_count: number;
  unsuccessful_count: number;
  generation_counts: Record<string, number>;
  execution_ids: string[];
};

type CurrentGenerationExecutionSummary = ExecutionAggregateSummary & {
  plan_generation: number;
};

type FutureGenerationAnomaly = {
  count: number;
  present: boolean;
  execution_ids: string[];
};

type ExecutionSummary = {
  count: number;
  executed_count: number;
  failed_count: number;
  blocked_count: number;
  skipped_count: number;
  plan_generation: number;
  counter_scope: string;
  lifetime: ExecutionAggregateSummary;
  current_generation: CurrentGenerationExecutionSummary;
  historical: ExecutionAggregateSummary;
  future_generation_anomaly: FutureGenerationAnomaly;
  physical_control_command_issued: boolean;
  safety_note: string | null;
};

type IncidentExecution = {
  id: string;
  workflow_id: string;
  action_id: string;
  incident_id: string;
  action_type: string;
  execution_mode: string | null;
  outcome: string;
  plan_generation: number;
  attempt_number: number;
  retry_count: number;
  executor: string | null;
  adapter_name: string | null;
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number | null;
  message: string;
  result: Record<string, unknown> | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
  physical_control_command_issued: boolean;
  success: boolean;
};

type IncidentListResponse = {
  items: IncidentSummary[];
  count: number;
  limit: number;
  offset: number;
};

type SourceIdentity = {
  source_asset_id: number | null;
  source_node_id: number | null;
  identity_resolution?: string | null;
};

type SourceTargetAsset = {
  asset_id: number;
  asset_name: string;
  asset_type: string;
};

type SourceOriginAsset = {
  asset_id: number;
  asset_name: string;
  asset_type: string;
  source_type: string | null;
  score: number;
  depth: number;
  relationship_id: number | null;
  downstream_asset_id: number | null;
  relationship_type: string | null;
  distance_meters: number | null;
  estimated_travel_time_minutes: number | null;
  relationship_confidence: number | null;
  evidence: string[];
};

type SourceTypeSupport = {
  source_type: string | null;
  score: number;
  share_percent: number;
  evidence_count: number;
};

type EvidenceCoverage = {
  available: number;
  total: number;
  percent: number;
};

type HydraulicEvidence = {
  status: string;
  topology_available: boolean;
  relationship_confidence_available: boolean;
  distance_available: boolean;
  travel_time_available: boolean;
  distance_coverage?: EvidenceCoverage;
  travel_time_coverage?: EvidenceCoverage;
  relationship_confidence_coverage?: EvidenceCoverage;
  hydraulic_metadata_complete: boolean;
  hydraulic_model_ready: boolean;
  hydraulic_model_reason: string | null;
  provenance?: {
    topology_source?: string | null;
    distance_field?: string | null;
    travel_time_field?: string | null;
    relationship_confidence_field?: string | null;
    hydraulic_model_source?: string | null;
  };
  limitations?: string[];
};

type SourceIntelligence = {
  available: boolean;
  status: string;
  assessment_type: string;
  engine_version: string;
  generated_at?: string | null;
  incident_id?: string | null;
  incident_context?: {
    event_type?: string | null;
    severity?: string | null;
  };
  source_identity: SourceIdentity;
  headline: string;
  summary: string;
  target_asset: SourceTargetAsset | null;
  probable_origin_assets: SourceOriginAsset[];
  source_type_support: SourceTypeSupport[];
  topology: {
    used: boolean;
    target_asset_id: number | null;
    target_asset_name: string | null;
    target_asset_type: string | null;
    max_depth: number;
    upstream_relationship_count: number;
    probable_origin_assets: SourceOriginAsset[];
  };
  hydraulic_evidence: HydraulicEvidence | null;
  limitations: string[];
};

type IncidentDetailResponse = {
  incident: IncidentDetailRecord;
  workflow: WorkflowSummary | null;
  events: WorkflowEvent[];
  notes: WorkflowNote[];
  action_plan: ActionPlanSummary;
  actions: IncidentAction[];
  execution_summary: ExecutionSummary;
  executions: IncidentExecution[];
  source_intelligence: SourceIntelligence | null;
};

type PersistedReportType = "summary" | "detailed" | "evidence_json";

type PersistedIncidentReport = {
  id: string;
  incident_id: string;
  workflow_id: string;
  report_number: string;
  report_type: PersistedReportType | string;
  report_stage: string;
  report_revision: number;
  schema_version: string;
  plan_generation: number;
  generated_by: string;
  generated_at: string | null;
  utility_name: string | null;
  system_name: string | null;
  synthetic: boolean;
  content_type: string;
  content_hash: string;
  supersedes_report_id: string | null;
  superseded_at: string | null;
  is_superseded: boolean;
  created_at: string | null;
  updated_at: string | null;
  metadata: Record<string, unknown> | null;
};

type ReportRegistrySummary = {
  count: number;
  active_count: number;
  superseded_count: number;
  current_generation: number;
  current_generation_count: number;
  final_count: number;
  draft_count: number;
  preliminary_count: number;
  generation_counts: Record<string, number>;
  type_counts: Record<string, number>;
  latest_generated_at: string | null;
};

type IncidentResolvedReportProfile = {
  utility_name: string | null;
  system_name: string | null;
  utility_id: number | null;
  central_system_id: number | null;
  distribution_line_id: number | null;
  source_asset_id: number | null;
  resolution_source: string | null;
};

type IncidentReportRegistryResponse = {
  incident_id: string;
  workflow_id: string | null;
  current_plan_generation: number;
  report_profile: IncidentResolvedReportProfile | null;
  report_registry: ReportRegistrySummary;
  reports: PersistedIncidentReport[];
};

type PersistIncidentReportResponse = {
  incident_id: string;
  workflow_id: string;
  persistence: {
    status: "created" | "reused" | string;
    created: boolean;
    reused: boolean;
    superseded_report_id: string | null;
    warnings: string[];
  };
  report: PersistedIncidentReport;
};

type IncidentReportRecordResponse = {
  incident_id: string;
  report: PersistedIncidentReport & {
    content?: string;
    evidence_snapshot?: Record<string, unknown>;
  };
};

type MutationName =
  | "acknowledge"
  | "assign"
  | "investigate"
  | "notes"
  | "verify"
  | "resolve"
  | "close"
  | "reopen"
  | "cancel"
  | "actions/plan"
  | "actions/refresh-plan"
  | "actions/approve"
  | "actions/start-execution";

const DEFAULT_OPERATOR = "FalilaX Operator";

const STATUS_ORDER = [
  "open",
  "acknowledged",
  "investigating",
  "awaiting_approval",
  "action_plan_ready",
  "executing",
  "verifying",
  "resolved",
  "closed",
];

const normalizeWorkflowStatus = (
  value: string | null | undefined,
): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll(" ", "_");

const terminalStatuses = new Set([
  "resolved",
  "closed",
  "cancelled",
  "suppressed",
]);

const formatStatus = (value: string | null | undefined) =>
  (value || "unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Not available";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString();
};

const formatNumber = (
  value: number | null | undefined,
  digits = 1,
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Not available";
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
  });
};

const formatConfidence = (
  value: number | null | undefined,
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Not available";
  }

  return `${Math.round(value * 100)}%`;
};

const formatGenerationCounts = (
  counts: Record<string, number> | null | undefined,
): string => {
  const entries = Object.entries(counts ?? {}).sort(
    ([left], [right]) => Number(left) - Number(right),
  );

  if (entries.length === 0) return "None";

  return entries
    .map(([generation, count]) => `Gen ${generation}: ${count}`)
    .join(" · ");
};

const escapeReportHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const reportValue = (
  value: unknown,
  fallback = "Not available",
): string => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
};

const reportCell = (
  label: string,
  value: unknown,
): string => `
  <div class="fact">
    <div class="fact-label">${escapeReportHtml(label)}</div>
    <div class="fact-value">${escapeReportHtml(reportValue(value))}</div>
  </div>
`;

type IncidentReportVariant = "summary" | "detailed";

type IncidentReportProfile = {
  utilityName: string;
  systemName: string;
};

const REPORT_PROFILE_STORAGE_KEY = "falilax.incident_report_profile.v1";

const loadIncidentReportProfile = (): IncidentReportProfile => {
  if (typeof window === "undefined") {
    return {
      utilityName: "",
      systemName: "",
    };
  }

  try {
    const saved = window.localStorage.getItem(REPORT_PROFILE_STORAGE_KEY);
    if (!saved) {
      return {
        utilityName: "",
        systemName: "",
      };
    }

    const parsed = JSON.parse(saved) as Partial<IncidentReportProfile>;

    return {
      utilityName: String(parsed.utilityName ?? ""),
      systemName: String(parsed.systemName ?? ""),
    };
  } catch {
    return {
      utilityName: "",
      systemName: "",
    };
  }
};

const saveIncidentReportProfile = (profile: IncidentReportProfile) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      REPORT_PROFILE_STORAGE_KEY,
      JSON.stringify(profile),
    );
  } catch {
    // Report generation must remain usable even if browser storage is blocked.
  }
};

const reportGeneration = (detail: IncidentDetailResponse): number =>
  detail.execution_summary?.plan_generation ??
  detail.workflow?.action_plan_generation ??
  1;

const reportDateStamp = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const buildHumanReportNumber = (
  detail: IncidentDetailResponse,
  fallbackDate: Date,
): string => {
  const incidentToken = detail.incident.id
    .replace(/^inc[_-]?/i, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toUpperCase();

  const currentGeneration = reportGeneration(detail);
  const currentActionDates = detail.actions
    .filter((action) => action.plan_generation === currentGeneration)
    .map((action) => action.proposed_at)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((left, right) => left.getTime() - right.getTime());

  const identityDate =
    currentActionDates[0] ??
    (detail.workflow?.reopened_at
      ? new Date(detail.workflow.reopened_at)
      : detail.workflow?.closed_at
        ? new Date(detail.workflow.closed_at)
        : detail.incident.detected_at
          ? new Date(detail.incident.detected_at)
          : fallbackDate);

  const stableDate = Number.isNaN(identityDate.getTime())
    ? fallbackDate
    : identityDate;

  return `FX-IR-${reportDateStamp(stableDate)}-${incidentToken}-G${currentGeneration}`;
};

const buildMachineReportId = (
  detail: IncidentDetailResponse,
  generatedAt: Date,
): string =>
  `FALILAX-${detail.incident.id}-${generatedAt
    .toISOString()
    .replace(/[-:.TZ]/g, "")}`;

const reportStageFor = (
  detail: IncidentDetailResponse,
  profile: IncidentReportProfile,
): "final" | "draft" | "preliminary" => {
  const status = normalizeWorkflowStatus(
    detail.workflow?.status ?? detail.incident.status,
  );
  const profileComplete = Boolean(
    profile.utilityName.trim() && profile.systemName.trim(),
  );

  if (status !== "closed") return "preliminary";
  return profileComplete ? "final" : "draft";
};

const hasExplicitSyntheticSignal = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;

  if (Array.isArray(value)) {
    return value.some((item) => hasExplicitSyntheticSignal(item));
  }

  if (typeof value !== "object") return false;

  for (const [rawKey, rawValue] of Object.entries(
    value as Record<string, unknown>,
  )) {
    const key = rawKey.trim().toLowerCase();

    if (
      [
        "simulation",
        "synthetic",
        "is_synthetic",
        "synthetic_test",
        "test_incident",
        "development_test",
      ].includes(key) &&
      rawValue === true
    ) {
      return true;
    }

    if (
      ["data_mode", "environment", "record_environment", "incident_environment"].includes(
        key,
      ) &&
      typeof rawValue === "string" &&
      ["simulation", "development", "dev", "test", "testing", "synthetic", "demo"].includes(
        rawValue.trim().toLowerCase(),
      )
    ) {
      return true;
    }

    if (hasExplicitSyntheticSignal(rawValue)) return true;
  }

  return false;
};

const detectSyntheticIncident = (detail: IncidentDetailResponse): boolean => {
  if (
    hasExplicitSyntheticSignal(detail.incident.metadata) ||
    hasExplicitSyntheticSignal(detail.incident.context) ||
    hasExplicitSyntheticSignal(detail.incident.intelligence) ||
    hasExplicitSyntheticSignal(detail.workflow?.metadata) ||
    detail.actions.some((action) => hasExplicitSyntheticSignal(action.metadata)) ||
    detail.executions.some((record) =>
      hasExplicitSyntheticSignal(record.metadata),
    )
  ) {
    return true;
  }

  const explicitTestText = [
    detail.incident.title,
    detail.incident.description,
    detail.workflow?.resolution_summary,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    explicitTestText.includes("synthetic browser verification incident") ||
    explicitTestText.includes("browser-only acceptance test") ||
    explicitTestText.includes("development lifecycle verification")
  );
};

const buildReportEvidenceSnapshot = (
  detail: IncidentDetailResponse,
  profile: IncidentReportProfile,
  syntheticOverride = false,
): Record<string, unknown> => ({
  schema: "falilax.incident_report_evidence_snapshot.v1",
  report_renderer_version: "1.4",
  plan_generation: reportGeneration(detail),
  report_stage: reportStageFor(detail, profile),
  classification:
    syntheticOverride || detectSyntheticIncident(detail)
      ? "development_synthetic_not_for_regulatory_submission"
      : "operational",
  report_profile: {
    utility_name: profile.utilityName.trim() || null,
    system_or_facility: profile.systemName.trim() || null,
    prepared_by: detail.workflow?.acknowledged_by || DEFAULT_OPERATOR,
  },
  incident: detail.incident,
  workflow: detail.workflow,
  source_intelligence: detail.source_intelligence,
  action_plan: detail.action_plan,
  actions: detail.actions,
  execution_summary: detail.execution_summary,
  executions: detail.executions,
  investigation_findings: detail.notes,
  audit_timeline: detail.events,
});

const normalizeFingerprintValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeFingerprintValue(item));
  }

  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};

    for (const key of Object.keys(source).sort()) {
      if (key === "generated_at" || key === "updated_at") continue;
      normalized[key] = normalizeFingerprintValue(source[key]);
    }

    return normalized;
  }

  return value;
};

const stableReportEvidenceJson = (value: unknown): string =>
  JSON.stringify(normalizeFingerprintValue(value));

const reportEvidenceFingerprint = async (value: unknown): Promise<string> => {
  const encoded = new TextEncoder().encode(stableReportEvidenceJson(value));

  if (window.crypto?.subtle) {
    const digest = await window.crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  throw new Error("Evidence snapshot hashing requires a secure browser context (HTTPS or localhost).");
};

const reportImpactCount = (incident: IncidentDetailResponse["incident"], value: number): string => {
  const impact = incident.impact as Record<string, unknown> | null;
  const assessment = String(impact?.assessment_status ?? "").toLowerCase();
  if (!assessment || ["not_evaluated", "not_assessed", "unavailable", "unknown", "pending"].includes(assessment)) {
    return "Not assessed";
  }
  return Number.isFinite(value) ? String(value) : "Not available";
};

const reportExecutionEvidence = (record: IncidentExecution): string => {
  const attestation = record.result?.attestation_message;
  return typeof attestation === "string" && attestation.trim()
    ? attestation
    : record.message || "No execution evidence message was recorded.";
};

const buildIncidentEvidenceReportHtml = (
  detail: IncidentDetailResponse,
  variant: IncidentReportVariant = "detailed",
  profile: IncidentReportProfile = {
    utilityName: "",
    systemName: "",
  },
  syntheticOverride = false,
  generatedAt = new Date(),
  evidenceSnapshotId = "Not available",
): string => {
  const incident = detail.incident;
  const workflow = detail.workflow;
  const source = detail.source_intelligence;
  const execution = detail.execution_summary;
  const actions = detail.actions ?? [];
  const executions = detail.executions ?? [];
  const notes = detail.notes ?? [];
  const events = detail.events ?? [];

  const generatedIso = generatedAt.toISOString();
  const humanReportNumber = buildHumanReportNumber(detail, generatedAt);
  const machineReportId = buildMachineReportId(detail, generatedAt);
  const currentGeneration = reportGeneration(detail);
  const status = normalizeWorkflowStatus(
    workflow?.status ?? incident.status,
  );
  const profileComplete =
    profile.utilityName.trim().length > 0 &&
    profile.systemName.trim().length > 0;
  const reportStage =
    status === "closed"
      ? profileComplete
        ? "FINAL"
        : "DRAFT"
      : "PRELIMINARY";
  const isSummary = variant === "summary";
  const reportTitle = isSummary
    ? "Incident Summary Report"
    : "Incident Evidence Report";
  const reportTypeLabel = isSummary ? "SUMMARY" : "DETAILED";
  const logoUrl = new URL(logoImage, window.location.origin).href;
  const sourceAssetName =
    source?.target_asset?.asset_name ??
    (incident.source_asset_id != null
      ? `Asset ${incident.source_asset_id}`
      : "Not available");
  const sourceAssetType = source?.target_asset?.asset_type ?? "Not available";
  const utilityName = profile.utilityName.trim() || "Not configured";
  const systemName = profile.systemName.trim() || "Not configured";
  const preparedBy = workflow?.acknowledged_by || DEFAULT_OPERATOR;
  const isSynthetic = syntheticOverride || detectSyntheticIncident(detail);
  const completedActions = actions.filter(
    (action) => normalizeWorkflowStatus(action.status) === "completed",
  ).length;
  const currentExecuted = execution?.current_generation?.executed_count ?? 0;
  const currentFailed = execution?.current_generation?.failed_count ?? 0;
  const currentBlocked = execution?.current_generation?.blocked_count ?? 0;
  const physicalControlIssued = Boolean(
    execution?.physical_control_command_issued,
  );
  const hydraulicStatus = source?.hydraulic_evidence?.status ?? "Unavailable";
  const hydraulicReady = Boolean(
    source?.hydraulic_evidence?.hydraulic_model_ready,
  );

  const upstreamAssets = source?.probable_origin_assets ?? [];
  const upstreamNames = upstreamAssets
    .slice(0, 3)
    .map((asset) => asset.asset_name)
    .join("; ");

  const upstreamRows = upstreamAssets
    .map(
      (asset, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeReportHtml(asset.asset_name)}</td>
          <td>${escapeReportHtml(asset.asset_type)}</td>
          <td>${asset.depth}</td>
          <td>${escapeReportHtml(asset.relationship_type ?? "Not available")}</td>
          <td>${escapeReportHtml(formatNumber(asset.score, 3))}</td>
          <td>${escapeReportHtml(formatConfidence(asset.relationship_confidence))}</td>
        </tr>
      `,
    )
    .join("");

  const summaryUpstreamRows = upstreamAssets
    .slice(0, 3)
    .map(
      (asset, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeReportHtml(asset.asset_name)}</td>
          <td>${escapeReportHtml(asset.asset_type)}</td>
          <td>${asset.depth}</td>
          <td>${escapeReportHtml(formatConfidence(asset.relationship_confidence))}</td>
        </tr>
      `,
    )
    .join("");

  const actionRows = actions
    .map(
      (action) => `
        <tr>
          <td>${escapeReportHtml(action.title)}</td>
          <td>${escapeReportHtml(isSynthetic && action.status === "completed" ? "Rehearsal completed" : formatStatus(action.status))}</td>
          <td>${escapeReportHtml(formatStatus(action.risk))}</td>
          <td>${escapeReportHtml(formatStatus(action.execution_mode))}</td>
          <td>${action.requires_approval ? "Required" : "Not required"}</td>
          <td>${escapeReportHtml(reportValue(action.approval_role))}</td>
          <td>${escapeReportHtml(reportValue(action.target_asset_id))}</td>
          <td>${action.plan_generation}</td>
        </tr>
      `,
    )
    .join("");

  const summaryActionRows = actions
    .map(
      (action) => `
        <tr>
          <td>${escapeReportHtml(action.title)}</td>
          <td>${escapeReportHtml(isSynthetic && action.status === "completed" ? "Rehearsal completed" : formatStatus(action.status))}</td>
          <td>${escapeReportHtml(formatStatus(action.risk))}</td>
          <td>${escapeReportHtml(formatStatus(action.execution_mode))}</td>
        </tr>
      `,
    )
    .join("");

  const executionRows = executions
    .map(
      (record) => `
        <tr>
          <td><strong>${escapeReportHtml(formatStatus(record.action_type))}</strong><br />
          Generation ${record.plan_generation} · Attempt ${record.attempt_number}<br />
          ${escapeReportHtml(isSynthetic ? "Rehearsal record" : formatStatus(record.outcome))}<br />
          ${escapeReportHtml(formatStatus(record.outcome))} · ${escapeReportHtml(formatDate(record.started_at))}<br />
          ${escapeReportHtml(reportValue(record.executor))}<br />
          ${escapeReportHtml(reportValue(record.adapter_name))}</td>
          <td>${escapeReportHtml(reportExecutionEvidence(record))}</td>
        </tr>
      `,
    )
    .join("");

  const noteRows = notes
    .map(
      (note) => `
        <tr>
          <td>${escapeReportHtml(formatDate(note.authored_at))}</td>
          <td>${escapeReportHtml(note.author)}</td>
          <td>${escapeReportHtml(note.message)}</td>
        </tr>
      `,
    )
    .join("");

  const eventRows = [...events]
    .sort((left, right) => {
      const leftTime = new Date(left.occurred_at ?? 0).getTime();
      const rightTime = new Date(right.occurred_at ?? 0).getTime();
      return leftTime - rightTime;
    })
    .map(
      (event) => `
        <tr>
          <td>${escapeReportHtml(formatDate(event.occurred_at))}<br /><strong>${escapeReportHtml(formatStatus(event.event_type))}</strong><br />${escapeReportHtml(reportValue(event.actor))}</td>
          <td>${escapeReportHtml(formatStatus(event.from_status || "-"))} → ${escapeReportHtml(formatStatus(event.to_status || "-"))}</td>
          <td>${escapeReportHtml(event.message)}</td>
        </tr>
      `,
    )
    .join("");

  const sourceLimitations = (source?.limitations ?? [])
    .map((item) => `<li>${escapeReportHtml(item)}</li>`)
    .join("");

  const syntheticBanner = isSynthetic
    ? `
      <div class="synthetic-banner">
        DEVELOPMENT / SYNTHETIC INCIDENT — NOT FOR REGULATORY SUBMISSION
      </div>
    `
    : "";

  const profileBanner = !profileComplete
    ? `
      <div class="profile-banner">
        DRAFT — ORGANIZATION PROFILE INCOMPLETE. CONFIGURE UTILITY / ORGANIZATION
        AND SYSTEM / FACILITY BEFORE ISSUING A FINAL REPORT.
      </div>
    `
    : "";

  const summaryBody = `
    <section>
      <h2>Executive Incident Summary</h2>
      <div class="identity-strip">
        <div><span>Utility</span><strong>${escapeReportHtml(utilityName)}</strong></div>
        <div><span>System / Facility</span><strong>${escapeReportHtml(systemName)}</strong></div>
        <div><span>Prepared by</span><strong>${escapeReportHtml(preparedBy)}</strong></div>
        <div><span>Report No.</span><strong>${escapeReportHtml(humanReportNumber)}</strong></div>
      </div>
      <p class="lede" style="margin-top:16px">${escapeReportHtml(incident.description || "No incident description was recorded.")}</p>
      <div class="facts" style="margin-top:16px">
        ${reportCell("Status", formatStatus(status))}
        ${reportCell("Severity", formatStatus(incident.severity))}
        ${reportCell("Detected", formatDate(incident.detected_at))}
        ${reportCell("Closed", formatDate(workflow?.closed_at))}
        ${reportCell("Source asset", sourceAssetName)}
        ${reportCell("Asset type", sourceAssetType)}
        ${reportCell("Source node", incident.source_node_id)}
        ${reportCell("Assigned investigator", workflow?.assigned_to)}
      </div>
      ${workflow?.resolution_summary ? `<h3>Resolution</h3><div class="callout">${escapeReportHtml(workflow.resolution_summary)}</div>` : ""}
    </section>

    <section>
      <h2>Operational Outcome</h2>
      <div class="outcome-grid">
        <div class="outcome-card good">
          <span>Corrective actions</span>
          <strong>${completedActions} / ${actions.length || 0} completed</strong>
          <small>Current Generation ${currentGeneration}</small>
        </div>
        <div class="outcome-card ${currentFailed > 0 ? "bad" : "good"}">
          <span>Execution exceptions</span>
          <strong>${currentFailed} failed · ${currentBlocked} blocked</strong>
          <small>${currentExecuted} current executions recorded</small>
        </div>
        <div class="outcome-card">
          <span>Source asset</span>
          <strong>${escapeReportHtml(sourceAssetName)}</strong>
          <small>${escapeReportHtml(sourceAssetType)}</small>
        </div>
        <div class="outcome-card">
          <span>Probable upstream assets</span>
          <strong>${escapeReportHtml(upstreamNames || "None identified")}</strong>
          <small>${upstreamAssets.length} ranked candidate${upstreamAssets.length === 1 ? "" : "s"}</small>
        </div>
        <div class="outcome-card ${physicalControlIssued ? "bad" : "good"}">
          <span>Physical utility commands</span>
          <strong>${physicalControlIssued ? "Control command recorded" : "None issued by FalilaX"}</strong>
          <small>Operator-attestation boundary</small>
        </div>
        <div class="outcome-card ${hydraulicReady ? "good" : "warn"}">
          <span>Hydraulic model</span>
          <strong>${hydraulicReady ? "Verified ready" : "Not verified / not ready"}</strong>
          <small>${escapeReportHtml(formatStatus(hydraulicStatus))} evidence</small>
        </div>
      </div>
    </section>

    <section>
      <h2>Source Intelligence Snapshot</h2>
      ${source?.available ? `
        <div class="facts">
          ${reportCell("Target asset", sourceAssetName)}
          ${reportCell("Upstream relationships", source.topology?.upstream_relationship_count)}
          ${reportCell("Hydraulic evidence", source.hydraulic_evidence?.status)}
          ${reportCell("Hydraulic model ready", source.hydraulic_evidence?.hydraulic_model_ready ? "Yes" : "No")}
        </div>
        <p class="lede" style="margin-top:14px">${escapeReportHtml(source.summary || source.headline)}</p>
        ${summaryUpstreamRows ? `
          <h3>Probable upstream origin assets</h3>
          <table>
            <thead><tr><th>#</th><th>Asset</th><th>Type</th><th>Depth</th><th>Confidence</th></tr></thead>
            <tbody>${summaryUpstreamRows}</tbody>
          </table>
        ` : ""}
      ` : `<p class="lede">Source Intelligence was unavailable for this incident.</p>`}
    </section>

    <section>
      <h2>Response Record</h2>
      <div class="facts">
        ${reportCell("Current generation", currentGeneration)}
        ${reportCell("Actions completed", completedActions)}
        ${reportCell("Current executed", currentExecuted)}
        ${reportCell("Historical executed", execution?.historical?.executed_count ?? 0)}
        ${reportCell("Lifetime records", execution?.lifetime?.count ?? 0)}
        ${reportCell("Failed", execution?.lifetime?.failed_count ?? 0)}
        ${reportCell("Blocked", execution?.lifetime?.blocked_count ?? 0)}
        ${reportCell("Physical control issued", physicalControlIssued ? "YES" : "No")}
      </div>
      <div class="callout safety" style="margin-top:16px">
        ${escapeReportHtml(execution?.safety_note || "Operator attestation records non-physical operational work and does not issue physical utility-control commands.")}
      </div>
      ${summaryActionRows ? `
        <h3>Current-generation actions</h3>
        <table>
          <thead><tr><th>Action</th><th>Status</th><th>Risk</th><th>Mode</th></tr></thead>
          <tbody>${summaryActionRows}</tbody>
        </table>
      ` : ""}
    </section>

    <section>
      <h2>Key Workflow Milestones</h2>
      <div class="facts">
        ${reportCell("Acknowledged", formatDate(workflow?.acknowledged_at))}
        ${reportCell("Investigation started", formatDate(workflow?.investigation_started_at))}
        ${reportCell("Execution started", formatDate(workflow?.execution_started_at))}
        ${reportCell("Verification started", formatDate(workflow?.verification_started_at))}
        ${reportCell("Resolved", formatDate(workflow?.resolved_at))}
        ${reportCell("Closed", formatDate(workflow?.closed_at))}
        ${reportCell("Audit events", events.length)}
        ${reportCell("SLA breach", workflow?.has_sla_breach ? "Yes" : "No")}
      </div>
    </section>
  `;

  const detailedBody = `
    <section>
      <h2>Report Control</h2>
      <div class="facts">
        ${reportCell("Report number", humanReportNumber)}
        ${reportCell("Utility", utilityName)}
        ${reportCell("System / Facility", systemName)}
        ${reportCell("Prepared by", preparedBy)}
        ${reportCell("Generated", generatedAt.toLocaleString())}
        ${reportCell("Report version", "1.4")}
        ${reportCell("Current generation", currentGeneration)}
        ${reportCell("Audit events", events.length)}
      </div>
    </section>

    <section>
      <h2>Executive Incident Summary</h2>
      <p class="lede">${escapeReportHtml(incident.description || "No incident description was recorded.")}</p>
      <div class="facts" style="margin-top:16px">
        ${reportCell("Detected", formatDate(incident.detected_at))}
        ${reportCell("Last seen", formatDate(incident.last_seen_at))}
        ${reportCell("Affected assets", reportImpactCount(incident, incident.affected_asset_count))}
        ${reportCell("Affected subscribers", reportImpactCount(incident, incident.affected_subscriber_count))}
        ${reportCell("Source asset", sourceAssetName)}
        ${reportCell("Source asset type", sourceAssetType)}
        ${reportCell("Source node", incident.source_node_id)}
        ${reportCell("Assigned investigator", workflow?.assigned_to)}
        ${reportCell("Assigned team", workflow?.assigned_team)}
        ${reportCell("Source asset ID", incident.source_asset_id)}
      </div>
      ${workflow?.resolution_summary ? `<h3>Resolution</h3><div class="callout">${escapeReportHtml(workflow.resolution_summary)}</div>` : ""}
    </section>

    <section>
      <h2>Operational Outcome</h2>
      <div class="outcome-grid">
        <div class="outcome-card good"><span>Current plan</span><strong>${completedActions} / ${actions.length || 0} completed</strong><small>Generation ${currentGeneration}</small></div>
        <div class="outcome-card ${currentFailed > 0 || currentBlocked > 0 ? "bad" : "good"}"><span>Exceptions</span><strong>${currentFailed} failed · ${currentBlocked} blocked</strong><small>${currentExecuted} current executions</small></div>
        <div class="outcome-card"><span>Source asset</span><strong>${escapeReportHtml(sourceAssetName)}</strong><small>${escapeReportHtml(sourceAssetType)}</small></div>
        <div class="outcome-card ${hydraulicReady ? "good" : "warn"}"><span>Hydraulic readiness</span><strong>${hydraulicReady ? "Ready" : "Not verified / not ready"}</strong><small>${escapeReportHtml(formatStatus(hydraulicStatus))} evidence</small></div>
      </div>
    </section>

    <section>
      <h2>Source Intelligence</h2>
      ${source?.available ? `
        <div class="facts">
          ${reportCell("Assessment", source.assessment_type)}
          ${reportCell("Engine", source.engine_version)}
          ${reportCell("Target asset", sourceAssetName)}
          ${reportCell("Target asset type", sourceAssetType)}
          ${reportCell("Upstream relationships", source.topology?.upstream_relationship_count)}
          ${reportCell("Hydraulic evidence", source.hydraulic_evidence?.status)}
          ${reportCell("Hydraulic model ready", source.hydraulic_evidence?.hydraulic_model_ready ? "Yes" : "No")}
          ${reportCell("Generated", formatDate(source.generated_at))}
        </div>
        <h3>Assessment summary</h3>
        <p class="lede">${escapeReportHtml(source.summary || source.headline)}</p>
        ${upstreamRows ? `
          <h3>Probable upstream origin assets</h3>
          <table>
            <thead><tr><th>#</th><th>Asset</th><th>Type</th><th>Depth</th><th>Relationship</th><th>Score</th><th>Confidence</th></tr></thead>
            <tbody>${upstreamRows}</tbody>
          </table>
        ` : ""}
        ${sourceLimitations ? `<h3>Investigation limitations</h3><ul>${sourceLimitations}</ul>` : ""}
      ` : `<p class="lede">Source Intelligence was unavailable for this incident.</p>`}
    </section>

    <section>
      <h2>Operator Action Plan</h2>
      <div class="facts">
        ${reportCell("Current generation", currentGeneration)}
        ${reportCell("Current actions", actions.length)}
        ${reportCell("Approval gated", detail.action_plan?.requires_approval_count ?? 0)}
        ${reportCell("Pending approval", detail.action_plan?.pending_approval_count ?? 0)}
      </div>
      ${actionRows ? `
        <table style="margin-top:16px">
          <thead><tr><th>Action</th><th>Status</th><th>Risk</th><th>Mode</th><th>Approval</th><th>Role</th><th>Asset</th><th>Gen.</th></tr></thead>
          <tbody>${actionRows}</tbody>
        </table>
      ` : `<p class="lede" style="margin-top:14px">No current action plan is present.</p>`}
    </section>

    <section>
      <h2>Execution Evidence</h2>
      <div class="facts">
        ${reportCell("Current executed", currentExecuted)}
        ${reportCell("Historical executed", execution?.historical?.executed_count ?? 0)}
        ${reportCell("Lifetime records", execution?.lifetime?.count ?? 0)}
        ${reportCell("Lifetime successful", execution?.lifetime?.successful_count ?? 0)}
        ${reportCell("Failed", execution?.lifetime?.failed_count ?? 0)}
        ${reportCell("Blocked", execution?.lifetime?.blocked_count ?? 0)}
        ${reportCell("Generation counts", formatGenerationCounts(execution?.lifetime?.generation_counts))}
        ${reportCell("Physical control issued", physicalControlIssued ? "YES" : "No")}
      </div>
      <div class="callout safety" style="margin-top:16px">
        ${escapeReportHtml(execution?.safety_note || "Operator attestation records non-physical operational work and does not issue physical utility-control commands.")}
      </div>
      ${executionRows ? `
        <table style="margin-top:16px">
          <thead><tr><th style="width:32%">Execution record</th><th>Evidence / operator attestation</th></tr></thead>
          <tbody>${executionRows}</tbody>
        </table>
      ` : `<p class="lede" style="margin-top:14px">No execution evidence has been recorded.</p>`}
    </section>

    <section>
      <h2>Workflow & SLA Record</h2>
      <div class="facts">
        ${reportCell("Acknowledged", formatDate(workflow?.acknowledged_at))}
        ${reportCell("Investigation started", formatDate(workflow?.investigation_started_at))}
        ${reportCell("Execution started", formatDate(workflow?.execution_started_at))}
        ${reportCell("Verification started", formatDate(workflow?.verification_started_at))}
        ${reportCell("Resolved", formatDate(workflow?.resolved_at))}
        ${reportCell("Closed", formatDate(workflow?.closed_at))}
        ${reportCell("SLA breach", workflow?.has_sla_breach ? "Yes" : "No")}
        ${reportCell("Acknowledged by", workflow?.acknowledged_by)}
      </div>
    </section>

    <section>
      <h2>Investigation Findings</h2>
      ${noteRows ? `
        <table>
          <thead><tr><th>Time</th><th>Author</th><th>Finding</th></tr></thead>
          <tbody>${noteRows}</tbody>
        </table>
      ` : `<p class="lede">No investigation findings were recorded.</p>`}
    </section>

    <section>
      <h2>Persistent Audit Timeline</h2>
      ${eventRows ? `
        <table>
          <thead><tr><th style="width:28%">Time / event / actor</th><th style="width:20%">Transition</th><th>Message</th></tr></thead>
          <tbody>${eventRows}</tbody>
        </table>
      ` : `<p class="lede">No workflow events were returned.</p>`}
    </section>

    <section class="signoff-section">
      <h2>Review & Sign-Off</h2>
      <p class="lede">Use this section for internal operational review of the retained incident record.</p>
      <div class="sign-grid">
        <div class="signature-block">
          <strong>Operator / Investigator</strong>
          <div class="line"></div>
          <span>Name / signature</span>
          <div class="line"></div>
          <span>Date</span>
        </div>
        <div class="signature-block">
          <strong>Operations Supervisor</strong>
          <div class="line"></div>
          <span>Name / signature</span>
          <div class="line"></div>
          <span>Date</span>
        </div>
      </div>
      <div class="disposition">
        <strong>Report disposition:</strong>
        <span>☐ Accepted</span>
        <span>☐ Follow-up required</span>
        <span>☐ Reopened</span>
      </div>
    </section>

    <section>
      <h2>Technical Identifiers</h2>
      <p class="lede">Machine identifiers are retained here for traceability while the main report uses the shorter human-facing report number.</p>
      <div class="facts" style="margin-top:16px">
        ${reportCell("Report number", humanReportNumber)}
        ${reportCell("Machine report ID", machineReportId)}
        ${reportCell("Incident ID", incident.id)}
        ${reportCell("Workflow ID", workflow?.id)}
        ${reportCell("Source event ID", incident.source_event_id)}
        ${reportCell("Source asset ID", incident.source_asset_id)}
        ${reportCell("Source node ID", incident.source_node_id)}
        ${reportCell("Generated ISO", generatedIso)}
      </div>
    </section>
  `;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FalilaX ${escapeReportHtml(reportTitle)} - ${escapeReportHtml(humanReportNumber)}</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
        "Segoe UI", sans-serif;
      color: #172033;
      background: #eef2f6;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: #eef2f6; }
    .toolbar {
      position: sticky; top: 0; z-index: 5; display: flex; gap: 10px;
      justify-content: flex-end; padding: 12px 20px; background: #0b1118;
      border-bottom: 1px solid #25303d;
    }
    .toolbar button {
      border: 0; border-radius: 8px; padding: 10px 16px; font-weight: 700;
      cursor: pointer; background: #0e7490; color: white;
    }
    .report {
      width: min(1100px, calc(100% - 32px)); margin: 24px auto 60px;
      background: white; border: 1px solid #dbe2ea; box-shadow: 0 12px 35px rgba(15,23,42,.08);
    }
    .cover { padding: 34px 46px 32px; border-bottom: 5px solid #0891b2; }
    .brand-lockup { display: flex; align-items: center; gap: 15px; }
    .brand-logo { width: 58px; height: 58px; object-fit: contain; }
    .brand { font-size: 13px; font-weight: 800; letter-spacing: .18em; color: #0e7490; }
    .report-kind { margin-top: 3px; color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: .12em; }
    .utility-cover { margin-top: 11px; color: #334155; font-size: 12px; font-weight: 650; }
    h1 { margin: 18px 0 6px; font-size: 34px; line-height: 1.08; }
    .subtitle { color: #526173; font-size: 16px; }
    .report-number { margin-top: 8px; color: #0e7490; font-size: 12px; font-weight: 800; letter-spacing: .04em; }
    .report-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
    .pill { border: 1px solid #cbd5e1; border-radius: 999px; padding: 5px 10px; font-size: 12px; font-weight: 700; }
    .pill.final { color: #166534; border-color: #86efac; background: #f0fdf4; }
    .pill.draft { color: #92400e; border-color: #f59e0b; background: #fffbeb; }
    .pill.preliminary { color: #92400e; border-color: #fcd34d; background: #fffbeb; }
    .pill.synthetic { color: #991b1b; border-color: #fca5a5; background: #fef2f2; }
    .synthetic-banner {
      padding: 12px 46px; background: #991b1b; color: white; text-align: center;
      font-size: 12px; font-weight: 900; letter-spacing: .08em;
    }
    .profile-banner {
      padding: 12px 46px; background: #fef3c7; color: #92400e; text-align: center;
      border-bottom: 1px solid #f59e0b;
      font-size: 11px; font-weight: 850; letter-spacing: .055em;
    }
    section { padding: 26px 46px; border-bottom: 1px solid #e5eaf0; break-inside: avoid-page; }
    h2 { margin: 0 0 15px; font-size: 20px; color: #0f172a; }
    h3 { margin: 18px 0 10px; font-size: 15px; color: #334155; }
    .lede { margin: 0; color: #475569; line-height: 1.65; }
    .facts { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; }
    .fact { border: 1px solid #e2e8f0; border-radius: 9px; padding: 11px 12px; background: #fafcff; }
    .fact-label { color: #64748b; text-transform: uppercase; font-size: 9px; letter-spacing: .08em; }
    .fact-value { margin-top: 4px; color: #0f172a; font-size: 13px; font-weight: 650; overflow-wrap: anywhere; }
    .identity-strip { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; }
    .identity-strip > div { border-top: 3px solid #0891b2; background: #f8fafc; padding: 11px 12px; }
    .identity-strip span { display: block; color: #64748b; text-transform: uppercase; font-size: 9px; letter-spacing: .08em; }
    .identity-strip strong { display: block; margin-top: 4px; font-size: 12px; color: #0f172a; overflow-wrap: anywhere; }
    .outcome-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; }
    .outcome-card { border: 1px solid #dbe2ea; border-radius: 10px; padding: 14px; background: #f8fafc; }
    .outcome-card.good { border-color: #86efac; background: #f0fdf4; }
    .outcome-card.warn { border-color: #fcd34d; background: #fffbeb; }
    .outcome-card.bad { border-color: #fca5a5; background: #fef2f2; }
    .outcome-card span { display:block; color:#64748b; text-transform:uppercase; font-size:9px; letter-spacing:.08em; }
    .outcome-card strong { display:block; margin-top:5px; color:#0f172a; font-size:15px; line-height:1.3; }
    .outcome-card small { display:block; margin-top:5px; color:#64748b; line-height:1.35; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #f1f5f9; color: #334155; text-align: left; padding: 8px; border: 1px solid #dbe2ea; }
    td { vertical-align: top; padding: 8px; border: 1px solid #dbe2ea; color: #475569; overflow-wrap: anywhere; }
    ul { margin: 8px 0 0 18px; padding: 0; color: #475569; line-height: 1.55; }
    .callout { border-left: 4px solid #0891b2; background: #ecfeff; padding: 13px 15px; color: #164e63; }
    .safety { border-left-color: ${physicalControlIssued ? "#dc2626" : "#16a34a"}; background: ${physicalControlIssued ? "#fef2f2" : "#f0fdf4"}; color: ${physicalControlIssued ? "#991b1b" : "#166534"}; }
    .sign-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:28px; margin-top:20px; }
    .signature-block { border:1px solid #dbe2ea; border-radius:10px; padding:16px; min-height:150px; }
    .signature-block strong { color:#0f172a; }
    .signature-block .line { border-bottom:1px solid #94a3b8; margin-top:34px; }
    .signature-block span { display:block; margin-top:5px; color:#64748b; font-size:10px; }
    .disposition { margin-top:18px; display:flex; flex-wrap:wrap; gap:18px; color:#334155; font-size:12px; }
    .footer { padding: 22px 46px 32px; color: #64748b; font-size: 10px; line-height: 1.6; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    @media (max-width: 800px) {
      .facts, .identity-strip, .outcome-grid, .sign-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
      section, .cover, .footer, .synthetic-banner, .profile-banner { padding-left: 22px; padding-right: 22px; }
    }
    @media print {
      @page { size: letter portrait; margin: 0.45in; }
      body { background: white; }
      .toolbar { display: none !important; }
      .report { width: 100%; margin: 0; border: 0; box-shadow: none; }
      .cover { padding-top: 8px; }
      section { break-inside: auto; padding: 16px 12px; }
      .cover, .footer { padding-left: 12px; padding-right: 12px; }
      .footer { break-inside: avoid; padding-top: 12px; padding-bottom: 8px; }
      .fact, .identity-strip > div, .callout { break-inside: avoid; }
      h2, h3 { break-after: avoid; }
      td { overflow-wrap: break-word; }
      .facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .outcome-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .outcome-card, .signature-block { break-inside: avoid; }
      table { break-inside: auto; }
      tr { break-inside: avoid; }
      thead { display: table-header-group; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">Print / Save PDF</button>
  </div>
  <main class="report">
    <div class="cover">
      <div class="brand-lockup">
        <img class="brand-logo" src="${escapeReportHtml(logoUrl)}" alt="FalilaX logo" />
        <div>
          <div class="brand">FALILAX OPERATIONAL INTELLIGENCE</div>
          <div class="report-kind">${reportTypeLabel} OPERATIONAL RECORD</div>
        </div>
      </div>
      <div class="utility-cover">${escapeReportHtml(utilityName)} · ${escapeReportHtml(systemName)}</div>
      <h1>${escapeReportHtml(reportTitle)}</h1>
      <div class="subtitle">${escapeReportHtml(incident.title)}</div>
      <div class="report-number">${escapeReportHtml(humanReportNumber)}</div>
      <div class="report-meta">
        <span class="pill ${reportStage.toLowerCase()}">${reportStage}</span>
        <span class="pill">${reportTypeLabel}</span>
        <span class="pill">${escapeReportHtml(formatStatus(status))}</span>
        <span class="pill">${escapeReportHtml(formatStatus(incident.severity))}</span>
        <span class="pill">Generation ${currentGeneration}</span>
        ${isSynthetic ? `<span class="pill synthetic">SYNTHETIC / DEVELOPMENT</span>` : ""}
      </div>
    </div>

    ${syntheticBanner}
    ${profileBanner}
    ${isSummary ? summaryBody : detailedBody}

    <div class="footer">
      <strong>Evidence package:</strong> This ${isSummary ? "summary" : "detailed"} report was generated from the live persisted FalilaX incident record at
      <span class="mono">${escapeReportHtml(generatedIso)}</span>. It is an operational record, not a laboratory certificate,
      regulatory filing, or proof that physical control commands were issued. Preserve the accompanying FalilaX JSON evidence
      package when a machine-readable audit copy is required.<br />
      <strong>Evidence snapshot:</strong> <span class="mono">${escapeReportHtml(evidenceSnapshotId)}</span><br />
      <strong>Report No.:</strong> <span class="mono">${escapeReportHtml(humanReportNumber)}</span>
      <br /><strong>Record stage:</strong> ${escapeReportHtml(reportStage)}
      ${!profileComplete ? `<br /><strong>Finalization requirement:</strong> Utility / Organization and System / Facility must be configured before this record can be issued as FINAL.` : ""}
      ${isSynthetic ? `<br /><strong>Classification:</strong> DEVELOPMENT / SYNTHETIC INCIDENT — NOT FOR REGULATORY SUBMISSION` : ""}
    </div>
  </main>
</body>
</html>`;
};

const writeIncidentReportWindow = (
  reportWindow: Window,
  content: string,
): void => {
  reportWindow.opener = null;
  reportWindow.document.open();
  reportWindow.document.write(content);
  reportWindow.document.close();
  reportWindow.focus();
};

const openIncidentReportContent = (content: string): boolean => {
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) return false;
  writeIncidentReportWindow(reportWindow, content);
  return true;
};

const buildIncidentEvidenceJsonPayload = (
  detail: IncidentDetailResponse,
  profile: IncidentReportProfile,
  syntheticOverride = false,
  generatedAtDate = new Date(),
  evidenceSnapshotId = "Not available",
) => {
  const generatedAt = generatedAtDate.toISOString();
  const humanReportNumber = buildHumanReportNumber(detail, generatedAtDate);
  const machineReportId = buildMachineReportId(detail, generatedAtDate);
  const isSynthetic = syntheticOverride || detectSyntheticIncident(detail);

  return {
    schema: "falilax.incident_evidence.v1",
    report_version: "1.4",
    report_number: humanReportNumber,
    machine_report_id: machineReportId,
    evidence_snapshot_id: evidenceSnapshotId,
    generated_at: generatedAt,
    report_stage: reportStageFor(detail, profile),
    organization_profile_complete: Boolean(
      profile.utilityName.trim() && profile.systemName.trim(),
    ),
    classification: isSynthetic
      ? "development_synthetic_not_for_regulatory_submission"
      : "operational",
    report_profile: {
      utility_name: profile.utilityName.trim() || null,
      system_or_facility: profile.systemName.trim() || null,
      prepared_by: detail.workflow?.acknowledged_by || DEFAULT_OPERATOR,
    },
    incident: detail.incident,
    workflow: detail.workflow,
    source_intelligence: detail.source_intelligence,
    action_plan: detail.action_plan,
    actions: detail.actions,
    execution_summary: detail.execution_summary,
    executions: detail.executions,
    investigation_findings: detail.notes,
    audit_timeline: detail.events,
  };
};

const downloadIncidentEvidenceJsonContent = (
  content: string,
  reportNumber: string,
): void => {
  if (!content || content.trim().length === 0) {
    throw new Error(
      "FalilaX could not download the Evidence JSON because the generated artifact was empty.",
    );
  }

  const blob = new Blob([content], {
    type: "application/json;charset=utf-8",
  });

  if (blob.size === 0) {
    throw new Error(
      "FalilaX generated a zero-byte Evidence JSON Blob. Download was cancelled.",
    );
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `FalilaX-${reportNumber}-Evidence.json`;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();

  /*
   * Do not revoke the Blob URL synchronously.
   *
   * Chromium/Edge may not have consumed the object URL when anchor.click()
   * returns. Revoking it immediately can result in a correctly named but
   * zero-byte downloaded file.
   */
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 2000);
};

const severityClasses = (severity: IncidentSeverity) => {
  const normalized = String(severity).toLowerCase();

  if (normalized === "critical") {
    return "border-red-700/70 bg-red-950/40 text-red-200";
  }

  if (normalized === "high") {
    return "border-orange-700/70 bg-orange-950/30 text-orange-200";
  }

  if (normalized === "medium") {
    return "border-amber-700/70 bg-amber-950/30 text-amber-200";
  }

  if (normalized === "low") {
    return "border-sky-700/70 bg-sky-950/30 text-sky-200";
  }

  return "border-zinc-700 bg-zinc-900 text-zinc-300";
};

const statusClasses = (status: IncidentStatus) => {
  const normalized = String(status).toLowerCase();

  if (normalized === "closed" || normalized === "resolved") {
    return "border-green-800 bg-green-950/30 text-green-300";
  }

  if (normalized === "cancelled" || normalized === "suppressed") {
    return "border-zinc-700 bg-zinc-900 text-zinc-400";
  }

  if (normalized === "verifying") {
    return "border-cyan-800 bg-cyan-950/30 text-cyan-300";
  }

  if (
    normalized === "investigating" ||
    normalized === "action_plan_ready" ||
    normalized === "awaiting_approval" ||
    normalized === "executing" ||
    normalized === "action_required"
  ) {
    return "border-amber-800 bg-amber-950/30 text-amber-300";
  }

  if (normalized === "acknowledged") {
    return "border-blue-800 bg-blue-950/30 text-blue-300";
  }

  if (normalized === "reopened") {
    return "border-orange-800 bg-orange-950/30 text-orange-300";
  }

  return "border-red-800 bg-red-950/30 text-red-300";
};

const actionStatusClasses = (status: string) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "approved" || normalized === "completed") {
    return "border-green-800 bg-green-950/30 text-green-300";
  }

  if (normalized === "pending_approval" || normalized === "proposed") {
    return "border-amber-800 bg-amber-950/30 text-amber-300";
  }

  if (normalized === "queued" || normalized === "in_progress") {
    return "border-cyan-800 bg-cyan-950/30 text-cyan-300";
  }

  if (
    normalized === "rejected" ||
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "expired"
  ) {
    return "border-red-800 bg-red-950/30 text-red-300";
  }

  return "border-zinc-700 bg-zinc-900 text-zinc-300";
};

const executionOutcomeClasses = (outcome: string) => {
  const normalized = String(outcome || "").toLowerCase();

  if (normalized === "executed") {
    return "border-green-800 bg-green-950/30 text-green-300";
  }

  if (normalized === "blocked") {
    return "border-amber-800 bg-amber-950/30 text-amber-300";
  }

  if (normalized === "failed" || normalized === "rejected") {
    return "border-red-800 bg-red-950/30 text-red-300";
  }

  if (normalized === "skipped") {
    return "border-zinc-700 bg-zinc-900 text-zinc-400";
  }

  return "border-cyan-800 bg-cyan-950/30 text-cyan-300";
};

function actionExpired(action: IncidentAction, now: number): boolean {
  const status = normalizeWorkflowStatus(action.status);
  if (status === "expired") return true;
  if (!["proposed", "pending_approval", "approved", "queued", "in_progress"].includes(status)) return false;
  return Boolean(action.expires_at && Date.parse(action.expires_at) <= now);
}

export function IncidentInvestigation() {
  const [expiryClock, setExpiryClock] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setExpiryClock(Date.now());
    const timer = window.setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, []);
  const { t, labelText, locale, dateText, numberText } = useOperationalText();
  const confidenceText = (value: number | null | undefined) => typeof value === "number" && Number.isFinite(value)
    ? `${numberText(Math.round(value * 100), 2)}%` : t("Not available");
  const generationText = (counts: Record<string, number> | null | undefined) => {
    const entries = Object.entries(counts ?? {}).sort(([a], [b]) => Number(a) - Number(b));
    return entries.length ? entries.map(([generation, count]) => `${t("Generation")} ${generation}: ${numberText(count, 0)}`).join(" · ") : t("None");
  };
  const navigate = useNavigate();
  const { incidentId: routeIncidentId } = useParams<{
    incidentId?: string;
  }>();

  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    routeIncidentId?.trim() || null,
  );
  const [detail, setDetail] = useState<IncidentDetailResponse | null>(null);

  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [mutating, setMutating] = useState<MutationName | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("active");
  const [search, setSearch] = useState("");

  const [operatorName, setOperatorName] = useState(DEFAULT_OPERATOR);
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedTeam, setAssignedTeam] = useState("");
  const [noteText, setNoteText] = useState("");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [completionActionId, setCompletionActionId] = useState<string | null>(
    null,
  );
  const [completionNotes, setCompletionNotes] = useState<
    Record<string, string>
  >({});
  const [attestingActionId, setAttestingActionId] = useState<string | null>(
    null,
  );
  const [reportProfile, setReportProfile] = useState<IncidentReportProfile>(
    () => loadIncidentReportProfile(),
  );
  const [reportSyntheticOverride, setReportSyntheticOverride] = useState(false);
  const [reportHistory, setReportHistory] = useState<PersistedIncidentReport[]>([]);
  const [reportRegistrySummary, setReportRegistrySummary] =
    useState<ReportRegistrySummary | null>(null);
  const [loadingReportHistory, setLoadingReportHistory] = useState(false);
  const [reportMutation, setReportMutation] = useState<PersistedReportType | null>(
    null,
  );
  const [reportRegistryMessage, setReportRegistryMessage] = useState<string | null>(
    null,
  );
  const [reportRegistryError, setReportRegistryError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    saveIncidentReportProfile(reportProfile);
  }, [reportProfile]);

  useEffect(() => {
    setReportSyntheticOverride(false);
    setReportRegistryMessage(null);
    setReportRegistryError(null);
  }, [selectedIncidentId]);

  const apiFetch = useCallback(
    async <T,>(path: string, options?: RequestInit): Promise<T> => {
      const response = await authenticatedFetch(`${API_BASE_URL}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        let message = `Request failed (${response.status})`;

        try {
          const body = await response.json();
          message =
            typeof body?.detail === "string"
              ? body.detail
              : JSON.stringify(body?.detail ?? body);
        } catch {
          const text = await response.text();
          if (text) message = text;
        }

        throw new Error(message);
      }

      return (await response.json()) as T;
    },
    [],
  );

  const loadIncidents = useCallback(async () => {
    setLoadingList(true);
    setError(null);

    try {
      const result = await apiFetch<IncidentListResponse>(
        "/api/v1/incidents?limit=200",
      );

      setIncidents(result.items ?? []);

      setSelectedIncidentId((current) => {
        const requestedIncidentId = routeIncidentId?.trim();

        if (requestedIncidentId) {
          return requestedIncidentId;
        }

        if (
          current &&
          result.items.some((incident) => incident.id === current)
        ) {
          return current;
        }

        return result.items[0]?.id ?? null;
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load incidents.",
      );
    } finally {
      setLoadingList(false);
    }
  }, [apiFetch, routeIncidentId]);

  const loadDetail = useCallback(
    async (incidentId: string) => {
      setLoadingDetail(true);
      setError(null);

      try {
        const result = await apiFetch<IncidentDetailResponse>(
          `/api/v1/incidents/${encodeURIComponent(incidentId)}`,
        );

        setDetail(result);
        setAssignedTo(result.workflow?.assigned_to ?? "");
        setAssignedTeam(result.workflow?.assigned_team ?? "");
        setResolutionSummary(result.workflow?.resolution_summary ?? "");
        setCompletionActionId(null);
        setCompletionNotes({});
        setAttestingActionId(null);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load incident details.",
        );
      } finally {
        setLoadingDetail(false);
      }
    },
    [apiFetch],
  );

  const loadReportHistory = useCallback(
    async (incidentId: string) => {
      setLoadingReportHistory(true);

      try {
        const result = await apiFetch<IncidentReportRegistryResponse>(
          `/api/v1/incidents/${encodeURIComponent(incidentId)}/reports`,
        );

        setReportHistory(result.reports ?? []);
        setReportRegistrySummary(result.report_registry ?? null);

        const resolvedUtilityName = String(
          result.report_profile?.utility_name ?? "",
        ).trim();

        const resolvedSystemName = String(
          result.report_profile?.system_name ?? "",
        ).trim();

        if (resolvedUtilityName || resolvedSystemName) {
          setReportProfile((current) => ({
            utilityName: resolvedUtilityName || current.utilityName,
            systemName: resolvedSystemName || current.systemName,
          }));
        }

        setReportRegistryError(null);
      } catch (historyError) {
        setReportHistory([]);
        setReportRegistrySummary(null);
        setReportRegistryError(
          historyError instanceof Error
            ? historyError.message
            : "Unable to load persisted report history.",
        );
      } finally {
        setLoadingReportHistory(false);
      }
    },
    [apiFetch],
  );

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  useEffect(() => {
    if (!selectedIncidentId) {
      setDetail(null);
      setReportHistory([]);
      setReportRegistrySummary(null);
      return;
    }

    loadDetail(selectedIncidentId);
    loadReportHistory(selectedIncidentId);
  }, [selectedIncidentId, loadDetail, loadReportHistory]);

  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return incidents.filter((incident) => {
      const status = normalizeWorkflowStatus(incident.status);
      const severity = String(incident.severity).toLowerCase();

      if (statusFilter === "active" && terminalStatuses.has(status)) {
        return false;
      }

      if (statusFilter === "critical" && severity !== "critical") {
        return false;
      }

      if (
        statusFilter !== "all" &&
        statusFilter !== "active" &&
        statusFilter !== "critical" &&
        status !== statusFilter
      ) {
        return false;
      }

      if (!query) return true;

      return [
        incident.id,
        incident.title,
        incident.description,
        incident.event_type,
        incident.assigned_to,
        incident.assigned_team,
        incident.source_node_id,
      ]
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [incidents, search, statusFilter]);

  const selectedQueueIncident = useMemo(
    () =>
      incidents.find((incident) => incident.id === selectedIncidentId) ?? null,
    [incidents, selectedIncidentId],
  );

  const selectedOutsideFilter = useMemo(() => {
    if (!selectedQueueIncident || search.trim()) return null;

    const alreadyVisible = filteredIncidents.some(
      (incident) => incident.id === selectedQueueIncident.id,
    );

    return alreadyVisible ? null : selectedQueueIncident;
  }, [filteredIncidents, search, selectedQueueIncident]);

  const queueIncidents = useMemo(
    () =>
      selectedOutsideFilter
        ? [selectedOutsideFilter, ...filteredIncidents]
        : filteredIncidents,
    [filteredIncidents, selectedOutsideFilter],
  );

  const selected = detail?.incident ?? null;
  const workflow = detail?.workflow ?? null;
  const sourceIntelligence = detail?.source_intelligence ?? null;
  const probableOriginAssets =
    sourceIntelligence?.probable_origin_assets ??
    sourceIntelligence?.topology?.probable_origin_assets ??
    [];
  const hydraulicEvidence = sourceIntelligence?.hydraulic_evidence ?? null;
  const incidentActions = (detail?.actions ?? []).map(action =>
    actionExpired(action, expiryClock) ? { ...action, status: "expired" } : action,
  );
  const expiredActionCount = incidentActions.filter(action => action.status === "expired").length;
  const planExpired = expiredActionCount > 0;
  const actionPlan = detail?.action_plan ? {
    ...detail.action_plan,
    approved_count: incidentActions.filter(action => action.status === "approved").length,
    pending_approval_count: incidentActions.filter(action => ["proposed", "pending_approval"].includes(action.status)).length,
    ready_for_execution: !planExpired && detail.action_plan.ready_for_execution,
  } : null;
  const executionSummary = detail?.execution_summary ?? null;
  const executionRecords = detail?.executions ?? [];
  const currentGenerationSummary =
    executionSummary?.current_generation ?? null;
  const historicalExecutionSummary =
    executionSummary?.historical ?? null;
  const lifetimeExecutionSummary =
    executionSummary?.lifetime ?? null;
  const currentPlanGeneration =
    executionSummary?.plan_generation ??
    workflow?.action_plan_generation ??
    1;
  const currentGenerationExecutions = executionRecords.filter(
    (execution) => execution.plan_generation === currentPlanGeneration,
  );
  const historicalExecutionGroups = useMemo(() => {
    const grouped = new Map<number, IncidentExecution[]>();

    for (const execution of executionRecords) {
      if (execution.plan_generation >= currentPlanGeneration) continue;

      const existing = grouped.get(execution.plan_generation) ?? [];
      existing.push(execution);
      grouped.set(execution.plan_generation, existing);
    }

    return [...grouped.entries()]
      .sort(([left], [right]) => right - left)
      .map(([generation, executions]) => ({
        generation,
        executions: [...executions].sort((left, right) => {
          const leftTime = new Date(
            left.finished_at ?? left.started_at ?? 0,
          ).getTime();
          const rightTime = new Date(
            right.finished_at ?? right.started_at ?? 0,
          ).getTime();

          return rightTime - leftTime;
        }),
      }));
  }, [executionRecords, currentPlanGeneration]);

  const hasActionPlan = (actionPlan?.count ?? 0) > 0;
  const completedActionCount = incidentActions.filter(
    (action) => normalizeWorkflowStatus(action.status) === "completed",
  ).length;
  const currentPlanCompleted =
    hasActionPlan &&
    incidentActions.length > 0 &&
    completedActionCount === incidentActions.length;
  const actionPlanGateLabel = planExpired ? "Plan expired" : currentPlanCompleted
    ? "Execution complete"
    : (actionPlan?.pending_approval_count ?? 0) > 0
      ? "Approval required"
      : actionPlan?.ready_for_execution
        ? "Ready for execution"
        : "Plan active";

  const currentStatus = normalizeWorkflowStatus(
    workflow?.status ?? selected?.status ?? "",
  );
  const reportSyntheticDetected = detail
    ? detectSyntheticIncident(detail)
    : false;
  const reportProfileComplete =
    reportProfile.utilityName.trim().length > 0 &&
    reportProfile.systemName.trim().length > 0;
  const reportWillBeFinal =
    currentStatus === "closed" && reportProfileComplete;
  const reportUiStage =
    currentStatus === "closed"
      ? reportProfileComplete
        ? "Final"
        : "Draft"
      : "Preliminary";

  const visitedWorkflowStatuses = useMemo(() => {
    const visited = new Set<string>();

    // Every persisted incident begins in OPEN.
    if (detail || selectedIncidentId) {
      visited.add("open");
    }

    for (const event of detail?.events ?? []) {
      const fromStatus = normalizeWorkflowStatus(event.from_status);
      const toStatus = normalizeWorkflowStatus(event.to_status);

      if (STATUS_ORDER.includes(fromStatus)) {
        visited.add(fromStatus);
      }

      if (STATUS_ORDER.includes(toStatus)) {
        visited.add(toStatus);
      }
    }

    // Timestamp fallbacks protect the UI if an older audit event is sparse.
    if (workflow?.acknowledged_at) {
      visited.add("acknowledged");
    }

    if (workflow?.investigation_started_at) {
      visited.add("investigating");
    }

    if (workflow?.execution_started_at) {
      visited.add("executing");
    }

    if (workflow?.verification_started_at) {
      visited.add("verifying");
    }

    if (workflow?.resolved_at) {
      visited.add("resolved");
    }

    if (workflow?.closed_at) {
      visited.add("closed");
    }

    if (STATUS_ORDER.includes(currentStatus)) {
      visited.add(currentStatus);
    }

    return visited;
  }, [detail, selectedIncidentId, workflow, currentStatus]);

  const furthestVisitedWorkflowIndex = useMemo(() => {
    let furthest = -1;

    STATUS_ORDER.forEach((step, index) => {
      if (visitedWorkflowStatuses.has(step)) {
        furthest = Math.max(furthest, index);
      }
    });

    return furthest;
  }, [visitedWorkflowStatuses]);

  const canAcknowledge =
    currentStatus === "open" || currentStatus === "reopened";
  const canInvestigate =
    currentStatus === "acknowledged" || currentStatus === "reopened";
  const canCreateActionPlan =
    currentStatus === "investigating" && !hasActionPlan;
  const canRefreshExpiredPlan = planExpired && ["awaiting_approval", "action_plan_ready"].includes(currentStatus);
  const canApproveActionPlan =
    !planExpired &&
    currentStatus === "awaiting_approval" &&
    (actionPlan?.pending_approval_count ?? 0) > 0;
  const canStartActionExecution =
    !planExpired &&
    currentStatus === "action_plan_ready" &&
    hasActionPlan &&
    Boolean(actionPlan?.ready_for_execution);
  const canVerify =
    currentStatus === "investigating" ||
    (currentStatus === "executing" &&
      (!hasActionPlan || currentPlanCompleted));
  const canResolve = currentStatus === "verifying";
  const canClose = currentStatus === "resolved";
  const canReopen = ["resolved", "closed", "cancelled"].includes(
    currentStatus,
  );
  const canCancel = !["closed", "cancelled"].includes(currentStatus);
  const terminalOperatorControls = ["closed", "cancelled"].includes(
    currentStatus,
  );

  const scrollToLifecycleControls = () => {
    document.getElementById("resolution-lifecycle")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const performMutation = async (
    mutation: MutationName,
    body: Record<string, unknown>,
  ) => {
    if (!selectedIncidentId) return;

    setMutating(mutation);
    setError(null);

    try {
      const updated = await apiFetch<IncidentDetailResponse>(
        `/api/v1/incidents/${encodeURIComponent(selectedIncidentId)}/${mutation}`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );

      setDetail(updated);
      setAssignedTo(updated.workflow?.assigned_to ?? "");
      setAssignedTeam(updated.workflow?.assigned_team ?? "");

      if (mutation === "notes") setNoteText("");
      if (mutation === "resolve") {
        setResolutionSummary(
          updated.workflow?.resolution_summary ?? "",
        );
      }

      if (mutation === "reopen") {
        // Reopen starts a fresh investigation cycle. Use the backend response
        // as the authority so a prior generation's resolution text cannot
        // leak into the new cycle in the UI.
        setResolutionSummary(
          updated.workflow?.resolution_summary ?? "",
        );
        setReasonText("");
      }

      if (mutation === "cancel") {
        setReasonText("");
      }

      await loadIncidents();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Workflow operation failed.",
      );
    } finally {
      setMutating(null);
    }
  };

  const attestActionCompletion = async (action: IncidentAction) => {
    if (!selectedIncidentId) return;

    const note = (completionNotes[action.id] ?? "").trim();

    if (!note) {
      setError("A completion note is required before recording execution.");
      return;
    }

    if (
      currentStatus !== "executing" ||
      action.plan_generation !== currentPlanGeneration ||
      action.superseded ||
      actionExpired(action, Date.now()) ||
      normalizeWorkflowStatus(action.status) !== "approved"
    ) {
      setError(
        "Only an approved action from the current executing plan can be completed.",
      );
      return;
    }

    setAttestingActionId(action.id);
    setError(null);

    try {
      const updated = await apiFetch<IncidentDetailResponse>(
        `/api/v1/incidents/${encodeURIComponent(
          selectedIncidentId,
        )}/actions/${encodeURIComponent(action.id)}/attest`,
        {
          method: "POST",
          body: JSON.stringify({
            actor: operatorName.trim() || DEFAULT_OPERATOR,
            message: note,
            evidence: {
              source: "incident_investigation_ui",
              evidence_type: "operator_completion_attestation",
              plan_generation: action.plan_generation,
              action_type: action.action_type,
              execution_mode: action.execution_mode,
            },
          }),
        },
      );

      setDetail(updated);
      setCompletionNotes((current) => {
        const next = { ...current };
        delete next[action.id];
        return next;
      });
      setCompletionActionId((current) =>
        current === action.id ? null : current,
      );

      await loadIncidents();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to record action completion.",
      );
    } finally {
      setAttestingActionId(null);
    }
  };


  const openPersistedReport = async (report: PersistedIncidentReport) => {
    if (!selectedIncidentId) return;

    setReportRegistryError(null);
    setReportRegistryMessage(null);

    const isJson = String(report.content_type).toLowerCase().includes("json");
    const reportWindow = isJson ? null : window.open("", "_blank");

    if (!isJson && !reportWindow) {
      setReportRegistryError(
        "The retained report window was blocked by the browser. Allow pop-ups for FalilaX and try again.",
      );
      return;
    }

    try {
      const result = await apiFetch<IncidentReportRecordResponse>(
        `/api/v1/incidents/${encodeURIComponent(
          selectedIncidentId,
        )}/reports/${encodeURIComponent(report.id)}`,
      );
      const content = String(result.report.content ?? "");

      if (!content) {
        throw new Error("The retained report does not contain an artifact payload.");
      }

      if (isJson) {
        downloadIncidentEvidenceJsonContent(content, result.report.report_number);
      } else if (reportWindow) {
        writeIncidentReportWindow(reportWindow, content);
      }

      setReportRegistryMessage(
        `Opened retained ${formatStatus(result.report.report_type)} revision ${result.report.report_revision}.`,
      );
    } catch (openError) {
      reportWindow?.close();
      setReportRegistryError(
        openError instanceof Error
          ? openError.message
          : "Unable to open the retained report.",
      );
    }
  };

  const persistHtmlReport = async (variant: IncidentReportVariant) => {
    if (!detail || !selectedIncidentId) return;

    const reportType: PersistedReportType = variant;
    const reportWindow = window.open("", "_blank");

    if (!reportWindow) {
      setReportRegistryError(
        "The incident report window was blocked by the browser. Allow pop-ups for FalilaX and try again.",
      );
      return;
    }

    setReportMutation(reportType);
    setReportRegistryError(null);
    setReportRegistryMessage(null);

    try {
      const snapshot = buildReportEvidenceSnapshot(
        detail,
        reportProfile,
        reportSyntheticOverride,
      );
      const fingerprint = await reportEvidenceFingerprint(snapshot);
      const generatedAt = new Date();
      const reportNumber = buildHumanReportNumber(detail, generatedAt);
      const expectedReportStage = reportStageFor(detail, reportProfile);
      const expectedUtilityName = reportProfile.utilityName.trim();
      const expectedSystemName = reportProfile.systemName.trim();
      const expectedSynthetic =
        reportSyntheticOverride || detectSyntheticIncident(detail);
      const existing = reportHistory.find(
        (report) =>
          !report.is_superseded &&
          report.report_number === reportNumber &&
          report.plan_generation === currentPlanGeneration &&
          report.report_type === reportType &&
          String(report.report_stage ?? "").toLowerCase() ===
            expectedReportStage &&
          String(report.utility_name ?? "").trim() === expectedUtilityName &&
          String(report.system_name ?? "").trim() === expectedSystemName &&
          Boolean(report.synthetic) === expectedSynthetic &&
          String(report.content_type ?? "").toLowerCase().includes("html") &&
          String(report.metadata?.browser_report_version ?? "") === "1.4" &&
          String(report.metadata?.evidence_fingerprint ?? "") === fingerprint,
      );

      if (existing) {
        const retained = await apiFetch<IncidentReportRecordResponse>(
          `/api/v1/incidents/${encodeURIComponent(
            selectedIncidentId,
          )}/reports/${encodeURIComponent(existing.id)}`,
        );
        const retainedContent = String(retained.report.content ?? "");
        if (!retainedContent) {
          throw new Error("The retained report does not contain an artifact payload.");
        }
        writeIncidentReportWindow(reportWindow, retainedContent);
        setReportRegistryMessage(
          `No evidence change detected. Opened retained ${formatStatus(reportType)} revision ${existing.report_revision}.`,
        );
        return;
      }

      const content = buildIncidentEvidenceReportHtml(
        detail,
        variant,
        reportProfile,
        reportSyntheticOverride,
        generatedAt,
        `FX-SNAPSHOT-SHA256-${fingerprint}`,
      );

      const persisted = await apiFetch<PersistIncidentReportResponse>(
        `/api/v1/incidents/${encodeURIComponent(selectedIncidentId)}/reports`,
        {
          method: "POST",
          body: JSON.stringify({
            report_number: reportNumber,
            report_type: reportType,
            report_stage: reportStageFor(detail, reportProfile),
            plan_generation: currentPlanGeneration,
            generated_by: operatorName.trim() || DEFAULT_OPERATOR,
            utility_name: reportProfile.utilityName.trim() || null,
            system_name: reportProfile.systemName.trim() || null,
            synthetic:
              reportSyntheticOverride || detectSyntheticIncident(detail),
            content_type: "text/html;charset=utf-8",
            content_text: content,
            evidence_snapshot: snapshot,
            metadata: {
              evidence_fingerprint: fingerprint,
              artifact_source: "incident_investigation_ui",
              report_variant: variant,
              browser_report_version: "1.4",
            },
          }),
        },
      );

      writeIncidentReportWindow(reportWindow, content);
      setReportRegistryMessage(
        `${formatStatus(reportType)} ${persisted.persistence.created ? "persisted" : "reused"} as revision ${persisted.report.report_revision}.`,
      );
      await loadReportHistory(selectedIncidentId);
    } catch (persistError) {
      reportWindow.close();
      setReportRegistryError(
        persistError instanceof Error
          ? persistError.message
          : "Unable to persist the incident report.",
      );
    } finally {
      setReportMutation(null);
    }
  };

  const persistEvidenceJson = async () => {
    if (!detail || !selectedIncidentId) return;

    const reportType: PersistedReportType = "evidence_json";
    setReportMutation(reportType);
    setReportRegistryError(null);
    setReportRegistryMessage(null);

    try {
      const snapshot = buildReportEvidenceSnapshot(
        detail,
        reportProfile,
        reportSyntheticOverride,
      );
      const fingerprint = await reportEvidenceFingerprint(snapshot);
      const generatedAt = new Date();
      const expectedReportNumber = buildHumanReportNumber(
        detail,
        generatedAt,
      );
      const expectedReportStage = reportStageFor(detail, reportProfile);
      const expectedUtilityName = reportProfile.utilityName.trim();
      const expectedSystemName = reportProfile.systemName.trim();
      const expectedSynthetic =
        reportSyntheticOverride || detectSyntheticIncident(detail);

      const existing = reportHistory.find(
        (report) =>
          !report.is_superseded &&
          report.report_number === expectedReportNumber &&
          report.plan_generation === currentPlanGeneration &&
          report.report_type === reportType &&
          String(report.report_stage ?? "").toLowerCase() ===
            expectedReportStage &&
          String(report.utility_name ?? "").trim() === expectedUtilityName &&
          String(report.system_name ?? "").trim() === expectedSystemName &&
          Boolean(report.synthetic) === expectedSynthetic &&
          String(report.content_type ?? "").toLowerCase().includes("json") &&
          String(report.metadata?.browser_report_version ?? "") === "1.4" &&
          String(report.metadata?.evidence_fingerprint ?? "") === fingerprint,
      );

      if (existing) {
        const retained = await apiFetch<IncidentReportRecordResponse>(
          `/api/v1/incidents/${encodeURIComponent(
            selectedIncidentId,
          )}/reports/${encodeURIComponent(existing.id)}`,
        );
        const retainedContent = String(retained.report.content ?? "");
        if (!retainedContent) {
          throw new Error("The retained evidence package is empty.");
        }
        downloadIncidentEvidenceJsonContent(
          retainedContent,
          retained.report.report_number,
        );
        setReportRegistryMessage(
          `No evidence change detected. Downloaded retained Evidence JSON revision ${existing.report_revision}.`,
        );
        return;
      }

      const payload = buildIncidentEvidenceJsonPayload(
        detail,
        reportProfile,
        reportSyntheticOverride,
        generatedAt,
        `FX-SNAPSHOT-SHA256-${fingerprint}`,
      );
      const reportNumber = payload.report_number;
      if (reportNumber !== expectedReportNumber) {
        throw new Error("Generated report identity is inconsistent.");
      }
      const content = JSON.stringify(payload, null, 2);

      const persisted = await apiFetch<PersistIncidentReportResponse>(
        `/api/v1/incidents/${encodeURIComponent(selectedIncidentId)}/reports`,
        {
          method: "POST",
          body: JSON.stringify({
            report_number: reportNumber,
            report_type: reportType,
            report_stage: expectedReportStage,
            plan_generation: currentPlanGeneration,
            generated_by: operatorName.trim() || DEFAULT_OPERATOR,
            utility_name: reportProfile.utilityName.trim() || null,
            system_name: reportProfile.systemName.trim() || null,
            synthetic: expectedSynthetic,
            content_type: "application/json;charset=utf-8",
            content_text: content,
            evidence_snapshot: snapshot,
            metadata: {
              evidence_fingerprint: fingerprint,
              artifact_source: "incident_investigation_ui",
              report_variant: "evidence_json",
              browser_report_version: "1.4",
            },
          }),
        },
      );

      downloadIncidentEvidenceJsonContent(content, reportNumber);
      setReportRegistryMessage(
        `Evidence JSON ${persisted.persistence.created ? "persisted" : "reused"} as revision ${persisted.report.report_revision}.`,
      );
      await loadReportHistory(selectedIncidentId);
    } catch (persistError) {
      setReportRegistryError(
        persistError instanceof Error
          ? persistError.message
          : "Unable to persist the evidence JSON package.",
      );
    } finally {
      setReportMutation(null);
    }
  };

  return (
    <div className="fx-app-shell min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-3"
              >
                <img
                  src={logoImage}
                  alt="FalilaX"
                  className="h-16 w-auto object-contain"
                />
                <span className="text-xl font-semibold tracking-wide">
                  FalilaX
                </span>
              </button>

              <nav className="hidden lg:flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <Link
                  to="/dashboard"
                  className="text-zinc-400 hover:text-zinc-100"
                ><Localize>{" Dashboard "}</Localize></Link>
                <Link
                  to="/map"
                  className="text-zinc-400 hover:text-zinc-100"
                ><Localize>{" Community Map "}</Localize></Link>
                <Link
                  to="/map"
                  className="text-zinc-400 hover:text-zinc-100"
                ><Localize>{" Source Attribution "}</Localize></Link>
                <Link
                  to="/incidents"
                  className="font-medium text-zinc-100"
                ><Localize>{" Investigation Workflow "}</Localize></Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:inline-flex rounded-md border border-green-900 bg-green-950/30 px-3 py-1 text-xs text-green-300"><Localize>{" Live Incident Workflow "}</Localize></span>

              <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /><Localize>{" Dashboard "}</Localize></Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-amber-400">
              <ShieldCheck className="h-4 w-4" /><Localize>{" Operator Investigation Workspace "}</Localize></div>

            <h1 className="text-3xl font-light"><Localize>{" Incident Investigation Workflow "}</Localize></h1>

            <p className="mt-2 max-w-3xl text-sm text-zinc-400"><Localize>{" Acknowledge incidents, assign responsibility, document investigation findings, verify corrective outcomes, and close incidents with a persistent audit trail. "}</Localize></p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2">
              <p className="text-xs text-zinc-500"><Localize>{"Operator"}</Localize></p>
              <Input
                value={operatorName}
                onChange={(event) => setOperatorName(event.target.value)}
                className="mt-1 h-8 w-52 border-zinc-700 bg-zinc-950"
              />
            </div>

            <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
              variant="outline"
              onClick={loadIncidents}
              disabled={loadingList}
              className="border-zinc-700 bg-zinc-900"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  loadingList ? "animate-spin" : ""
                }`}
              /><Localize>{" Refresh "}</Localize></Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-200">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium"><Localize>{"Workflow request failed"}</Localize></p>
              <p className="mt-1 text-red-300/90">{labelText(error)}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
            <div className="border-b border-zinc-800 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold"><Localize>{"Incident Queue"}</Localize></h2>
                  <p className="text-xs text-zinc-500">
                    {filteredIncidents.length}<Localize>{" matching "}</Localize>{selectedOutsideFilter ? t(" · 1 selected outside filter") : ""}
                    {" · "}
                    {incidents.length}<Localize>{" total "}</Localize></p>
                </div>

                <ClipboardList className="h-5 w-5 text-amber-400" />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("Search incidents...")}
                  className="border-zinc-700 bg-zinc-950 pl-9"
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {["active", "all", "critical"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`rounded-lg border px-3 py-2 text-xs capitalize transition ${
                      statusFilter === filter
                        ? "border-amber-600 bg-amber-950/30 text-amber-200"
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {labelText(filter)}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[760px] overflow-y-auto p-3">
              {loadingList ? (
                <div className="p-8 text-center text-sm text-zinc-500"><Localize>{" Loading incident queue... "}</Localize></div>
              ) : queueIncidents.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-green-500" />
                  <p className="font-medium"><Localize>{"No matching incidents"}</Localize></p>
                  <p className="mt-1 text-xs text-zinc-500"><Localize>{" FalilaX will place operational incidents here when they are persisted by the Digital Twin lifecycle. "}</Localize></p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queueIncidents.map((incident) => {
                    const active = incident.id === selectedIncidentId;

                    return (
                      <button
                        key={incident.id}
                        type="button"
                        onClick={() => {
                          setSelectedIncidentId(incident.id);
                          navigate(
                            `/incidents/${encodeURIComponent(incident.id)}`,
                          );
                        }}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          active
                            ? "border-amber-600 bg-amber-950/20"
                            : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
                        }`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <p className="line-clamp-2 text-sm font-medium">
                            <GeneratedText value={incident.title} />
                          </p>

                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
                        </div>

                        <div className="mb-3 flex flex-wrap gap-2">
                          {active &&
                            selectedOutsideFilter?.id === incident.id && (
                              <span className="rounded border border-orange-800 bg-orange-950/30 px-2 py-0.5 text-[11px] text-orange-300"><Localize>{" Selected · outside "}</Localize>{labelText(formatStatus(statusFilter))}<Localize>{" filter "}</Localize></span>
                            )}
                          <span
                            className={`rounded border px-2 py-0.5 text-[11px] ${severityClasses(
                              incident.severity,
                            )}`}
                          >
                            {labelText(formatStatus(incident.severity))}
                          </span>
                          <span
                            className={`rounded border px-2 py-0.5 text-[11px] ${statusClasses(
                              incident.status,
                            )}`}
                          >
                            {labelText(formatStatus(incident.status))}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-zinc-500">
                          <p><Localize>{"Node: "}</Localize>{incident.source_node_id ?? "N/A"}</p>
                          <p>{dateText(incident.detected_at)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <section className="min-w-0">
            {!selectedIncidentId ? (
              <div className="flex min-h-[620px] items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center">
                <div className="max-w-md">
                  <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
                  <h2 className="text-xl font-medium"><Localize>{" No incident selected "}</Localize></h2>
                  <p className="mt-2 text-sm text-zinc-500"><Localize>{" Select an incident from the queue to open the investigation workspace. "}</Localize></p>
                </div>
              </div>
            ) : loadingDetail || !detail || !selected || !workflow ? (
              <div className="flex min-h-[620px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/30">
                <Activity className="mr-3 h-5 w-5 animate-pulse text-amber-400" />
                <span className="text-zinc-400"><Localize>{" Loading investigation workspace... "}</Localize></span>
              </div>
            ) : (
              <div className="space-y-6">
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-md border px-2.5 py-1 text-xs ${severityClasses(
                            selected.severity,
                          )}`}
                        >
                          {labelText(formatStatus(selected.severity))}
                        </span>
                        <span
                          className={`rounded-md border px-2.5 py-1 text-xs ${statusClasses(
                            workflow.status,
                          )}`}
                        >
                          {labelText(formatStatus(workflow.status))}
                        </span>
                        {selected.is_emergency && (
                          <span className="rounded-md border border-red-700 bg-red-950/50 px-2.5 py-1 text-xs text-red-200"><Localize>{" Emergency "}</Localize></span>
                        )}
                      </div>

                      <h2 className="text-2xl font-semibold">
                        <GeneratedText value={selected.title} />
                      </h2>

                      <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                        <GeneratedText value={selected.description || t("No incident description.")} />
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-500">
                        <span><Localize>{"Incident: "}</Localize>{selected.id}</span>
                        <span><Localize>{"Event: "}</Localize>{labelText(selected.event_type ?? "N/A")}</span>
                        <span><Localize>{"Node: "}</Localize>{selected.source_node_id ?? "N/A"}</span>
                        <span><Localize>{"Detected: "}</Localize>{dateText(selected.detected_at)}</span>
                      </div>
                    </div>

                    <div className="grid min-w-[280px] grid-cols-2 gap-3">
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                        <p className="text-xs text-zinc-500"><Localize>{"Affected assets"}</Localize></p>
                        <p className="mt-1 text-2xl font-semibold">
                          {selected.affected_asset_count}
                        </p>
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                        <p className="text-xs text-zinc-500"><Localize>{"Audit events"}</Localize></p>
                        <p className="mt-1 text-2xl font-semibold">
                          {workflow.event_count}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold"><Localize>{" Investigation Progress "}</Localize></h3>
                      <p className="text-sm text-zinc-500"><Localize>{" Persistent workflow state from detection to closure. "}</Localize></p>
                    </div>

                    <Clock3 className="h-5 w-5 text-amber-400" />
                  </div>

                  <div className="grid gap-2 md:grid-cols-5 xl:grid-cols-9">
                    {STATUS_ORDER.map((step, index) => {
                      const current = step === currentStatus;
                      const visited = visitedWorkflowStatuses.has(step);
                      const completed = visited && !current;
                      const skipped =
                        !visited &&
                        index < furthestVisitedWorkflowIndex;
                      const pending =
                        !current &&
                        !completed &&
                        !skipped;

                      return (
                        <div
                          key={step}
                          className={`rounded-xl border p-3 ${
                            current
                              ? "border-amber-600 bg-amber-950/30"
                              : completed
                                ? "border-green-900 bg-green-950/20"
                                : skipped
                                  ? "border-dashed border-zinc-700 bg-zinc-950/40"
                                  : "border-zinc-800 bg-zinc-950/70"
                          }`}
                        >
                          <div className="mb-2">
                            {current ? (
                              <Activity className="h-4 w-4 text-amber-400" />
                            ) : completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            ) : skipped ? (
                              <div className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-600 text-[10px] text-zinc-500">
                                —
                              </div>
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-zinc-700" />
                            )}
                          </div>

                          <p
                            className={`text-xs font-medium ${
                              skipped || pending
                                ? "text-zinc-500"
                                : ""
                            }`}
                          >
                            {labelText(formatStatus(step))}
                          </p>

                          <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-600">
                            {current
                              ? t("Current")
                              : completed
                                ? t("Visited")
                                : skipped
                                  ? t("Skipped")
                                  : t("Pending")}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {!STATUS_ORDER.includes(currentStatus) && currentStatus && (
                    <div className="mt-4 rounded-lg border border-orange-900 bg-orange-950/20 px-3 py-2 text-xs text-orange-300"><Localize>{" Current workflow state: "}</Localize>{labelText(formatStatus(currentStatus))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-zinc-500">
                    <span><Localize>{"Green = state actually visited"}</Localize></span>
                    <span><Localize>{"Amber = current state"}</Localize></span>
                    <span><Localize>{"Dashed = skipped state"}</Localize></span>
                    <span><Localize>{"Dim = pending state"}</Localize></span>
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                      <Activity className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                      <div>
                        <h3 className="text-lg font-semibold"><Localize>{" Source Intelligence "}</Localize></h3>
                        <p className="mt-1 max-w-3xl text-sm text-zinc-500"><Localize>{" Incident-linked upstream topology evidence from the explicit source asset. This investigation view does not infer a site identity from an asset or node ID. "}</Localize></p>
                      </div>
                    </div>

                    {sourceIntelligence && (
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-md border px-2.5 py-1 text-xs ${
                            sourceIntelligence.available
                              ? "border-cyan-800 bg-cyan-950/30 text-cyan-300"
                              : "border-zinc-700 bg-zinc-950 text-zinc-400"
                          }`}
                        >
                          {labelText(formatStatus(sourceIntelligence.status))}
                        </span>
                        <span className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-400"><Localize>{" Engine v"}</Localize>{sourceIntelligence.engine_version}
                        </span>
                      </div>
                    )}
                  </div>

                  {!sourceIntelligence ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-5 text-sm text-zinc-500"><Localize>{" Source intelligence was not returned for this incident. "}</Localize></div>
                  ) : !sourceIntelligence.available ? (
                    <div className="rounded-xl border border-amber-900/70 bg-amber-950/20 p-5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                        <div>
                          <p className="font-medium text-amber-200">
                            <GeneratedText value={sourceIntelligence.headline} />
                          </p>
                          <p className="mt-2 text-sm text-zinc-400">
                            <GeneratedText value={sourceIntelligence.summary} />
                          </p>
                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-500">
                            <span><Localize>{" Source asset ID:"}</Localize>{" "}
                              {sourceIntelligence.source_identity
                                ?.source_asset_id ?? t("Unavailable")}
                            </span>
                            <span><Localize>{" Digital Twin node ID:"}</Localize>{" "}
                              {sourceIntelligence.source_identity
                                ?.source_node_id ?? t("Unavailable")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/10 p-4">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-sm font-medium text-cyan-200">
                              <GeneratedText value={sourceIntelligence.headline} />
                            </p>
                            <p className="mt-1 max-w-4xl text-sm text-zinc-400">
                              <GeneratedText value={sourceIntelligence.summary} />
                            </p>
                          </div>

                          <div className="shrink-0 text-xs text-zinc-500">
                            {sourceIntelligence.generated_at
                              ? t("Updated {date}", { date: dateText(sourceIntelligence.generated_at) })
                              : ""}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-3">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500"><Localize>{" Explicit source asset "}</Localize></p>
                          <p className="mt-2 text-base font-semibold">
                            {sourceIntelligence.target_asset?.asset_name ??
                              t("Not available")}
                          </p>
                          <p className="mt-1 text-sm text-zinc-400">
                            {labelText(sourceIntelligence.target_asset?.asset_type) ||
                              t("Unknown asset type")}
                          </p>
                          <div className="mt-3 space-y-1 text-xs text-zinc-500">
                            <p><Localize>{" Asset ID:"}</Localize>{" "}
                              {sourceIntelligence.source_identity
                                ?.source_asset_id ?? "N/A"}
                            </p>
                            <p><Localize>{" Digital Twin node ID:"}</Localize>{" "}
                              {sourceIntelligence.source_identity
                                ?.source_node_id ?? "N/A"}
                            </p>
                            <p><Localize>{" Identity:"}</Localize>{" "}
                              {labelText(formatStatus(
                                sourceIntelligence.source_identity
                                  ?.identity_resolution,
                              ))}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500"><Localize>{" Upstream topology "}</Localize></p>
                          <p className="mt-2 text-3xl font-semibold">
                            {
                              sourceIntelligence.topology
                                .upstream_relationship_count
                            }
                          </p>
                          <p className="mt-1 text-sm text-zinc-400">{" "}{t(sourceIntelligence.topology
                              .upstream_relationship_count === 1 ? "Active upstream relationship" : "Active upstream relationships")}{" "}
                          </p>
                          <div className="mt-3 text-xs text-zinc-500">
                            <p><Localize>{" Topology used:"}</Localize>{" "}
                              {sourceIntelligence.topology.used ? t("Yes") : t("No")}
                            </p>
                            <p><Localize>{" Search depth:"}</Localize>{" "}
                              {sourceIntelligence.topology.max_depth}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500"><Localize>{" Hydraulic evidence "}</Localize></p>
                          <p className="mt-2 text-base font-semibold">
                            {labelText(formatStatus(hydraulicEvidence?.status))}
                          </p>
                          <div className="mt-3 space-y-1 text-xs text-zinc-500">
                            <p><Localize>{" Relationship confidence:"}</Localize>{" "}
                              {hydraulicEvidence
                                ?.relationship_confidence_available
                                ? t("Available")
                                : t("Unavailable")}
                            </p>
                            <p><Localize>{" Distance metadata:"}</Localize>{" "}
                              {hydraulicEvidence?.distance_available
                                ? t("Available")
                                : t("Unavailable")}
                            </p>
                            <p><Localize>{" Travel-time metadata:"}</Localize>{" "}
                              {hydraulicEvidence?.travel_time_available
                                ? t("Available")
                                : t("Unavailable")}
                            </p>
                            <p><Localize>{" Hydraulic model ready:"}</Localize>{" "}
                              {hydraulicEvidence?.hydraulic_model_ready
                                ? t("Yes")
                                : t("No")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
                        <div>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <h4 className="font-medium"><Localize>{" Probable Upstream Origin Assets "}</Localize></h4>
                              <p className="text-xs text-zinc-500"><Localize>{" Ranked topology candidates for operator investigation. "}</Localize></p>
                            </div>
                            <span className="text-xs text-zinc-500">
                              {probableOriginAssets.length}{" "}{t(probableOriginAssets.length === 1 ? "candidate" : "candidates")}{" "}
                            </span>
                          </div>

                          {probableOriginAssets.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-5 text-sm text-zinc-500"><Localize>{" No upstream origin assets were resolved. "}</Localize></div>
                          ) : (
                            <div className="space-y-3">
                              {probableOriginAssets.map((candidate, index) => (
                                <div
                                  key={`${candidate.asset_id}-${candidate.relationship_id ?? index}`}
                                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                                >
                                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-800 bg-cyan-950/30 text-xs font-semibold text-cyan-300">
                                          {index + 1}
                                        </span>
                                        <p className="font-medium">
                                          {candidate.asset_name}
                                        </p>
                                        <span className="rounded border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-400">
                                          {labelText(candidate.asset_type)}
                                        </span>
                                      </div>

                                      <div className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2 xl:grid-cols-3">
                                        <p><Localize>{" Asset ID: "}</Localize>{candidate.asset_id}
                                        </p>
                                        <p><Localize>{" Depth: "}</Localize>{candidate.depth}{" "}{t(candidate.depth === 1 ? "step" : "steps")}{" "}{" "}<Localize>{" upstream "}</Localize></p>
                                        <p><Localize>{" Relationship:"}</Localize>{" "}
                                          {labelText(formatStatus(
                                            candidate.relationship_type,
                                          ))}
                                        </p>
                                        <p><Localize>{" Confidence:"}</Localize>{" "}
                                          {confidenceText(
                                            candidate.relationship_confidence,
                                          )}
                                        </p>
                                        <p><Localize>{" Distance:"}</Localize>{" "}
                                          {candidate.distance_meters === null
                                            ? t("Not available")
                                            : `${numberText(
                                                candidate.distance_meters,
                                                1,
                                              )} m`}
                                        </p>
                                        <p><Localize>{" Travel time:"}</Localize>{" "}
                                          {candidate.estimated_travel_time_minutes ===
                                          null
                                            ? t("Not available")
                                            : `${numberText(
                                                candidate.estimated_travel_time_minutes,
                                                1,
                                              )} min`}
                                        </p>
                                      </div>

                                      {candidate.evidence?.length > 0 && (
                                        <div className="mt-3 space-y-1">
                                          {candidate.evidence
                                            .slice(0, 3)
                                            .map((item, evidenceIndex) => (
                                              <p
                                                key={evidenceIndex}
                                                className="text-xs text-zinc-400"
                                              >
                                                • <GeneratedText value={item} />
                                              </p>
                                            ))}
                                        </div>
                                      )}
                                    </div>

                                    <div className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-right">
                                      <p className="text-[10px] uppercase tracking-wide text-zinc-500"><Localize>{" Topology score "}</Localize></p>
                                      <p className="mt-1 text-lg font-semibold text-cyan-300">
                                        {numberText(candidate.score, 3)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                            <h4 className="font-medium"><Localize>{"Evidence Support"}</Localize></h4>
                            <p className="mt-1 text-xs text-zinc-500"><Localize>{" Relative topology evidence by source class; these values are not site-level probabilities. "}</Localize></p>

                            <div className="mt-4 space-y-3">
                              {(sourceIntelligence.source_type_support ?? [])
                                .filter((item) => item.score > 0)
                                .map((item) => (
                                  <div key={item.source_type}>
                                    <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                                      <span className="text-zinc-300">
                                        {labelText(formatStatus(item.source_type))}
                                      </span>
                                      <span className="text-zinc-500">
                                        {item.share_percent}%
                                      </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                      <div
                                        className="h-full rounded-full bg-cyan-700"
                                        style={{
                                          width: `${Math.max(
                                            0,
                                            Math.min(
                                              100,
                                              item.share_percent,
                                            ),
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                    <p className="mt-1 text-[10px] text-zinc-600"><Localize>{" Score "}</Localize>{numberText(item.score, 3)} ·{" "}
                                      {item.evidence_count}{" "}{t(item.evidence_count === 1 ? "evidence item" : "evidence items")}{" "}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                            <h4 className="font-medium"><Localize>{" Hydraulic Readiness "}</Localize></h4>

                            <div className="mt-3 space-y-2 text-xs text-zinc-500">
                              <div className="flex items-center justify-between gap-3">
                                <span><Localize>{"Relationship confidence coverage"}</Localize></span>
                                <span className="text-zinc-300">
                                  {hydraulicEvidence
                                    ?.relationship_confidence_coverage
                                    ?.percent ?? 0}
                                  %
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span><Localize>{"Distance coverage"}</Localize></span>
                                <span className="text-zinc-300">
                                  {hydraulicEvidence?.distance_coverage
                                    ?.percent ?? 0}
                                  %
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span><Localize>{"Travel-time coverage"}</Localize></span>
                                <span className="text-zinc-300">
                                  {hydraulicEvidence?.travel_time_coverage
                                    ?.percent ?? 0}
                                  %
                                </span>
                              </div>
                            </div>

                            {!hydraulicEvidence?.hydraulic_model_ready &&
                              hydraulicEvidence?.hydraulic_model_reason && (
                                <div className="mt-4 rounded-lg border border-amber-900/60 bg-amber-950/20 p-3 text-xs text-amber-200/90">
                                  <GeneratedText value={hydraulicEvidence.hydraulic_model_reason} />
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      {(sourceIntelligence.limitations?.length ?? 0) > 0 && (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500"><Localize>{" Investigation limitations "}</Localize></p>
                              <div className="mt-2 space-y-1">
                                {sourceIntelligence.limitations
                                  .slice(0, 5)
                                  .map((limitation, index) => (
                                    <p
                                      key={index}
                                      className="text-xs text-zinc-500"
                                    >
                                      • <GeneratedText value={limitation} />
                                    </p>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                      <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" />
                      <div>
                        <h3 className="text-lg font-semibold"><Localize>{" Operator Action Plan "}</Localize></h3>
                        <p className="mt-1 max-w-3xl text-sm text-zinc-500"><Localize>{" Durable incident actions generated from the current event, severity, impact, and explicit source asset. Approval gates are enforced before workflow execution. "}</Localize></p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-400">
                        {actionPlan?.count ?? 0}{" "}{t((actionPlan?.count ?? 0) === 1 ? "persisted action" : "persisted actions")}{" "}
                      </span>
                      {hasActionPlan && (
                        <span
                          className={`rounded-md border px-2.5 py-1 text-xs ${
                            currentPlanCompleted ||
                            actionPlan?.ready_for_execution
                              ? "border-green-800 bg-green-950/30 text-green-300"
                              : (actionPlan?.pending_approval_count ?? 0) > 0
                                ? "border-amber-800 bg-amber-950/30 text-amber-300"
                                : "border-cyan-800 bg-cyan-950/30 text-cyan-300"
                          }`}
                        >
                          {labelText(actionPlanGateLabel)}
                        </span>
                      )}
                    </div>
                  </div>

                  {!hasActionPlan ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="font-medium text-zinc-200"><Localize>{" No durable action plan has been created. "}</Localize></p>
                          <p className="mt-1 max-w-3xl text-sm text-zinc-500"><Localize>{" Start the investigation first, then let FalilaX generate the operator action plan. The plan is persisted and remains separate from physical utility control execution. "}</Localize></p>
                        </div>

                        <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                          onClick={() =>
                            performMutation("actions/plan", {
                              actor: operatorName.trim() || DEFAULT_OPERATOR,
                            })
                          }
                          disabled={!canCreateActionPlan || mutating !== null}
                          className="shrink-0 bg-violet-700 hover:bg-violet-600"
                        >
                          {mutating === "actions/plan"
                            ? t("Creating...")
                            : t("Create Action Plan")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {planExpired && (
                        <div role="status" className="rounded-xl border border-amber-800 bg-amber-950/20 p-4">
                          <p className="font-medium text-amber-300">{t("Plan expired")}</p>
                          <p className="mt-2 text-sm text-zinc-400">{t("Expired actions cannot be approved or recorded as completed. Previous approvals do not carry over to a fresh plan.")}</p>
                          {canRefreshExpiredPlan ? (
                            <Button className="mt-3 h-auto whitespace-normal bg-violet-700 hover:bg-violet-600"
                              disabled={mutating !== null}
                              onClick={() => performMutation("actions/refresh-plan", { actor: operatorName.trim() || DEFAULT_OPERATOR })}>
                              {mutating === "actions/refresh-plan" ? t("Creating...") : t("Create fresh plan")}
                            </Button>
                          ) : (
                            <p className="mt-2 text-sm text-zinc-400">{t("This plan has already progressed beyond approval. Review its execution history before choosing the next workflow step.")}</p>
                          )}
                        </div>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500"><Localize>{" Total actions "}</Localize></p>
                          <p className="mt-2 text-2xl font-semibold">
                            {actionPlan?.count ?? 0}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500"><Localize>{" Approval-gated "}</Localize></p>
                          <p className="mt-2 text-2xl font-semibold text-amber-300">
                            {actionPlan?.requires_approval_count ?? 0}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500"><Localize>{" Pending approval "}</Localize></p>
                          <p className="mt-2 text-2xl font-semibold text-amber-300">
                            {actionPlan?.pending_approval_count ?? 0}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500">
                            {currentPlanCompleted ? t("Completed") : t("Approved")}
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-green-300">
                            {currentPlanCompleted
                              ? completedActionCount
                              : (actionPlan?.approved_count ?? 0)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-sm font-medium"><Localize>{" Action-plan gate "}</Localize></p>
                          <p className="mt-1 max-w-3xl text-xs text-zinc-500">
                            {actionPlan?.safety_note ||
                              t("Workflow execution does not issue physical utility control commands.")}
                          </p>
                        </div>

                        {currentStatus === "executing" &&
                        !currentPlanCompleted ? (
                          <div className="rounded-lg border border-cyan-900 bg-cyan-950/20 px-3 py-2 text-sm text-cyan-200">
                            <p className="font-medium"><Localize>{" Execution progress"}</Localize>{" "}
                              {currentGenerationSummary?.executed_count ?? 0} /{" "}
                              {actionPlan?.count ?? incidentActions.length}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500"><Localize>{" Record completion on each approved current-plan action before starting verification. "}</Localize></p>
                          </div>
                        ) : currentPlanCompleted ? (
                          <div className="flex items-center gap-2 rounded-lg border border-green-900 bg-green-950/20 px-3 py-2 text-sm text-green-300">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span><Localize>{"All current-plan actions completed"}</Localize></span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-3">
                            <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                              variant="outline"
                              onClick={() =>
                                performMutation("actions/approve", {
                                  approved_by:
                                    operatorName.trim() || DEFAULT_OPERATOR,
                                })
                              }
                              disabled={
                                !canApproveActionPlan || mutating !== null
                              }
                              className="border-amber-800 text-amber-300"
                            >
                              {mutating === "actions/approve"
                                ? t("Approving...")
                                : t("Approve Pending Actions")}
                            </Button>

                            <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                              onClick={() =>
                                performMutation("actions/start-execution", {
                                  actor:
                                    operatorName.trim() || DEFAULT_OPERATOR,
                                })
                              }
                              disabled={
                                !canStartActionExecution || mutating !== null
                              }
                              className="bg-cyan-700 hover:bg-cyan-600"
                            >
                              {mutating === "actions/start-execution"
                                ? t("Starting...")
                                : t("Start Execution")}
                            </Button>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <h4 className="font-medium"><Localize>{"Persisted Actions"}</Localize></h4>
                            <p className="text-xs text-zinc-500"><Localize>{" Ranked operator actions for this incident. "}</Localize></p>
                          </div>
                          <span className="text-xs text-zinc-500">
                            {incidentActions.length}{" "}{t(incidentActions.length === 1 ? "action" : "actions")}{" "}
                          </span>
                        </div>

                        <div className="grid gap-3 xl:grid-cols-2">
                          {incidentActions.map((action) => {
                            const actionStatus = normalizeWorkflowStatus(
                              action.status,
                            );
                            const isCurrentGeneration =
                              action.plan_generation === currentPlanGeneration &&
                              !action.superseded;
                            const canRecordCompletion =
                              currentStatus === "executing" &&
                              isCurrentGeneration &&
                              actionStatus === "approved";
                            const completionOpen =
                              completionActionId === action.id;
                            const completionNote =
                              completionNotes[action.id] ?? "";
                            const attesting =
                              attestingActionId === action.id;

                            return (
                              <div
                                key={action.id}
                                className={`rounded-xl border bg-zinc-950 p-4 ${
                                  actionStatus === "completed"
                                    ? "border-green-950/80"
                                    : canRecordCompletion
                                      ? "border-cyan-950/80"
                                      : "border-zinc-800"
                                }`}
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="font-medium">
                                        {action.title}
                                      </p>
                                      <span
                                        className={`rounded border px-2 py-0.5 text-[11px] ${severityClasses(
                                          action.risk,
                                        )}`}
                                      >
                                        {labelText(formatStatus(action.risk))}<Localize>{" risk "}</Localize></span>
                                      <span
                                        className={`rounded border px-2 py-0.5 text-[11px] ${actionStatusClasses(
                                          action.status,
                                        )}`}
                                      >
                                        {labelText(formatStatus(action.status))}
                                      </span>
                                      {isCurrentGeneration && (
                                        <span className="rounded border border-cyan-800 bg-cyan-950/20 px-2 py-0.5 text-[11px] text-cyan-300"><Localize>{" Generation "}</Localize>{action.plan_generation}
                                        </span>
                                      )}
                                    </div>

                                    <p className="mt-2 text-sm text-zinc-400">
                                      {action.description}
                                    </p>
                                  </div>

                                  <div className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-right">
                                    <p className="text-[10px] uppercase tracking-wide text-zinc-500"><Localize>{" Priority "}</Localize></p>
                                    <p className="mt-1 text-lg font-semibold">
                                      {action.priority}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2 xl:grid-cols-3">
                                  <p><Localize>{" Type: "}</Localize>{labelText(formatStatus(action.action_type))}
                                  </p>
                                  <p><Localize>{" Mode:"}</Localize>{" "}
                                    {labelText(formatStatus(action.execution_mode))}
                                  </p>
                                  <p><Localize>{" Target asset:"}</Localize>{" "}
                                    {action.target_asset_id ?? "N/A"}
                                  </p>
                                  <p><Localize>{" Approval:"}</Localize>{" "}
                                    {action.requires_approval
                                      ? action.approval_role
                                        ? t("Required ({role})", { role: labelText(action.approval_role) })
                                        : t("Required")
                                      : t("Not required")}
                                  </p>
                                  <p><Localize>{" Proposed: "}</Localize>{dateText(action.proposed_at)}
                                  </p>
                                  <p><Localize>{" Expires: "}</Localize>{dateText(action.expires_at)}
                                  </p>
                                </div>

                                {action.reason && (
                                  <p className="mt-3 text-xs text-zinc-500">
                                    {action.reason}
                                  </p>
                                )}

                                {actionStatus === "completed" &&
                                  isCurrentGeneration && (
                                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-900/70 bg-green-950/15 px-3 py-2 text-xs text-green-300">
                                      <CheckCircle2 className="h-4 w-4 shrink-0" /><Localize>{" Execution recorded for the current plan. "}</Localize></div>
                                  )}

                                {canRecordCompletion && !completionOpen && (
                                  <div className="mt-4 border-t border-zinc-900 pt-4">
                                    <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                                      variant="outline"
                                      onClick={() =>
                                        setCompletionActionId(action.id)
                                      }
                                      disabled={
                                        attestingActionId !== null ||
                                        mutating !== null
                                      }
                                      className="w-full border-cyan-800 text-cyan-300 hover:bg-cyan-950/30"
                                    ><Localize>{" Record Completion "}</Localize></Button>
                                  </div>
                                )}

                                {canRecordCompletion && completionOpen && (
                                  <div className="mt-4 space-y-3 rounded-xl border border-cyan-900/60 bg-cyan-950/10 p-3">
                                    <div>
                                      <p className="text-sm font-medium text-cyan-200"><Localize>{" Operator completion attestation "}</Localize></p>
                                      <p className="mt-1 text-xs text-zinc-500"><Localize>{" Describe what was completed and the result observed. This creates a durable non-physical execution record. "}</Localize></p>
                                    </div>

                                    <Textarea
                                      value={completionNote}
                                      onChange={(event) =>
                                        setCompletionNotes((current) => ({
                                          ...current,
                                          [action.id]: event.target.value,
                                        }))
                                      }
                                      placeholder={t("Completion note, observed result, sample reference, work-order reference, or other operator evidence...")}
                                      className="min-h-24 border-zinc-700 bg-zinc-950"
                                    />

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                      <div className="flex items-start gap-2 text-[11px] text-zinc-500">
                                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
                                        <span><Localize>{" Records operator attestation only. No SCADA, valve, pump, chemical-dosing, pressure-control, PLC, or RTU command is issued. "}</Localize></span>
                                      </div>

                                      <div className="flex shrink-0 gap-2">
                                        <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                                          type="button"
                                          variant="ghost"
                                          onClick={() =>
                                            setCompletionActionId(null)
                                          }
                                          disabled={attesting}
                                          className="text-zinc-400"
                                        ><Localize>{" Cancel "}</Localize></Button>
                                        <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                                          type="button"
                                          onClick={() =>
                                            attestActionCompletion(action)
                                          }
                                          disabled={
                                            !completionNote.trim() ||
                                            attesting ||
                                            mutating !== null
                                          }
                                          className="bg-cyan-700 hover:bg-cyan-600"
                                        >
                                          {attesting
                                            ? t("Recording...")
                                            : t("Confirm Completion")}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                      <Activity className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                      <div>
                        <h3 className="text-lg font-semibold"><Localize>{" Execution History "}</Localize></h3>
                        <p className="mt-1 max-w-3xl text-sm text-zinc-500"><Localize>{" Durable action execution records separated into the current action-plan generation, prior generations, and lifetime incident history. "}</Localize></p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md border border-cyan-800 bg-cyan-950/30 px-2.5 py-1 text-xs text-cyan-300"><Localize>{" Current plan · Generation "}</Localize>{currentPlanGeneration}
                      </span>
                      <span className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-400">
                        {lifetimeExecutionSummary?.count ?? 0}{" "}{t((lifetimeExecutionSummary?.count ?? 0) === 1 ? "lifetime record" : "lifetime records")}{" "}
                      </span>
                    </div>
                  </div>

                  {!executionSummary ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-5 text-sm text-zinc-500"><Localize>{" Execution history was not returned for this incident. "}</Localize></div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-green-900/70 bg-green-950/10 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500"><Localize>{" Current Generation "}</Localize></p>
                          <p className="mt-2 text-2xl font-semibold text-green-300">
                            {currentGenerationSummary?.executed_count ?? 0}
                            <span className="text-sm font-normal text-zinc-500">
                              {" "}
                              / {actionPlan?.count ?? 0}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-zinc-500"><Localize>{" Actions executed in Generation "}</Localize>{currentPlanGeneration}
                          </p>
                          <p className="mt-2 text-[11px] text-zinc-600">
                            {(currentGenerationSummary?.failed_count ?? 0)}<Localize>{" failed "}</Localize>{" · "}
                            {(currentGenerationSummary?.blocked_count ?? 0)}<Localize>{" blocked "}</Localize></p>
                        </div>

                        <div className="rounded-xl border border-violet-900/60 bg-violet-950/10 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500"><Localize>{" Historical "}</Localize></p>
                          <p className="mt-2 text-2xl font-semibold text-violet-300">
                            {historicalExecutionSummary?.executed_count ?? 0}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500"><Localize>{" Successful prior-generation executions "}</Localize></p>
                          <p className="mt-2 text-[11px] text-zinc-600">
                            {generationText(
                              historicalExecutionSummary?.generation_counts,
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500"><Localize>{" Lifetime "}</Localize></p>
                          <p className="mt-2 text-2xl font-semibold">
                            {lifetimeExecutionSummary?.count ?? 0}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500"><Localize>{" Durable execution records "}</Localize></p>
                          <p className="mt-2 text-[11px] text-zinc-600">
                            {generationText(
                              lifetimeExecutionSummary?.generation_counts,
                            )}
                          </p>
                        </div>

                        <div
                          className={`rounded-xl border p-4 ${
                            executionSummary.physical_control_command_issued
                              ? "border-red-800 bg-red-950/20"
                              : "border-green-900/70 bg-green-950/10"
                          }`}
                        >
                          <p className="text-xs uppercase tracking-wide text-zinc-500"><Localize>{" Physical Control "}</Localize></p>
                          <p
                            className={`mt-2 text-lg font-semibold ${
                              executionSummary.physical_control_command_issued
                                ? "text-red-300"
                                : "text-green-300"
                            }`}
                          >
                            {executionSummary.physical_control_command_issued
                              ? t("Issued")
                              : t("Not issued")}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500"><Localize>{" Operator attestation safety boundary "}</Localize></p>
                          <p className="mt-2 text-[11px] text-zinc-600"><Localize>{" Counter scope:"}</Localize>{" "}
                            {labelText(formatStatus(
                              executionSummary.counter_scope ??
                                workflow.execution_counter_scope,
                            ))}
                          </p>
                        </div>
                      </div>

                      {executionSummary.future_generation_anomaly?.present && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-800 bg-red-950/20 p-4 text-sm text-red-200">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <div>
                            <p className="font-medium"><Localize>{" Future-generation execution anomaly "}</Localize></p>
                            <p className="mt-1 text-xs text-red-300/90">
                              {
                                executionSummary.future_generation_anomaly.count
                              }{" "}{" "}{t(executionSummary.future_generation_anomaly.count ===
                              1 ? "execution record" : "execution records")}{" "}{" "}<Localize>{" belong to a generation newer than the current plan. "}</Localize></p>
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <h4 className="font-medium"><Localize>{" Current Plan — Generation "}</Localize>{currentPlanGeneration}
                            </h4>
                            <p className="text-xs text-zinc-500"><Localize>{" Execution attempts associated only with the current durable action plan. "}</Localize></p>
                          </div>
                          <span className="text-xs text-zinc-500">
                            {currentGenerationExecutions.length}{" "}{t(currentGenerationExecutions.length === 1 ? "execution record" : "execution records")}{" "}
                          </span>
                        </div>

                        {currentGenerationExecutions.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-5">
                            <p className="text-sm font-medium text-zinc-300"><Localize>{" No current-generation executions yet. "}</Localize></p>
                            <p className="mt-1 text-xs text-zinc-500"><Localize>{" Prior-generation audit history is preserved below and is not counted as current-plan work. "}</Localize></p>
                          </div>
                        ) : (
                          <div className="grid gap-3 xl:grid-cols-2">
                            {[...currentGenerationExecutions]
                              .sort((left, right) => {
                                const leftTime = new Date(
                                  left.finished_at ?? left.started_at ?? 0,
                                ).getTime();
                                const rightTime = new Date(
                                  right.finished_at ?? right.started_at ?? 0,
                                ).getTime();

                                return rightTime - leftTime;
                              })
                              .map((execution) => (
                                <div
                                  key={execution.id}
                                  className="rounded-xl border border-green-900/50 bg-zinc-950 p-4"
                                >
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium">
                                          {labelText(formatStatus(execution.action_type))}
                                        </p>
                                        <span
                                          className={`rounded border px-2 py-0.5 text-[11px] ${executionOutcomeClasses(
                                            execution.outcome,
                                          )}`}
                                        >
                                          {labelText(formatStatus(execution.outcome))}
                                        </span>
                                        <span className="rounded border border-cyan-900 bg-cyan-950/20 px-2 py-0.5 text-[11px] text-cyan-300"><Localize>{" Generation "}</Localize>{execution.plan_generation}
                                        </span>
                                      </div>

                                      <p className="mt-2 text-xs text-zinc-500">
                                        {execution.message ||
                                          t("No execution message was recorded.")}
                                      </p>
                                    </div>

                                    <div className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-right">
                                      <p className="text-[10px] uppercase tracking-wide text-zinc-500"><Localize>{" Attempt "}</Localize></p>
                                      <p className="mt-1 text-lg font-semibold">
                                        {execution.attempt_number}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2 xl:grid-cols-3">
                                    <p><Localize>{" Operator: "}</Localize>{execution.executor || t("Not recorded")}
                                    </p>
                                    <p><Localize>{" Mode: "}</Localize>{labelText(formatStatus(execution.execution_mode))}
                                    </p>
                                    <p><Localize>{" Adapter: "}</Localize>{execution.adapter_name || "N/A"}
                                    </p>
                                    <p><Localize>{" Started: "}</Localize>{dateText(execution.started_at)}
                                    </p>
                                    <p><Localize>{" Finished: "}</Localize>{dateText(execution.finished_at)}
                                    </p>
                                    <p><Localize>{" Duration:"}</Localize>{" "}
                                      {execution.duration_ms === null
                                        ? t("Not available")
                                        : `${execution.duration_ms} ms`}
                                    </p>
                                  </div>

                                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-900 pt-3 text-[11px] text-zinc-600">
                                    <span className="break-all"><Localize>{" Action: "}</Localize>{execution.action_id}
                                    </span>
                                    <span
                                      className={
                                        execution.physical_control_command_issued
                                          ? "text-red-300"
                                          : "text-green-400"
                                      }
                                    >
                                      {execution.physical_control_command_issued
                                        ? t("Physical control issued")
                                        : t("Non-physical attestation")}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <h4 className="font-medium"><Localize>{" Historical Execution Audit "}</Localize></h4>
                            <p className="text-xs text-zinc-500"><Localize>{" Completed execution records from superseded action-plan generations. "}</Localize></p>
                          </div>
                          <span className="text-xs text-zinc-500">
                            {historicalExecutionSummary?.count ?? 0}{" "}{t((historicalExecutionSummary?.count ?? 0) === 1 ? "historical record" : "historical records")}{" "}
                          </span>
                        </div>

                        {historicalExecutionGroups.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-5 text-sm text-zinc-500"><Localize>{" No prior-generation execution history exists for this incident. "}</Localize></div>
                        ) : (
                          <div className="space-y-4">
                            {historicalExecutionGroups.map((group) => {
                              const successful = group.executions.filter(
                                (execution) => execution.outcome === "executed",
                              ).length;
                              const failed = group.executions.filter(
                                (execution) => execution.outcome === "failed",
                              ).length;
                              const blocked = group.executions.filter(
                                (execution) => execution.outcome === "blocked",
                              ).length;

                              return (
                                <div
                                  key={group.generation}
                                  className="rounded-xl border border-violet-900/40 bg-zinc-950/80 p-4"
                                >
                                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <p className="font-medium text-violet-200"><Localize>{" Generation "}</Localize>{group.generation}
                                      </p>
                                      <p className="text-xs text-zinc-500">
                                        {successful}<Localize>{" executed · "}</Localize>{failed}<Localize>{" failed ·"}</Localize>{" "}
                                        {blocked}<Localize>{" blocked "}</Localize></p>
                                    </div>
                                    <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-400">
                                      {group.executions.length}{" "}{t(group.executions.length === 1 ? "durable record" : "durable records")}{" "}
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    {group.executions.map((execution) => (
                                      <div
                                        key={execution.id}
                                        className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3"
                                      >
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <p className="text-sm font-medium">
                                                {labelText(formatStatus(
                                                  execution.action_type,
                                                ))}
                                              </p>
                                              <span
                                                className={`rounded border px-2 py-0.5 text-[10px] ${executionOutcomeClasses(
                                                  execution.outcome,
                                                )}`}
                                              >
                                                {labelText(formatStatus(execution.outcome))}
                                              </span>
                                            </div>
                                            <p className="mt-1 text-xs text-zinc-500">
                                              {execution.executor || t("Unknown operator")}
                                              {" · "}
                                              {dateText(execution.finished_at)}
                                              {t(" · Attempt ")}
                                              {execution.attempt_number}
                                            </p>
                                          </div>
                                          <span className="text-[10px] text-zinc-600">
                                            {execution.adapter_name || t("No adapter")}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-zinc-300"><Localize>{" Execution safety boundary "}</Localize></p>
                          <p className="mt-1 text-xs text-zinc-500">
                            <GeneratedText value={executionSummary.safety_note ||
                              "Operator attestation records non-physical operational work and does not issue physical utility-control commands."} />
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-cyan-900/60 bg-cyan-950/10 p-6">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold"><Localize>{" Incident Reports & Evidence "}</Localize>
                      {locale !== "en" && <span className="mt-2 block text-xs font-normal text-slate-400">{t("Reports are generated in English. Saved evidence and existing reports are preserved.")}</span>}</h3>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                              reportUiStage === "Final"
                                ? "border-green-800 bg-green-950/30 text-green-300"
                                : "border-amber-800 bg-amber-950/30 text-amber-300"
                            }`}
                          >
                            {labelText(reportUiStage)}
                          </span>
                          {(reportSyntheticDetected || reportSyntheticOverride) && (
                            <span className="rounded-md border border-red-800 bg-red-950/30 px-2 py-0.5 text-[11px] font-medium text-red-300"><Localize>{" Synthetic / Development "}</Localize></span>
                          )}
                        </div>
                        <p className="mt-1 max-w-3xl text-sm text-zinc-400"><Localize>{" Generate a concise management summary, a detailed retained evidence report, or a machine-readable JSON package. Closed incidents are issued as FINAL only after Utility / Organization and System / Facility are configured. "}</Localize></p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500">
                          <span><Localize>{"Generation "}</Localize>{currentPlanGeneration}</span>
                          <span>{detail?.events?.length ?? 0}<Localize>{" audit events"}</Localize></span>
                          <span>{lifetimeExecutionSummary?.count ?? 0}<Localize>{" execution records"}</Localize></span>
                          <span><Localize>{" Physical control: "}</Localize>{executionSummary?.physical_control_command_issued ? t("Issued") : t("Not issued")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-start">
                      <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                        type="button"
                        onClick={() => persistHtmlReport("summary")}
                        disabled={!detail || reportMutation !== null}
                        className="bg-cyan-700 hover:bg-cyan-600"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {reportMutation === "summary"
                          ? t("Persisting Summary...")
                          : reportWillBeFinal
                            ? t("Summary Report / PDF")
                            : t("Summary Draft / PDF")}
                      </Button>

                      <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                        type="button"
                        variant="outline"
                        onClick={() => persistHtmlReport("detailed")}
                        disabled={!detail || reportMutation !== null}
                        className="border-cyan-800 text-cyan-200 hover:bg-cyan-950/40"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        {reportMutation === "detailed"
                          ? t("Persisting Detailed...")
                          : reportWillBeFinal
                            ? t("Detailed Report / PDF")
                            : t("Detailed Draft / PDF")}
                      </Button>

                      <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                        type="button"
                        variant="outline"
                        onClick={persistEvidenceJson}
                        disabled={!detail || reportMutation !== null}
                        className="border-zinc-700"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {reportMutation === "evidence_json"
                          ? t("Persisting Evidence...")
                          : t("Evidence JSON")}
                      </Button>
                    </div>
                  </div>

                  {!reportProfileComplete && (
                    <div className="mt-5 rounded-xl border border-amber-800/70 bg-amber-950/20 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                        <div>
                          <p className="text-sm font-semibold text-amber-200"><Localize>{" Organization profile incomplete "}</Localize></p>
                          <p className="mt-1 text-xs leading-5 text-zinc-400"><Localize>{" Reports can still be opened and saved as DRAFT, but FalilaX will not label a closed-incident report FINAL until both Utility / Organization and System / Facility are configured. "}</Localize></p>
                        </div>
                      </div>
                    </div>
                  )}

                  {reportWillBeFinal && (
                    <div className="mt-5 rounded-xl border border-green-900/70 bg-green-950/20 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                        <div>
                          <p className="text-sm font-semibold text-green-200"><Localize>{" Organization profile complete "}</Localize></p>
                          <p className="mt-1 text-xs leading-5 text-zinc-400"><Localize>{" This closed incident is eligible to generate FINAL summary and detailed operational records. "}</Localize></p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid gap-3 border-t border-cyan-950/70 pt-5 lg:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500"><Localize>{" Utility / Organization "}</Localize></span>
                      <Input
                        value={reportProfile.utilityName}
                        onChange={(event) =>
                          setReportProfile((current) => ({
                            ...current,
                            utilityName: event.target.value,
                          }))
                        }
                        placeholder={t("e.g., Montgomery Water Works")}
                        className="border-zinc-700 bg-zinc-950/80"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500"><Localize>{" System / Facility "}</Localize></span>
                      <Input
                        value={reportProfile.systemName}
                        onChange={(event) =>
                          setReportProfile((current) => ({
                            ...current,
                            systemName: event.target.value,
                          }))
                        }
                        placeholder={t("e.g., Montgomery Central Water System")}
                        className="border-zinc-700 bg-zinc-950/80"
                      />
                    </label>

                    <p className="lg:col-span-2 text-xs leading-5 text-zinc-500"><Localize>{" FalilaX resolves the Utility / Organization and System / Facility from the incident's persisted infrastructure ownership when available. You may edit these values for reporting purposes. Report artifacts are persisted in the FalilaX Report Registry. "}</Localize></p>

                    <label className="lg:col-span-2 flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <input
                        type="checkbox"
                        checked={reportSyntheticDetected || reportSyntheticOverride}
                        disabled={reportSyntheticDetected}
                        onChange={(event) =>
                          setReportSyntheticOverride(event.target.checked)
                        }
                        className="mt-0.5 h-4 w-4 accent-red-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-zinc-300"><Localize>{" Mark report as Development / Synthetic "}</Localize></p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {reportSyntheticDetected
                            ? t("FalilaX detected an explicit synthetic/development signal in the persisted incident evidence. Reports will be marked NOT FOR REGULATORY SUBMISSION.")
                            : t("Use this for demos, acceptance tests, or synthetic incidents. This setting applies only to the currently selected incident in this browser session.")}
                        </p>
                      </div>
                    </label>

                    <div className="lg:col-span-2 border-t border-cyan-950/70 pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-zinc-200"><Localize>{" Persisted Report History "}</Localize></h4>
                          <p className="mt-1 text-xs text-zinc-500"><Localize>{" Immutable report artifacts retained in PostgreSQL for this incident. "}</Localize></p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          <span className="rounded-md border border-zinc-700 px-2 py-1 text-zinc-300">
                            {reportRegistrySummary?.count ?? reportHistory.length}<Localize>{" records "}</Localize></span>
                          <span className="rounded-md border border-cyan-800 px-2 py-1 text-cyan-300"><Localize>{" Generation "}</Localize>{currentPlanGeneration}
                          </span>
                        </div>
                      </div>

                      {reportRegistryError && (
                        <div className="mt-3 rounded-lg border border-red-900/70 bg-red-950/20 px-3 py-2 text-xs text-red-300">
                          {labelText(reportRegistryError)}
                        </div>
                      )}

                      {reportRegistryMessage && (
                        <div className="mt-3 rounded-lg border border-green-900/70 bg-green-950/20 px-3 py-2 text-xs text-green-300">
                          {labelText(reportRegistryMessage)}
                        </div>
                      )}

                      {loadingReportHistory ? (
                        <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-xs text-zinc-500"><Localize>{" Loading retained report history... "}</Localize></div>
                      ) : reportHistory.length === 0 ? (
                        <div className="mt-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-4 text-xs text-zinc-500"><Localize>{" No persisted reports yet. The next Summary, Detailed, or Evidence JSON action will create the first durable registry record. "}</Localize></div>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {reportHistory.map((report) => (
                            <div
                              key={report.id}
                              className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
                                report.is_superseded
                                  ? "border-zinc-800 bg-zinc-950/40 opacity-70"
                                  : "border-cyan-950/80 bg-zinc-950/70"
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-medium text-zinc-200">
                                    {labelText(formatStatus(report.report_type))}
                                  </span>
                                  <span className="rounded-md border border-cyan-800 px-2 py-0.5 text-[10px] text-cyan-300"><Localize>{" Generation "}</Localize>{report.plan_generation}
                                  </span>
                                  <span className="rounded-md border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-300"><Localize>{" Revision "}</Localize>{report.report_revision}
                                  </span>
                                  <span
                                    className={`rounded-md border px-2 py-0.5 text-[10px] ${
                                      String(report.report_stage).toLowerCase() === "final"
                                        ? "border-green-800 text-green-300"
                                        : "border-amber-800 text-amber-300"
                                    }`}
                                  >
                                    {labelText(formatStatus(report.report_stage))}
                                  </span>
                                  {report.is_superseded && (
                                    <span className="rounded-md border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-500"><Localize>{" Superseded "}</Localize></span>
                                  )}
                                </div>
                                <p className="mt-1 truncate font-mono text-[11px] text-zinc-500">
                                  {report.report_number}
                                </p>
                                <p className="mt-1 text-[11px] text-zinc-500">
                                  {dateText(report.generated_at)} · {report.generated_by}
                                  {report.content_hash
                                    ? ` · SHA-256 ${report.content_hash.slice(0, 12)}…`
                                    : ""}
                                </p>
                              </div>
                              <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                                type="button"
                                variant="outline"
                                onClick={() => openPersistedReport(report)}
                                className="shrink-0 border-zinc-700"
                              >
                                {String(report.content_type).toLowerCase().includes("json")
                                  ? t("Download retained")
                                  : t("Open retained")}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
                  <div className="space-y-6">
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <UserCheck className="h-5 w-5 text-amber-400" />
                        <div>
                          <h3 className="font-semibold"><Localize>{" Operator Controls "}</Localize></h3>
                          <p className="text-xs text-zinc-500"><Localize>{" Actions are validated by the backend workflow engine. "}</Localize></p>
                        </div>
                      </div>

                      {terminalOperatorControls ? (
                        <div className="flex flex-col gap-4 rounded-xl border border-green-900/70 bg-green-950/15 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                            <div>
                              <p className="text-sm font-medium text-green-200">
                                {currentStatus === "closed"
                                  ? t("Incident lifecycle closed")
                                  : t("Incident lifecycle cancelled")}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500"><Localize>{" Primary lifecycle controls are complete. To resume investigation, provide a reopen reason in Resolution & Lifecycle. "}</Localize></p>
                            </div>
                          </div>

                          {canReopen && (
                            <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                              variant="outline"
                              onClick={scrollToLifecycleControls}
                              className="shrink-0 border-orange-800 text-orange-300"
                            ><Localize>{" Reopen options "}</Localize></Button>
                          )}
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                            onClick={() =>
                              performMutation("acknowledge", {
                                acknowledged_by:
                                  operatorName.trim() || DEFAULT_OPERATOR,
                              })
                            }
                            disabled={!canAcknowledge || mutating !== null}
                            className="bg-blue-700 hover:bg-blue-600"
                          ><Localize>{" Acknowledge "}</Localize></Button>

                          <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                            onClick={() =>
                              performMutation("investigate", {
                                actor: operatorName.trim() || DEFAULT_OPERATOR,
                              })
                            }
                            disabled={!canInvestigate || mutating !== null}
                            className="bg-amber-700 hover:bg-amber-600"
                          ><Localize>{" Start Investigation "}</Localize></Button>

                          <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                            onClick={() =>
                              performMutation("verify", {
                                actor: operatorName.trim() || DEFAULT_OPERATOR,
                              })
                            }
                            disabled={!canVerify || mutating !== null}
                            className="bg-cyan-700 hover:bg-cyan-600"
                          ><Localize>{" Start Verification "}</Localize></Button>

                          <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                            onClick={() =>
                              performMutation("close", {
                                actor: operatorName.trim() || DEFAULT_OPERATOR,
                              })
                            }
                            disabled={!canClose || mutating !== null}
                            className="bg-green-700 hover:bg-green-600"
                          ><Localize>{" Close Incident "}</Localize></Button>
                        </div>
                      )}

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-zinc-400" />
                            <p className="text-sm font-medium"><Localize>{"Assignment"}</Localize></p>
                          </div>

                          <div className="space-y-3">
                            <Input
                              value={assignedTo}
                              onChange={(event) =>
                                setAssignedTo(event.target.value)
                              }
                              readOnly={terminalOperatorControls}
                              aria-readonly={terminalOperatorControls}
                              placeholder={t("Assigned investigator")}
                              className={`border-zinc-700 bg-zinc-900 ${
                                terminalOperatorControls
                                  ? "cursor-default text-zinc-300"
                                  : ""
                              }`}
                            />
                            <Input
                              value={assignedTeam}
                              onChange={(event) =>
                                setAssignedTeam(event.target.value)
                              }
                              readOnly={terminalOperatorControls}
                              aria-readonly={terminalOperatorControls}
                              placeholder={t("Assigned team")}
                              className={`border-zinc-700 bg-zinc-900 ${
                                terminalOperatorControls
                                  ? "cursor-default text-zinc-300"
                                  : ""
                              }`}
                            />

                            {terminalOperatorControls ? (
                              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-500"><Localize>{" Assignment is read-only while the incident lifecycle is closed. Reopen the incident before changing ownership. "}</Localize></div>
                            ) : (
                              <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                                variant="outline"
                                onClick={() =>
                                  performMutation("assign", {
                                    assigned_by:
                                      operatorName.trim() || DEFAULT_OPERATOR,
                                    assigned_to:
                                      assignedTo.trim() || null,
                                    assigned_team:
                                      assignedTeam.trim() || null,
                                  })
                                }
                                disabled={
                                  (!assignedTo.trim() &&
                                    !assignedTeam.trim()) ||
                                  mutating !== null
                                }
                                className="w-full border-zinc-700"
                              ><Localize>{" Save Assignment "}</Localize></Button>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-zinc-400" />
                            <p className="text-sm font-medium"><Localize>{" Investigation Finding "}</Localize></p>
                          </div>

                          <Textarea
                            value={noteText}
                            onChange={(event) => setNoteText(event.target.value)}
                            readOnly={terminalOperatorControls}
                            aria-readonly={terminalOperatorControls}
                            placeholder={
                              terminalOperatorControls
                                ? t("Investigation findings are read-only while this incident is closed.")
                                : t("Document sampling results, field observations, source-attribution findings, or operator notes...")
                            }
                            className={`min-h-28 border-zinc-700 bg-zinc-900 ${
                              terminalOperatorControls
                                ? "cursor-default text-zinc-400"
                                : ""
                            }`}
                          />

                          {terminalOperatorControls ? (
                            <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-500"><Localize>{" New findings can be added after the incident is reopened. "}</Localize></div>
                          ) : (
                            <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                              variant="outline"
                              onClick={() =>
                                performMutation("notes", {
                                  author:
                                    operatorName.trim() || DEFAULT_OPERATOR,
                                  message: noteText.trim(),
                                  metadata: {
                                    source: "incident_investigation_ui",
                                  },
                                })
                              }
                              disabled={!noteText.trim() || mutating !== null}
                              className="mt-3 w-full border-zinc-700"
                            ><Localize>{" Add Finding "}</Localize></Button>
                          )}
                        </div>
                      </div>

                      <div
                        id="resolution-lifecycle"
                        className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-zinc-400" />
                          <p className="text-sm font-medium"><Localize>{" Resolution & Lifecycle "}</Localize></p>
                        </div>

                        <Textarea
                          value={resolutionSummary}
                          onChange={(event) =>
                            setResolutionSummary(event.target.value)
                          }
                          readOnly={terminalOperatorControls}
                          placeholder={t("Resolution summary required before resolving an incident.")}
                          className={`min-h-24 border-zinc-700 bg-zinc-900 ${
                            terminalOperatorControls
                              ? "cursor-default text-zinc-300"
                              : ""
                          }`}
                        />

                        <div className="mt-3 flex flex-wrap gap-3">
                          {!terminalOperatorControls && (
                            <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                              onClick={() =>
                                performMutation("resolve", {
                                  actor:
                                    operatorName.trim() || DEFAULT_OPERATOR,
                                  summary: resolutionSummary.trim(),
                                })
                              }
                              disabled={
                                !canResolve ||
                                !resolutionSummary.trim() ||
                                mutating !== null
                              }
                              className="bg-green-700 hover:bg-green-600"
                            ><Localize>{" Resolve Incident "}</Localize></Button>
                          )}

                          <Input
                            value={reasonText}
                            onChange={(event) =>
                              setReasonText(event.target.value)
                            }
                            placeholder={
                              terminalOperatorControls
                                ? t("Reason for reopening")
                                : t("Reason for reopen/cancel")
                            }
                            className="min-w-[240px] flex-1 border-zinc-700 bg-zinc-900"
                          />

                          <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                            variant="outline"
                            onClick={() =>
                              performMutation("reopen", {
                                actor:
                                  operatorName.trim() || DEFAULT_OPERATOR,
                                reason: reasonText.trim(),
                              })
                            }
                            disabled={
                              !canReopen ||
                              !reasonText.trim() ||
                              mutating !== null
                            }
                            className="border-orange-800 text-orange-300"
                          ><Localize>{" Reopen "}</Localize></Button>

                          {!terminalOperatorControls && (
                            <Button style={{ whiteSpace: "normal", height: "auto", minHeight: "2.5rem", overflowWrap: "anywhere", textAlign: "center" }}
                              variant="outline"
                              onClick={() =>
                                performMutation("cancel", {
                                  actor:
                                    operatorName.trim() || DEFAULT_OPERATOR,
                                  reason: reasonText.trim(),
                                })
                              }
                              disabled={
                                !canCancel ||
                                !reasonText.trim() ||
                                mutating !== null
                              }
                              className="border-red-900 text-red-300"
                            >
                              <XCircle className="mr-2 h-4 w-4" /><Localize>{" Cancel "}</Localize></Button>
                          )}
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                      <h3 className="font-semibold"><Localize>{"Investigation Notes"}</Localize></h3>
                      <p className="mb-4 text-xs text-zinc-500"><Localize>{" Durable operator findings associated with this workflow. "}</Localize></p>

                      {detail.notes.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500"><Localize>{" No investigation findings have been recorded yet. "}</Localize></div>
                      ) : (
                        <div className="space-y-3">
                          {[...detail.notes]
                            .reverse()
                            .map((note) => (
                              <div
                                key={note.id}
                                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                              >
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-sm font-medium">
                                    {note.author}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {dateText(note.authored_at)}
                                  </p>
                                </div>
                                <p className="whitespace-pre-wrap text-sm text-zinc-300">
                                  {note.message}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                      <h3 className="font-semibold"><Localize>{"Current Ownership"}</Localize></h3>

                      <div className="mt-4 space-y-4 text-sm">
                        <div>
                          <p className="text-xs text-zinc-500"><Localize>{" Acknowledged by "}</Localize></p>
                          <p className="mt-1">
                            {workflow.acknowledged_by || t("Unacknowledged")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500"><Localize>{" Assigned investigator "}</Localize></p>
                          <p className="mt-1">
                            {workflow.assigned_to || t("Not assigned")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500"><Localize>{"Assigned team"}</Localize></p>
                          <p className="mt-1">
                            {workflow.assigned_team || t("Not assigned")}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold"><Localize>{"Audit Timeline"}</Localize></h3>
                          <p className="text-xs text-zinc-500">
                            {detail.events.length}<Localize>{" persisted events "}</Localize></p>
                        </div>

                        <Clock3 className="h-5 w-5 text-zinc-500" />
                      </div>

                      <div className="space-y-4">
                        {[...detail.events]
                          .reverse()
                          .map((event, index) => (
                            <div
                              key={event.id}
                              className="relative pl-6"
                            >
                              {index < detail.events.length - 1 && (
                                <div className="absolute left-[7px] top-5 h-[calc(100%+4px)] w-px bg-zinc-800" />
                              )}

                              <div className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border border-amber-600 bg-zinc-950" />

                              <p className="text-sm font-medium">
                                {labelText(formatStatus(event.event_type))}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {dateText(event.occurred_at)}
                                {event.actor ? ` · ${event.actor}` : ""}
                              </p>
                              <p className="mt-1 text-xs text-zinc-400">
                                <GeneratedText value={event.message} />
                              </p>
                            </div>
                          ))}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Siren className="h-5 w-5 text-amber-400" />
                        <h3 className="font-semibold"><Localize>{"Response Deadlines"}</Localize></h3>
                      </div>

                      <div className="space-y-4 text-sm">
                        <div>
                          <p className="text-xs text-zinc-500"><Localize>{" Acknowledgement due "}</Localize></p>
                          <p className="mt-1">
                            {dateText(workflow.acknowledgement_due_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500"><Localize>{" Investigation due "}</Localize></p>
                          <p className="mt-1">
                            {dateText(workflow.investigation_due_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500"><Localize>{" Resolution due "}</Localize></p>
                          <p className="mt-1">
                            {dateText(workflow.resolution_due_at)}
                          </p>
                        </div>

                        {workflow.has_sla_breach && (
                          <div className="rounded-lg border border-red-800 bg-red-950/30 p-3 text-red-300"><Localize>{" SLA breach detected. "}</Localize></div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="mt-8 flex items-start gap-2 border-t border-zinc-900 pt-6 text-xs text-zinc-500">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p><Localize>{" FalilaX provides operational decision support. Incident workflow actions and source-attribution intelligence do not replace official regulatory testing, emergency response procedures, or public-health directives. "}</Localize></p>
        </div>
      </main>
    </div>
  );
}
