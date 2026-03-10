/**
 * Mock Data Service
 * 
 * Provides mock data that matches the backend API structure.
 * Used in demo mode when backend is not available.
 * 
 * These mock responses align with the FastAPI backend schema.
 */

import type {
  DashboardOverview,
  MeasurementsResponse,
  AlertsResponse,
  AlertTimelineResponse,
  MapDataResponse,
  SourceAttributionResponse,
  WaterUseGuidanceResponse,
  SystemStatus,
} from '@/app/types/api';

/**
 * Mock Dashboard Overview
 * Endpoint: /api/v1/dashboard/overview
 */
export const mockDashboardOverview: DashboardOverview = {
  risk_level: 'monitoring',
  confidence_score: 78,
  risk_trend: 'escalating',
  change_percentage: '+6%',
  last_updated: '2026-01-20T14:32:00Z',
  recommended_actions: [
    'Increase testing frequency to twice-weekly to protect student and staff health',
    'Notify school administration and facilities team within 48 hours',
    'Consider temporary bottled water for drinking fountains if turbidity continues to rise',
  ],
  context_type: 'school',
  location: {
    name: 'Lincoln Elementary School',
    district: 'District 5 · North Wing',
    building_type: 'Educational facility',
    building_age: 32,
    plumbing_type: 'Mixed copper/PVC',
  },
};

/**
 * Mock Measurements Data
 * Endpoint: /api/v1/measurements/latest
 */
export const mockMeasurementsResponse: MeasurementsResponse = {
  site_id: 'lincoln-elementary-001',
  parameters: [
    {
      parameter_code: 'PB',
      parameter_name: 'Lead',
      measured_value: 12,
      unit: 'ppb',
      threshold: 15,
      status: 'moderate',
      trend: 'increasing',
      change_value: '+1.8',
      change_label: 'since last week',
      timestamp: '2026-01-20T14:00:00Z',
      category: 'heavy-metals',
    },
    {
      parameter_code: 'CU',
      parameter_name: 'Copper',
      measured_value: 0.9,
      unit: 'ppm',
      threshold: 1.3,
      status: 'safe',
      trend: 'decreasing',
      change_value: '-0.1',
      change_label: 'since last week',
      timestamp: '2026-01-20T14:00:00Z',
      category: 'heavy-metals',
    },
    {
      parameter_code: 'CL',
      parameter_name: 'Chlorine',
      measured_value: 3.2,
      unit: 'ppm',
      threshold: 4.0,
      status: 'safe',
      trend: 'stable',
      change_value: '+0.0',
      change_label: 'since last week',
      timestamp: '2026-01-20T14:00:00Z',
      category: 'disinfectant',
    },
    {
      parameter_code: 'PH',
      parameter_name: 'pH',
      measured_value: 7.8,
      unit: '',
      threshold: 8.5,
      status: 'safe',
      trend: 'stable',
      change_value: '+0.1',
      change_label: 'since last week',
      timestamp: '2026-01-20T14:00:00Z',
      category: 'physical',
    },
    {
      parameter_code: 'TURB',
      parameter_name: 'Turbidity',
      measured_value: 0.8,
      unit: 'NTU',
      threshold: 1.0,
      status: 'moderate',
      trend: 'increasing',
      change_value: '+0.3',
      change_label: 'since last week',
      timestamp: '2026-01-20T14:00:00Z',
      category: 'physical',
    },
    {
      parameter_code: 'TC',
      parameter_name: 'Total Coliforms',
      measured_value: 0,
      unit: 'CFU/100mL',
      threshold: 0,
      status: 'safe',
      trend: 'stable',
      change_value: '0',
      change_label: 'since last week',
      timestamp: '2026-01-20T14:00:00Z',
      category: 'microbiology',
    },
    {
      parameter_code: 'EC',
      parameter_name: 'E. coli',
      measured_value: 0,
      unit: 'CFU/100mL',
      threshold: 0,
      status: 'safe',
      trend: 'stable',
      change_value: '0',
      change_label: 'since last week',
      timestamp: '2026-01-20T14:00:00Z',
      category: 'microbiology',
    },
  ],
  last_updated: '2026-01-20T14:00:00Z',
};

/**
 * Mock Alerts Data
 * Endpoint: /api/v1/alerts
 */
export const mockAlertsResponse: AlertsResponse = {
  alerts: [
    {
      id: 'alert-001',
      tier: 'ACTION',
      title: 'Elevated Turbidity Detected',
      message: 'Water clarity has decreased. Increased monitoring recommended.',
      status: 'active',
      sent_at: '2026-01-20T12:05:00Z',
      occurrence_count: 1,
      parameter_codes: ['TURB'],
    },
    {
      id: 'alert-002',
      tier: 'ACTION',
      title: 'Lead Levels Rising',
      message: 'Lead concentration trending upward. Consider increased testing.',
      status: 'active',
      sent_at: '2026-01-20T12:08:00Z',
      occurrence_count: 1,
      parameter_codes: ['PB'],
    },
  ],
  total_count: 2,
};

/**
 * Mock Alert Timeline
 * Endpoint: /api/v1/alerts/timeline
 */
