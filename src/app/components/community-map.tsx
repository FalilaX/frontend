import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Map } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { API_BASE_URL } from "@/app/config/api";

// ✅ CORRECT LOGO IMPORT
import logoImage from "@/assets/falilax-logo.png";

type RiskStatus = "safe" | "moderate" | "critical";

type StateSummary = {
  state_code: string;
  state_name: string;
  x: number;
  y: number;
  status: RiskStatus;
  alert_count: number;
  last_sample_at?: string;
};

export default function CommunityMap() {
  const [states, setStates] = useState<StateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStates = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/map/states`);

        // ✅ SAFE RESPONSE CHECK (prevents crash)
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();

        // ✅ ENSURE ARRAY (prevents .map crash)
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format");
        }

        setStates(data);
      } catch (error) {
        console.warn("Using fallback data:", error);

        setStates([
          {
            state_code: "WA",
            state_name: "Washington",
            x: 10,
            y: 16,
            status: "safe",
            alert_count: 1,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadStates();
  }, []);

  const statusColor = (status: RiskStatus) => {
    switch (status) {
      case "safe":
        return "bg-green-500";
      case "moderate":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {/* ✅ BIGGER + CLEAN LOGO */}
          <img
            src={logoImage}
            alt="FalilaX"
            className="h-24 w-auto object-contain"
          />

          <h1 className="text-2xl font-semibold tracking-wide">
            FalilaX Map
          </h1>
        </div>

        {/* ✅ FIXED BACK BUTTON */}
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* TITLE */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Map className="h-7 w-7 text-amber-400" />
          Community Risk Map
        </h2>

        <p className="text-gray-400 mt-2">
          Real-time water risk visualization across regions
        </p>
      </div>

      {/* MAP AREA */}
      <div className="bg-gray-900 rounded-xl p-6 min-h-[450px] relative border border-zinc-800">
        {loading ? (
          <p className="text-gray-400 animate-pulse">
            Loading map...
          </p>
        ) : states.length === 0 ? (
          <p className="text-gray-500">
            No data available
          </p>
        ) : (
          states.map((state) => (
            <div
              key={state.state_code}
              className={`absolute w-4 h-4 rounded-full ${statusColor(
                state.status
              )} shadow-md`}
              style={{
                left: `${state.x}%`,
                top: `${state.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              title={`${state.state_name} • ${state.status}`}
            />
          ))
        )}
      </div>

      {/* LEGEND */}
      <div className="mt-6 flex gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>Safe</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span>Moderate</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
}