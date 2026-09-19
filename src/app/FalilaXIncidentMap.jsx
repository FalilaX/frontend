import { apiErrorMessage } from "@/app/utils/api-error";
import { canCloseIncident } from "@/app/utils/incident-closure";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import {
  closeIncident,
  fetchIncidentDetail,
  fetchIncidents,
  runUnsafeTurbiditySimulation,
  simulateAndSaveIncident,
} from "@/app/utils/api-client";

const defaultIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const nodeCoordinates = {
  1: [32.378, -86.3077],
  2: [32.373, -86.301],
  3: [32.369, -86.296],
  4: [32.365, -86.289],
  5: [32.363, -86.303],
  6: [32.358, -86.284],
  7: [32.356, -86.308],
  8: [32.351, -86.281],
  9: [32.349, -86.312],
};

const networkLines = [
  [nodeCoordinates[1], nodeCoordinates[2]],
  [nodeCoordinates[2], nodeCoordinates[3]],
  [nodeCoordinates[3], nodeCoordinates[4]],
  [nodeCoordinates[3], nodeCoordinates[5]],
  [nodeCoordinates[4], nodeCoordinates[6]],
  [nodeCoordinates[5], nodeCoordinates[7]],
  [nodeCoordinates[6], nodeCoordinates[8]],
  [nodeCoordinates[7], nodeCoordinates[9]],
];

