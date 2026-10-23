import React from "react";

const STAGES = [
  {
    id: "ingestion",
    number: "01",
    title: "Ingestion",
    description: "Incoming observation enters the intelligence path.",
  },
  {
    id: "fingerprint",
    number: "02",
    title: "Water Fingerprint",
    description: "Current water-state measurements are established.",
  },
  {
    id: "multi",
    number: "03",
    title: "Multi-Parameter Intelligence",
    description: "Signals are interpreted together rather than independently.",
  },
  {
    id: "source",
    number: "04",
    title: "Source Attribution",
    description: "The system evaluates the most likely origin.",
  },
  {
    id: "spatial",
    number: "05",
    title: "Spatial Localization",
    description: "The intelligence path evaluates where the event is localized.",
  },
  {
    id: "physiology",
    number: "06",
    title: "Digital Physiology",
    description: "The evolving state of the water system is interpreted.",
  },
  {
    id: "twin",
    number: "07",
    title: "Digital Twin",
    description: "Network impact and propagation are evaluated.",
  },
  {
    id: "incident",
    number: "08",
    title: "Incident Intelligence",
    description: "The operational significance becomes an incident decision.",
  },
  {
    id: "action",
    number: "09",
    title: "Recommended Action",
    description: "The intelligence path produces an operational response.",
  },
  {
    id: "pulse",
    number: "10",
    title: "Water Pulse",
    description: "The resulting operational signal reaches the notification layer.",
  },
  {
    id: "evidence",
    number: "11",
    title: "Evidence",
    description: "The intelligence path remains inspectable and auditable.",
  },
];

function hasObject(value) {
  return Boolean(value && typeof value === "object");
}

function hasKeys(value) {
  return hasObject(value) && Object.keys(value).length > 0;
}

function normalizedText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isExplicitlyUnestablished(value) {
  const text = normalizedText(value);

  return (
    !text ||
    text.includes("undetermined") ||
    text.includes("not established") ||
    text.includes("not evaluated") ||
    text.includes("not available") ||
    text.includes("unknown") ||
    text.includes("insufficient") ||
    text.includes("no substantive") ||
    text.includes("not exposed")
  );
}

function hasSubstantiveObject(value) {
  if (!hasKeys(value)) return false;

  const serialized = normalizedText(JSON.stringify(value));

  return !(
    serialized.includes("not evaluated") &&
    serialized.includes("not exposed")
  );
}

function hasSubstantiveImpact(report) {
  const candidates = [
    report?.prediction,
    report?.impact,
    report?.digital_twin,
  ];

  return candidates.some((candidate) => {
    if (!hasSubstantiveObject(candidate)) return false;

    if (
      candidate?.evaluated === false ||
      candidate?.impact_evaluated === false ||
      candidate?.propagation_evaluated === false
    ) {
      return false;
    }

    const explicitSignals = [
      candidate?.evaluated === true,
      candidate?.impact_evaluated === true,
      candidate?.propagation_evaluated === true,
      candidate?.arrival_times,
      candidate?.hydraulic_arrival_times,
      candidate?.affected_assets,
      candidate?.affected_node_ids,
      candidate?.propagation,
      candidate?.paths,
      candidate?.predictions,
    ];

    return explicitSignals.some((signal) => {
      if (signal === true) return true;
      if (Array.isArray(signal)) return signal.length > 0;
      if (hasObject(signal)) return hasKeys(signal);
      return false;
    });
  });
}

