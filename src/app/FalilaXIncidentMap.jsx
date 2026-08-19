import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import {
  closeIncident,
  fetchIncidentDetail,
  fetchIncidents,
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

const riskColor = (risk) => {
  if (risk === "HIGH") return "red";
  if (risk === "MODERATE") return "orange";
  return "green";
};

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

const assetNameToNodeId = {
  "North Reservoir": 1,
  "Treatment Plant A": 2,
  "Main Pump Station": 3,
  "Pressure Zone A": 4,
  "Pressure Zone B": 5,
  "DMA A": 6,
  "DMA B": 7,
  "Customer Area A": 8,
  "Customer Area B": 9,
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

export default function FalilaXIncidentMap() {
  const [digitalTwinResult, setDigitalTwinResult] = useState(null);
  const [digitalTwinLoading, setDigitalTwinLoading] = useState(false);
  const [digitalTwinError, setDigitalTwinError] = useState(null);
  const [savedIncidentId, setSavedIncidentId] = useState(null);

  const [incidents, setIncidents] = useState([]);
  const [incidentHistoryLoading, setIncidentHistoryLoading] = useState(false);
  const [incidentHistoryError, setIncidentHistoryError] = useState(null);

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

  const runDigitalTwinSimulation = async () => {
    setDigitalTwinLoading(true);
    setDigitalTwinError(null);
    setSavedIncidentId(null);

    try {
      const result = await simulateAndSaveIncident({
        node_id: 1,
        chlorine_mg_l: 0.1,
        pressure_psi: 55,
      });

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
    setDigitalTwinLoading(true);
    setDigitalTwinError(null);

    try {
      const data = await fetchIncidentDetail(incidentId);
      setDigitalTwinResult(data.report);
      setSavedIncidentId(data.incident_id);
    } catch (error) {
      setDigitalTwinError(error?.message || "Failed to open incident");
    } finally {
      setDigitalTwinLoading(false);
    }
  };

  const handleCloseIncident = async (incidentId) => {
    setIncidentHistoryLoading(true);
    setIncidentHistoryError(null);

    try {
      await closeIncident(incidentId);
      await loadIncidents();
    } catch (error) {
      setIncidentHistoryError(error?.message || "Failed to close incident");
    } finally {
      setIncidentHistoryLoading(false);
    }
  };

  const impact = digitalTwinResult?.impact || {};
  const predictionTimeline = digitalTwinResult?.prediction?.timeline || [];
  const recommendations = digitalTwinResult?.recommendations || [];
  const isolation = impact?.recommended_isolation;
  const rootCause = digitalTwinResult?.root_cause;
  const incidentCenter = nodeCoordinates[1];

  const affectedAssets = predictionTimeline.map((item) => ({
    node_id: assetNameToNodeId[item.asset],
    name: item.asset,
    risk: item.risk,
    arrival_time_minutes: item.eta_minutes,
    network_distance: item.distance,
  }));

  const affectedAssetsCount =
    impact?.affected_assets ?? impact?.affected_asset_count ?? affectedAssets.length;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "60px",
          zIndex: 1000,
          width: "455px",
          maxHeight: "85vh",
          overflowY: "auto",
          background: "white",
          padding: "16px",
          borderRadius: "10px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#b00020" }}>
          FalilaX Incident Operations Center
        </h2>

        <button
          onClick={runDigitalTwinSimulation}
          disabled={digitalTwinLoading}
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
            Active incident: {savedIncidentId}
          </div>
        )}

        {digitalTwinError && (
          <div
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

        <hr />

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
                  incident.status === "CLOSED" ? "#e8f5e9" : "#fff3cd",
                border: "1px solid #ddd",
              }}
            >
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
                  Open
                </button>

                {incident.status !== "CLOSED" && (
                  <button
                    onClick={() => handleCloseIncident(incident.incident_id)}
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
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {!digitalTwinResult && (
          <p style={{ marginTop: "14px" }}>
            Click the button to simulate low chlorine at Node 1, run the full
            incident intelligence engine, and save the incident to the database.
          </p>
        )}

        {digitalTwinResult && (
          <>
            <hr />

            <h3>Incident Summary</h3>
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
              {digitalTwinResult.measurements?.chlorine_mg_l} mg/L
            </div>
            <div>
              <strong>Pressure:</strong>{" "}
              {digitalTwinResult.measurements?.pressure_psi} psi
            </div>

            <hr />

            <h3>Root Cause Intelligence</h3>
            <div>
              <strong>Most Likely Cause:</strong>{" "}
              {rootCause?.most_likely_cause}
            </div>
            <div>
              <strong>Confidence:</strong>{" "}
              {rootCause?.confidence
                ? `${Math.round(rootCause.confidence * 100)}%`
                : "N/A"}
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
                }}
              >
                <strong>{hypothesis.cause}</strong>
                <br />
                Probability: {Math.round(hypothesis.probability * 100)}%
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
              <strong>Affected Assets:</strong> {affectedAssetsCount}
            </div>

            {isolation && (
              <div
                style={{
                  marginTop: "10px",
                  background: "#fff3cd",
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

            <h3>AI Recommendations</h3>
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
                }}
              >
                <strong>{rec.priority}</strong>
                <br />
                {rec.action}
                <br />
                <small>{rec.reason}</small>
                <br />
                {rec.confidence && (
                  <small>
                    Confidence: {Math.round(rec.confidence * 100)}%
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
            {affectedAssets.map((asset) => (
              <div
                key={asset.node_id}
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
          </>
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

        {digitalTwinResult && (
          <Circle
            center={incidentCenter}
            radius={1100}
            pathOptions={{
              color: "purple",
              fillColor: "purple",
              fillOpacity: 0.15,
              weight: 3,
            }}
          >
            <Popup>
              <strong>Digital Twin Predicted Impact Zone</strong>
              <br />
              Event: {digitalTwinResult.summary?.event}
              <br />
              Severity: {digitalTwinResult.summary?.severity}
              <br />
              Affected Assets: {affectedAssetsCount}
            </Popup>
          </Circle>
        )}

        {affectedAssets.map((asset) => {
          const position = nodeCoordinates[asset.node_id];
          if (!position) return null;

          return (
            <Circle
              key={`risk-${asset.node_id}`}
              center={position}
              radius={130}
              pathOptions={{
                color: riskColor(asset.risk),
                fillColor: riskColor(asset.risk),
                fillOpacity: 0.35,
                weight: 2,
              }}
            >
              <Popup>
                <strong>{asset.name}</strong>
                <br />
                Risk: {asset.risk}
                <br />
                ETA: {asset.arrival_time_minutes} min
                <br />
                Distance: {asset.network_distance}
              </Popup>
            </Circle>
          );
        })}

        {Object.entries(nodeCoordinates).map(([nodeId, position]) => {
          const affected = affectedAssets.find(
            (asset) => String(asset.node_id) === nodeId
          );

          return (
            <Marker key={nodeId} position={position} icon={defaultIcon}>
              <Popup>
                <strong>
                  {affected ? affected.name : `Network Node ${nodeId}`}
                </strong>
                <br />
                Node ID: {nodeId}
                {affected && (
                  <>
                    <br />
                    Risk: {affected.risk}
                    <br />
                    ETA: {affected.arrival_time_minutes} min
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}