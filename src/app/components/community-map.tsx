import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Map,
  ShieldAlert,
  Activity,
  Building2,
  ChevronRight,
  Network,
  AlertTriangle,
  Table2,
  Sparkles,
  School,
  Hospital,
  Home,
  MapPin,
  Users,
  Truck,
  FlaskConical,
  Wrench,
  Layers,
  Timer,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import logoImage from "@/assets/falilax-logo.png";

type RiskStatus = "safe" | "moderate" | "critical" | "action";
type ResourceType = "field_team" | "flush_crew" | "mobile_lab";
type ResourceStatus = "deployed" | "en_route" | "standby";

type SiteSummary = {
  id: string;
  location_id?: number;
  label: string;
  county_code: string;
  x: number;
  y: number;
  status: RiskStatus;
  type: string;
  detail: string;
  response: string;
  last_sample_at?: string | null;
  signals?: { label: string; value: string }[];
};

type CountySummary = {
  county_code: string;
  county_name: string;
  x: number;
  y: number;
  status: RiskStatus;
  alert_count: number;
};

type StateSummary = {
  state_code: string;
  state_name: string;
  x: number;
  y: number;
  status: RiskStatus;
  alert_count: number;
  risk_score: number;
  affected_cities_count: number;
  last_sample_at?: string;
  top_parameters: string[];
};

type ResourceDeployment = {
  id: string;
  label: string;
  type: ResourceType;
  status: ResourceStatus;
  x: number;
  y: number;
  assigned_zone: string;
  eta: string;
  task: string;
};

type ForecastStep = {
  hour: number;
  label: string;
  radius: number;
  population: number;
  facilities: number;
  schools: number;
  hospitals: number;
  estimatedCost: string;
  severity: RiskStatus;
};

const API_BASE = "http://127.0.0.1:8001/api/v1";

const forecastSteps: ForecastStep[] = [
  {
    hour: 0,
    label: "0h",
    radius: 42,
    population: 180,
    facilities: 2,
    schools: 0,
    hospitals: 0,
    estimatedCost: "$4,000",
    severity: "moderate",
  },
  {
    hour: 6,
    label: "6h",
    radius: 74,
    population: 480,
    facilities: 5,
    schools: 1,
    hospitals: 0,
    estimatedCost: "$8,000",
    severity: "moderate",
  },
  {
    hour: 12,
    label: "12h",
    radius: 112,
    population: 1250,
    facilities: 9,
    schools: 2,
    hospitals: 1,
    estimatedCost: "$24,000",
    severity: "action",
  },
  {
    hour: 24,
    label: "24h",
    radius: 158,
    population: 3480,
    facilities: 18,
    schools: 4,
    hospitals: 2,
    estimatedCost: "$48,000",
    severity: "action",
  },
  {
    hour: 48,
    label: "48h",
    radius: 218,
    population: 6120,
    facilities: 31,
    schools: 11,
    hospitals: 5,
    estimatedCost: "$92,000",
    severity: "critical",
  },
];

const resourceDeployments: ResourceDeployment[] = [
  {
    id: "ft-01",
    label: "Field Team 1",
    type: "field_team",
    status: "deployed",
    x: 61,
    y: 53,
    assigned_zone: "Montgomery Central",
    eta: "On site",
    task: "Confirm field conditions and collect samples",
  },
  {
    id: "fc-01",
    label: "Flush Crew A",
    type: "flush_crew",
    status: "en_route",
    x: 55,
    y: 61,
    assigned_zone: "Distribution Line B",
    eta: "18 min",
    task: "Prepare line flushing and valve inspection",
  },
  {
    id: "ml-01",
    label: "Mobile Lab Unit",
    type: "mobile_lab",
    status: "standby",
    x: 69,
    y: 56,
    assigned_zone: "Hospital / School Corridor",
    eta: "32 min",
    task: "Rapid confirmation testing and sample triage",
  },
];

