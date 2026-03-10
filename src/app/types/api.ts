/**
 * FalilaX Backend API Type Definitions
 * 
 * These types map directly to the FastAPI backend responses.
 * Maintains alignment with backend data architecture for seamless integration.
 */

// ============================================================================
// Dashboard Overview API
// Endpoint: /api/v1/dashboard/overview
// ============================================================================

export interface DashboardOverview {
  risk_level: 'safe' | 'monitoring' | 'critical';
  confidence_score: number;
  risk_trend: 'improving' | 'stable' | 'worsening' | 'escalating' | 'fluctuating';
  change_percentage: string;
  last_updated: string;
  recommended_actions: string[];
  context_type: 'home' | 'school' | 'hospital' | 'restaurant' | 'utility';
  location: {
    name: string;
    district: string;
    building_type: string;
    building_age: number;
    plumbing_type: string;
  };
}

// ============================================================================
// Measurements API
// Endpoint: /api/v1/measurements/latest
// ============================================================================

export interface WaterParameter {
  parameter_code: string;
  parameter_name: string;
  measured_value: number;
  unit: string;
  threshold: number;
  status: 'safe' | 'moderate' | 'critical';
  trend: 'increasing' | 'decreasing' | 'stable';
  change_value: string;
  change_label: string;
  timestamp: string;
  category: 'heavy-metals' | 'physical' | 'microbiology' | 'disinfectant' | 'disinfection-byproduct' | 'inorganic' | 'radionuclides';
}

export interface MeasurementsResponse {
  site_id: string;
  parameters: WaterParameter[];
  last_updated: string;
}

// ============================================================================
// Alerts API
// Endpoint: /api/v1/alerts
// ============================================================================

export interface Alert {
  id: string;
  tier: 'NOTICE' | 'ACTION' | 'CRITICAL';
  title: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  sent_at: string;
  occurrence_count: number;
  parameter_codes?: string[];
}

export interface AlertsResponse {
  alerts: Alert[];
  total_count: number;
}

// ============================================================================
// Alert Timeline API
// Endpoint: /api/v1/alerts/timeline
// ============================================================================

export interface TimelineEvent {
  timestamp: string;
  event: string;
  description: string;
  event_type: 'detection' | 'update' | 'notification' | 'resolution';
}

export interface AlertTimelineResponse {
  events: TimelineEvent[];
}

// ============================================================================
// Community Map API
// Endpoint: /api/v1/alerts/map
// ============================================================================

export interface MapLocation {
  location_label: string;
  latitude: number;
  longitude: number;
  status: 'safe' | 'monitoring' | 'critical';
  parameter_code?: string;
  measured_value?: number;
  unit?: string;
  last_updated: string;
  facility_type?: string;
}

export interface MapDataResponse {
  locations: MapLocation[];
  district_risk_overlay?: {
    district_id: string;
    risk_level: 'safe' | 'monitoring' | 'critical';
  }[];
}

// ============================================================================
// Source Attribution API
// Endpoint: /api/v1/source-attribution/{site_id}
// ============================================================================

export interface SourceCandidate {
  source_type: string;
  label: string;
  probability: number;
  evidence: {
    parameter: string;
    value: number;
    unit: string;
  }[];
}

export interface SourceAttributionResponse {
  site_id: string;
  assessment_type: 'inferred' | 'measured' | 'hybrid';
  headline: string;
  confidence_score: number;
  candidates: SourceCandidate[];
  immediate_actions: string[];
  follow_up_actions: string[];
  explanation: string;
  data_sources: string[];
  timestamp: string;
}

// ============================================================================
// Water Use Guidance API
// Endpoint: /api/v1/guidance/water-use
// ============================================================================

export interface WaterUseGuidanceItem {
  activity: 'drinking' | 'cooking' | 'brushing_teeth' | 'bathing' | 'laundry' | 'cleaning' | 'toilet';
  status: 'safe' | 'caution' | 'avoid';
  label: string;
  icon?: string;
}

export interface WaterUseGuidanceResponse {
  site_id: string;
  risk_level: 'safe' | 'monitoring' | 'critical';
  guidance: WaterUseGuidanceItem[];
  disclaimer: string;
}

// ============================================================================
// System Status API
// Endpoint: /api/v1/system/status
// ============================================================================

export interface SystemStatus {
  signals_refreshed_at: string;
  next_model_update: string;
  system_health: 'operational' | 'degraded' | 'outage';
  data_integrity_verified: boolean;
  last_lab_verification?: string;
}

// ============================================================================
// API Error Response
// ============================================================================

export interface APIError {
  error: string;
  message: string;
  status_code: number;
  timestamp: string;
}

// ============================================================================
// API Loading State Helper Type
// ============================================================================

export type APIState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: APIError };
