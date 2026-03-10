Improve the current FalilaX dashboard UI so that it aligns directly with the backend API architecture.

Important constraints:

Do NOT redesign the interface

Do NOT change layout

Do NOT move components

Do NOT change typography or color system

Only add data-binding readiness and backend field references

Maintain the current visual identity

Add invisible structure or labels that map to backend data

The goal is to make the UI backend-ready for FastAPI integration.

1. Add Data Binding Labels to Key Components

Each dynamic UI component must have a data binding identifier that maps to backend responses.

Example structure:

data_source: /api/v1/dashboard/overview
field: risk_status

Add these identifiers as developer notes or component labels in Figma Dev Mode.

Apply this to the following UI elements.

2. Dashboard Overview Data Mapping

Attach the following backend fields to the dashboard widgets.

Risk Status Card

endpoint: /api/v1/dashboard/overview
field: risk_level
values: safe | monitoring | critical

Confidence Score

endpoint: /api/v1/dashboard/overview
field: confidence_score

Trend Indicator

endpoint: /api/v1/dashboard/overview
field: risk_trend
values: improving | stable | worsening

Last Updated Timestamp

endpoint: /api/v1/dashboard/overview
field: last_updated

Recommended Actions Panel

endpoint: /api/v1/dashboard/overview
field: recommended_actions[]
3. Parameter Signals Mapping

For parameter cards such as:

pH

turbidity

lead

chlorine

microbial signals

Add the following data references:

endpoint: /api/v1/measurements/latest
fields:
- parameter_code
- measured_value
- unit
- threshold
- status
- trend
- timestamp

Each parameter card should bind to one record in the array.

4. Alerts System Mapping

Connect alert UI components to the alerts API.

Alert List Panel

endpoint: /api/v1/alerts
fields:
- id
- tier
- title
- message
- status
- sent_at
- occurrence_count

Alert Severity Colors

NOTICE = blue
ACTION = yellow
CRITICAL = red

Alert Timeline

endpoint: /api/v1/alerts/timeline
fields:
- timestamp
- event
- description
5. Community Map Data Mapping

Map markers must connect to backend geospatial alert data.

endpoint: /api/v1/alerts/map
fields:
- location_label
- latitude
- longitude
- status
- parameter_code
- measured_value
- last_updated

Map marker color mapping:

safe = green
monitor = yellow
critical = red

Hover card fields:

facility_name
parameter_signals
risk_level
timestamp
6. Source Attribution Mapping

Connect the Source Attribution page to the backend analysis endpoint.

endpoint: /api/v1/source-attribution/{site_id}

Bind the following UI elements.

Assessment Type

field: assessment_type
values: inferred | measured | hybrid

Conclusion Headline

field: headline

Confidence Score

field: confidence_score

Source Probabilities

field: candidates[]
subfields:
- source_type
- label
- probability
- evidence[]

Immediate Actions

field: immediate_actions[]

Follow Up Actions

field: follow_up_actions[]

Explanation Panel

field: explanation

Data Sources Panel

field: data_sources[]
7. Water Use Guidance Mapping

Connect water use guidance UI cards to backend guidance rules.

endpoint: /api/v1/guidance/water-use
fields:
- activity
- status
- label

Status mapping:

safe
caution
avoid

Activities:

drinking
cooking
brushing_teeth
bathing
laundry
cleaning
toilet
8. Context Selection Mapping

Each context card should pass a context parameter to backend APIs.

Add hidden parameter mapping:

context_type = home
context_type = school
context_type = hospital
context_type = restaurant
context_type = utility

This parameter should be attached to all dashboard API requests.

9. System Monitoring Indicators

Bind the system status indicators to backend monitoring endpoints.

Live Data Indicator

endpoint: /api/v1/system/status
fields:
- signals_refreshed_at
- next_model_update
- system_health
10. Add Loading and Empty States

Prepare UI components for backend latency.

Add loading states:

Loading signals...
Fetching risk analysis...
Retrieving water measurements...

Add empty states:

No recent measurements available
No alerts detected
No risk signals detected
11. Add Error State UI

Prepare error messaging components.

Example:

Unable to retrieve water quality signals.
Retry connection.

Add retry button:

Retry API request
12. Add Developer Data Schema Panel (Hidden)

Create a hidden frame labeled:

FalilaX Data Schema Reference

List the primary backend endpoints.

/api/v1/dashboard/overview
/api/v1/alerts
/api/v1/alerts/map
/api/v1/measurements/latest
/api/v1/source-attribution/{site_id}
/api/v1/guidance/water-use
/api/v1/system/status

This frame is for developer reference only and should not appear in the UI.