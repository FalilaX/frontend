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

type IncidentListResponse = {
  items: IncidentSummary[];
  count: number;
  limit: number;
  offset: number;
};

type IncidentDetailResponse = {
  incident: IncidentDetailRecord;
  workflow: WorkflowSummary | null;
  events: WorkflowEvent[];
  notes: WorkflowNote[];
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
  | "cancel";

const DEFAULT_OPERATOR = "FalilaX Operator";

const STATUS_ORDER = [
  "open",
  "acknowledged",
  "investigating",
  "action_required",
  "executing",
  "verifying",
  "resolved",
  "closed",
];

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
      const status = String(incident.status).toLowerCase();

      if (statusFilter === "active" && terminalStatuses.has(status)) {
        return false;
      }

      if (
        statusFilter !== "all" &&
        statusFilter !== "active" &&
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
  const currentStatus = String(
    workflow?.status ?? selected?.status ?? "",
  ).toLowerCase();

  const canAcknowledge =
    currentStatus === "open" || currentStatus === "reopened";
  const canInvestigate =
    currentStatus === "acknowledged" || currentStatus === "reopened";
  const canVerify = [
    "investigating",
    "action_plan_ready",
    "executing",
  ].includes(currentStatus);
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

  const workflowStepIndex = STATUS_ORDER.indexOf(currentStatus);

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

                  <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-8">
                    {STATUS_ORDER.map((step, index) => {
                      const complete =
                        workflowStepIndex >= 0 && index < workflowStepIndex;
                      const current = step === currentStatus;

                      return (
                        <div
                          key={step}
                          className={`rounded-xl border p-3 ${
                            current
                              ? "border-amber-600 bg-amber-950/30"
                              : complete
                                ? "border-green-900 bg-green-950/20"
                                : "border-zinc-800 bg-zinc-950/70"
                          }`}
                        >
                          <div className="mb-2">
                            {complete ? (
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            ) : current ? (
                              <Activity className="h-4 w-4 text-amber-400" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-zinc-700" />
                            )}
                          </div>
                          <p className="text-xs font-medium">
                            {formatStatus(step)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
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