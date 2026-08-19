import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  Siren,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

import { API_BASE_URL } from "@/app/config/api";
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
  source_type: string;
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
  source_type: string;
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
  source_intelligence: SourceIntelligence | null;
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
  | "actions/approve"
  | "actions/start-execution";

const DEFAULT_OPERATOR = "FalilaX Operator";

const STATUS_ORDER = [
  "open",
  "acknowledged",
  "investigating",
  "action_plan_ready",
  "awaiting_approval",
  "action_required",
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

export function IncidentInvestigation() {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    null,
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

  const apiFetch = useCallback(
    async <T,>(path: string, options?: RequestInit): Promise<T> => {
      const response = await fetch(`${API_BASE_URL}${path}`, {
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
  }, [apiFetch]);

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

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  useEffect(() => {
    if (!selectedIncidentId) {
      setDetail(null);
      return;
    }

    loadDetail(selectedIncidentId);
  }, [selectedIncidentId, loadDetail]);

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

  const selected = detail?.incident ?? null;
  const workflow = detail?.workflow ?? null;
  const sourceIntelligence = detail?.source_intelligence ?? null;
  const probableOriginAssets =
    sourceIntelligence?.probable_origin_assets ??
    sourceIntelligence?.topology?.probable_origin_assets ??
    [];
  const hydraulicEvidence = sourceIntelligence?.hydraulic_evidence ?? null;
  const actionPlan = detail?.action_plan ?? null;
  const incidentActions = detail?.actions ?? [];
  const hasActionPlan = (actionPlan?.count ?? 0) > 0;

  const currentStatus = normalizeWorkflowStatus(
    workflow?.status ?? selected?.status ?? "",
  );

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
  const canApproveActionPlan =
    ["awaiting_approval", "action_plan_ready"].includes(currentStatus) &&
    (actionPlan?.pending_approval_count ?? 0) > 0;
  const canStartActionExecution =
    ["awaiting_approval", "action_plan_ready"].includes(currentStatus) &&
    hasActionPlan &&
    Boolean(actionPlan?.ready_for_execution);
  const canVerify = ["investigating", "executing"].includes(currentStatus);
  const canResolve = currentStatus === "verifying";
  const canClose = currentStatus === "resolved";
  const canReopen = ["resolved", "closed", "cancelled"].includes(
    currentStatus,
  );
  const canCancel = !["closed", "cancelled"].includes(currentStatus);

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
          updated.workflow?.resolution_summary ?? resolutionSummary,
        );
      }
      if (mutation === "reopen" || mutation === "cancel") {
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-8">
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

              <nav className="hidden lg:flex items-center gap-6 text-sm">
                <Link
                  to="/dashboard"
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  Dashboard
                </Link>
                <Link
                  to="/map"
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  Community Map
                </Link>
                <Link
                  to="/attribution?siteId=1"
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  Source Attribution
                </Link>
                <Link
                  to="/incidents"
                  className="font-medium text-zinc-100"
                >
                  Investigation Workflow
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:inline-flex rounded-md border border-green-900 bg-green-950/30 px-3 py-1 text-xs text-green-300">
                Live Incident Workflow
              </span>

              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-amber-400">
              <ShieldCheck className="h-4 w-4" />
              Operator Investigation Workspace
            </div>

            <h1 className="text-3xl font-light">
              Incident Investigation Workflow
            </h1>

            <p className="mt-2 max-w-3xl text-sm text-zinc-400">
              Acknowledge incidents, assign responsibility, document
              investigation findings, verify corrective outcomes, and close
              incidents with a persistent audit trail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2">
              <p className="text-xs text-zinc-500">Operator</p>
              <Input
                value={operatorName}
                onChange={(event) => setOperatorName(event.target.value)}
                className="mt-1 h-8 w-52 border-zinc-700 bg-zinc-950"
              />
            </div>

            <Button
              variant="outline"
              onClick={loadIncidents}
              disabled={loadingList}
              className="border-zinc-700 bg-zinc-900"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  loadingList ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-200">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Workflow request failed</p>
              <p className="mt-1 text-red-300/90">{error}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/50">
            <div className="border-b border-zinc-800 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Incident Queue</h2>
                  <p className="text-xs text-zinc-500">
                    {filteredIncidents.length} shown · {incidents.length} total
                  </p>
                </div>

                <ClipboardList className="h-5 w-5 text-amber-400" />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search incidents..."
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
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[760px] overflow-y-auto p-3">
              {loadingList ? (
                <div className="p-8 text-center text-sm text-zinc-500">
                  Loading incident queue...
                </div>
              ) : filteredIncidents.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-green-500" />
                  <p className="font-medium">No matching incidents</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    FalilaX will place operational incidents here when they are
                    persisted by the Digital Twin lifecycle.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredIncidents.map((incident) => {
                    const active = incident.id === selectedIncidentId;

                    return (
                      <button
                        key={incident.id}
                        type="button"
                        onClick={() => setSelectedIncidentId(incident.id)}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          active
                            ? "border-amber-600 bg-amber-950/20"
                            : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
                        }`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <p className="line-clamp-2 text-sm font-medium">
                            {incident.title}
                          </p>

                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
                        </div>

                        <div className="mb-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded border px-2 py-0.5 text-[11px] ${severityClasses(
                              incident.severity,
                            )}`}
                          >
                            {formatStatus(incident.severity)}
                          </span>
                          <span
                            className={`rounded border px-2 py-0.5 text-[11px] ${statusClasses(
                              incident.status,
                            )}`}
                          >
                            {formatStatus(incident.status)}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-zinc-500">
                          <p>Node: {incident.source_node_id ?? "N/A"}</p>
                          <p>{formatDate(incident.detected_at)}</p>
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
                  <h2 className="text-xl font-medium">
                    No incident selected
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    Select an incident from the queue to open the investigation
                    workspace.
                  </p>
                </div>
              </div>
            ) : loadingDetail || !selected || !workflow ? (
              <div className="flex min-h-[620px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/30">
                <Activity className="mr-3 h-5 w-5 animate-pulse text-amber-400" />
                <span className="text-zinc-400">
                  Loading investigation workspace...
                </span>
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
                          {formatStatus(selected.severity)}
                        </span>
                        <span
                          className={`rounded-md border px-2.5 py-1 text-xs ${statusClasses(
                            workflow.status,
                          )}`}
                        >
                          {formatStatus(workflow.status)}
                        </span>
                        {selected.is_emergency && (
                          <span className="rounded-md border border-red-700 bg-red-950/50 px-2.5 py-1 text-xs text-red-200">
                            Emergency
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-semibold">
                        {selected.title}
                      </h2>

                      <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                        {selected.description || "No incident description."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-500">
                        <span>Incident: {selected.id}</span>
                        <span>Event: {selected.event_type ?? "N/A"}</span>
                        <span>Node: {selected.source_node_id ?? "N/A"}</span>
                        <span>Detected: {formatDate(selected.detected_at)}</span>
                      </div>
                    </div>

                    <div className="grid min-w-[280px] grid-cols-2 gap-3">
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                        <p className="text-xs text-zinc-500">Affected assets</p>
                        <p className="mt-1 text-2xl font-semibold">
                          {selected.affected_asset_count}
                        </p>
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                        <p className="text-xs text-zinc-500">Audit events</p>
                        <p className="mt-1 text-2xl font-semibold">
                          {workflow.event_count}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Investigation Progress
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Persistent workflow state from detection to closure.
                      </p>
                    </div>

                    <Clock3 className="h-5 w-5 text-amber-400" />
                  </div>

                  <div className="grid gap-2 md:grid-cols-5 xl:grid-cols-10">
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
                            {formatStatus(step)}
                          </p>

                          <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-600">
                            {current
                              ? "Current"
                              : completed
                                ? "Visited"
                                : skipped
                                  ? "Skipped"
                                  : "Pending"}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {!STATUS_ORDER.includes(currentStatus) && currentStatus && (
                    <div className="mt-4 rounded-lg border border-orange-900 bg-orange-950/20 px-3 py-2 text-xs text-orange-300">
                      Current workflow state: {formatStatus(currentStatus)}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-zinc-500">
                    <span>Green = state actually visited</span>
                    <span>Amber = current state</span>
                    <span>Dashed = skipped state</span>
                    <span>Dim = pending state</span>
                  </div>
                </section>

                <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                      <Activity className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                      <div>
                        <h3 className="text-lg font-semibold">
                          Source Intelligence
                        </h3>
                        <p className="mt-1 max-w-3xl text-sm text-zinc-500">
                          Incident-linked upstream topology evidence from the
                          explicit source asset. This investigation view does
                          not infer a site identity from an asset or node ID.
                        </p>
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
                          {formatStatus(sourceIntelligence.status)}
                        </span>
                        <span className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-400">
                          Engine v{sourceIntelligence.engine_version}
                        </span>
                      </div>
                    )}
                  </div>

                  {!sourceIntelligence ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-5 text-sm text-zinc-500">
                      Source intelligence was not returned for this incident.
                    </div>
                  ) : !sourceIntelligence.available ? (
                    <div className="rounded-xl border border-amber-900/70 bg-amber-950/20 p-5">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                        <div>
                          <p className="font-medium text-amber-200">
                            {sourceIntelligence.headline}
                          </p>
                          <p className="mt-2 text-sm text-zinc-400">
                            {sourceIntelligence.summary}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-500">
                            <span>
                              Source asset ID:{" "}
                              {sourceIntelligence.source_identity
                                ?.source_asset_id ?? "Unavailable"}
                            </span>
                            <span>
                              Digital Twin node ID:{" "}
                              {sourceIntelligence.source_identity
                                ?.source_node_id ?? "Unavailable"}
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
                              {sourceIntelligence.headline}
                            </p>
                            <p className="mt-1 max-w-4xl text-sm text-zinc-400">
                              {sourceIntelligence.summary}
                            </p>
                          </div>

                          <div className="shrink-0 text-xs text-zinc-500">
                            {sourceIntelligence.generated_at
                              ? `Updated ${formatDate(
                                  sourceIntelligence.generated_at,
                                )}`
                              : ""}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-3">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500">
                            Explicit source asset
                          </p>
                          <p className="mt-2 text-base font-semibold">
                            {sourceIntelligence.target_asset?.asset_name ??
                              "Not available"}
                          </p>
                          <p className="mt-1 text-sm text-zinc-400">
                            {sourceIntelligence.target_asset?.asset_type ??
                              "Unknown asset type"}
                          </p>
                          <div className="mt-3 space-y-1 text-xs text-zinc-500">
                            <p>
                              Asset ID:{" "}
                              {sourceIntelligence.source_identity
                                ?.source_asset_id ?? "N/A"}
                            </p>
                            <p>
                              Digital Twin node ID:{" "}
                              {sourceIntelligence.source_identity
                                ?.source_node_id ?? "N/A"}
                            </p>
                            <p>
                              Identity:{" "}
                              {formatStatus(
                                sourceIntelligence.source_identity
                                  ?.identity_resolution,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500">
                            Upstream topology
                          </p>
                          <p className="mt-2 text-3xl font-semibold">
                            {
                              sourceIntelligence.topology
                                .upstream_relationship_count
                            }
                          </p>
                          <p className="mt-1 text-sm text-zinc-400">
                            Active upstream relationship
                            {sourceIntelligence.topology
                              .upstream_relationship_count === 1
                              ? ""
                              : "s"}
                          </p>
                          <div className="mt-3 text-xs text-zinc-500">
                            <p>
                              Topology used:{" "}
                              {sourceIntelligence.topology.used ? "Yes" : "No"}
                            </p>
                            <p>
                              Search depth:{" "}
                              {sourceIntelligence.topology.max_depth}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500">
                            Hydraulic evidence
                          </p>
                          <p className="mt-2 text-base font-semibold">
                            {formatStatus(hydraulicEvidence?.status)}
                          </p>
                          <div className="mt-3 space-y-1 text-xs text-zinc-500">
                            <p>
                              Relationship confidence:{" "}
                              {hydraulicEvidence
                                ?.relationship_confidence_available
                                ? "Available"
                                : "Unavailable"}
                            </p>
                            <p>
                              Distance metadata:{" "}
                              {hydraulicEvidence?.distance_available
                                ? "Available"
                                : "Unavailable"}
                            </p>
                            <p>
                              Travel-time metadata:{" "}
                              {hydraulicEvidence?.travel_time_available
                                ? "Available"
                                : "Unavailable"}
                            </p>
                            <p>
                              Hydraulic model ready:{" "}
                              {hydraulicEvidence?.hydraulic_model_ready
                                ? "Yes"
                                : "No"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
                        <div>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <h4 className="font-medium">
                                Probable Upstream Origin Assets
                              </h4>
                              <p className="text-xs text-zinc-500">
                                Ranked topology candidates for operator
                                investigation.
                              </p>
                            </div>
                            <span className="text-xs text-zinc-500">
                              {probableOriginAssets.length} candidate
                              {probableOriginAssets.length === 1 ? "" : "s"}
                            </span>
                          </div>

                          {probableOriginAssets.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-5 text-sm text-zinc-500">
                              No upstream origin assets were resolved.
                            </div>
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
                                          {candidate.asset_type}
                                        </span>
                                      </div>

                                      <div className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2 xl:grid-cols-3">
                                        <p>
                                          Asset ID: {candidate.asset_id}
                                        </p>
                                        <p>
                                          Depth: {candidate.depth} step
                                          {candidate.depth === 1 ? "" : "s"}{" "}
                                          upstream
                                        </p>
                                        <p>
                                          Relationship:{" "}
                                          {formatStatus(
                                            candidate.relationship_type,
                                          )}
                                        </p>
                                        <p>
                                          Confidence:{" "}
                                          {formatConfidence(
                                            candidate.relationship_confidence,
                                          )}
                                        </p>
                                        <p>
                                          Distance:{" "}
                                          {candidate.distance_meters === null
                                            ? "Not available"
                                            : `${formatNumber(
                                                candidate.distance_meters,
                                                1,
                                              )} m`}
                                        </p>
                                        <p>
                                          Travel time:{" "}
                                          {candidate.estimated_travel_time_minutes ===
                                          null
                                            ? "Not available"
                                            : `${formatNumber(
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
                                                • {item}
                                              </p>
                                            ))}
                                        </div>
                                      )}
                                    </div>

                                    <div className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-right">
                                      <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                                        Topology score
                                      </p>
                                      <p className="mt-1 text-lg font-semibold text-cyan-300">
                                        {formatNumber(candidate.score, 3)}
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
                            <h4 className="font-medium">Evidence Support</h4>
                            <p className="mt-1 text-xs text-zinc-500">
                              Relative topology evidence by source class; these
                              values are not site-level probabilities.
                            </p>

                            <div className="mt-4 space-y-3">
                              {(sourceIntelligence.source_type_support ?? [])
                                .filter((item) => item.score > 0)
                                .map((item) => (
                                  <div key={item.source_type}>
                                    <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                                      <span className="text-zinc-300">
                                        {formatStatus(item.source_type)}
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
                                    <p className="mt-1 text-[10px] text-zinc-600">
                                      Score {formatNumber(item.score, 3)} ·{" "}
                                      {item.evidence_count} evidence item
                                      {item.evidence_count === 1 ? "" : "s"}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                            <h4 className="font-medium">
                              Hydraulic Readiness
                            </h4>

                            <div className="mt-3 space-y-2 text-xs text-zinc-500">
                              <div className="flex items-center justify-between gap-3">
                                <span>Relationship confidence coverage</span>
                                <span className="text-zinc-300">
                                  {hydraulicEvidence
                                    ?.relationship_confidence_coverage
                                    ?.percent ?? 0}
                                  %
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span>Distance coverage</span>
                                <span className="text-zinc-300">
                                  {hydraulicEvidence?.distance_coverage
                                    ?.percent ?? 0}
                                  %
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span>Travel-time coverage</span>
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
                                  {hydraulicEvidence.hydraulic_model_reason}
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
                              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Investigation limitations
                              </p>
                              <div className="mt-2 space-y-1">
                                {sourceIntelligence.limitations
                                  .slice(0, 5)
                                  .map((limitation, index) => (
                                    <p
                                      key={index}
                                      className="text-xs text-zinc-500"
                                    >
                                      • {limitation}
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
                        <h3 className="text-lg font-semibold">
                          Operator Action Plan
                        </h3>
                        <p className="mt-1 max-w-3xl text-sm text-zinc-500">
                          Durable incident actions generated from the current
                          event, severity, impact, and explicit source asset.
                          Approval gates are enforced before workflow execution.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-400">
                        {actionPlan?.count ?? 0} persisted action
                        {(actionPlan?.count ?? 0) === 1 ? "" : "s"}
                      </span>
                      {hasActionPlan && (
                        <span
                          className={`rounded-md border px-2.5 py-1 text-xs ${
                            actionPlan?.ready_for_execution
                              ? "border-green-800 bg-green-950/30 text-green-300"
                              : "border-amber-800 bg-amber-950/30 text-amber-300"
                          }`}
                        >
                          {actionPlan?.ready_for_execution
                            ? "Ready for execution"
                            : "Approval required"}
                        </span>
                      )}
                    </div>
                  </div>

                  {!hasActionPlan ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="font-medium text-zinc-200">
                            No durable action plan has been created.
                          </p>
                          <p className="mt-1 max-w-3xl text-sm text-zinc-500">
                            Start the investigation first, then let FalilaX
                            generate the operator action plan. The plan is
                            persisted and remains separate from physical utility
                            control execution.
                          </p>
                        </div>

                        <Button
                          onClick={() =>
                            performMutation("actions/plan", {
                              actor: operatorName.trim() || DEFAULT_OPERATOR,
                            })
                          }
                          disabled={!canCreateActionPlan || mutating !== null}
                          className="shrink-0 bg-violet-700 hover:bg-violet-600"
                        >
                          {mutating === "actions/plan"
                            ? "Creating..."
                            : "Create Action Plan"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500">
                            Total actions
                          </p>
                          <p className="mt-2 text-2xl font-semibold">
                            {actionPlan?.count ?? 0}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500">
                            Approval-gated
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-amber-300">
                            {actionPlan?.requires_approval_count ?? 0}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500">
                            Pending approval
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-amber-300">
                            {actionPlan?.pending_approval_count ?? 0}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <p className="text-xs uppercase tracking-wide text-zinc-500">
                            Approved
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-green-300">
                            {actionPlan?.approved_count ?? 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Action-plan gate
                          </p>
                          <p className="mt-1 max-w-3xl text-xs text-zinc-500">
                            {actionPlan?.safety_note ||
                              "Workflow execution does not issue physical utility control commands."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button
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
                              ? "Approving..."
                              : "Approve Pending Actions"}
                          </Button>

                          <Button
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
                              ? "Starting..."
                              : "Start Execution"}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <h4 className="font-medium">Persisted Actions</h4>
                            <p className="text-xs text-zinc-500">
                              Ranked operator actions for this incident.
                            </p>
                          </div>
                          <span className="text-xs text-zinc-500">
                            {incidentActions.length} action
                            {incidentActions.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        <div className="grid gap-3 xl:grid-cols-2">
                          {incidentActions.map((action) => (
                            <div
                              key={action.id}
                              className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
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
                                      {formatStatus(action.risk)} risk
                                    </span>
                                    <span
                                      className={`rounded border px-2 py-0.5 text-[11px] ${actionStatusClasses(
                                        action.status,
                                      )}`}
                                    >
                                      {formatStatus(action.status)}
                                    </span>
                                  </div>

                                  <p className="mt-2 text-sm text-zinc-400">
                                    {action.description}
                                  </p>
                                </div>

                                <div className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-right">
                                  <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                                    Priority
                                  </p>
                                  <p className="mt-1 text-lg font-semibold">
                                    {action.priority}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2 xl:grid-cols-3">
                                <p>
                                  Type: {formatStatus(action.action_type)}
                                </p>
                                <p>
                                  Mode:{" "}
                                  {formatStatus(action.execution_mode)}
                                </p>
                                <p>
                                  Target asset:{" "}
                                  {action.target_asset_id ?? "N/A"}
                                </p>
                                <p>
                                  Approval:{" "}
                                  {action.requires_approval
                                    ? action.approval_role
                                      ? `Required (${action.approval_role})`
                                      : "Required"
                                    : "Not required"}
                                </p>
                                <p>
                                  Proposed: {formatDate(action.proposed_at)}
                                </p>
                                <p>
                                  Expires: {formatDate(action.expires_at)}
                                </p>
                              </div>

                              {action.reason && (
                                <p className="mt-3 text-xs text-zinc-500">
                                  {action.reason}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
                  <div className="space-y-6">
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                      <div className="mb-5 flex items-center gap-3">
                        <UserCheck className="h-5 w-5 text-amber-400" />
                        <div>
                          <h3 className="font-semibold">
                            Operator Controls
                          </h3>
                          <p className="text-xs text-zinc-500">
                            Actions are validated by the backend workflow
                            engine.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Button
                          onClick={() =>
                            performMutation("acknowledge", {
                              acknowledged_by:
                                operatorName.trim() || DEFAULT_OPERATOR,
                            })
                          }
                          disabled={!canAcknowledge || mutating !== null}
                          className="bg-blue-700 hover:bg-blue-600"
                        >
                          Acknowledge
                        </Button>

                        <Button
                          onClick={() =>
                            performMutation("investigate", {
                              actor: operatorName.trim() || DEFAULT_OPERATOR,
                            })
                          }
                          disabled={!canInvestigate || mutating !== null}
                          className="bg-amber-700 hover:bg-amber-600"
                        >
                          Start Investigation
                        </Button>

                        <Button
                          onClick={() =>
                            performMutation("verify", {
                              actor: operatorName.trim() || DEFAULT_OPERATOR,
                            })
                          }
                          disabled={!canVerify || mutating !== null}
                          className="bg-cyan-700 hover:bg-cyan-600"
                        >
                          Start Verification
                        </Button>

                        <Button
                          onClick={() =>
                            performMutation("close", {
                              actor: operatorName.trim() || DEFAULT_OPERATOR,
                            })
                          }
                          disabled={!canClose || mutating !== null}
                          className="bg-green-700 hover:bg-green-600"
                        >
                          Close Incident
                        </Button>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-zinc-400" />
                            <p className="text-sm font-medium">Assignment</p>
                          </div>

                          <div className="space-y-3">
                            <Input
                              value={assignedTo}
                              onChange={(event) =>
                                setAssignedTo(event.target.value)
                              }
                              placeholder="Assigned investigator"
                              className="border-zinc-700 bg-zinc-900"
                            />
                            <Input
                              value={assignedTeam}
                              onChange={(event) =>
                                setAssignedTeam(event.target.value)
                              }
                              placeholder="Assigned team"
                              className="border-zinc-700 bg-zinc-900"
                            />
                            <Button
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
                            >
                              Save Assignment
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-zinc-400" />
                            <p className="text-sm font-medium">
                              Investigation Finding
                            </p>
                          </div>

                          <Textarea
                            value={noteText}
                            onChange={(event) => setNoteText(event.target.value)}
                            placeholder="Document sampling results, field observations, source-attribution findings, or operator notes..."
                            className="min-h-28 border-zinc-700 bg-zinc-900"
                          />

                          <Button
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
                          >
                            Add Finding
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-zinc-400" />
                          <p className="text-sm font-medium">
                            Resolution & Lifecycle
                          </p>
                        </div>

                        <Textarea
                          value={resolutionSummary}
                          onChange={(event) =>
                            setResolutionSummary(event.target.value)
                          }
                          placeholder="Resolution summary required before resolving an incident."
                          className="min-h-24 border-zinc-700 bg-zinc-900"
                        />

                        <div className="mt-3 flex flex-wrap gap-3">
                          <Button
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
                          >
                            Resolve Incident
                          </Button>

                          <Input
                            value={reasonText}
                            onChange={(event) =>
                              setReasonText(event.target.value)
                            }
                            placeholder="Reason for reopen/cancel"
                            className="min-w-[240px] flex-1 border-zinc-700 bg-zinc-900"
                          />

                          <Button
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
                          >
                            Reopen
                          </Button>

                          <Button
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
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                      <h3 className="font-semibold">Investigation Notes</h3>
                      <p className="mb-4 text-xs text-zinc-500">
                        Durable operator findings associated with this
                        workflow.
                      </p>

                      {detail.notes.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
                          No investigation findings have been recorded yet.
                        </div>
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
                                    {formatDate(note.authored_at)}
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
                      <h3 className="font-semibold">Current Ownership</h3>

                      <div className="mt-4 space-y-4 text-sm">
                        <div>
                          <p className="text-xs text-zinc-500">
                            Acknowledged by
                          </p>
                          <p className="mt-1">
                            {workflow.acknowledged_by || "Unacknowledged"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500">
                            Assigned investigator
                          </p>
                          <p className="mt-1">
                            {workflow.assigned_to || "Not assigned"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-500">Assigned team</p>
                          <p className="mt-1">
                            {workflow.assigned_team || "Not assigned"}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Audit Timeline</h3>
                          <p className="text-xs text-zinc-500">
                            {detail.events.length} persisted events
                          </p>
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
                                {formatStatus(event.event_type)}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {formatDate(event.occurred_at)}
                                {event.actor ? ` · ${event.actor}` : ""}
                              </p>
                              <p className="mt-1 text-xs text-zinc-400">
                                {event.message}
                              </p>
                            </div>
                          ))}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Siren className="h-5 w-5 text-amber-400" />
                        <h3 className="font-semibold">Response Deadlines</h3>
                      </div>

                      <div className="space-y-4 text-sm">
                        <div>
                          <p className="text-xs text-zinc-500">
                            Acknowledgement due
                          </p>
                          <p className="mt-1">
                            {formatDate(workflow.acknowledgement_due_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">
                            Investigation due
                          </p>
                          <p className="mt-1">
                            {formatDate(workflow.investigation_due_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">
                            Resolution due
                          </p>
                          <p className="mt-1">
                            {formatDate(workflow.resolution_due_at)}
                          </p>
                        </div>

                        {workflow.has_sla_breach && (
                          <div className="rounded-lg border border-red-800 bg-red-950/30 p-3 text-red-300">
                            SLA breach detected.
                          </div>
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
          <p>
            FalilaX provides operational decision support. Incident workflow
            actions and source-attribution intelligence do not replace official
            regulatory testing, emergency response procedures, or public-health
            directives.
          </p>
        </div>
      </main>
    </div>
  );
}