# FalilaX Backend Integration Guide

This document explains the frontend-backend integration architecture for the FalilaX Water Risk Intelligence system.

## Overview

The frontend has been prepared for seamless integration with the FastAPI backend. All data structures, API endpoints, and component mappings align with the backend architecture.

## Architecture

### Type Definitions (`/src/app/types/api.ts`)

TypeScript interfaces that match FastAPI response schemas:
- `DashboardOverview` - Overall risk status and metrics
- `MeasurementsResponse` - Water quality parameters
- `AlertsResponse` - Alert notifications
- `AlertTimelineResponse` - Chronological events
- `MapDataResponse` - Geospatial data for map
- `SourceAttributionResponse` - Source analysis results
- `WaterUseGuidanceResponse` - Activity-based guidance
- `SystemStatus` - System health monitoring

### API Configuration (`/src/app/config/api.ts`)

Central configuration for all backend endpoints:
```typescript
export const API_ENDPOINTS = {
  DASHBOARD_OVERVIEW: '/api/v1/dashboard/overview',
  MEASUREMENTS_LATEST: '/api/v1/measurements/latest',
  ALERTS: '/api/v1/alerts',
  ALERTS_TIMELINE: '/api/v1/alerts/timeline',
  ALERTS_MAP: '/api/v1/alerts/map',
  SOURCE_ATTRIBUTION: '/api/v1/source-attribution/{site_id}',
  WATER_USE_GUIDANCE: '/api/v1/guidance/water-use',
  SYSTEM_STATUS: '/api/v1/system/status',
};
```

**Environment Configuration:**
Set `REACT_APP_API_BASE_URL` in `.env` to point to your FastAPI backend:
```
REACT_APP_API_BASE_URL=http://localhost:8000
```

### API Client (`/src/app/utils/api-client.ts`)

Utility functions for API calls:
- `fetchAPI<T>()` - Generic API fetch with error handling
- `fetchAPIWithRetry<T>()` - Automatic retry logic for failed requests
- `isDemoMode()` - Check if running in demo mode (mock data)
- `formatTimestamp()` - Convert API timestamps to human-readable format
- `formatRelativeTime()` - Format "X minutes ago" style timestamps

### UI Components

#### Loading States (`/src/app/components/ui/loading-state.tsx`)
- `<LoadingState />` - Full loading screen with message
- `<LoadingSpinner />` - Inline spinner
- `<SkeletonCard />` - Skeleton loader for cards
- `<SkeletonParameter />` - Skeleton loader for parameters

#### Error States (`/src/app/components/ui/error-state.tsx`)
- `<ErrorState />` - Full error screen with retry button
- `<InlineError />` - Inline error message

#### Empty States (`/src/app/components/ui/empty-state.tsx`)
- `<EmptyState />` - Display when no data is available

### Mock Data Service (`/src/app/services/mock-data.ts`)

Mock data that matches backend API structure, used in demo mode:
- `mockDashboardOverview`
- `mockMeasurementsResponse`
- `mockAlertsResponse`
- `mockAlertTimeline`
- `mockMapData`
- `mockSourceAttribution`
- `mockWaterUseGuidance`
- `mockSystemStatus`

### Developer Reference (`/src/app/components/dev/data-schema-reference.tsx`)

Hidden component documenting all API endpoints and field mappings. View in browser dev tools during development.

## Component-to-API Mapping

### Dashboard Component
**API Endpoints:**
- Overview data: `GET /api/v1/dashboard/overview`
- Parameters: `GET /api/v1/measurements/latest`
- Alerts: `GET /api/v1/alerts`
- Timeline: `GET /api/v1/alerts/timeline`
- System status: `GET /api/v1/system/status`

**Data Binding:**
```typescript
// Risk Status Card
risk_level: 'safe' | 'monitoring' | 'critical'
confidence_score: number (0-100)
risk_trend: 'improving' | 'stable' | 'worsening'

// Parameters
parameters: WaterParameter[]
  - parameter_code: string
  - measured_value: number
  - status: 'safe' | 'moderate' | 'critical'
  - trend: 'increasing' | 'decreasing' | 'stable'
```

### Community Map Component
**API Endpoints:**
- Map locations: `GET /api/v1/alerts/map`

**Data Binding:**
```typescript
locations: MapLocation[]
  - location_label: string
  - latitude: number
  - longitude: number
  - status: 'safe' | 'monitoring' | 'critical'
  - parameter_code?: string
  - measured_value?: number
```

**Map Marker Colors:**
- Safe = Green (`#10b981`)
- Monitoring = Yellow/Amber (`#fbbf24`)
- Critical = Red (`#ef4444`)

### Source Attribution Component
**API Endpoints:**
- Attribution analysis: `GET /api/v1/source-attribution/{site_id}`

