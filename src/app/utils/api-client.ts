/**
 * FalilaX API Client Utilities
 * 
 * Provides standardized API call functions with error handling,
 * loading states, and retry logic.
 */

import { API_CONFIG } from '@/app/config/api';
import type { APIError, APIState } from '@/app/types/api';

/**
 * Generic API fetch wrapper with error handling
 */
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
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'API Error',
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
      if (error.name === 'AbortError') {
        throw {
          error: 'Request Timeout',
          message: 'The request took too long to complete',
          status_code: 408,
          timestamp: new Date().toISOString(),
        } as APIError;
      }

      throw {
        error: 'Network Error',
        message: error.message,
        status_code: 0,
        timestamp: new Date().toISOString(),
      } as APIError;
    }

    throw error;
  }
}

/**
 * API fetch with automatic retry logic
 */
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

      // Don't retry on client errors (4xx)
      if (lastError.status_code >= 400 && lastError.status_code < 500) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, API_CONFIG.RETRY_DELAY * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError;
}

/**
 * Mock API response for demo mode
 * 
 * This function simulates API responses when backend is not available.
 * Remove or disable this in production.
 */
export async function fetchAPIMock<T>(
  mockData: T,
  delay: number = 800
): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData), delay);
  });
}

/**
 * Check if we're in demo mode (no backend available)
 */
export function isDemoMode(): boolean {
  // In demo mode, we use mock data instead of real API calls
  // Set REACT_APP_DEMO_MODE=true in .env to enable demo mode
  return process.env.REACT_APP_DEMO_MODE === 'true' || true; // Default to true for now
}

/**
 * API State Management Helper
 * 
 * Creates an APIState object from a promise
 */
export function createAPIState<T>(status: APIState<T>['status'], data?: T, error?: APIError): APIState<T> {
  switch (status) {
    case 'idle':
      return { status: 'idle' };
    case 'loading':
      return { status: 'loading' };
    case 'success':
      return { status: 'success', data: data as T };
    case 'error':
      return { status: 'error', error: error as APIError };
  }
}

/**
 * Format timestamp from API to human-readable format
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

/**
 * Format relative time for "next update in X minutes"
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'updating now';
  if (diffMins < 60) return `~${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  return `~${diffHours} hour${diffHours > 1 ? 's' : ''}`;
}
