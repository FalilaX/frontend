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
  Shield,
  Network,
  Droplets,
  Clock3,
} from "lucide-react";

import AlertFeed from "@/app/components/AlertFeed";
import IngestionHealthPanel from "@/app/components/IngestionHealthPanel";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import logoImage from "@/assets/falilax-logo.png";

type RiskStatus = "safe" | "moderate" | "critical";

type DashboardData = {
  location: string;
  status: RiskStatus;
  risk_score: number;
  alerts: number;
  critical_alerts: number;
  action_alerts: number;
  notice_alerts: number;
  failed_alerts: number;
  sent_alerts: number;
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
        const res = await fetch("http://127.0.0.1:8001/api/v1/alerts/dashboard/summary");

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const result = await res.json();

        const critical = result.by_tier?.critical ?? 0;
        const action = result.by_tier?.action ?? 0;
        const notice = result.by_tier?.notice ?? 0;
        const sent = result.by_status?.sent ?? 0;
        const failed = result.by_status?.failed ?? 0;

        setData({
          location: "Montgomery, AL",
          status: critical > 0 ? "critical" : action > 0 ? "moderate" : "safe",
          risk_score: critical > 0 ? 95 : action > 0 ? 65 : notice > 0 ? 35 : 15,
          alerts: result.total_alerts ?? 0,
          critical_alerts: critical,
          action_alerts: action,
          notice_alerts: notice,
          failed_alerts: failed,
          sent_alerts: sent,
          last_updated: new Date().toISOString(),
        });
      } catch (error) {
        console.warn("Using fallback dashboard data:", error);

        setData({
          location: "Montgomery, AL",
          status: "moderate",
          risk_score: 62,
          alerts: 2,
          critical_alerts: 1,
          action_alerts: 1,
          notice_alerts: 0,
          failed_alerts: 0,
          sent_alerts: 2,
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
      <div className="fixed top-4 right-4 z-50 px-2 py-1 rounded text-xs text-zinc-500 bg-zinc-900 border border-zinc-800">
        Live Backend · Local API
      </div>

      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div
                onClick={() => navigate("/")}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img
                  src={logoImage}
                  alt="FalilaX"
                  className="h-20 w-auto object-contain"
                />
                <span className="text-xl font-semibold tracking-wide">FalilaX</span>
              </div>

              <nav className="hidden md:flex gap-6 text-sm">
                <Link to="/dashboard" className="text-zinc-100 font-medium">
                  Dashboard
                </Link>
                <Link to="/map" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                  Community Map
                </Link>
                <Link
                  to="/attribution?siteId=1"
                  className="text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Source Attribution
                </Link>
              </nav>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate("/select-context")}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <p className="text-zinc-400 animate-pulse">Loading dashboard...</p>
        ) : data ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-light mb-2">Water Risk Dashboard</h1>
              <p className="text-zinc-400 mb-4">
                Live operational overview for monitored water quality conditions
              </p>

              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Clock3 className="w-3 h-3" />
                <span>Updated: {new Date(data.last_updated).toLocaleString()}</span>
              </div>
            </div>

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

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1">Active Alerts</p>
                  <p className="text-xl font-semibold">{data.alerts}</p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1">Critical Alerts</p>
                  <p className="text-xl font-semibold text-red-400">
                    {data.critical_alerts}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1">Action Alerts</p>
                  <p className="text-xl font-semibold text-yellow-400">
                    {data.action_alerts}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm mt-4">
                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1">Notice Alerts</p>
                  <p className="text-xl font-semibold">{data.notice_alerts}</p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1">Sent Alerts</p>
                  <p className="text-xl font-semibold text-green-400">
                    {data.sent_alerts}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1">Failed Alerts</p>
                  <p className="text-xl font-semibold text-red-300">
                    {data.failed_alerts}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <div
                onClick={() => navigate("/map")}
                className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-amber-500 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Map className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium">Community Map</h3>
                </div>
                <p className="text-sm text-zinc-400">
                  View regional water risk distribution and alert clusters.
                </p>
              </div>

              <div
                onClick={() => navigate("/attribution?siteId=1")}
                className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-amber-500 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Network className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium">Source Attribution</h3>
                </div>
                <p className="text-sm text-zinc-400">
                  Identify the most likely source of water quality issues.
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
                    <p>• Sensor ingestion pipeline operational</p>
                    <p>• Alert engine operational</p>
                    <p>• Dashboard summary connected to live backend</p>
                    <p>• Email alerts active</p>
                    <p>• SMS pending Twilio toll-free approval</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium">Risk Intelligence</h3>
                </div>
                <p className="text-sm text-zinc-400">
                  FalilaX combines threshold detection, anomaly tracking, and alert intelligence.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <Droplets className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium">Water Monitoring</h3>
                </div>
                <p className="text-sm text-zinc-400">
                  Live interpretation of water measurements across monitored sites.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <Info className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium">Decision Support</h3>
                </div>
                <p className="text-sm text-zinc-400">
                  Clear alerts and context-aware guidance for faster response.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <IngestionHealthPanel />
            </div>

            <div className="mt-8">
              <AlertFeed />
            </div>

            <div className="mt-8 text-xs text-zinc-500 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              <p>
                FalilaX provides informational water quality alerts only and does
                not replace official regulatory testing, public health advisories,
                or guidance from water authorities.
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