const statePositions: Record<string, { x: number; y: number; name: string }> = {
  AL: { x: 67, y: 62, name: "Alabama" },
  AK: { x: 17, y: 84, name: "Alaska" },
  AZ: { x: 22, y: 66, name: "Arizona" },
  AR: { x: 55, y: 61, name: "Arkansas" },
  CA: { x: 14, y: 63, name: "California" },
  CO: { x: 34, y: 49, name: "Colorado" },
  CT: { x: 90, y: 34, name: "Connecticut" },
  DE: { x: 88, y: 44, name: "Delaware" },
  FL: { x: 77, y: 77, name: "Florida" },
  GA: { x: 71, y: 63, name: "Georgia" },
  HI: { x: 30, y: 88, name: "Hawaii" },
  ID: { x: 21, y: 34, name: "Idaho" },
  IL: { x: 61, y: 43, name: "Illinois" },
  IN: { x: 65, y: 44, name: "Indiana" },
  IA: { x: 53, y: 39, name: "Iowa" },
  KS: { x: 46, y: 50, name: "Kansas" },
  KY: { x: 67, y: 50, name: "Kentucky" },
  LA: { x: 58, y: 71, name: "Louisiana" },
  ME: { x: 93, y: 19, name: "Maine" },
  MD: { x: 86, y: 45, name: "Maryland" },
  MA: { x: 91, y: 31, name: "Massachusetts" },
  MI: { x: 68, y: 31, name: "Michigan" },
  MN: { x: 50, y: 24, name: "Minnesota" },
  MS: { x: 61, y: 64, name: "Mississippi" },
  MO: { x: 55, y: 50, name: "Missouri" },
  MT: { x: 26, y: 23, name: "Montana" },
  NE: { x: 44, y: 40, name: "Nebraska" },
  NV: { x: 17, y: 48, name: "Nevada" },
  NH: { x: 92, y: 26, name: "New Hampshire" },
  NJ: { x: 88, y: 39, name: "New Jersey" },
  NM: { x: 31, y: 61, name: "New Mexico" },
  NY: { x: 86, y: 33, name: "New York" },
  NC: { x: 80, y: 54, name: "North Carolina" },
  ND: { x: 40, y: 20, name: "North Dakota" },
  OH: { x: 72, y: 42, name: "Ohio" },
  OK: { x: 47, y: 58, name: "Oklahoma" },
  OR: { x: 14, y: 29, name: "Oregon" },
  PA: { x: 81, y: 39, name: "Pennsylvania" },
  RI: { x: 93, y: 32, name: "Rhode Island" },
  SC: { x: 77, y: 59, name: "South Carolina" },
  SD: { x: 40, y: 31, name: "South Dakota" },
  TN: { x: 69, y: 55, name: "Tennessee" },
  TX: { x: 50, y: 70, name: "Texas" },
  UT: { x: 23, y: 49, name: "Utah" },
  VT: { x: 90, y: 24, name: "Vermont" },
  VA: { x: 83, y: 48, name: "Virginia" },
  WA: { x: 10, y: 16, name: "Washington" },
  WV: { x: 78, y: 46, name: "West Virginia" },
  WI: { x: 58, y: 30, name: "Wisconsin" },
  WY: { x: 31, y: 36, name: "Wyoming" },
};

const allStates: StateSummary[] = Object.entries(statePositions).map(
  ([code, item]) => ({
    state_code: code,
    state_name: item.name,
    x: item.x,
    y: item.y,
    status: "safe",
    alert_count: 0,
    risk_score: 15,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  }),
);

function normalizeStatus(status: string | undefined): RiskStatus {
  const value = String(status || "").toLowerCase();
  if (value === "critical") return "critical";
  if (value === "action") return "action";
  if (value === "moderate" || value === "notice") return "moderate";
  return "safe";
}

function riskScoreFromStatus(status: RiskStatus, alertCount: number): number {
  if (status === "critical") return 95;
  if (status === "action") return 75;
  if (status === "moderate") return 50;
  return alertCount > 0 ? 35 : 15;
}

function inferTopParameters(status: RiskStatus): string[] {
  if (status === "critical") return ["pH", "Turbidity"];
  if (status === "action") return ["Turbidity", "Chlorine"];
  if (status === "moderate") return ["Water Quality"];
  return ["Normal"];
}

