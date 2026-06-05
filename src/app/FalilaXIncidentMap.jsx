import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const hospitalIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const schoolIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const householdIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function FalilaXIncidentMap() {
  const [data, setData] = useState(null);
  const [lines, setLines] = useState([]);
  const [responsePlan, setResponsePlan] = useState(null);
  const [impactDashboard, setImpactDashboard] = useState(null);
  const [routingPlan, setRoutingPlan] = useState(null);
  const [sourceAttribution, setSourceAttribution] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [communityAlerts, setCommunityAlerts] = useState(null);

  const [resourceDeployment, setResourceDeployment] = useState(null);
  const [escalationIntel, setEscalationIntel] = useState(null);
  const [financialImpact, setFinancialImpact] = useState(null);
  const [predictiveSpread, setPredictiveSpread] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8001/api/v1/gis-risk-map/1")
      .then((res) => res.json())
      .then((json) => setData(json));

    fetch("http://127.0.0.1:8001/api/v1/distribution-line-map")
      .then((res) => res.json())
      .then((json) => setLines(json.distribution_lines || []));

    fetch("http://127.0.0.1:8001/api/v1/response-intelligence/1")
      .then((res) => res.json())
      .then((json) => setResponsePlan(json));

    fetch("http://127.0.0.1:8001/api/v1/impact-dashboard/1")
      .then((res) => res.json())
      .then((json) => setImpactDashboard(json));

    fetch("http://127.0.0.1:8001/api/v1/alert-routing/1")
      .then((res) => res.json())
      .then((json) => setRoutingPlan(json));

    fetch("http://127.0.0.1:8001/api/v1/source-attribution-intelligence/1")
      .then((res) => res.json())
      .then((json) => setSourceAttribution(json));

    fetch("http://127.0.0.1:8001/api/v1/notification-status-dashboard/1")
      .then((res) => res.json())
      .then((json) => setNotificationStatus(json));

    fetch("http://127.0.0.1:8001/api/v1/incident-timeline-intelligence/1")
      .then((res) => res.json())
      .then((json) => setTimeline(json.timeline || []));

    fetch("http://127.0.0.1:8001/api/v1/community-alert-intelligence/1")
      .then((res) => res.json())
      .then((json) => setCommunityAlerts(json));

    fetch("http://127.0.0.1:8001/api/v1/resource-deployment-intelligence/1")
      .then((res) => res.json())
      .then((json) => setResourceDeployment(json));

    fetch("http://127.0.0.1:8001/api/v1/escalation-intelligence/1")
      .then((res) => res.json())
      .then((json) => setEscalationIntel(json));

    fetch("http://127.0.0.1:8001/api/v1/financial-impact-intelligence/1")
      .then((res) => res.json())
      .then((json) => setFinancialImpact(json));

    fetch("http://127.0.0.1:8001/api/v1/predictive-spread-intelligence/1")
      .then((res) => res.json())
      .then((json) => setPredictiveSpread(json));
  }, []);

  if (!data) {
    return <div>Loading FalilaX GIS Map...</div>;
  }

  const incidentCenter = [32.3780, -86.3077];

  const getIcon = (type) => {
    if (type === "hospital") return hospitalIcon;
    if (type === "school") return schoolIcon;
    if (type === "home" || type === "household") return householdIcon;
    return defaultIcon;
  };

  const riskColor = (point) => {
    const score = Number(point.criticality_score || 0);

    if (score >= 90) return "red";
    if (score >= 70) return "orange";
    if (score >= 50) return "gold";
    return "green";
  };

  const lineColor = (line) => {
    if (line.id === 1) return "red";
    return "green";
  };

  const timelineColor = (severity) => {
    if (severity === "critical") return "red";
    if (severity === "success") return "green";
    return "#2196f3";
  };

  const statusColor = (status) => {
    if (status === "completed") return "#d4edda";
    if (status === "active") return "#fff3cd";
    if (status === "pending") return "#f8d7da";
    return "#f1f1f1";
  };

  const recommendedActions = responsePlan?.recommended_actions || [];
  const summary = impactDashboard?.impact_summary;
  const incident = impactDashboard?.incident || data.incident;
  const facilityGroups = impactDashboard?.affected_facility_groups || [];
  const routing = routingPlan?.routing_plan || [];
  const notifications = notificationStatus?.notifications || [];
  const communityAlertRows = communityAlerts?.community_alerts || [];
  const deploymentResources = resourceDeployment?.resources || [];
  const escalationChain = escalationIntel?.escalation_chain || [];
  const costs = financialImpact?.estimated_costs || {};
  const forecast = predictiveSpread?.forecast || [];
  const projected48hRisk =
    forecast.find((item) => item.hours === 48)?.population_at_risk ?? "Loading";

  const renderRecommendedActions = (limit = recommendedActions.length) => {
    const actionsToShow = recommendedActions.slice(0, limit);

    if (actionsToShow.length === 0) {
      return <p>Loading response plan...</p>;
    }

    return (
      <div>
        {actionsToShow.map((action) => (
          <div
            key={action.priority}
            style={{
              background: action.priority <= 2 ? "#ffcccc" : "#fff3cd",
              padding: "6px",
              marginBottom: "5px",
              borderRadius: "4px",
              border: "1px solid #ddd"
            }}
          >
            <strong>Priority {action.priority}</strong>
            <br />
            {action.action}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "60px",
          zIndex: 1000,
          width: "390px",
          maxHeight: "650px",
          overflowY: "auto",
          background: "white",
          padding: "14px",
          borderRadius: "10px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px"
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "16px",
            marginBottom: "8px",
            color: "#b00020"
          }}
        >
          FalilaX Incident Command Summary
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px",
            marginBottom: "10px"
          }}
        >
          <div style={{ background: "#ffebee", padding: "6px", borderRadius: "6px" }}>
            <strong>Population</strong>
            <br />
            {summary?.total_population_exposed ?? incident?.population_at_risk}
          </div>

          <div style={{ background: "#fff3cd", padding: "6px", borderRadius: "6px" }}>
            <strong>Sites</strong>
            <br />
            {summary?.affected_site_count ?? incident?.affected_site_count}
          </div>

          <div style={{ background: "#e3f2fd", padding: "6px", borderRadius: "6px" }}>
            <strong>Alerts</strong>
            <br />
            {communityAlerts?.alerts_sent ?? "Loading"}
          </div>

          <div style={{ background: "#f3e5f5", padding: "6px", borderRadius: "6px" }}>
            <strong>Est. Cost</strong>
            <br />${costs.estimated_total_incident_cost ?? "Loading"}
          </div>

          <div style={{ background: "#ede7f6", padding: "6px", borderRadius: "6px" }}>
            <strong>48h Risk</strong>
            <br />
            {projected48hRisk}
          </div>

          <div style={{ background: "#e8f5e9", padding: "6px", borderRadius: "6px" }}>
            <strong>Ack Rate</strong>
            <br />
            {notificationStatus?.acknowledgement_rate ?? "Loading"}%
          </div>
        </div>

        <div>
          <strong>{incident?.cluster_name}</strong>
        </div>

        <div style={{ marginTop: "8px" }}>
          <strong>Status:</strong> {incident?.incident_status}
        </div>

        <div>
          <strong>Alert Level:</strong> {incident?.alert_level}
        </div>

        <div>
          <strong>Population at Risk:</strong>{" "}
          {summary?.total_population_exposed ??
            incident?.population_at_risk ??
            "Loading"}
        </div>

        <div>
          <strong>Affected Sites:</strong>{" "}
          {summary?.affected_site_count ??
            incident?.affected_site_count ??
            "Loading"}
        </div>

        <div>
          <strong>Highest Criticality:</strong>{" "}
          {summary?.highest_criticality_score ?? "Loading"}
        </div>

        <div>
          <strong>Response Time:</strong>{" "}
          {summary?.estimated_response_time ?? "Loading"}
        </div>

        <div style={{ marginTop: "8px" }}>
          <strong>Operational Priority:</strong>
          <br />
          <span style={{ color: "#b00020", fontWeight: "bold" }}>
            {summary?.operational_priority ?? "Loading"}
          </span>
        </div>

        <hr />

        <div>
          <strong>Resource Deployment Intelligence</strong>
        </div>

        {resourceDeployment ? (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#f1f8e9"
            }}
          >
            <div>
              <strong>Priority:</strong>{" "}
              {resourceDeployment.deployment_priority}
            </div>

            <div>
              <strong>Crews Required:</strong>{" "}
              {resourceDeployment.estimated_crews_required}
            </div>

            <div>
              <strong>Response Time:</strong>{" "}
              {resourceDeployment.estimated_response_time}
            </div>

            <hr />

            {deploymentResources.map((resource, idx) => (
              <div
                key={idx}
                style={{
                  marginTop: "6px",
                  padding: "6px",
                  borderRadius: "4px",
                  background: "#ffffff",
                  border: "1px solid #ddd"
                }}
              >
                <strong>
                  {resource.resource_type} x{resource.quantity}
                </strong>
                <br />
                Destination: {resource.destination}
                <br />
                Purpose: {resource.purpose}
              </div>
            ))}
          </div>
        ) : (
          <div>Loading resource deployment...</div>
        )}

        <hr />

        <div>
          <strong>Escalation Intelligence</strong>
        </div>

        {escalationIntel ? (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#f8f9fa"
            }}
          >
            <div>
              <strong>Status:</strong>{" "}
              {escalationIntel.current_escalation_status}
            </div>

            <hr />

            {escalationChain.map((level) => (
              <div
                key={level.level}
                style={{
                  marginTop: "6px",
                  padding: "6px",
                  borderRadius: "4px",
                  background: statusColor(level.status)
                }}
              >
                <strong>Level {level.level}</strong>
                <br />
                {level.authority}
                <br />
                Status: {level.status}
              </div>
            ))}
          </div>
        ) : (
          <div>Loading escalation intelligence...</div>
        )}

        <hr />

        <div>
          <strong>Financial Impact Intelligence</strong>
        </div>

        {financialImpact ? (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#fff8e1"
            }}
          >
            <div>
              <strong>Population Impacted:</strong>{" "}
              {financialImpact.population_impacted}
            </div>

            <div>Testing Cost: ${costs.testing_cost}</div>
            <div>Flushing Cost: ${costs.flushing_cost}</div>
            <div>Notification Cost: ${costs.notification_cost}</div>
            <div>Emergency Staffing: ${costs.emergency_staffing_cost}</div>

            <div
              style={{
                marginTop: "8px",
                padding: "8px",
                borderRadius: "4px",
                background: "#ffcccc",
                fontWeight: "bold"
              }}
            >
              Estimated Total: ${costs.estimated_total_incident_cost}
            </div>
          </div>
        ) : (
          <div>Loading financial impact...</div>
        )}

        <hr />

        <div>
          <strong>Predictive Spread Intelligence</strong>
        </div>

        {predictiveSpread ? (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#f3e5f5"
            }}
          >
            <div>
              <strong>Model:</strong> {predictiveSpread.model_type}
            </div>

            <div>
              <strong>Current Population:</strong>{" "}
              {predictiveSpread.current_population_at_risk}
            </div>

            <hr />

            {forecast.map((item) => (
              <div
                key={item.hours}
                style={{
                  marginTop: "6px",
                  padding: "6px",
                  borderRadius: "4px",
                  background: "#ffffff",
                  border: "1px solid #ddd"
                }}
              >
                <strong>{item.hours} Hours</strong>
                <br />
                Population at Risk: {item.population_at_risk}
                <br />
                Radius: {item.risk_zone_radius_m} m
                <br />
                Severity: {item.severity}
              </div>
            ))}

            <div style={{ marginTop: "8px" }}>
              {predictiveSpread.interpretation}
            </div>
          </div>
        ) : (
          <div>Loading predictive spread...</div>
        )}

        <hr />

        <div>
          <strong>Source Attribution Intelligence</strong>
        </div>

        {sourceAttribution ? (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#fff7e6"
            }}
          >
            <div>
              <strong>Likely Source:</strong>
              <br />
              {sourceAttribution.most_likely_source}
            </div>

            <div style={{ marginTop: "6px" }}>
              <strong>Confidence:</strong>{" "}
              {sourceAttribution.confidence_score}%
            </div>

            <div style={{ marginTop: "6px" }}>
              <strong>Evidence</strong>
              <ul style={{ paddingLeft: "18px", marginTop: "4px" }}>
                {sourceAttribution.supporting_evidence?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: "6px" }}>
              <strong>Interpretation:</strong>
              <br />
              {sourceAttribution.interpretation}
            </div>
          </div>
        ) : (
          <div>Loading source attribution...</div>
        )}

        <hr />

        <div>
          <strong>Affected Facility Groups</strong>
        </div>

        {facilityGroups.length > 0 ? (
          facilityGroups.map((group) => (
            <div key={group.type}>
              {group.type}: {group.count} site(s), population{" "}
              {group.population_served}
            </div>
          ))
        ) : (
          <div>Loading facility groups...</div>
        )}

        <hr />

        <div>
          <strong>Alert Routing Intelligence</strong>
        </div>

        {routing.length > 0 ? (
          routing.map((facility) => (
            <div
              key={facility.facility_id}
              style={{
                marginTop: "8px",
                padding: "7px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                background: "#f8f9fa"
              }}
            >
              <strong>{facility.facility_name}</strong>
              <br />
              <span style={{ color: "#666" }}>
                {facility.facility_type} | Criticality{" "}
                {facility.criticality_score}
              </span>

              <ul style={{ marginTop: "5px", paddingLeft: "18px" }}>
                {facility.notify.map((person, idx) => (
                  <li key={idx}>{person}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div>Loading alert routing...</div>
        )}

        <hr />

        <div>
          <strong>Notification Status Dashboard</strong>
        </div>

        {notificationStatus ? (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#eef7ff"
            }}
          >
            <div>
              <strong>Total:</strong>{" "}
              {notificationStatus.total_notifications}
            </div>

            <div>
              <strong>Delivered:</strong> {notificationStatus.delivered}
            </div>

            <div>
              <strong>Acknowledged:</strong>{" "}
              {notificationStatus.acknowledged}
            </div>

            <div>
              <strong>Pending:</strong> {notificationStatus.pending}
            </div>

            <div>
              <strong>Acknowledgement Rate:</strong>{" "}
              {notificationStatus.acknowledgement_rate}%
            </div>

            <hr />

            {notifications.map((note, idx) => (
              <div
                key={idx}
                style={{
                  marginTop: "6px",
                  padding: "6px",
                  borderRadius: "4px",
                  background: note.acknowledged ? "#d4edda" : "#fff3cd"
                }}
              >
                <strong>{note.facility}</strong>
                <br />
                {note.recipient} via {note.method}
                <br />
                Status: {note.status}
                <br />
                {note.acknowledged ? "Acknowledged" : "Awaiting Response"}
              </div>
            ))}
          </div>
        ) : (
          <div>Loading notification status...</div>
        )}

        <hr />

        <div>
          <strong>Community Alert Intelligence</strong>
        </div>

        {communityAlerts ? (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#eef8ff"
            }}
          >
            <div>
              <strong>Total Recipients:</strong>{" "}
              {communityAlerts.total_recipients}
            </div>

            <div>
              <strong>Alerts Sent:</strong> {communityAlerts.alerts_sent}
            </div>

            <div>
              <strong>Email Alerts:</strong> {communityAlerts.email_alerts}
            </div>

            <div>
              <strong>SMS Alerts:</strong> {communityAlerts.sms_alerts}
            </div>

            <div>
              <strong>Reach Rate:</strong> {communityAlerts.reach_rate}%
            </div>

            <hr />

            {communityAlertRows.map((alert) => (
              <div
                key={alert.id}
                style={{
                  marginTop: "6px",
                  padding: "6px",
                  borderRadius: "4px",
                  background: "#ffffff",
                  border: "1px solid #ddd"
                }}
              >
                <strong>{alert.site_name}</strong>
                <br />
                {alert.recipient_name}
                <br />
                {alert.recipient_type}
                <br />
                Channel: {alert.delivery_channel}
                <br />
                Status: {alert.status}
              </div>
            ))}
          </div>
        ) : (
          <div>Loading community alerts...</div>
        )}

        <hr />

        <div>
          <strong>Incident Timeline Intelligence</strong>
        </div>

        <div
          style={{
            marginTop: "8px",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            background: "#ffffff"
          }}
        >
          {timeline.length > 0 ? (
            timeline.map((item) => (
              <div
                key={item.id}
                style={{
                  borderLeft: `5px solid ${timelineColor(item.severity)}`,
                  paddingLeft: "10px",
                  marginBottom: "10px"
                }}
              >
                <strong>{item.activity_type}</strong>
                <br />
                {item.event}
                <br />
                <small>
                  {item.created_by} | {item.created_at}
                </small>
              </div>
            ))
          ) : (
            <div>Loading incident timeline...</div>
          )}
        </div>
      </div>

      <MapContainer
        center={incidentCenter}
        zoom={13}
        style={{ height: "700px", width: "100%" }}
      >
        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Circle
          center={incidentCenter}
          radius={1000}
          pathOptions={{
            color: "red",
            fillColor: "red",
            fillOpacity: 0.15,
            weight: 3
          }}
        >
          <Popup>
            <strong>Incident Impact Zone</strong>
            <br />
            Radius: 1000 meters
            <br />
            Population at Risk: {data.incident.population_at_risk}
            <br />
            Alert Level: {data.incident.alert_level}
            <br />
            Status: {data.incident.incident_status}

            <hr />

            <strong>Recommended Response Checklist</strong>
            {renderRecommendedActions()}
          </Popup>
        </Circle>

        {forecast
          .filter((item) => item.hours > 0)
          .map((item) => (
            <Circle
              key={item.hours}
              center={incidentCenter}
              radius={item.risk_zone_radius_m}
              pathOptions={{
                color: item.hours >= 24 ? "purple" : "orange",
                fillColor: item.hours >= 24 ? "purple" : "orange",
                fillOpacity: 0.04,
                weight: 1
              }}
            >
              <Popup>
                <strong>{item.hours}-Hour Predictive Spread</strong>
                <br />
                Population at Risk: {item.population_at_risk}
                <br />
                Radius: {item.risk_zone_radius_m} m
                <br />
                Severity: {item.severity}
              </Popup>
            </Circle>
          ))}

        {lines.map((line) => (
          <Polyline
            key={line.id}
            positions={line.coordinates}
            pathOptions={{
              color: lineColor(line),
              weight: 6,
              opacity: 0.85
            }}
          >
            <Popup>
              <strong>{line.line_name}</strong>
              <br />
              Code: {line.line_code}
              <br />
              County: {line.county}, {line.state}
              <br />
              Status: {line.id === 1 ? "Affected / Critical" : "Normal"}

              <hr />

              <strong>Recommended Response Checklist</strong>
              {renderRecommendedActions(4)}
            </Popup>
          </Polyline>
        ))}

        {data.map_points.map((point) => (
          <div key={point.id}>
            <Circle
              center={[Number(point.lat), Number(point.lon)]}
              radius={90}
              pathOptions={{
                color: riskColor(point),
                fillColor: riskColor(point),
                fillOpacity: 0.35,
                weight: 2
              }}
            >
              <Popup>
                <strong>{point.name}</strong>
                <br />
                Type: {point.type}
                <br />
                Population: {point.population_served}
                <br />
                Criticality: {point.criticality_score}
                <br />
                Risk Color: {riskColor(point)}

                <hr />

                <strong>Recommended Response Checklist</strong>
                {renderRecommendedActions(5)}
              </Popup>
            </Circle>

            <Marker
              icon={getIcon(point.type)}
              position={[Number(point.lat), Number(point.lon)]}
            >
              <Popup>
                <strong>{point.name}</strong>
                <br />
                Type: {point.type}
                <br />
                Population: {point.population_served}
                <br />
                Criticality: {point.criticality_score}

                <hr />

                <strong>Recommended Response Checklist</strong>
                {renderRecommendedActions(5)}
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>
    </div>
  );
}