**Data Binding:**
```typescript
assessment_type: 'inferred' | 'measured' | 'hybrid'
headline: string
confidence_score: number
candidates: SourceCandidate[]
  - source_type: string
  - label: string
  - probability: number
  - evidence: Array<{parameter, value, unit}>
```

### Context Selection
**Context Parameter:**
All dashboard API requests should include `context_type` parameter:
- `home` - Residential home
- `school` - Educational facility
- `hospital` - Healthcare facility
- `restaurant` - Food service
- `utility` - Water utility operator

## Integration Steps

### 1. Environment Setup
Create `.env` file in project root:
```bash
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_DEMO_MODE=false  # Set to 'true' to use mock data
```

### 2. Update API Client
In `/src/app/utils/api-client.ts`, update `isDemoMode()` function:
```typescript
export function isDemoMode(): boolean {
  return process.env.REACT_APP_DEMO_MODE === 'true';
}
```

### 3. Component Integration Pattern

Example of integrating a component with the backend:

```typescript
import { useState, useEffect } from 'react';
import { fetchAPIWithRetry } from '@/app/utils/api-client';
import { buildApiUrl } from '@/app/config/api';
import { API_ENDPOINTS } from '@/app/config/api';
import { LoadingState } from '@/app/components/ui/loading-state';
import { ErrorState } from '@/app/components/ui/error-state';
import type { DashboardOverview, APIError } from '@/app/types/api';

function Dashboard() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<APIError | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = buildApiUrl(API_ENDPOINTS.DASHBOARD_OVERVIEW);
      const response = await fetchAPIWithRetry<DashboardOverview>(url);
      setData(response);
    } catch (err) {
      setError(err as APIError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState error={error} onRetry={loadData} />;
  if (!data) return <EmptyState title="No data available" />;

  return (
    <div>
      {/* Render dashboard with data */}
    </div>
  );
}
```

### 4. Query Parameters

For endpoints with parameters:
```typescript
// Path parameters
const url = buildApiUrl(
  API_ENDPOINTS.SOURCE_ATTRIBUTION, 
  { site_id: 'lincoln-elementary-001' }
);

// Query parameters
const url = buildApiUrlWithQuery(
  API_ENDPOINTS.MEASUREMENTS_LATEST,
  undefined,
  { context_type: 'school', limit: 20 }
);
```

## Color System Mapping

### Risk Levels
```typescript
const riskColors = {
  safe: '#10b981',      // emerald-400
  monitoring: '#fbbf24', // amber-400
  critical: '#ef4444',   // red-400
};
```

### Alert Tiers
```typescript
const alertColors = {
  NOTICE: '#3b82f6',    // blue-400
  ACTION: '#fbbf24',    // amber-400
  CRITICAL: '#ef4444',  // red-400
};
```

## Error Handling

All API calls should handle three error states:

1. **Network Error** - No connection to backend
2. **Timeout Error** - Request took too long (30s default)
3. **API Error** - Backend returned error response

Example:
```typescript
try {
  const data = await fetchAPIWithRetry(url);
} catch (error) {
  const apiError = error as APIError;
  
  if (apiError.status_code === 404) {
    // Handle not found
  } else if (apiError.status_code === 0) {
    // Handle network error
  } else if (apiError.status_code === 408) {
    // Handle timeout
  } else {
    // Handle other errors
  }
}
```

## Polling for Real-Time Updates

Use polling intervals defined in `API_CONFIG.POLLING`:

```typescript
useEffect(() => {
  loadData(); // Initial load
  
  const interval = setInterval(() => {
    loadData(); // Refresh data
  }, API_CONFIG.POLLING.DASHBOARD); // 60 seconds
  
  return () => clearInterval(interval);
}, []);
```

## Testing

### Demo Mode
Set `REACT_APP_DEMO_MODE=true` to test with mock data without backend.

### Backend Integration
1. Start FastAPI backend: `uvicorn main:app --reload`
2. Set `REACT_APP_API_BASE_URL=http://localhost:8000`
3. Set `REACT_APP_DEMO_MODE=false`
4. Test all endpoints with browser network inspector

## Next Steps

1. **Connect to Backend**: Update `.env` with FastAPI backend URL
2. **Implement Data Fetching**: Add API calls to components using patterns above
3. **Test Integration**: Verify all endpoints return expected data
4. **Add Authentication**: Implement JWT tokens if required by backend
5. **Optimize Performance**: Add caching, debouncing, and request deduplication

## Support

For questions about the backend integration:
- Review TypeScript types in `/src/app/types/api.ts`
- Check API endpoint constants in `/src/app/config/api.ts`
- Examine mock data structure in `/src/app/services/mock-data.ts`
- View developer reference in `/src/app/components/dev/data-schema-reference.tsx`