export default function CommunityMap() {
  const [states, setStates] = useState<StateSummary[]>([]);
  const [counties, setCounties] = useState<CountySummary[]>([]);
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStateCode, setSelectedStateCode] = useState("AL");
  const [selectedCountyCode, setSelectedCountyCode] = useState("montgomery");
  const [selectedResource, setSelectedResource] =
    useState<ResourceDeployment | null>(null);
  const [forecastHour, setForecastHour] = useState(24);

  const [layers, setLayers] = useState({
    states: true,
    counties: true,
    sites: true,
    resources: true,
    predictiveSpread: true,
  });

  const navigate = useNavigate();

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  useEffect(() => {
    const loadStates = async () => {
      try {
        const res = await fetch(`${API_BASE}/map/usa-summary`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        const liveStates = Array.isArray(data.states) ? data.states : [];

        const liveMapped: StateSummary[] = liveStates.map((item: any) => {
          const stateCode = String(item.state_code || "AL").toUpperCase();
          const position = statePositions[stateCode] ?? statePositions.AL;
          const status = normalizeStatus(item.status);
          const alertCount = item.alert_count ?? 0;

          return {
            state_code: stateCode,
            state_name:
              item.state_name && item.state_name !== "UNKNOWN"
                ? item.state_name
                : position.name,
            x: position.x,
            y: position.y,
            status,
            alert_count: alertCount,
            risk_score: riskScoreFromStatus(status, alertCount),
            affected_cities_count: alertCount > 0 ? 1 : 0,
            last_sample_at: new Date().toISOString(),
            top_parameters: inferTopParameters(status),
          };
        });

        const mergedStates = allStates.map((baseState) => {
          const liveState = liveMapped.find(
            (item) => item.state_code === baseState.state_code,
          );
          return liveState ?? baseState;
        });

        setStates(mergedStates);
      } catch (error) {
        console.warn("Using fallback map data:", error);
        setStates(allStates);
      } finally {
        setLoading(false);
      }
    };

    loadStates();
  }, []);

  useEffect(() => {
    const loadCounties = async () => {
      try {
        const res = await fetch(`${API_BASE}/map/states/${selectedStateCode}`);
        if (!res.ok) throw new Error(`County API error: ${res.status}`);

        const data = await res.json();
        setCounties(Array.isArray(data.counties) ? data.counties : []);

        const firstCounty = Array.isArray(data.counties) ? data.counties[0] : null;
        if (firstCounty?.county_code) {
          setSelectedCountyCode(firstCounty.county_code);
        }
      } catch (error) {
        console.warn("Could not load counties:", error);
        setCounties([]);
      }
    };

    loadCounties();
  }, [selectedStateCode]);

  useEffect(() => {
    const loadSites = async () => {
      if (!selectedStateCode || !selectedCountyCode) return;

      try {
        const res = await fetch(
          `${API_BASE}/map/sites?state=${selectedStateCode}&county=${selectedCountyCode}`,
        );

        if (!res.ok) throw new Error(`Sites API error: ${res.status}`);

        const data = await res.json();
        setSites(Array.isArray(data.sites) ? data.sites : []);
      } catch (error) {
        console.warn("Could not load sites:", error);
        setSites([]);
      }
    };

    loadSites();
  }, [selectedStateCode, selectedCountyCode]);

  const selectedState =
    states.find((state) => state.state_code === selectedStateCode) ?? states[0];

  const selectedCounty =
    counties.find((county) => county.county_code === selectedCountyCode) ?? counties[0];

  const selectedSite = sites[0];

  const currentForecast =
    forecastSteps.find((step) => step.hour === forecastHour) ?? forecastSteps[0];

  const summary = useMemo(() => {
    return {
      totalStates: states.length,
      activeStates: states.filter((s) => s.alert_count > 0).length,
      highRiskStates: states.filter(
        (s) => s.status === "critical" || s.status === "action",
      ).length,
      resourceUnits: resourceDeployments.length,
    };
  }, [states]);

  const attentionStates = useMemo(() => {
    return [...states]
      .filter((state) => state.alert_count > 0)
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10);
  }, [states]);

  const statusColor = (status: RiskStatus) => {
    switch (status) {
      case "safe":
        return "bg-emerald-500";
      case "moderate":
        return "bg-amber-400";
      case "action":
        return "bg-orange-500";
      case "critical":
        return "bg-red-600";
      default:
        return "bg-zinc-500";
    }
  };

  const statusTextColor = (status: RiskStatus) => {
    switch (status) {
      case "safe":
        return "text-emerald-400";
      case "moderate":
        return "text-amber-400";
      case "action":
        return "text-orange-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-zinc-400";
    }
  };

  const statusText = (status: RiskStatus) => {
    switch (status) {
      case "safe":
        return "Safe";
      case "moderate":
        return "Moderate";
      case "action":
        return "Action";
      case "critical":
        return "Critical";
      default:
        return "Unknown";
    }
  };

  const forecastRingClass = (severity: RiskStatus) => {
    if (severity === "critical") return "border-red-500 bg-red-500/10";
    if (severity === "action") return "border-orange-500 bg-orange-500/10";
    if (severity === "moderate") return "border-amber-400 bg-amber-400/10";
    return "border-emerald-500 bg-emerald-500/10";
  };

  const formatTime = (value?: string | null) => {
    if (!value) return "Unavailable";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  };

  const resourceIcon = (type: ResourceType) => {
    if (type === "field_team") return <Users className="h-4 w-4" />;
    if (type === "flush_crew") return <Wrench className="h-4 w-4" />;
    return <FlaskConical className="h-4 w-4" />;
  };

  const resourceColor = (status: ResourceStatus) => {
    if (status === "deployed") return "bg-emerald-500 ring-emerald-500/30";
    if (status === "en_route") return "bg-amber-500 ring-amber-500/30";
    return "bg-sky-500 ring-sky-500/30";
  };

  const resourceTypeLabel = (type: ResourceType) => {
    if (type === "field_team") return "Field Team";
    if (type === "flush_crew") return "Flush Crew";
    return "Mobile Lab";
  };

  const resourceStatusText = (status: ResourceStatus) => {
    if (status === "deployed") return "Deployed";
    if (status === "en_route") return "En Route";
    return "Standby";
  };

  const SiteIcon = ({ type }: { type: string }) => {
    if (type === "school") return <School className="h-4 w-4" />;
    if (type === "hospital") return <Hospital className="h-4 w-4" />;
    if (type === "residential") return <Home className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed top-4 right-4 z-50 px-2 py-1 rounded text-xs text-zinc-500 bg-zinc-900 border border-zinc-800">
        Live Map · Backend Data
      </div>

      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img src={logoImage} alt="FalilaX" className="h-20 w-auto object-contain" />
              <span className="text-xl font-semibold tracking-wide">FalilaX Map</span>
            </div>

            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light mb-2 flex items-center gap-3">
            <Map className="h-7 w-7 text-amber-400" />
            Community Risk Map
          </h1>
          <p className="text-zinc-400">
            Live regional intelligence view for water quality alerts, monitored facilities,
            deployed response resources, and predictive spread simulation.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              States Tracked
            </div>
            <div className="text-2xl font-semibold">{summary.totalStates}</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Forecast Population
            </div>
            <div className="text-2xl font-semibold">
              {currentForecast.population.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Forecast Facilities
            </div>
            <div className="text-2xl font-semibold">{currentForecast.facilities}</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
              <Truck className="w-4 h-4 text-amber-400" />
              Resource Units
            </div>
            <div className="text-2xl font-semibold">{summary.resourceUnits}</div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1.6fr_0.9fr] gap-6">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Regional Monitoring Surface</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  USA → Alabama → Montgomery County → monitored sites, response resources, and forecast spread
                </p>
              </div>
              <div className="text-xs text-zinc-500">Live Backend View</div>
            </div>

            <div className="px-6 py-3 border-b border-zinc-800 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1.5 text-xs text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>{summary.totalStates} monitored states</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-300">
                <Network className="h-3.5 w-3.5 text-amber-400" />
                <span>Live backend data active</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/5 px-3 py-1.5 text-xs text-sky-300">
                <Truck className="h-3.5 w-3.5" />
                <span>{resourceDeployments.length} resource units deployed</span>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-zinc-800 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                <Layers className="h-3.5 w-3.5" />
                <span>GIS Layers</span>
              </div>

              {[
                ["states", "States"],
                ["counties", "Counties"],
                ["sites", "Sites"],
                ["resources", "Resources"],
                ["predictiveSpread", "Predictive Spread"],
              ].map(([key, label]) => {
                const layerKey = key as keyof typeof layers;
                const isActive = layers[layerKey];

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleLayer(layerKey)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      isActive
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                        : "border-zinc-800 bg-zinc-950 text-zinc-500"
                    }`}
                  >
                    {isActive ? "✓" : "○"} {label}
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-4 border-b border-zinc-800">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-zinc-300 mb-1">
                    <Timer className="h-4 w-4 text-amber-400" />
                    Predictive Spread Timeline
                  </div>
                  <p className="text-xs text-zinc-500">
                    Current forecast: {currentForecast.label} · {currentForecast.population.toLocaleString()} people at risk · {currentForecast.estimatedCost} estimated cost
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {forecastSteps.map((step) => (
                    <button
                      key={step.hour}
                      type="button"
                      onClick={() => setForecastHour(step.hour)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        forecastHour === step.hour
                          ? "border-sky-400 bg-sky-500/15 text-sky-200"
                          : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative min-h-[560px] bg-[radial-gradient(circle_at_center,_rgba(29,78,216,0.12),_rgba(9,9,11,0.88))]">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
              </div>

              {layers.predictiveSpread && (
                <div
                  className={`absolute rounded-full border-2 ${forecastRingClass(currentForecast.severity)} transition-all duration-500 pointer-events-none`}
                  style={{
                    width: `${currentForecast.radius}px`,
                    height: `${currentForecast.radius}px`,
                    left: "67%",
                    top: "62%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}

              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 animate-pulse">
                  Loading monitoring surface...
                </div>
              ) : (
                <>
                  {layers.states &&
                    states.map((state) => (
                      <button
                        key={state.state_code}
                        type="button"
                        onClick={() => setSelectedStateCode(state.state_code)}
                        className="absolute group outline-none"
                        style={{
                          left: `${state.x}%`,
                          top: `${state.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        title={`${state.state_name} • ${statusText(state.status)} • ${state.alert_count} alerts`}
                      >
                        <div
                          className={`rounded-full ${statusColor(state.status)} transition-all ${
                            selectedState?.state_code === state.state_code
                              ? "h-5 w-5 scale-125 ring-8 ring-red-500/30 shadow-[0_0_24px_rgba(220,38,38,0.35)]"
                              : "h-4 w-4 ring-8 ring-emerald-400/20 shadow-lg group-hover:scale-110"
                          }`}
                        />
                        <div className="mt-3 text-[11px] text-zinc-300">
                          {state.state_code}
                        </div>
                      </button>
                    ))}

                  {layers.counties &&
                    counties.map((county) => (
                      <button
                        key={county.county_code}
                        type="button"
                        onClick={() => setSelectedCountyCode(county.county_code)}
                        className="absolute group outline-none"
                        style={{
                          left: `${county.x}%`,
                          top: `${county.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        title={`${county.county_name} County`}
                      >
                        <div
                          className={`h-6 w-6 rounded-full ${statusColor(county.status)} ring-8 ring-red-500/20 shadow-[0_0_22px_rgba(220,38,38,0.35)]`}
                        />
                        <div className="mt-3 text-[11px] text-white font-semibold">
                          {county.county_name}
                        </div>
                      </button>
                    ))}

                  {layers.sites &&
                    sites.map((site) => (
                      <button
                        key={site.id}
                        type="button"
                        onClick={() =>
                          navigate(`/attribution?siteId=${site.location_id ?? 1}`)
                        }
                        className="absolute group outline-none"
                        style={{
                          left: `${site.x}%`,
                          top: `${site.y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        title={`${site.label} • ${statusText(site.status)} • Open attribution`}
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${statusColor(site.status)} text-white ring-8 ring-red-500/20 shadow-[0_0_24px_rgba(220,38,38,0.4)]`}
                        >
                          <SiteIcon type={site.type} />
                        </div>
                        <div className="mt-3 max-w-[100px] text-[11px] text-white font-semibold leading-tight">
                          {site.label}
                        </div>
                      </button>
                    ))}

                  {layers.resources &&
                    resourceDeployments.map((resource) => {
                      const isSelected = selectedResource?.id === resource.id;

                      return (
                        <button
                          key={resource.id}
                          type="button"
                          onClick={() => setSelectedResource(resource)}
                          className="absolute group outline-none z-20"
                          style={{
                            left: `${resource.x}%`,
                            top: `${resource.y}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                          title={`${resource.label} • ${resourceTypeLabel(resource.type)} • ${resourceStatusText(resource.status)}`}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-white ring-8 shadow-[0_0_24px_rgba(14,165,233,0.35)] transition-all group-hover:scale-110 ${
                              isSelected ? "scale-125 ring-sky-300/50" : ""
                            } ${resourceColor(resource.status)}`}
                          >
                            {resourceIcon(resource.type)}
                          </div>

                          <div
                            className={`absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap rounded-lg border border-sky-500/30 bg-zinc-950/95 px-3 py-2 text-xs text-sky-100 shadow-xl transition ${
                              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <p className="font-semibold">{resource.label}</p>
                            <p className="text-zinc-400">
                              {resourceTypeLabel(resource.type)} · {resourceStatusText(resource.status)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-zinc-800 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span>Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full" />
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span>Action</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full" />
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-400" />
                <span>Resource Units</span>
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-medium">Selected Region</h2>
              <p className="text-sm text-zinc-400 mt-1">
                State, county, site, forecast, and resource-level risk summary
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                <div className="flex items-center gap-2 text-orange-300 text-sm mb-3">
                  <Timer className="w-4 h-4" />
                  Forecast Intelligence
                </div>

                <h3 className="text-xl font-semibold">{currentForecast.label} Forecast</h3>
                <p className={`text-sm mt-1 ${statusTextColor(currentForecast.severity)}`}>
                  {statusText(currentForecast.severity)} projected spread
                </p>

                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                    <p className="text-zinc-500">Population</p>
                    <p className="text-lg font-semibold">
                      {currentForecast.population.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                    <p className="text-zinc-500">Facilities</p>
                    <p className="text-lg font-semibold">{currentForecast.facilities}</p>
                  </div>

                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                    <p className="text-zinc-500">Schools</p>
                    <p className="text-lg font-semibold">{currentForecast.schools}</p>
                  </div>

                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                    <p className="text-zinc-500">Hospitals</p>
                    <p className="text-lg font-semibold">{currentForecast.hospitals}</p>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 mt-4">
                  Estimated cost: {currentForecast.estimatedCost}
                </p>
              </div>

              {selectedResource ? (
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
                  <div className="flex items-center gap-2 text-sky-300 text-sm mb-3">
                    <Truck className="w-4 h-4" />
                    Selected Resource
                  </div>

                  <h3 className="text-xl font-semibold">{selectedResource.label}</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {resourceTypeLabel(selectedResource.type)} ·{" "}
                    {resourceStatusText(selectedResource.status)}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-zinc-300">
                    <p>
                      <span className="text-zinc-500">Assigned Zone:</span>{" "}
                      {selectedResource.assigned_zone}
                    </p>
                    <p>
                      <span className="text-zinc-500">ETA:</span>{" "}
                      {selectedResource.eta}
                    </p>
                    <p>
                      <span className="text-zinc-500">Task:</span>{" "}
                      {selectedResource.task}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedResource(null)}
                    className="mt-4 w-full border-zinc-700"
                  >
                    Clear Resource Selection
                  </Button>
                </div>
              ) : null}

              {selectedState ? (
                <>
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">State</p>
                    <h3 className="text-2xl font-semibold">{selectedState.state_name}</h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      {selectedState.state_code}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                    <p className="text-sm text-zinc-400 mb-2">Current Risk Status</p>
                    <p className={`text-xl font-semibold ${statusTextColor(selectedState.status)}`}>
                      {statusText(selectedState.status)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                      <p className="text-sm text-zinc-400 mb-2">Alert Count</p>
                      <p className="text-2xl font-semibold">
                        {selectedState.alert_count}
                      </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                      <p className="text-sm text-zinc-400 mb-2">Resource Units</p>
                      <p className="text-2xl font-semibold">
                        {resourceDeployments.length}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-zinc-500">No state selected</p>
              )}
            </div>
          </aside>
        </div>

        <div className="grid xl:grid-cols-[1.6fr_0.9fr] gap-6 mt-6">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table2 className="h-4 w-4 text-amber-400" />
                <h2 className="text-lg font-medium">State Risk Table</h2>
              </div>
              <div className="text-xs text-zinc-500">
                Visible confirmation of monitored states
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950/60 text-zinc-400">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">State</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Alerts</th>
                    <th className="text-left px-4 py-3 font-medium">Risk</th>
                    <th className="text-left px-4 py-3 font-medium">Top Drivers</th>
                  </tr>
                </thead>
                <tbody>
                  {states.map((state) => {
                    const isSelected = selectedState?.state_code === state.state_code;

                    return (
                      <tr
                        key={state.state_code}
                        onClick={() => setSelectedStateCode(state.state_code)}
                        className={`border-t border-zinc-800 cursor-pointer transition ${
                          isSelected ? "bg-amber-500/5" : "hover:bg-zinc-800/40"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-zinc-100">{state.state_name}</p>
                          <p className="text-xs text-zinc-500">{state.state_code}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${statusTextColor(state.status)}`}>
                            {statusText(state.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-300">{state.alert_count}</td>
                        <td className="px-4 py-3 text-zinc-300">{state.risk_score}</td>
                        <td className="px-4 py-3 text-zinc-400">
                          {state.top_parameters.slice(0, 2).join(" • ")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h3 className="mb-3 text-sm font-medium text-zinc-400">
                Predictive Spread Simulation
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                The predictive spread slider simulates how incident impact may evolve
                over 0, 6, 12, 24, and 48 hours. The ring on the map expands as projected
                risk increases.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-8 text-xs text-zinc-500 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5" />
          <p>
            FalilaX provides interpretive risk intelligence and does not replace official
            regulatory testing, emergency response, or public health advisories.
          </p>
        </div>
      </main>
    </div>
  );
}