function deriveStageState(report, id) {

  if (!report) {
    return {
      state: "WAITING",
      evidence: "Awaiting an intelligence run",
    };
  }

  /*
   * The incident-detail API can expose the canonical intelligence report
   * directly or inside one of several execution/detail envelopes.
   *
   * The X-Ray deliberately inspects only explicit runtime outputs.
   * Capability names alone never make a stage LIVE.
   */
  const sources = [
    report,
    report?.report,
    report?.detail,
    report?.execution,
    report?.runtime_result,
    report?.runtime,
    report?.intelligence,
    report?.node_intelligence,
    report?.incident,
    report?.lifecycle,
  ].filter(hasObject);

  const firstObject = (...paths) => {
    for (const source of sources) {
      for (const path of paths) {
        const parts = path.split(".");
        let value = source;

        for (const part of parts) {
          if (!hasObject(value)) {
            value = undefined;
            break;
          }
          value = value[part];
        }

        if (hasKeys(value)) {
          return value;
        }
      }
    }

    return null;
  };

  const firstArray = (...paths) => {
    for (const source of sources) {
      for (const path of paths) {
        const parts = path.split(".");
        let value = source;

        for (const part of parts) {
          if (!hasObject(value)) {
            value = undefined;
            break;
          }
          value = value[part];
        }

        if (Array.isArray(value) && value.length > 0) {
          return value;
        }
      }
    }

    return null;
  };

  const firstValue = (...paths) => {
    for (const source of sources) {
      for (const path of paths) {
        const parts = path.split(".");
        let value = source;

        for (const part of parts) {
          if (!hasObject(value)) {
            value = undefined;
            break;
          }
          value = value[part];
        }

        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          return value;
        }
      }
    }

    return null;
  };

  const evaluatedState = (value) => {
    const text = normalizedText(value);

    return (
      text === "evaluated" ||
      text === "complete" ||
      text === "completed" ||
      text === "live" ||
      text === "success" ||
      text === "successful"
    );
  };

  const explicitlyNotEvaluated = (value) => {
    const text = normalizedText(value);

    return (
      text === "not_evaluated" ||
      text === "not evaluated" ||
      text.includes("not evaluated")
    );
  };

  const hasMeaningfulResult = (value) => {
    if (!hasKeys(value)) return false;

    const serialized = normalizedText(JSON.stringify(value));

    if (
      serialized.includes("not exposed") &&
      serialized.includes("not evaluated")
    ) {
      return false;
    }

    return true;
  };

  switch (id) {
    case "ingestion":
      return {
        state: "LIVE",
        evidence: "Incident-detail report received from the runtime path",
      };

    case "fingerprint": {
      const analyses =
        firstObject(
          "intelligence.node_intelligence.analyses",
          "node_intelligence.analyses",
          "incident.intelligence.node_intelligence.analyses",
          "report.intelligence.node_intelligence.analyses",
          "intelligence.analyses"
        );

      if (analyses && Object.keys(analyses).length > 0) {
        const count = Object.keys(analyses).length;

        return {
          state: "LIVE",
          evidence: `Water Fingerprint established from runtime water-state intelligence (${count} parameter analyses)`,
        };
      }

      const measurements =
        firstObject(
          "measurements",
          "water_fingerprint",
          "fingerprint",
          "intelligence.measurements",
          "runtime_result.measurements"
        ) ||
        firstArray(
          "measurements",
          "measurement_history",
          "observations"
        );

      if (measurements) {
        const count = Array.isArray(measurements)
          ? measurements.length
          : Object.keys(measurements).length;

        return {
          state: "LIVE",
          evidence: `Water-state measurement payload present (${count} field(s)/record(s))`,
        };
      }

      return {
        state: "NOT EXPOSED",
        evidence: "Water Fingerprint measurement payload is not exposed in this report",
      };
    }

    case "multi": {
      const analyses =
        firstObject(
          "intelligence.node_intelligence.analyses",
          "node_intelligence.analyses",
          "incident.intelligence.node_intelligence.analyses",
          "report.intelligence.node_intelligence.analyses",
          "intelligence.analyses"
        );

      if (analyses && Object.keys(analyses).length >= 2) {
        const parameterCount = Object.keys(analyses).length;

        return {
          state: "LIVE",
          evidence: `Multi-parameter intelligence executed across ${parameterCount} parameter analyses`,
        };
      }

      const multiPayload =
        firstObject(
          "multi_parameter_event",
          "multi_parameter",
          "multi_parameter_intelligence",
          "intelligence.multi_parameter_event",
          "intelligence.multi_parameter",
          "node_intelligence.multi_parameter",
          "runtime_result.multi_parameter_event"
        );

      if (!multiPayload) {
        return {
          state: "NOT EXPOSED",
          evidence: "No substantive multi-parameter intelligence output exposed",
        };
      }

      const status =
        firstValue(
          "multi_parameter_event.status",
          "multi_parameter.status",
          "multi_parameter_intelligence.status",
          "intelligence.multi_parameter_event.status",
          "intelligence.multi_parameter.status"
        );

      const evaluated =
        firstValue(
          "multi_parameter_event.evaluated",
          "multi_parameter.evaluated",
          "multi_parameter_intelligence.evaluated",
          "intelligence.multi_parameter_event.evaluated",
          "intelligence.multi_parameter.evaluated"
        );

      if (
        evaluated === false ||
        explicitlyNotEvaluated(status)
      ) {
        return {
          state: "EVALUATED",
          evidence: "Multi-parameter pathway was executed but did not establish a substantive result",
        };
      }

      if (
        evaluated === true ||
        evaluatedState(status) ||
        hasMeaningfulResult(multiPayload)
      ) {
        return {
          state: "LIVE",
          evidence: "Multi-parameter intelligence output detected from the runtime execution",
        };
      }

      return {
        state: "EVALUATED",
        evidence: "Multi-parameter pathway was assessed but no substantive result was established",
      };
    }
    case "source": {
      const sourceIntelligence =
        firstObject(
          "source_intelligence",
          "intelligence.source_intelligence",
          "incident.source_intelligence",
          "runtime_result.source_intelligence"
        );

      if (!sourceIntelligence) {
        return {
          state: "NOT EXPOSED",
          evidence: "Source-attribution result is not exposed in this report",
        };
      }

      const sourceIdentity =
        firstObject(
          "source_intelligence.source_identity",
          "source_identity",
          "intelligence.source_intelligence.source_identity"
        );

      const targetAsset =
        firstObject(
          "source_intelligence.target_asset",
          "target_asset",
          "intelligence.source_intelligence.target_asset"
        );

      const probableOrigins =
        firstArray(
          "source_intelligence.probable_origin_assets",
          "probable_origin_assets",
          "intelligence.source_intelligence.probable_origin_assets"
        );

      const topology =
        firstObject(
          "source_intelligence.topology",
          "topology",
          "intelligence.source_intelligence.topology"
        );

      const headline =
        firstValue(
          "source_intelligence.headline",
          "headline",
          "intelligence.source_intelligence.headline"
        );

      const summary =
        firstValue(
          "source_intelligence.summary",
          "summary",
          "intelligence.source_intelligence.summary"
        );

      const status =
        firstValue(
          "source_intelligence.status",
          "status",
          "intelligence.source_intelligence.status"
        );

      const cause =
        firstValue(
          "source_intelligence.most_likely_cause",
          "source_intelligence.established_cause",
          "source_intelligence.source",
          "most_likely_cause",
          "established_cause",
          "source",
          "origin"
        );

      const explicitOriginEstablished =
        Boolean(cause) &&
        !isExplicitlyUnestablished(cause);

      const upstreamCount = Number(
        topology?.upstream_relationship_count ??
        sourceIntelligence?.upstream_relationship_count ??
        0
      );

      if (explicitOriginEstablished) {
        return {
          state: "LIVE",
          evidence: `Most-likely source/cause established: ${cause}`,
        };
      }

      if (
        Array.isArray(probableOrigins) &&
        probableOrigins.length > 0
      ) {
        return {
          state: "EVALUATED",
          evidence:
            `${probableOrigins.length} probable source origin candidate(s) identified; ` +
            "origin requires operational confirmation",
        };
      }

      if (
        sourceIdentity ||
        targetAsset ||
        headline ||
        summary ||
        status ||
        upstreamCount >= 0
      ) {
        const assetName =
          targetAsset?.asset_name ||
          targetAsset?.name;

        if (assetName) {
          return {
            state: "EVALUATED",
            evidence:
              `Source asset resolved: ${assetName}; ` +
              "origin was not established",
          };
        }

        if (
          status === "target_resolved_no_upstream_topology" ||
          upstreamCount === 0
        ) {
          return {
            state: "EVALUATED",
            evidence:
              "Source asset was resolved, but no upstream topology path was available; origin was not established",
          };
        }

        return {
          state: "EVALUATED",
          evidence:
            "Source-attribution pathway was evaluated; origin was not established",
        };
      }

      return {
        state: "EVALUATED",
        evidence:
          "Source-attribution pathway was evaluated; origin was not established",
      };
    }
    case "physiology": {
      const physiology =
        firstObject(
          "digital_physiology",
          "physiology",
          "physiological_state",
          "water_state",
          "intelligence.digital_physiology",
          "intelligence.physiology",
          "intelligence.physiological_state",
          "intelligence.water_state",
          "runtime_result.digital_physiology",
          "runtime_result.water_state"
        );

      if (physiology && hasMeaningfulResult(physiology)) {
        return {
          state: "LIVE",
          evidence: "Digital Physiology/system-state interpretation detected in the execution output",
        };
      }

      return {
        state: "NOT EXPOSED",
        evidence: "Digital Physiology payload is not exposed in this report",
      };
    }

    case "twin": {
      const twinPayload =
        firstObject(
          "digital_twin",
          "prediction",
          "impact",
          "propagation",
          "intelligence.digital_twin",
          "intelligence.prediction",
          "intelligence.impact",
          "runtime_result.digital_twin",
          "runtime_result.impact"
        );

      const affectedNodes =
        firstArray(
          "affected_nodes",
          "affected_node_ids",
          "digital_twin.affected_nodes",
          "digital_twin.affected_node_ids",
          "impact.affected_nodes",
          "impact.affected_node_ids",
          "propagation.affected_nodes"
        );

      const propagation =
        firstObject(
          "propagation_intelligence",
          "report.propagation_intelligence",
          "detail.propagation_intelligence",
          "digital_twin.propagation",
          "prediction.propagation",
          "impact.propagation",
          "propagation"
        );

      const hasCanonicalPropagation =
        propagation &&
        hasSubstantiveObject(propagation) &&
        (
          propagation.path_count > 0 ||
          (
            Array.isArray(propagation.potentially_affected_asset_ids) &&
            propagation.potentially_affected_asset_ids.length > 0
          ) ||
          (
            Array.isArray(propagation.path_estimates) &&
            propagation.path_estimates.length > 0
          )
        );

      if (
        hasSubstantiveImpact(report) ||
        (
          twinPayload &&
          (
            twinPayload.evaluated === true ||
            twinPayload.impact_evaluated === true ||
            twinPayload.propagation_evaluated === true
          )
        ) ||
        (Array.isArray(affectedNodes) && affectedNodes.length > 0) ||
        (
          hasCanonicalPropagation &&
          !isExplicitlyUnestablished(propagation?.status)
        )
      ) {
        return {
          state: "LIVE",
          evidence: "Digital Twin impact/propagation intelligence is present",
        };
      }

      if (
        hasKeys(
          firstObject(
            "digital_twin",
            "prediction",
            "impact"
          )
        )
      ) {
        return {
          state: "EVALUATED",
          evidence: "Digital Twin pathway was assessed but substantive network impact was not established",
        };
      }

      return {
        state: "NOT EXPOSED",
        evidence: "Digital Twin impact/propagation payload is not exposed in this report",
      };
    }

    case "incident": {
      const incident =
        firstObject(
          "incident",
          "incident_intelligence",
          "intelligence.incident",
          "intelligence.incident_intelligence",
          "lifecycle.incident"
        );

      const canonicalIncident =
        report?.incident ??
        report?.report?.incident ??
        report?.detail?.incident ??
        report?.lifecycle?.incident ??
        null;

      const event =
        canonicalIncident?.event_type ??
        canonicalIncident?.event ??
        canonicalIncident?.title ??
        firstValue(
          "summary.event",
          "event",
          "decision",
          "incident.status"
        );

      if (incident || event) {
        return {
          state: "LIVE",
          evidence: `Operational incident intelligence established${event ? `: ${event}` : ""}`,
        };
      }

      return {
        state: "NOT EXPOSED",
        evidence: "Incident decision payload is not exposed in this report",
      };
    }

    case "action": {
      const recommendations =
        firstArray(
          "recommendations",
          "recommended_actions",
          "actions",
          "incident.recommendations",
          "incident.recommended_actions",
          "intelligence.recommendations",
          "intelligence.recommended_actions",
          "risk_resolution.recommendations",
          "risk_resolution.recommended_actions"
        );

      const actionPayload =
        firstObject(
          "recommendation",
          "recommended_action",
          "action",
          "risk_resolution.action",
          "incident.action"
        );

      if (recommendations) {
        return {
          state: "LIVE",
          evidence: `${recommendations.length} operational recommendation(s) produced`,
        };
      }

      if (actionPayload) {
        return {
          state: "LIVE",
          evidence: "Operational response recommendation detected",
        };
      }

      return {
        state: "NOT EXPOSED",
        evidence: "No recommendation/action output exposed in this report",
      };
    }

    case "pulse": {
      const notification =
        firstObject(
          "notification_pipeline",
          "notification_integration",
          "notification",
          "notifications",
          "notification_result",
          "alert",
          "notification_summary",
          "incident.notification",
          "incident.notifications"
        );

      if (notification) {
        return {
          state: "LIVE",
          evidence: "Notification pipeline/output detected in the execution result",
        };
      }

      return {
        state: "NOT EXPOSED",
        evidence: "Notification-layer result is not exposed in this report",
      };
    }

    case "evidence": {
      const evidence =
        firstObject(
          "audit",
          "evidence_bundle",
          "execution_summary",
          "execution",
          "persistence",
          "incident_execution",
          "audit_trail"
        );

      const evidenceItems =
        firstArray(
          "evidence",
          "intelligence_events",
          "execution_attempts",
          "audit_events",
          "evidence.events"
        );

      if (evidenceItems) {
        return {
          state: "LIVE",
          evidence: `${evidenceItems.length} evidence item(s) captured from the intelligence execution`,
        };
      }

      if (evidence) {
        return {
          state: "LIVE",
          evidence: "Inspectable execution/evidence trail detected",
        };
      }

      return {
        state: "NOT EXPOSED",
        evidence: "Evidence/audit trail is not exposed in this report",
      };
    }

    case "FAILED":
      return {
        border: "rgba(248,113,113,0.45)",
        background: "rgba(127,29,29,0.18)",
        accent: "#f87171",
        text: "#fee2e2",
        muted: "#fecaca",
        glow: "0 0 12px rgba(248,113,113,0.12)",
      }

    default:
      return {
        state: "NOT EXPOSED",
        evidence: "No runtime data source mapped",
      };
  }
}

