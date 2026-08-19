/**
 * FalilaX API Client Utilities
 */

import {
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
  buildApiUrlWithQuery,
} from "@/app/config/api";

import type { APIError, APIState } from "@/app/types/api";

export async function fetchAPI<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "API Error",
        message: response.statusText,
        status_code: response.status,
        timestamp: new Date().toISOString(),
      }));

      throw {
        ...errorData,
        status_code: response.status,
      } as APIError;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw {
          error: "Request Timeout",
          message: "The request took too long to complete",
          status_code: 408,
          timestamp: new Date().toISOString(),
        } as APIError;
      }

      throw {
        error: "Network Error",
        message: error.message,
        status_code: 0,
        timestamp: new Date().toISOString(),
      } as APIError;
    }

    throw error;
  }
}

export async function fetchAPIWithRetry<T>(
  url: string,
  options?: RequestInit,
  maxRetries: number = API_CONFIG.MAX_RETRIES
): Promise<T> {
  let lastError: APIError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchAPI<T>(url, options);
    } catch (error) {
      lastError = error as APIError;

      if (lastError.status_code >= 400 && lastError.status_code < 500) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, API_CONFIG.RETRY_DELAY * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError;
}

export async function simulateDigitalTwinMeasurement(params: {
  node_id: number;
  chlorine_mg_l?: number;
  pressure_psi?: number;
  flow_m3_day?: number;
}) {
  const url = buildApiUrlWithQuery(
    API_ENDPOINTS.DIGITAL_TWIN_SIMULATE,
    undefined,
    params
  );

  return fetchAPI<any>(url, {
    method: "POST",
  });
}

export async function simulateAndSaveIncident(params: {
  node_id: number;
  chlorine_mg_l?: number;
  pressure_psi?: number;
  turbidity_ntu?: number;
  ph?: number;
  temperature_c?: number;
  flow_m3_day?: number;
}) {
  const url = buildApiUrlWithQuery(
    API_ENDPOINTS.INCIDENT_SIMULATE,
    undefined,
    params
  );

  return fetchAPI<any>(url, {
    method: "POST",
  });
}

export async function fetchIncidents() {
  const url = buildApiUrl(API_ENDPOINTS.INCIDENTS);
  return fetchAPI<any[]>(url);
}

export async function fetchIncidentDetail(incident_id: string) {
  const url = buildApiUrl(API_ENDPOINTS.INCIDENT_DETAIL, { incident_id });
  return fetchAPI<any>(url);
}

export async function closeIncident(incident_id: string) {
  const url = buildApiUrl(API_ENDPOINTS.INCIDENT_CLOSE, { incident_id });

  return fetchAPI<any>(url, {
    method: "PATCH",
  });
}

export async function fetchAPIMock<T>(
  mockData: T,
  delay: number = 800
): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData), delay);
  });
}

export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === "true";
}

export function createAPIState<T>(
  status: APIState<T>["status"],
  data?: T,
  error?: APIError
): APIState<T> {
  switch (status) {
    case "idle":
      return { status: "idle" };
    case "loading":
      return { status: "loading" };
    case "success":
      return { status: "success", data: data as T };
    case "error":
      return { status: "error", error: error as APIError };
  }
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();

  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "updating now";
  if (diffMins < 60) return `~${diffMins} minute${diffMins > 1 ? "s" : ""}`;
  return `~${diffHours} hour${diffHours > 1 ? "s" : ""}`;
}