const formatConfidence = (value) =>
  typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value * 10000) / 100}%`
    : "Not established";

const isSimulation = (id, report) =>
  String(id || "").startsWith("SIM-") ||
  report?.summary?.simulation === true ||
  report?.simulation?.simulation === true;

export default function FalilaXIncidentMap() {
  const reportRef = useRef(null);
  const [openingIncidentId, setOpeningIncidentId] = useState(null);
  const [closingIncidentId, setClosingIncidentId] = useState(null);
  const [digitalTwinResult, setDigitalTwinResult] = useState(null);
  const [digitalTwinLoading, setDigitalTwinLoading] = useState(false);
  const [digitalTwinError, setDigitalTwinError] = useState(null);
  const [savedIncidentId, setSavedIncidentId] = useState(null);
  const [safetyTestLoading, setSafetyTestLoading] = useState(false);
  const [safetyTestResult, setSafetyTestResult] = useState(null);
  const [safetyTestError, setSafetyTestError] = useState(null);

  const [incidents, setIncidents] = useState([]);
  const [incidentHistoryLoading, setIncidentHistoryLoading] = useState(false);
  const [incidentHistoryError, setIncidentHistoryError] = useState(null);

  useEffect(() => {
    if (digitalTwinLoading || openingIncidentId || digitalTwinResult || digitalTwinError) {
      reportRef.current?.scrollIntoView({ block: "start" });
      reportRef.current?.focus({ preventScroll: true });
    }
  }, [digitalTwinLoading, openingIncidentId, digitalTwinResult, digitalTwinError]);

  const loadIncidents = async () => {
    setIncidentHistoryLoading(true);
    setIncidentHistoryError(null);

    try {
      const data = await fetchIncidents();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (error) {
      setIncidentHistoryError(error?.message || "Failed to load incidents");
    } finally {
      setIncidentHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const runUnsafeTurbiditySafetyTest = async () => {
    const confirmed = window.confirm(
      "SIMULATION ONLY: Generate a deterministic unsafe turbidity reading of 10.0 NTU? No email or SMS will be sent."
    );

    if (!confirmed) return;

    setSafetyTestLoading(true);
    setSafetyTestResult(null);
    setSafetyTestError(null);

    try {
      const result = await runUnsafeTurbiditySimulation();
      setSafetyTestResult(result);
    } catch (error) {
      setSafetyTestError(
        error?.message || "Deterministic safety simulation failed"
      );
    } finally {
      setSafetyTestLoading(false);
    }
  };

  const runDigitalTwinSimulation = async () => {
    setDigitalTwinLoading(true);
    setDigitalTwinError(null);
    setSavedIncidentId(null);
    setDigitalTwinResult(null);

    try {
      const result = await simulateAndSaveIncident({
        node_id: 1,
        chlorine_mg_l: 0.1,
        pressure_psi: 55,
      });

      if (!result?.report || typeof result.report !== "object") {
        throw new Error("The simulation returned no report. Refresh saved incidents to check its record.");
      }
      setDigitalTwinResult(result.report);
      setSavedIncidentId(result.incident_id);
      await loadIncidents();
    } catch (error) {
      setDigitalTwinError(error?.message || "Digital Twin simulation failed");
    } finally {
      setDigitalTwinLoading(false);
    }
  };

  const openIncident = async (incidentId) => {
    setOpeningIncidentId(incidentId);
    setDigitalTwinError(null);
    setDigitalTwinResult(null);
    setSavedIncidentId(incidentId);

    try {
      const data = await fetchIncidentDetail(incidentId);
      if (!data?.report || typeof data.report !== "object") {
        throw new Error("This saved incident has no report available.");
      }
      setDigitalTwinResult({
        ...data.report,
        summary: {
          ...data.report.summary,
          status: data.incident?.status ?? data.status ?? data.report.summary?.status,
        },
      });
      setSavedIncidentId(data.incident_id ?? incidentId);
    } catch (error) {
      setDigitalTwinError(apiErrorMessage(error, "Failed to open incident"));
    } finally {
      setOpeningIncidentId(null);
    }
  };

  const handleCloseIncident = async (incidentId) => {
    if (incidentBusy) return;
    if (!canCloseIncident(incidents.find((item) => item.incident_id === incidentId))) {
      setIncidentHistoryError("Resolve the incident through its investigation workflow before closing it.");
      return;
    }
    setClosingIncidentId(incidentId);
    setIncidentHistoryError(null);
    try {
      await closeIncident(incidentId);
      if (savedIncidentId === incidentId) {
        await openIncident(incidentId);
      }
      await loadIncidents();
    } catch (error) {
      setIncidentHistoryError(apiErrorMessage(error, "Failed to close incident"));
    } finally {
      setClosingIncidentId(null);
    }
  };

  const impact = digitalTwinResult?.impact || {};
  const impactNotEvaluated = impact.assessment_status === "not_evaluated";
  const predictionNotEvaluated = digitalTwinResult?.prediction?.assessment_status === "not_evaluated";
  const predictionTimeline = predictionNotEvaluated
    ? [] : digitalTwinResult?.prediction?.timeline || [];
  const simulationSelected = isSimulation(savedIncidentId, digitalTwinResult);
  const reportBusy = digitalTwinLoading || openingIncidentId !== null;
  const incidentBusy = reportBusy || closingIncidentId !== null;
  const recommendations = digitalTwinResult?.recommendations || [];
  const isolation = impactNotEvaluated ? null : impact?.recommended_isolation;
  const rootCause = digitalTwinResult?.root_cause;
  const incidentCenter = nodeCoordinates[1];

  const affectedAssets = predictionTimeline.map((item) => ({
    node_id: item.node_id,
    name: item.asset,
    risk: item.risk,
    arrival_time_minutes: item.eta_minutes,
    network_distance: item.distance,
  }));

  const affectedAssetsCount =
    impact?.affected_assets ?? impact?.affected_asset_count ?? affectedAssets.length;

  return (
    <div className="fx-app-shell fx-incident-map" style={{ position: "relative", height: "100vh", width: "100%" }}>
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "60px",
          zIndex: 1000,
          width: "455px",
          maxWidth: "calc(100vw - 76px)",
          boxSizing: "border-box",
          color: "#f6f9fc",
          overflowWrap: "anywhere",
          maxHeight: "85vh",
          overflowY: "auto",
          background: "rgba(6, 24, 39, 0.96)",
          padding: "16px",
          borderRadius: "10px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          fontFamily: "Inter, Segoe UI, sans-serif",
          fontSize: "14px",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#f6f9fc" }}>
          FalilaX Incident Operations Center
        </h2>

        <p style={{ color: "#cbd5e1", fontSize: "12px" }}>
          Illustrative demo network. Coordinates and connections are not verified infrastructure or predicted impact.
        </p>
        <button
          onClick={runDigitalTwinSimulation}
          disabled={incidentBusy}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "6px",
            background: digitalTwinLoading ? "#999" : "#0b5ed7",
            color: "white",
            fontWeight: "bold",
            cursor: digitalTwinLoading ? "not-allowed" : "pointer",
          }}
        >
          {digitalTwinLoading
            ? "Running & Saving Incident..."
            : "Run and Save Incident Simulation"}
        </button>

        <div
          style={{
            marginTop: "14px",
            padding: "12px",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            background: "rgba(245, 158, 11, 0.10)",
          }}
        >
          <div style={{ color: "#fbbf24", fontWeight: "bold" }}>
            Controlled Safety Simulation
          </div>
          <div
            style={{
              marginTop: "5px",
              marginBottom: "10px",
              color: "#d1d5db",
              fontSize: "12px",
            }}
          >
            Admin-only deterministic test. External email and SMS delivery
            remain disabled.
          </div>

          <button
            onClick={runUnsafeTurbiditySafetyTest}
            disabled={safetyTestLoading}
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "6px",
              background: safetyTestLoading ? "#999" : "#d97706",
              color: "white",
              fontWeight: "bold",
              cursor: safetyTestLoading ? "not-allowed" : "pointer",
            }}
          >
            {safetyTestLoading
              ? "Running Safety Test..."
              : "Run Unsafe Turbidity Safety Test"}
          </button>

          {safetyTestResult && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                borderRadius: "6px",
                background: "#451a03",
                color: "#fde68a",
              }}
            >
              <strong>SIMULATION ONLY</strong>
              <div>
                Generated:{" "}
                {safetyTestResult.measurements?.[0]?.value ?? "?"}{" "}
                {safetyTestResult.measurements?.[0]?.unit ?? ""}
              </div>
              <div>
                Parameter:{" "}
                {safetyTestResult.measurements?.[0]?.parameter_code ?? "?"}
              </div>
              <div>
                Location: {safetyTestResult.location_label ?? "?"}
              </div>
              <div style={{ marginTop: "5px", fontSize: "12px" }}>
                The resulting alert is restricted to the in-app channel.
              </div>
            </div>
          )}

          {safetyTestError && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                borderRadius: "6px",
                background: "#7f1d1d",
                color: "#fecaca",
              }}
            >
              {safetyTestError}
            </div>
          )}
        </div>

        <hr />

        <section ref={reportRef} tabIndex={-1} aria-label="Selected incident report" aria-busy={reportBusy}>
          {reportBusy && <p role="status">{openingIncidentId ? `Opening report: ${openingIncidentId}` : "Running and saving simulation..."}</p>}
        {savedIncidentId && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              background: "#d1e7dd",
              borderRadius: "6px",
              color: "#0f5132",
              fontWeight: "bold",
            }}
          >
            Selected incident: {savedIncidentId}
          </div>
        )}

        {digitalTwinError && (
          <div role="alert"
            style={{
              marginTop: "12px",
              color: "#842029",
              background: "#f8d7da",
              padding: "10px",
              borderRadius: "6px",
            }}
          >
            {digitalTwinError}
          </div>
        )}

        {digitalTwinResult && (
          <>
            <hr />

            <h3>Incident Summary</h3>
            {simulationSelected && (
              <div style={{ padding: "10px", background: "#312447", color: "#f3e8ff", borderRadius: "6px" }}>
                <strong>SIMULATION — synthetic measurements</strong>
                <p>This report does not establish real-world exposure or a contamination source.</p>
                {digitalTwinResult.simulation?.external_delivery_authorized === false &&
                  <div>External delivery: not authorized</div>}
                {digitalTwinResult.simulation?.notification_dispatch_enabled === false &&
                  <div>Notification dispatch: disabled for this run</div>}
              </div>
            )}
            <div><strong>Detection confidence:</strong> {formatConfidence(digitalTwinResult.detection?.confidence ?? digitalTwinResult.decision?.detection_confidence)}</div>
            <div>
              <strong>Event:</strong> {digitalTwinResult.summary?.event}
            </div>
            <div>
              <strong>Severity:</strong> {digitalTwinResult.summary?.severity}
            </div>
            <div>
              <strong>Status:</strong> {digitalTwinResult.summary?.status}
            </div>
            <div>
              <strong>Node:</strong> {digitalTwinResult.summary?.node_id}
            </div>

            <hr />

            <h3>Measurements</h3>
            <div>
              <strong>Chlorine:</strong>{" "}
              {digitalTwinResult.measurements?.chlorine_mg_l ?? "Not recorded"} mg/L
            </div>
            <div>
              <strong>Pressure:</strong>{" "}
              {digitalTwinResult.measurements?.pressure_psi ?? "Not recorded"} psi
            </div>

            <hr />

            <h3>Root Cause Intelligence</h3>
            <div>
              <strong>Most Likely Cause:</strong>{" "}
              {rootCause?.most_likely_cause}
            </div>
            <div>
              <strong>Source-attribution confidence:</strong>{" "}
              {formatConfidence(rootCause?.confidence)}
            </div>
            <p>{rootCause?.explanation}</p>

            {rootCause?.hypotheses?.map((hypothesis, idx) => (
              <div
                key={idx}
                style={{
                  marginTop: "8px",
                  padding: "8px",
                  borderRadius: "6px",
                  background: "#eef2ff",
                  border: "1px solid #ddd",
                  color: "#172b3a",
                }}
              >
                <strong>{hypothesis.cause}</strong>
                <br />
                Probability: {formatConfidence(hypothesis.probability)}
                <ul style={{ marginTop: "6px" }}>
                  {hypothesis.evidence?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}

            <hr />

            <h3>Impact</h3>
            <div>
              <strong>Affected Assets:</strong> {impactNotEvaluated ? "Not evaluated" : affectedAssetsCount}
            </div>

            {isolation && (
              <div
                style={{
                  marginTop: "10px",
                  background: "#fff3cd",
                  color: "#172b3a",
                  padding: "10px",
                  borderRadius: "6px",
                }}
              >
                <strong>Recommended Isolation</strong>
                <br />
                Close pipe: {String(isolation.closed_edge)}
                <br />
                From: {isolation.from_node}
                <br />
                To: {isolation.to_node}
                <br />
                Critical Protected: {isolation.critical_protected_count}
                <br />
                Service Disruption: {isolation.service_disruption_count}
              </div>
            )}

            <hr />

            <h3>Response Recommendations</h3>
            {simulationSelected && <p>Simulation guidance for review; no operational action has been executed.</p>}
            {recommendations.length === 0 && <p>No recommendations recorded.</p>}
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  marginTop: "8px",
                  padding: "8px",
                  borderRadius: "6px",
                  background:
                    rec.priority === "HIGH" ? "#ffcccc" : "#fff3cd",
                  border: "1px solid #ddd",
                  color: "#172b3a",
                }}
              >
                <strong>{rec.priority}</strong>
                <br />
                {rec.action}
                <br />
                {rec.source === "event_response_rule" && <small>Source: event response rule</small>}
                <small>{rec.reason}</small>
                <br />
                {typeof rec.confidence === "number" && (
                  <small>
                    Confidence: {formatConfidence(rec.confidence)}
                  </small>
                )}
                {rec.expected_outcome && (
                  <>
                    <br />
                    <small>Expected outcome: {rec.expected_outcome}</small>
                  </>
                )}
              </div>
            ))}

            <hr />

            <h3>Prediction Timeline</h3>
            {predictionNotEvaluated ? <p>Hydraulic arrival times were not evaluated.</p>
              : predictionTimeline.length === 0 && <p>No prediction timeline recorded.</p>}
            {predictionTimeline.map((item) => (
              <div
                key={`${item.rank}-${item.asset}`}
                style={{
                  marginTop: "8px",
                  padding: "8px",
                  borderRadius: "6px",
                  background:
                    item.risk === "HIGH"
                      ? "#ffcccc"
                      : item.risk === "MODERATE"
                      ? "#fff3cd"
                      : "#e8f5e9",
                  border: "1px solid #ddd",
                  color: "#172b3a",
                }}
              >
                <strong>
                  #{item.rank} {item.asset}
                </strong>
                <br />
                Risk: {item.risk}
                <br />
                ETA: {item.eta_minutes} min
                <br />
                Action: {item.recommended_action}
              </div>
            ))}

            <hr />

            <h3>Affected Assets</h3>
            {impactNotEvaluated ? <p>Network impact was not evaluated. A zero count does not establish that no assets are affected.</p>
              : affectedAssets.length === 0 && <p>No asset details recorded.</p>}
            {!impactNotEvaluated && affectedAssets.map((asset, index) => (
              <div
                key={`${asset.node_id ?? asset.name}-${index}`}
                style={{
                  marginTop: "8px",
                  padding: "8px",
                  borderRadius: "6px",
                  background:
                    asset.risk === "HIGH"
                      ? "#ffcccc"
                      : asset.risk === "MODERATE"
                      ? "#fff3cd"
                      : "#e8f5e9",
                  border: "1px solid #ddd",
                  color: "#172b3a",
                }}
              >
                <strong>{asset.name}</strong>
                <br />
                Risk: {asset.risk}
                <br />
                ETA: {asset.arrival_time_minutes} min
                <br />
                Distance: {asset.network_distance}
              </div>
            ))}
            {digitalTwinResult.limitations?.length > 0 && (
              <><h3>Report Limitations</h3><ul>{digitalTwinResult.limitations.map((item, index) => <li key={index}>{item}</li>)}</ul></>
            )}
          </>
        )}
        </section>

        <h3>Saved Incident History</h3>

        <button
          onClick={loadIncidents}
          disabled={incidentHistoryLoading}
          style={{
            width: "100%",
            padding: "9px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            background: "#f8f9fa",
            color: "#172b3a",
            fontWeight: "bold",
            cursor: incidentHistoryLoading ? "not-allowed" : "pointer",
          }}
        >
          {incidentHistoryLoading ? "Loading incidents..." : "Refresh Saved Incidents"}
        </button>

        {incidentHistoryError && (
          <div
            style={{
              marginTop: "10px",
              color: "#842029",
              background: "#f8d7da",
              padding: "10px",
              borderRadius: "6px",
            }}
          >
            {incidentHistoryError}
          </div>
        )}

        <div style={{ marginTop: "10px" }}>
          {incidents.length === 0 && (
            <div style={{ color: "#6b7280" }}>No saved incidents yet.</div>
          )}

          {incidents.slice(0, 8).map((incident) => (
            <div
              key={incident.incident_id}
              style={{
                marginTop: "8px",
                padding: "10px",
                borderRadius: "8px",
                background:
                  String(incident.status).toLowerCase() === "closed" ? "#e8f5e9" : "#fff3cd",
                border: "1px solid #ddd",
                  color: "#172b3a",
              }}
            >
              {isSimulation(incident.incident_id) && <div><strong>SIMULATION</strong></div>}
              <strong>{incident.incident_id}</strong>
              <br />
              Event: {incident.event_type}
              <br />
              Severity: {incident.severity}
              <br />
              Status: {incident.status}
              <br />
              Cause: {incident.most_likely_cause || "N/A"}
              <br />
              <small>
                Created:{" "}
                {incident.created_at
                  ? new Date(incident.created_at).toLocaleString()
                  : "N/A"}
              </small>

              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button
                  onClick={() => openIncident(incident.incident_id)}
                  disabled={incidentBusy}
                  style={{
                    flex: 1,
                    padding: "7px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#0b5ed7",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {openingIncidentId === incident.incident_id ? "Opening report..." : "Open report"}
                </button>

                {canCloseIncident(incident) && (
                  <button
                    onClick={() => handleCloseIncident(incident.incident_id)}
                    disabled={incidentBusy}
                    style={{
                      flex: 1,
                      padding: "7px",
                      border: "none",
                      borderRadius: "6px",
                      background: "#198754",
                      color: "white",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {closingIncidentId === incident.incident_id ? "Closing..." : "Close"}
                  </button>
                )}
              </div>
              {!canCloseIncident(incident) &&
                String(incident.status).toLowerCase() !== "closed" && (
                  <p style={{ marginTop: "8px", fontSize: "13px" }}>
                    Closure becomes available after the investigation workflow is resolved.
                  </p>
                )}
            </div>
          ))}
        </div>

        {!digitalTwinResult && (
          <p style={{ marginTop: "14px" }}>
            Open a saved report, or run a separate low-chlorine simulation at Node 1.
          </p>
        )}


      </div>

      <MapContainer
        center={incidentCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {networkLines.map((line, idx) => (
          <Polyline
            key={idx}
            positions={line}
            pathOptions={{
              color: "green",
              weight: 5,
              opacity: 0.75,
            }}
          />
        ))}

        {Object.entries(nodeCoordinates).map(([nodeId, position]) => (
          <Marker key={nodeId} position={position} icon={defaultIcon}>
            <Popup>
              <strong>Illustrative Network Node {nodeId}</strong>
              <br />Demo coordinates; not verified asset geography.
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