function getCanonicalXRay(report) {
  const xray =
    report?.intelligence_xray ??
    report?.report?.intelligence_xray ??
    report?.detail?.intelligence_xray ??
    report?.execution?.intelligence_xray;

  if (
    xray &&
    Array.isArray(xray.stages) &&
    xray.stages.length > 0
  ) {
    return xray;
  }

  return null;
}

function canonicalStageResult(stageId, canonicalXRay) {
  if (!canonicalXRay) return null;

  const aliases = {
    ingestion: ["ingestion"],
    fingerprint: ["water_fingerprint", "fingerprint"],
    multi: ["multi_parameter_intelligence", "multi_parameter"],
    source: ["source_attribution"],
    spatial: ["spatial_localization", "spatial"],
    physiology: ["digital_physiology"],
    twin: ["digital_twin"],
    incident: ["incident_intelligence"],
    action: ["recommended_action"],
    pulse: ["notification", "water_pulse"],
    evidence: ["evidence"],
  };

  const backendStage = canonicalXRay.stages.find((item) => {
    const backendName = String(item?.stage ?? "").toLowerCase();
    return (aliases[stageId] ?? []).includes(backendName);
  });

  if (!backendStage) {
    return {
      state: "NOT EXPOSED",
      evidence: "Stage was not returned by the canonical X-Ray.",
    };
  }

  const status = String(
    backendStage.status ?? ""
  ).toLowerCase();

  if (
    status === "completed" ||
    status === "complete" ||
    status === "live" ||
    status === "success"
  ) {
    return {
      state: "LIVE",
      evidence:
        backendStage.reason ||
        backendStage.evidence?.summary ||
        "Stage completed in the canonical runtime execution.",
      backendEvidence: backendStage.evidence ?? {},
    };
  }

  if (
    status === "failed" ||
    status === "error"
  ) {
    return {
      state: "FAILED",
      evidence:
        backendStage.reason ||
        backendStage.evidence?.summary ||
        "Stage failed during the canonical runtime execution.",
      backendEvidence: backendStage.evidence ?? {},
    };
  }

  if (
    status === "not_exposed" ||
    status === "not evaluated" ||
    status === "not_evaluated"
  ) {
    return {
      state: "NOT EXPOSED",
      evidence:
        backendStage.reason ||
        backendStage.evidence?.summary ||
        "Stage was not exposed by this execution.",
      backendEvidence: backendStage.evidence ?? {},
    };
  }

  if (
    status === "evaluated" ||
    status === "pending" ||
    status === "waiting"
  ) {
    return {
      state: "EVALUATED",
      evidence:
        backendStage.reason ||
        backendStage.evidence?.summary ||
        "Stage was evaluated but did not complete as a live stage.",
      backendEvidence: backendStage.evidence ?? {},
    };
  }

  return {
    state: "WAITING",
    evidence:
      backendStage.reason ||
      backendStage.evidence?.summary ||
      "Stage has not completed.",
    backendEvidence: backendStage.evidence ?? {},
  };
}

