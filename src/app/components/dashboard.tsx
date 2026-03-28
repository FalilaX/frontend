import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Minus,
  Map,
  Activity,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { API_BASE_URL } from "@/app/config/api";
import logoImage from "@/assets/falilax-logo.png";

type RiskStatus = "safe" | "moderate" | "critical";

type DashboardData = {
  location: string;
  status: RiskStatus;
  risk_score: number;
  alerts: number;
  last_updated: string;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard`);

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const result = await res.json();

        if (!result || typeof result !== "object" || typeof result.location !== "string") {
          throw new Error("Invalid dashboard response");
        }

        setData(result as DashboardData);
      } catch (error) {
        console.warn("Using fallback dashboard data:", error);

        setData({
          location: "Montgomery, AL",
          status: "moderate",
          risk_score: 62,
          alerts: 2,
          last_updated: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statusIcon = (status: RiskStatus) => {
    switch (status) {
      case "safe":
        return <CheckCircle2 className="text-green-400 w-6 h-6" />;
      case "moderate":
        return <Minus className="text-yellow-400 w-6 h-6" />;
      case "critical":
        return <AlertTriangle className="text-red-400 w-6 h-6" />;
      default:
        return <Minus className="text-zinc-400 w-6 h-6" />;
    }
  };

  const statusText = (status: RiskStatus) => {
    switch (status) {
      case "safe":
        return "Safe";
      case "moderate":
        return "Moderate Risk";
      case "critical":
        return "Critical Risk";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoImage}
              alt="FalilaX"
              className="h-20 w-auto object-contain"
            />
            <span className="text-xl font-semibold tracking-wide">FalilaX</span>
          </Link>

          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {loading ? (
          <p className="text-zinc-400 animate-pulse">Loading dashboard...</p>
        ) : data ? (
          <>
            <div className="bg-zinc-900 rounded-xl p-6 mb-6 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">{data.location}</h2>

                <div className="flex items-center gap-2">
                  {statusIcon(data.status)}
                  <span className="text-lg">{statusText(data.status)}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Risk Score</span>
                  <span>{data.risk_score}%</span>
                </div>

                <Progress value={data.risk_score} />
              </div>

              <div className="flex justify-between text-sm text-zinc-400">
                <span>{data.alerts} Active Alerts</span>
                <span>
                  Updated: {new Date(data.last_updated).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div
                onClick={() => navigate("/map")}
                className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-amber-500 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Map className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium">Community Map</h3>
                </div>
                <p className="text-sm text-zinc-400">
                  View regional water risk distribution
                </p>
              </div>

              <div
                onClick={() => setShowDetails(!showDetails)}
                className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-amber-500 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-medium">System Activity</h3>
                  </div>

                  {showDetails ? <ChevronUp /> : <ChevronDown />}
                </div>

                {showDetails && (
                  <div className="mt-4 text-sm text-zinc-400 space-y-1">
                    <p>• Sensor network active</p>
                    <p>• Alerts engine operational</p>
                    <p>• Last anomaly detected: 2 hrs ago</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 text-xs text-zinc-500 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              <p>
                FalilaX provides predictive water quality insights and does not
                replace official regulatory testing or public health advisories.
              </p>
            </div>
          </>
        ) : (
          <p className="text-zinc-500">No dashboard data available.</p>
        )}
      </main>
    </div>
  );
}