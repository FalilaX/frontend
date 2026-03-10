/**
 * FalilaX Data Schema Reference
 * 
 * Developer reference for backend API endpoints and data structures.
 * This component is hidden in production and serves as documentation
 * for frontend-backend integration.
 * 
 * @internal
 */

import { API_ENDPOINTS } from '@/app/config/api';

export function DataSchemaReference() {
  // This component should not render in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="hidden" data-dev-reference="falilax-api-schema">
      <h2>FalilaX Backend API Schema Reference</h2>
      
      <section data-category="dashboard">
        <h3>Dashboard & Overview</h3>
        <div data-endpoint={API_ENDPOINTS.DASHBOARD_OVERVIEW}>
          <p>Returns overall risk status, confidence, and recommendations</p>
          <ul>
            <li data-field="risk_level">Risk level: safe | monitoring | critical</li>
            <li data-field="confidence_score">Confidence score: 0-100</li>
            <li data-field="risk_trend">Risk trend: improving | stable | worsening</li>
            <li data-field="last_updated">ISO timestamp</li>
            <li data-field="recommended_actions">Array of action strings</li>
          </ul>
        </div>
      </section>

      <section data-category="measurements">
        <h3>Measurements & Parameters</h3>
        <div data-endpoint={API_ENDPOINTS.MEASUREMENTS_LATEST}>
          <p>Returns latest water quality parameter measurements</p>
          <ul>
            <li data-field="parameter_code">Parameter identifier</li>
            <li data-field="measured_value">Numeric measurement</li>
            <li data-field="unit">Unit of measurement</li>
            <li data-field="threshold">Safety threshold</li>
            <li data-field="status">safe | moderate | critical</li>
            <li data-field="trend">increasing | decreasing | stable</li>
            <li data-field="timestamp">ISO timestamp</li>
          </ul>
        </div>
      </section>

      <section data-category="alerts">
        <h3>Alerts System</h3>
        <div data-endpoint={API_ENDPOINTS.ALERTS}>
          <p>Returns active alerts and notifications</p>
          <ul>
            <li data-field="id">Alert identifier</li>
            <li data-field="tier">NOTICE | ACTION | CRITICAL</li>
            <li data-field="title">Alert title</li>
            <li data-field="message">Alert message</li>
            <li data-field="status">active | acknowledged | resolved</li>
            <li data-field="sent_at">ISO timestamp</li>
          </ul>
        </div>
        <div data-endpoint={API_ENDPOINTS.ALERTS_TIMELINE}>
          <p>Returns chronological alert events</p>
          <ul>
            <li data-field="timestamp">ISO timestamp</li>
            <li data-field="event">Event name</li>
            <li data-field="description">Event description</li>
          </ul>
        </div>
        <div data-endpoint={API_ENDPOINTS.ALERTS_MAP}>
          <p>Returns geospatial alert data for map visualization</p>
          <ul>
            <li data-field="location_label">Facility name</li>
            <li data-field="latitude">Latitude coordinate</li>
            <li data-field="longitude">Longitude coordinate</li>
            <li data-field="status">safe | monitoring | critical</li>
          </ul>
        </div>
      </section>

      <section data-category="source-attribution">
        <h3>Source Attribution</h3>
        <div data-endpoint={API_ENDPOINTS.SOURCE_ATTRIBUTION}>
          <p>Returns source attribution analysis for contamination</p>
          <ul>
            <li data-field="assessment_type">inferred | measured | hybrid</li>
            <li data-field="headline">Attribution conclusion</li>
            <li data-field="confidence_score">0-100</li>
            <li data-field="candidates">Array of source candidates with probabilities</li>
            <li data-field="immediate_actions">Array of immediate action strings</li>
            <li data-field="follow_up_actions">Array of follow-up action strings</li>
            <li data-field="explanation">Detailed explanation text</li>
          </ul>
        </div>
      </section>

      <section data-category="guidance">
        <h3>Water Use Guidance</h3>
        <div data-endpoint={API_ENDPOINTS.WATER_USE_GUIDANCE}>
          <p>Returns water use safety guidance by activity</p>
          <ul>
            <li data-field="activity">Activity type (drinking, cooking, etc.)</li>
            <li data-field="status">safe | caution | avoid</li>
            <li data-field="label">Display label</li>
          </ul>
        </div>
      </section>

      <section data-category="system">
        <h3>System Status</h3>
        <div data-endpoint={API_ENDPOINTS.SYSTEM_STATUS}>
          <p>Returns system health and data freshness</p>
          <ul>
            <li data-field="signals_refreshed_at">ISO timestamp</li>
            <li data-field="next_model_update">ISO timestamp</li>
            <li data-field="system_health">operational | degraded | outage</li>
            <li data-field="data_integrity_verified">boolean</li>
          </ul>
        </div>
      </section>

      <section data-category="context">
        <h3>Context Parameters</h3>
        <p>Pass context_type parameter with all dashboard requests:</p>
        <ul>
          <li data-context="home">Residential home</li>
          <li data-context="school">Educational facility</li>
          <li data-context="hospital">Healthcare facility</li>
          <li data-context="restaurant">Food service establishment</li>
          <li data-context="utility">Water utility operator</li>
        </ul>
      </section>

      <section data-category="color-mapping">
        <h3>Status Color Mapping</h3>
        <ul>
          <li data-color="safe">Green (#10b981, emerald-400)</li>
          <li data-color="monitoring">Yellow/Amber (#fbbf24, amber-400)</li>
          <li data-color="critical">Red (#ef4444, red-400)</li>
        </ul>
        <h4>Alert Tier Colors</h4>
        <ul>
          <li data-color="NOTICE">Blue (#3b82f6, blue-400)</li>
          <li data-color="ACTION">Yellow/Amber (#fbbf24, amber-400)</li>
          <li data-color="CRITICAL">Red (#ef4444, red-400)</li>
        </ul>
      </section>
    </div>
  );
}

/**
 * API Endpoint Constants for Component Mapping
 * 
 * Use these constants in component comments to document API dependencies
 */
export const COMPONENT_API_MAPPING = {
  Dashboard: {
    overview: API_ENDPOINTS.DASHBOARD_OVERVIEW,
    measurements: API_ENDPOINTS.MEASUREMENTS_LATEST,
    alerts: API_ENDPOINTS.ALERTS,
    timeline: API_ENDPOINTS.ALERTS_TIMELINE,
    systemStatus: API_ENDPOINTS.SYSTEM_STATUS,
  },
  CommunityMap: {
    locations: API_ENDPOINTS.ALERTS_MAP,
  },
  SourceAttribution: {
    analysis: API_ENDPOINTS.SOURCE_ATTRIBUTION,
  },
  WaterUseGuidance: {
    guidance: API_ENDPOINTS.WATER_USE_GUIDANCE,
  },
} as const;