export const mockAlertTimeline: AlertTimelineResponse = {
  events: [
    {
      timestamp: '2026-01-20T12:05:00Z',
      event: 'Detection',
      description: 'Elevated turbidity detected',
      event_type: 'detection',
    },
    {
      timestamp: '2026-01-20T12:12:00Z',
      event: 'Classification',
      description: 'Risk classification updated',
      event_type: 'update',
    },
    {
      timestamp: '2026-01-20T12:15:00Z',
      event: 'Notification',
      description: 'Alerts dispatched to registered contacts',
      event_type: 'notification',
    },
  ],
};

/**
 * Mock Map Data
 * Endpoint: /api/v1/alerts/map
 */
export const mockMapData: MapDataResponse = {
  locations: [
    {
      location_label: 'Lincoln Elementary School',
      latitude: 40.7128,
      longitude: -74.0060,
      status: 'monitoring',
      parameter_code: 'TURB',
      measured_value: 0.8,
      unit: 'NTU',
      last_updated: '2026-01-20T14:00:00Z',
      facility_type: 'school',
    },
    {
      location_label: 'Washington High School',
      latitude: 40.7580,
      longitude: -73.9855,
      status: 'safe',
      last_updated: '2026-01-20T13:45:00Z',
      facility_type: 'school',
    },
    {
      location_label: 'City Hospital',
      latitude: 40.7489,
      longitude: -73.9680,
      status: 'critical',
      parameter_code: 'PB',
      measured_value: 18,
      unit: 'ppb',
      last_updated: '2026-01-20T14:10:00Z',
      facility_type: 'hospital',
    },
  ],
  district_risk_overlay: [
    { district_id: 'district-1', risk_level: 'safe' },
    { district_id: 'district-2', risk_level: 'safe' },
    { district_id: 'district-3', risk_level: 'monitoring' },
    { district_id: 'district-4', risk_level: 'safe' },
    { district_id: 'district-5', risk_level: 'monitoring' },
  ],
};

/**
 * Mock Source Attribution
 * Endpoint: /api/v1/source-attribution/{site_id}
 */
export const mockSourceAttribution: SourceAttributionResponse = {
  site_id: 'lincoln-elementary-001',
  assessment_type: 'inferred',
  headline: 'Elevated lead risk likely originates from building plumbing infrastructure',
  confidence_score: 68,
  candidates: [
    {
      source_type: 'building_plumbing',
      label: 'Building Plumbing',
      probability: 68,
      evidence: [
        { parameter: 'pH', value: 6.1, unit: '' },
        { parameter: 'Lead', value: 0.019, unit: 'mg/L' },
      ],
    },
    {
      source_type: 'distribution_line',
      label: 'Distribution Line',
      probability: 24,
      evidence: [
        { parameter: 'pH', value: 6.8, unit: '' },
        { parameter: 'Lead', value: 0.004, unit: 'mg/L' },
      ],
    },
    {
      source_type: 'central_system',
      label: 'Central Water System',
      probability: 8,
      evidence: [
        { parameter: 'pH', value: 7.2, unit: '' },
        { parameter: 'Lead', value: 0.002, unit: 'mg/L' },
      ],
    },
  ],
  immediate_actions: [
    'Flush taps for 2 minutes before use',
    'Use cold water for drinking and cooking',
    'Install certified lead-reduction filters',
  ],
  follow_up_actions: [
    'Schedule inspection of building plumbing by certified professional',
    'Request certified laboratory testing (first-draw and flushed samples)',
    'Review water heater and fixture replacement timeline',
  ],
  explanation: 'The pattern of elevated lead with decreasing pH suggests leaching from building-level plumbing materials. Water chemistry signals indicate corrosive conditions favoring metal dissolution from older fixtures or solder joints.',
  data_sources: [
    'Utility-level water quality reports',
    'Building infrastructure records',
    'Neighborhood baseline measurements',
    'EPA compliance monitoring data',
  ],
  timestamp: '2026-01-20T14:30:00Z',
};

/**
 * Mock Water Use Guidance
 * Endpoint: /api/v1/guidance/water-use
 */
export const mockWaterUseGuidance: WaterUseGuidanceResponse = {
  site_id: 'lincoln-elementary-001',
  risk_level: 'monitoring',
  guidance: [
    { activity: 'drinking', status: 'caution', label: 'Use caution', icon: '⚠️' },
    { activity: 'cooking', status: 'caution', label: 'Use caution', icon: '⚠️' },
    { activity: 'brushing_teeth', status: 'safe', label: 'Safe', icon: '✅' },
    { activity: 'bathing', status: 'safe', label: 'Safe', icon: '✅' },
    { activity: 'laundry', status: 'safe', label: 'Safe', icon: '✅' },
    { activity: 'cleaning', status: 'safe', label: 'Safe', icon: '✅' },
    { activity: 'toilet', status: 'safe', label: 'Safe', icon: '✅' },
  ],
  disclaimer: 'Guidance based on inferred risk conditions and available system-level data. Not a substitute for regulatory testing or official advisories.',
};

/**
 * Mock System Status
 * Endpoint: /api/v1/system/status
 */
export const mockSystemStatus: SystemStatus = {
  signals_refreshed_at: '2026-01-20T14:14:00Z',
  next_model_update: '2026-01-20T15:00:00Z',
  system_health: 'operational',
  data_integrity_verified: true,
  last_lab_verification: '2026-01-15T10:00:00Z',
};
