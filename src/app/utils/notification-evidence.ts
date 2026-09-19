type EvidenceContext = {
  simulation?: unknown;
  data_mode?: unknown;
  source_type?: unknown;
  simulation_location?: unknown;
  location_label?: unknown;
  likely_source?: unknown;
  source_name?: unknown;
  source?: unknown;
};

export function simulationEvidence(notification: {
  incident_id?: string | null;
  event_type?: string | null;
  context?: EvidenceContext | null;
}) {
  const context = notification.context ?? {};
  const flag = context.simulation;
  const simulated = notification.incident_id?.startsWith("SIM-") === true ||
    notification.event_type?.toLowerCase() === "controlled_safety_simulation" ||
    String(context.source_type).toLowerCase() === "simulation" ||
    ["simulation", "synthetic", "demo", "test", "replay"].includes(String(context.data_mode).toLowerCase()) ||
    ["true", "1"].includes(String(flag).toLowerCase()) ||
    (flag !== null && typeof flag === "object");
  const location = [context.simulation_location, context.location_label,
    context.likely_source, context.source_name, context.source]
    .find((value): value is string => typeof value === "string" &&
      !!value.trim() && !["Not established", "Under investigation"].includes(value.trim()));
  return { simulated, location: location?.trim() || "Not specified" };
}
