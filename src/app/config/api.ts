export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  DASHBOARD_OVERVIEW: "/api/v1/dashboard/overview",

  DIGITAL_TWIN_SIMULATE: "/api/v1/digital-twin/simulate",

  INCIDENTS: "/api/v1/incidents",
  INCIDENT_SIMULATE: "/api/v1/incidents/simulate",
  INCIDENT_DETAIL: "/api/v1/incidents/{incident_id}",
  INCIDENT_ACKNOWLEDGE: "/api/v1/incidents/{incident_id}/acknowledge",
  INCIDENT_ASSIGN: "/api/v1/incidents/{incident_id}/assign",
  INCIDENT_INVESTIGATE: "/api/v1/incidents/{incident_id}/investigate",
  INCIDENT_NOTES: "/api/v1/incidents/{incident_id}/notes",
  INCIDENT_VERIFY: "/api/v1/incidents/{incident_id}/verify",
  INCIDENT_RESOLVE: "/api/v1/incidents/{incident_id}/resolve",
  INCIDENT_CLOSE: "/api/v1/incidents/{incident_id}/close",
  INCIDENT_REOPEN: "/api/v1/incidents/{incident_id}/reopen",
  INCIDENT_CANCEL: "/api/v1/incidents/{incident_id}/cancel",

  INCIDENT_ACTIONS: "/api/v1/incidents/{incident_id}/actions",
  INCIDENT_ACTION_PLAN: "/api/v1/incidents/{incident_id}/actions/plan",
  INCIDENT_ACTION_APPROVE: "/api/v1/incidents/{incident_id}/actions/approve",
  INCIDENT_ACTION_START_EXECUTION:
    "/api/v1/incidents/{incident_id}/actions/start-execution",

  MEASUREMENTS_LATEST: "/api/v1/measurements/latest",
  MEASUREMENTS_HISTORY: "/api/v1/measurements/history",

  ALERTS: "/api/v1/alerts",
  ALERTS_TIMELINE: "/api/v1/alerts/timeline",
  ALERTS_MAP: "/api/v1/alerts/map",
  ALERT_ACKNOWLEDGE: "/api/v1/alerts/{alert_id}/acknowledge",

  SOURCE_ATTRIBUTION: "/api/v1/source-attribution/{site_id}",

  WATER_USE_GUIDANCE: "/api/v1/guidance/water-use",

  SYSTEM_STATUS: "/api/v1/system/status",
  SYSTEM_HEALTH: "/api/v1/system/health",

  LOCATIONS: "/api/v1/locations",
  LOCATION_DETAIL: "/api/v1/locations/{location_id}",
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  POLLING: {
    DASHBOARD: 60000,
    MEASUREMENTS: 120000,
    ALERTS: 30000,
    SYSTEM_STATUS: 300000,
  },
};

export function buildApiUrl(
  endpoint: string,
  params?: Record<string, string | number>
): string {
  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, String(value));
    });
  }

  return url;
}

export function buildApiUrlWithQuery(
  endpoint: string,
  pathParams?: Record<string, string | number>,
  queryParams?: Record<string, string | number | boolean | undefined | null>
): string {
  let url = buildApiUrl(endpoint, pathParams);

  if (queryParams) {
    const searchParams = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();

    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
}