function stateStyles(state) {
  switch (state) {
    case "LIVE":
      return {
        border: "rgba(98,221,255,0.42)",
        background: "rgba(31,100,124,0.16)",
        accent: "#62ddff",
        text: "#ffffff",
        muted: "#b9eaff",
        glow: "0 0 16px rgba(98,221,255,0.22)",
      }

    case "EVALUATED":
      return {
        border: "rgba(255,193,7,0.42)",
        background: "rgba(120,88,18,0.15)",
        accent: "#ffd166",
        text: "#fff7dc",
        muted: "#f3d98b",
        glow: "0 0 12px rgba(255,209,102,0.12)",
      }

    case "WAITING":
      return {
        border: "rgba(148,163,184,0.18)",
        background: "rgba(255,255,255,0.025)",
        accent: "#94a3b8",
        text: "#cbd5e1",
        muted: "#71869a",
        glow: "none",
      }

    default:
      return {
        border: "rgba(148,163,184,0.13)",
        background: "rgba(255,255,255,0.025)",
        accent: "#64748b",
        text: "#cbd5e1",
        muted: "#71869a",
        glow: "none",
      }
  }
}
export default function FalilaXIntelligenceXRay({ report }) {
  console.log("[FalilaX X-Ray] ACTUAL REPORT:", report);

  const canonicalXRay = getCanonicalXRay(report);

  const results = STAGES.map((stage) => ({
    ...stage,
    result:
      canonicalStageResult(stage.id, canonicalXRay) ??
      deriveStageState(report, stage.id),
  }));

  const liveCount = results.filter(
    (item) => item.result.state === "LIVE"
  ).length;

  const evaluatedCount = results.filter(
    (item) => item.result.state === "EVALUATED"
  ).length;

  const failedCount = results.filter(
    (item) => item.result.state === "FAILED"
  ).length;

  const stageCount =
    canonicalXRay?.stage_count ??
    results.length;

  const completedStageCount =
    canonicalXRay?.completed_stage_count ??
    liveCount;

  return (
    <section
      aria-label="FIX FalilaX Intelligence X-Ray"
      style={{
        marginTop: "16px",
        marginBottom: "16px",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid rgba(63, 207, 255, 0.42)",
        background:
          "linear-gradient(180deg, rgba(8, 32, 49, 0.98), rgba(5, 22, 36, 0.98))",
        boxShadow:
          "0 0 0 1px rgba(63, 207, 255, 0.06), 0 10px 30px rgba(0,0,0,0.22)",
        color: "#f6f9fc",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 9px",
              borderRadius: "999px",
              border: "1px solid rgba(63, 207, 255, 0.5)",
              color: "#62ddff",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.16em",
            }}
          >
            FIX{String.fromCharCode(8482)}
          </div>

          <h3
            style={{
              margin: "10px 0 4px",
              fontSize: "20px",
              lineHeight: 1.15,
              color: "#ffffff",
            }}
          >
            FalilaX Intelligence X-Ray{String.fromCharCode(8482)}
          </h3>

          <div
            style={{
              color: "#9fb5c8",
              fontSize: "11px",
              lineHeight: 1.5,
            }}
          >
            Live visual anatomy of the intelligence path
          </div>
        </div>

        <div
          style={{
            minWidth: "78px",
            padding: "8px 10px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.09)",
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: report ? "#62ddff" : "#94a3b8",
            }}
          >
            {canonicalXRay
              ? `${completedStageCount}/${stageCount}`
              : `${liveCount}/${stageCount}`}
          </div>
          <div
            style={{
              marginTop: "2px",
              fontSize: "9px",
              color: "#8da4b8",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            stages completed
          </div>

          {canonicalXRay?.overall_status && (
            <div
              style={{
                marginTop: "4px",
                fontSize: "8px",
                color:
                  canonicalXRay.overall_status === "completed"
                    ? "#62ddff"
                    : "#ffd166",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {canonicalXRay.overall_status}
            </div>
          )}

          {canonicalXRay?.execution_id && (
            <div
              style={{
                marginTop: "4px",
                fontSize: "7px",
                color: "#71869a",
                letterSpacing: "0.04em",
                wordBreak: "break-all",
              }}
            >
              {canonicalXRay.execution_id}
            </div>
          )}

          {canonicalXRay && failedCount > 0 && (
            <div
              style={{
                marginTop: "4px",
                fontSize: "8px",
                color: "#f87171",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {failedCount} failed
            </div>
          )}

          {report && evaluatedCount > 0 && (
            <div
              style={{
                marginTop: "4px",
                fontSize: "8px",
                color: "#ffd166",
                letterSpacing: "0.05em",
              }}
            >
              {evaluatedCount} evaluated
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          paddingLeft: "4px",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "19px",
            top: "22px",
            bottom: "22px",
            width: "2px",
            background:
              "linear-gradient(180deg, rgba(98,221,255,0.75), rgba(98,221,255,0.12))",
          }}
        />

        {results.map((stage, index) => {
          const result = stage.result;
          const live = result.state === "LIVE";
          const waiting = result.state === "WAITING";
          const evaluated = result.state === "EVALUATED";
          const styles = stateStyles(result.state);

          return (
            <div
              key={stage.id}
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "40px 1fr",
                gap: "10px",
                minHeight: index === STAGES.length - 1 ? "62px" : "74px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  border: `2px solid ${styles.accent}`,
                  background: styles.background,
                  boxShadow: styles.glow,
                  color: styles.accent,
                  fontSize: "9px",
                  fontWeight: 800,
                }}
              >
                {stage.number}
              </div>

              <div
                style={{
                  marginBottom: "8px",
                  padding: "9px 10px",
                  borderRadius: "8px",
                  border: `1px solid ${styles.border}`,
                  background: styles.background,
                  boxShadow: styles.glow,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: styles.text,
                    }}
                  >
                    {stage.title}
                  </div>

                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: "8px",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      color: styles.accent,
                    }}
                  >
                    {result.state}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "3px",
                    fontSize: "9px",
                    lineHeight: 1.4,
                    color: "#8fa6b9",
                  }}
                >
                  {stage.description}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "9px",
                    lineHeight: 1.35,
                    color: styles.muted,
                  }}
                >
                  {result.evidence}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "5px",
          paddingTop: "10px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          fontSize: "9px",
          lineHeight: 1.5,
          color: "#71869a",
        }}
      >
        <strong style={{ color: "#9fb5c8" }}>FIX{String.fromCharCode(8482)}</strong> reflects
        intelligence actually exposed by the current execution.
        <br />
        <span style={{ color: "#ffd166" }}>EVALUATED</span> means the
        pathway was assessed but did not establish a substantive result.
        <br />
        A stage is never marked LIVE merely because the capability exists
        in the FalilaX architecture.
      </div>
    </section>
  );
}
