import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Map,
  ShieldAlert,
  Activity,
  Building2,
  Clock3,
  ChevronRight,
  Network,
  AlertTriangle,
  Table2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import logoImage from "@/assets/falilax-logo.png";

type RiskStatus = "safe" | "moderate" | "critical" | "action";

type CitySummary = {
  city_name: string;
  status: RiskStatus;
  alert_count: number;
  risk_score: number;
  top_parameters: string[];
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
  cities?: CitySummary[];
};

const fallbackStates: StateSummary[] = [
  {
    state_code: "AL",
    state_name: "Alabama",
    x: 67,
    y: 62,
    status: "moderate",
    alert_count: 6,
    risk_score: 62,
    affected_cities_count: 8,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Turbidity", "Lead", "E. coli"],
    cities: [
      {
        city_name: "Birmingham",
        status: "moderate",
        alert_count: 2,
        risk_score: 58,
        top_parameters: ["Turbidity", "Lead"],
      },
      {
        city_name: "Montgomery",
        status: "action",
        alert_count: 3,
        risk_score: 74,
        top_parameters: ["Turbidity", "Chlorine"],
      },
      {
        city_name: "Huntsville",
        status: "safe",
        alert_count: 0,
        risk_score: 18,
        top_parameters: ["Normal"],
      },
      {
        city_name: "Mobile",
        status: "moderate",
        alert_count: 1,
        risk_score: 49,
        top_parameters: ["Nitrate"],
      },
      {
        city_name: "Tuscaloosa",
        status: "moderate",
        alert_count: 1,
        risk_score: 52,
        top_parameters: ["Lead"],
      },
    ],
  },
  {
    state_code: "AK",
    state_name: "Alaska",
    x: 17,
    y: 84,
    status: "safe",
    alert_count: 0,
    risk_score: 15,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "AZ",
    state_name: "Arizona",
    x: 22,
    y: 66,
    status: "moderate",
    alert_count: 1,
    risk_score: 45,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Nitrate"],
  },
  {
    state_code: "AR",
    state_name: "Arkansas",
    x: 55,
    y: 61,
    status: "moderate",
    alert_count: 1,
    risk_score: 47,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Lead"],
  },
  {
    state_code: "CA",
    state_name: "California",
    x: 14,
    y: 63,
    status: "moderate",
    alert_count: 2,
    risk_score: 51,
    affected_cities_count: 2,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Microplastics", "Lead"],
  },
  {
    state_code: "CO",
    state_name: "Colorado",
    x: 34,
    y: 49,
    status: "safe",
    alert_count: 0,
    risk_score: 20,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "CT",
    state_name: "Connecticut",
    x: 90,
    y: 34,
    status: "safe",
    alert_count: 0,
    risk_score: 17,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "DE",
    state_name: "Delaware",
    x: 88,
    y: 44,
    status: "safe",
    alert_count: 0,
    risk_score: 18,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "FL",
    state_name: "Florida",
    x: 77,
    y: 77,
    status: "moderate",
    alert_count: 2,
    risk_score: 54,
    affected_cities_count: 2,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Chlorine", "Turbidity"],
  },
  {
    state_code: "GA",
    state_name: "Georgia",
    x: 71,
    y: 63,
    status: "safe",
    alert_count: 0,
    risk_score: 23,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "HI",
    state_name: "Hawaii",
    x: 30,
    y: 88,
    status: "safe",
    alert_count: 0,
    risk_score: 16,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "ID",
    state_name: "Idaho",
    x: 21,
    y: 34,
    status: "safe",
    alert_count: 0,
    risk_score: 19,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "IL",
    state_name: "Illinois",
    x: 61,
    y: 43,
    status: "moderate",
    alert_count: 1,
    risk_score: 43,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Lead"],
  },
  {
    state_code: "IN",
    state_name: "Indiana",
    x: 65,
    y: 44,
    status: "safe",
    alert_count: 0,
    risk_score: 22,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "IA",
    state_name: "Iowa",
    x: 53,
    y: 39,
    status: "safe",
    alert_count: 0,
    risk_score: 21,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "KS",
    state_name: "Kansas",
    x: 46,
    y: 50,
    status: "safe",
    alert_count: 0,
    risk_score: 24,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "KY",
    state_name: "Kentucky",
    x: 67,
    y: 50,
    status: "moderate",
    alert_count: 1,
    risk_score: 46,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Turbidity"],
  },
  {
    state_code: "LA",
    state_name: "Louisiana",
    x: 58,
    y: 71,
    status: "action",
    alert_count: 3,
    risk_score: 71,
    affected_cities_count: 2,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["E. coli", "Nitrate"],
  },
  {
    state_code: "ME",
    state_name: "Maine",
    x: 93,
    y: 19,
    status: "safe",
    alert_count: 0,
    risk_score: 14,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "MD",
    state_name: "Maryland",
    x: 86,
    y: 45,
    status: "moderate",
    alert_count: 1,
    risk_score: 41,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Lead"],
  },
  {
    state_code: "MA",
    state_name: "Massachusetts",
    x: 91,
    y: 31,
    status: "safe",
    alert_count: 0,
    risk_score: 18,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "MI",
    state_name: "Michigan",
    x: 68,
    y: 31,
    status: "moderate",
    alert_count: 2,
    risk_score: 53,
    affected_cities_count: 2,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Lead", "Copper"],
  },
  {
    state_code: "MN",
    state_name: "Minnesota",
    x: 50,
    y: 24,
    status: "safe",
    alert_count: 0,
    risk_score: 20,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "MS",
    state_name: "Mississippi",
    x: 61,
    y: 64,
    status: "moderate",
    alert_count: 1,
    risk_score: 48,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Turbidity"],
  },
  {
    state_code: "MO",
    state_name: "Missouri",
    x: 55,
    y: 50,
    status: "moderate",
    alert_count: 1,
    risk_score: 44,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Nitrate"],
  },
  {
    state_code: "MT",
    state_name: "Montana",
    x: 26,
    y: 23,
    status: "safe",
    alert_count: 0,
    risk_score: 16,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "NE",
    state_name: "Nebraska",
    x: 44,
    y: 40,
    status: "safe",
    alert_count: 0,
    risk_score: 22,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "NV",
    state_name: "Nevada",
    x: 17,
    y: 48,
    status: "safe",
    alert_count: 0,
    risk_score: 19,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "NH",
    state_name: "New Hampshire",
    x: 92,
    y: 26,
    status: "safe",
    alert_count: 0,
    risk_score: 15,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "NJ",
    state_name: "New Jersey",
    x: 88,
    y: 39,
    status: "moderate",
    alert_count: 1,
    risk_score: 42,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Lead"],
  },
  {
    state_code: "NM",
    state_name: "New Mexico",
    x: 31,
    y: 61,
    status: "safe",
    alert_count: 0,
    risk_score: 23,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "NY",
    state_name: "New York",
    x: 86,
    y: 33,
    status: "safe",
    alert_count: 0,
    risk_score: 19,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "NC",
    state_name: "North Carolina",
    x: 80,
    y: 54,
    status: "moderate",
    alert_count: 1,
    risk_score: 45,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Turbidity"],
  },
  {
    state_code: "ND",
    state_name: "North Dakota",
    x: 40,
    y: 20,
    status: "safe",
    alert_count: 0,
    risk_score: 17,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "OH",
    state_name: "Ohio",
    x: 72,
    y: 42,
    status: "moderate",
    alert_count: 1,
    risk_score: 44,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Lead"],
  },
  {
    state_code: "OK",
    state_name: "Oklahoma",
    x: 47,
    y: 58,
    status: "safe",
    alert_count: 0,
    risk_score: 25,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "OR",
    state_name: "Oregon",
    x: 14,
    y: 29,
    status: "safe",
    alert_count: 0,
    risk_score: 18,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "PA",
    state_name: "Pennsylvania",
    x: 81,
    y: 39,
    status: "moderate",
    alert_count: 1,
    risk_score: 43,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Lead"],
  },
  {
    state_code: "RI",
    state_name: "Rhode Island",
    x: 93,
    y: 32,
    status: "safe",
    alert_count: 0,
    risk_score: 14,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "SC",
    state_name: "South Carolina",
    x: 77,
    y: 59,
    status: "safe",
    alert_count: 0,
    risk_score: 24,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "SD",
    state_name: "South Dakota",
    x: 40,
    y: 31,
    status: "safe",
    alert_count: 0,
    risk_score: 18,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "TN",
    state_name: "Tennessee",
    x: 69,
    y: 55,
    status: "moderate",
    alert_count: 1,
    risk_score: 47,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Turbidity"],
  },
  {
    state_code: "TX",
    state_name: "Texas",
    x: 50,
    y: 70,
    status: "action",
    alert_count: 4,
    risk_score: 74,
    affected_cities_count: 3,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Nitrate", "E. coli", "Lead"],
  },
  {
    state_code: "UT",
    state_name: "Utah",
    x: 23,
    y: 49,
    status: "safe",
    alert_count: 0,
    risk_score: 20,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "VT",
    state_name: "Vermont",
    x: 90,
    y: 24,
    status: "safe",
    alert_count: 0,
    risk_score: 14,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "VA",
    state_name: "Virginia",
    x: 83,
    y: 48,
    status: "moderate",
    alert_count: 1,
    risk_score: 40,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Lead"],
  },
  {
    state_code: "WA",
    state_name: "Washington",
    x: 10,
    y: 16,
    status: "safe",
    alert_count: 0,
    risk_score: 17,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "WV",
    state_name: "West Virginia",
    x: 78,
    y: 46,
    status: "moderate",
    alert_count: 1,
    risk_score: 41,
    affected_cities_count: 1,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Turbidity"],
  },
  {
    state_code: "WI",
    state_name: "Wisconsin",
    x: 58,
    y: 30,
    status: "safe",
    alert_count: 0,
    risk_score: 19,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
  {
    state_code: "WY",
    state_name: "Wyoming",
    x: 31,
    y: 36,
    status: "safe",
    alert_count: 0,
    risk_score: 18,
    affected_cities_count: 0,
    last_sample_at: new Date().toISOString(),
    top_parameters: ["Normal"],
  },
];

export default function CommunityMap() {
  const [states, setStates] = useState<StateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStateCode, setSelectedStateCode] = useState<string>("AL");
  const navigate = useNavigate();

  useEffect(() => {
    const loadStates = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8001/api/v1/map/states");

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format");
        }

        setStates(data);
      } catch (error) {
        console.warn("Using fallback map data:", error);
        setStates(fallbackStates);
      } finally {
        setLoading(false);
      }
    };

    loadStates();
  }, []);

  const selectedState =
    states.find((state) => state.state_code === selectedStateCode) ?? states[0];

  const summary = useMemo(() => {
    const totalStates = states.length;
    const activeStates = states.filter((s) => s.alert_count > 0).length;
    const highRiskStates = states.filter(
      (s) => s.status === "critical" || s.status === "action"
    ).length;

    return {
      totalStates,
      activeStates,
      highRiskStates,
    };
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

  const statusRing = (status: RiskStatus) => {
    switch (status) {
      case "safe":
        return "ring-emerald-400/30";
      case "moderate":
        return "ring-amber-400/30";
      case "action":
        return "ring-orange-400/30";
      case "critical":
        return "ring-red-500/30";
      default:
        return "ring-zinc-400/20";
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

  const formatTime = (value?: string) => {
    if (!value) return "Unavailable";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  };

  const selectedMarkerClasses = (status: RiskStatus) => {
    switch (status) {
      case "safe":
        return "shadow-[0_0_0_8px_rgba(16,185,129,0.16),0_0_24px_rgba(16,185,129,0.35)]";
      case "moderate":
        return "shadow-[0_0_0_8px_rgba(251,191,36,0.16),0_0_24px_rgba(251,191,36,0.35)]";
      case "action":
        return "shadow-[0_0_0_8px_rgba(249,115,22,0.16),0_0_24px_rgba(249,115,22,0.35)]";
      case "critical":
        return "shadow-[0_0_0_8px_rgba(220,38,38,0.16),0_0_24px_rgba(220,38,38,0.35)]";
      default:
        return "shadow-[0_0_0_8px_rgba(113,113,122,0.12),0_0_24px_rgba(113,113,122,0.25)]";
    }
  };

  const attentionStates = useMemo(() => {
    return [...states]
      .filter((state) => state.alert_count > 0)
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10);
  }, [states]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed top-4 right-4 z-50 px-2 py-1 rounded text-xs text-zinc-500 bg-zinc-900 border border-zinc-800">
        Demo Mode · Simulated Data
      </div>

      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img
                src={logoImage}
                alt="FalilaX"
                className="h-20 w-auto object-contain"
              />
              <span className="text-xl font-semibold tracking-wide">
                FalilaX Map
              </span>
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
            Regional intelligence view for water quality signals across monitored states.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
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
              States With Alerts
            </div>
            <div className="text-2xl font-semibold">{summary.activeStates}</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              High-Risk States
            </div>
            <div className="text-2xl font-semibold">{summary.highRiskStates}</div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1.6fr_0.9fr] gap-6">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Regional Monitoring Surface</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Interactive state-level alert distribution
                </p>
              </div>
              <div className="text-xs text-zinc-500">United States · Monitoring View</div>
            </div>

            <div className="px-6 py-3 border-b border-zinc-800 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1.5 text-xs text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>{summary.totalStates} monitored states</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-300">
                <Network className="h-3.5 w-3.5 text-amber-400" />
                <span>Pilot drilldown active: Alabama</span>
              </div>

              {selectedState ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1.5 text-xs text-zinc-300">
                  <Map className="h-3.5 w-3.5 text-amber-400" />
                  <span>Selected: {selectedState.state_name}</span>
                </div>
              ) : null}
            </div>

            <div className="relative min-h-[560px] bg-[radial-gradient(circle_at_center,_rgba(29,78,216,0.12),_rgba(9,9,11,0.88))]">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
              </div>

              {selectedState ? (
                <div className="absolute left-6 top-6 z-10 rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                    Active Selection
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${statusColor(selectedState.status)}`} />
                    <div>
                      <p className="text-sm font-medium text-zinc-100">
                        {selectedState.state_name}
                      </p>
                      <p className={`text-xs ${statusTextColor(selectedState.status)}`}>
                        {statusText(selectedState.status)} · Risk {selectedState.risk_score}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 animate-pulse">
                  Loading monitoring surface...
                </div>
              ) : states.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                  No map data available
                </div>
              ) : (
                states.map((state) => {
                  const isSelected = selectedState?.state_code === state.state_code;

                  return (
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
                          isSelected
                            ? `h-5 w-5 scale-125 ring-8 ${statusRing(state.status)} ${selectedMarkerClasses(
                                state.status
                              )}`
                            : `h-4 w-4 ring-8 ${statusRing(state.status)} shadow-lg group-hover:scale-110`
                        }`}
                      />
                      <div
                        className={`mt-3 text-[11px] ${
                          isSelected ? "text-zinc-100 font-semibold" : "text-zinc-300 opacity-80"
                        }`}
                      >
                        {state.state_code}
                      </div>
                    </button>
                  );
                })
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
            </div>
          </section>

          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-medium">Selected Region</h2>
              <p className="text-sm text-zinc-400 mt-1">
                State-level risk summary and monitoring context
              </p>
            </div>

            <div className="p-6">
              {selectedState ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">State</p>
                    <h3 className="text-2xl font-semibold">{selectedState.state_name}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{selectedState.state_code}</p>
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
                      <p className="text-2xl font-semibold">{selectedState.alert_count}</p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                      <p className="text-sm text-zinc-400 mb-2">Risk Score</p>
                      <p className="text-2xl font-semibold">{selectedState.risk_score}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                      <Clock3 className="w-4 h-4 text-amber-400" />
                      Last Monitoring Update
                    </div>
                    <p className="text-sm text-zinc-200">
                      {formatTime(selectedState.last_sample_at)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Top Risk Drivers
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedState.top_parameters.map((parameter) => (
                        <span
                          key={parameter}
                          className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        >
                          {parameter}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                      <Network className="w-4 h-4 text-amber-400" />
                      Affected Cities
                    </div>
                    <p className="text-2xl font-semibold">{selectedState.affected_cities_count}</p>
                  </div>

                  {selectedState.state_code === "AL" && selectedState.cities?.length ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-300 mb-2">
                            <Sparkles className="h-3 w-3 text-amber-400" />
                            <span>Pilot Drilldown Active</span>
                          </div>
                          <h4 className="text-lg font-medium">Alabama Cities</h4>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/attribution?siteId=1")}
                          className="border-zinc-700"
                        >
                          View Detail
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {selectedState.cities.map((city) => (
                          <div
                            key={city.city_name}
                            className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium">{city.city_name}</p>
                                <p className={`text-sm ${statusTextColor(city.status)}`}>
                                  {statusText(city.status)}
                                </p>
                              </div>

                              <div className="text-right text-sm">
                                <p className="text-zinc-400">Alerts</p>
                                <p className="font-semibold">{city.alert_count}</p>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                              <span>Risk score: {city.risk_score}</span>
                              <span>{city.top_parameters.join(" • ")}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                      <p className="text-sm text-zinc-400 mb-2">Interpretation</p>
                      <p className="text-sm text-zinc-300 leading-6">
                        {selectedState.status === "safe" &&
                          "This state is currently showing low-risk water quality indicators across the monitored footprint."}
                        {selectedState.status === "moderate" &&
                          "This state has moderate water-risk signals and should remain under active observation."}
                        {selectedState.status === "action" &&
                          "This state has elevated signals that may require targeted follow-up and operational attention."}
                        {selectedState.status === "critical" &&
                          "This state is showing severe warning signals that may require urgent intervention and escalation."}
                      </p>
                    </div>
                  )}
                </div>
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
                Visible confirmation of all monitored states
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
                    <th className="text-left px-4 py-3 font-medium">Cities</th>
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
                          <div>
                            <p className="font-medium text-zinc-100">{state.state_name}</p>
                            <p className="text-xs text-zinc-500">{state.state_code}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${statusTextColor(state.status)}`}>
                            {statusText(state.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-300">{state.alert_count}</td>
                        <td className="px-4 py-3 text-zinc-300">{state.risk_score}</td>
                        <td className="px-4 py-3 text-zinc-300">{state.affected_cities_count}</td>
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
              <h3 className="mb-4 text-sm font-medium text-zinc-400">
                States Requiring Attention
              </h3>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {attentionStates.map((item) => (
                  <button
                    key={item.state_code}
                    type="button"
                    onClick={() => setSelectedStateCode(item.state_code)}
                    className={`w-full rounded border p-3 text-left ${
                      item.status === "critical" || item.status === "action"
                        ? "border-red-500/20 bg-red-500/5"
                        : "border-amber-500/20 bg-amber-500/5"
                    }`}
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <h4 className="text-sm font-medium">{item.state_name}</h4>
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          item.status === "critical" || item.status === "action"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      />
                    </div>
                    <p className="text-xs text-zinc-400">
                      {item.alert_count} active alerts · risk {item.risk_score}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h3 className="mb-3 text-sm font-medium text-zinc-400">Response Note</h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                This view is structured for national clarity first: all states remain visible at the
                U.S. level, while Alabama serves as the pilot drilldown state for city-level
                operational intelligence.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-8 text-xs text-zinc-500 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5" />
          <p>
            FalilaX provides interpretive risk intelligence and does not replace
            official regulatory testing, emergency response, or public health advisories.
          </p>
        </div>
      </main>
    </div>
  );
}