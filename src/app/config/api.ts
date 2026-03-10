/**
 * FalilaX Backend API Configuration
 *
 * Central configuration for all backend API endpoints.
 * Update API_BASE_URL to point to your FastAPI backend.
 */

// API Base URL for Vite frontend
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

/**
 * API Endpoints
 *
 * All backend endpoints for the FalilaX water risk intelligence system.
 * These align with the FastAPI backend architecture.
 */
export const API_ENDPOINTS = {
  // Dashboard & Overview
  DASHBOARD_OVERVIEW: "/api/v1/dashboard/overview",

  // Measurements & Parameters
  MEASUREMENTS_LATEST: "/api/v1/measurements/latest",
  MEASUREMENTS_HISTORY: "/api/v1/measurements/history",

  // Alerts System
  ALERTS: "/api/v1/alerts",
  ALERTS_TIMELINE: "/api/v1/alerts/timeline",
  ALERTS_MAP: "/api/v1/alerts/map",
  ALERT_ACKNOWLEDGE: "/api/v1/alerts/{alert_id}/acknowledge",

  // Source Attribution
  SOURCE_ATTRIBUTION: "/api/v1/source-attribution/{site_id}",

  // Water Use Guidance
  WATER_USE_GUIDANCE: "/api/v1/guidance/water-use",

  // System Monitoring
  SYSTEM_STATUS: "/api/v1/system/status",
  SYSTEM_HEALTH: "/api/v1/system/health",

  // Context & Location
  LOCATIONS: "/api/v1/locations",
  LOCATION_DETAIL: "/api/v1/locations/{location_id}",
} as const;

/**
 * API Request Configuration
 */
export const API_CONFIG = {
  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  // Polling intervals for real-time data (in milliseconds)
  POLLING: {
    DASHBOARD: 60000,      // 1 minute
    MEASUREMENTS: 120000,  // 2 minutes
    ALERTS: 30000,         // 30 seconds
    SYSTEM_STATUS: 300000, // 5 minutes
  },
};

/**
 * Helper function to build API URL with path parameters
 */
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

/**
 * Helper function to build API URL with query parameters
 */
export function buildApiUrlWithQuery(
  endpoint: string,
  pathParams?: Record<string, string | number>,
  queryParams?: Record<string, string | number | boolean>
): string {
  let url = buildApiUrl(endpoint, pathParams);

  if (queryParams) {
    const searchParams = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    url += `?${searchParams.toString()}`;
  }

  return url;
}