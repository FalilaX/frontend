Improve the current FalilaX Water Risk Intelligence dashboard UI while keeping the existing design, layout, and visual identity unchanged.

Important constraints:

Do NOT redesign the interface

Do NOT change layout structure

Do NOT change color palette or typography

Do NOT move existing components

Only add the improvements listed below

Ensure all improvements align with backend-driven data fields

All added elements must appear native to the existing design system

1. Add System Credibility Signal Under the Hero Section

Below the headline:

Water Risk Intelligence Made Clear

Add a subtle credibility line in small text:

Powered by multi-signal water quality analysis and infrastructure risk modeling.

Style:

small text

muted gray

center aligned

placed directly below the headline description

This improves trust and authority.

2. Add Live Data Indicator in the Top Navigation Bar

In the top navigation area add a live monitoring indicator.

Element:

● LIVE DATA
Signals refreshed: 12 minutes ago
Next model update: ~48 minutes

Design:

small green dot indicator

compact inline status component

subtle text

placed near the Demo Mode – Simulated Data label

Purpose: communicate system activity and freshness of data.

3. Improve Community Map Intelligence Layer

Enhance the Community Water Quality Map without changing layout.

Add two improvements:

A. District Risk Overlay

Add optional district shading:

Green = Safe
Yellow = Monitoring
Red = Critical

The shading should appear faint and transparent behind the map pins.

B. Map Hover Cards

When hovering over map markers display a small card with:

Facility Name
Parameter signals
Risk level
Last sample timestamp

Example:

Lincoln Elementary School
pH: 5.9
Turbidity: 4.1 NTU
Risk Level: Moderate
Last Sample: 2 hours ago

Ensure the hover card matches the dark UI style.

4. Add Measurement Evidence to Source Attribution

On the Source Attribution Analysis page, enhance each candidate source block.

Under each source probability card add supporting measurement evidence.

Example:

Central Water System
pH: 7.2
Lead: 0.002 mg/L

Distribution Line
pH: 6.8
Lead: 0.004 mg/L

Building Plumbing
pH: 6.1
Lead: 0.019 mg/L

Keep styling minimal and consistent with the current card format.

This visually explains why the attribution model reached its conclusion.

5. Add Confidence Score Tooltip

Where the interface displays:

Confidence Score
68% Moderate Confidence

Add an information tooltip icon.

Tooltip text:

Confidence reflects consistency of water quality signals across
multiple monitoring points and parameters.

This improves algorithm transparency.

6. Add Parameter Trend Mini Charts

Enhance parameter displays by adding small sparkline trend indicators.

Example component:

pH
6.5 → 6.3 → 6.1 → 5.9

Design rules:

tiny line chart

subtle

placed beside or below parameter values

no major layout shift

Purpose: show trend detection, which reinforces risk intelligence.

7. Improve Water Use Guidance Clarity

Enhance the Water Use Guidance cards.

Add status icons and color indicators.

Example:

🟡 Drinking — Use caution
🟡 Cooking — Use caution
🟢 Bathing / Showering — Safe
🟢 Cleaning — Safe
🟢 Laundry — Safe
🟢 Toilet flushing — Safe

Use the same design system colors already used in the UI.

This allows users to understand safety instantly.

8. Add Alert Timeline Panel

Add a small Alert Timeline section in the right-hand panel.

Display system events chronologically.

Example:

12:05 PM
Elevated turbidity detected

12:12 PM
Risk classification updated

12:15 PM
Alerts dispatched to registered contacts

This reinforces that FalilaX is an active monitoring system.

9. Improve Context Selection Screen

Enhance the context selection cards by adding small descriptive text.

Example:

Home

Monitor residential tap water safety signals.

School

Protect student and staff drinking water quality.

Hospital

Monitor water systems affecting patient safety.

Restaurant

Ensure safe water for food preparation and sanitation.

Utility

Manage water quality signals across distribution systems.

Keep text minimal and aligned with current typography.

10. Add Data Integrity Indicator

Add a small badge in the dashboard footer or sidebar.

Example:

Data integrity verified against EPA reference ranges

Style:

subtle

muted color

informational badge

Purpose: improve institutional credibility.

11. Add Alert Notification Indicator in Navigation

Add a small alert counter in the navigation.

Example:

Dashboard
Community Map
Source Attribution
Alerts (2)

Use a subtle badge style consistent with the UI theme.

12. Improve Map Legend Clarity

Replace the current legend with more descriptive labels:

Safe — All signals within recommended limits
Monitoring — Elevated parameters detected
Critical — Health risk thresholds exceeded

Keep the color system unchanged.

13. Add Risk Forecast Widget

Add a compact Risk Forecast panel under the main dashboard metrics.

Example:

Risk Forecast (Next 24 Hours)

Moderate risk likely due to increasing turbidity signals.

This prepares the interface for predictive backend models.

14. Expand System Insight Panel

Enhance the System Insight expandable section with explanatory text.

Example:

Risk signals suggest the issue originates within
the building plumbing infrastructure rather than
the municipal supply system.

This communicates AI interpretation clearly to users.

15. Add Export Report Button

Add a button within the dashboard actions:

Export Risk Report (PDF)

Purpose:

institutional reporting

regulatory documentation

facility management workflows

Final Constraints

Figma AI must follow these rules:

Do not redesign existing UI

Do not alter spacing or grid

Do not change color palette

Do not move navigation or sections

Only enhance with the additions above

Maintain FalilaX dark-theme design language