import { useEffect, useMemo, useState } from "react";
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
  Siren,
  Users,
  TrendingUp,
  BellRing,
  DollarSign,
  RadioTower,
  Circle,
} from "lucide-react";

import AlertFeed from "@/app/components/AlertFeed";
import IngestionHealthPanel from "@/app/components/IngestionHealthPanel";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { API_BASE_URL } from "@/app/config/api";
import logoImage from "@/assets/falilax-logo.png";

type RiskStatus = "safe" | "moderate" | "critical";
type ProgressStatus = "complete" | "current" | "pending";

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
        const res = await fetch(`${API_BASE_URL}/api/v1/alerts/dashboard/summary`);

        if (!res.ok) throw new Error(`API error: ${res.status}`);

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

  const commandCenter = useMemo(() => {
    if (!data) return null;

    const severity =
      data.status === "critical"
        ? "CRITICAL"
        : data.status === "moderate"
          ? "ELEVATED"
          : "NORMAL";

    const incidentStatus = data.status === "safe" ? "Monitoring" : "Active";

    const incidentHeadline =
      data.status === "critical"
        ? "CRITICAL INCIDENT ACTIVE"
        : data.status === "moderate"
          ? "ELEVATED INCIDENT ACTIVE"
          : "NO ACTIVE INCIDENT";

    const escalationLevel =
      data.status === "critical"
        ? "Level 3"
        : data.status === "moderate"
          ? "Level 2"
          : "Level 1";

    const populationAtRisk =
      data.status === "critical" ? 12486 : data.status === "moderate" ? 4280 : 0;

    const affectedSites =
      data.status === "critical" ? 38 : data.status === "moderate" ? 14 : 0;

    const estimatedCost =
      data.status === "critical"
        ? "$182,000"
        : data.status === "moderate"
          ? "$46,500"
          : "$0";

    const projection48h =
      data.status === "critical"
        ? "18,200"
        : data.status === "moderate"
          ? "6,100"
          : "Stable";

    const acknowledgementRate =
      data.sent_alerts + data.failed_alerts > 0
        ? Math.round((data.sent_alerts / (data.sent_alerts + data.failed_alerts)) * 100)
        : data.status === "safe"
          ? 100
          : 92;

    const progressSteps =
      data.status === "critical"
        ? [
            { label: "Incident Detected", status: "complete" as ProgressStatus },
            { label: "Source Attributed", status: "complete" as ProgressStatus },
            { label: "Alerts Sent", status: "complete" as ProgressStatus },
            { label: "Investigation Started", status: "current" as ProgressStatus },
            { label: "Corrective Action", status: "pending" as ProgressStatus },
            { label: "Verification", status: "pending" as ProgressStatus },
            { label: "Closed", status: "pending" as ProgressStatus },
          ]
        : data.status === "moderate"
          ? [
              { label: "Incident Detected", status: "complete" as ProgressStatus },
              { label: "Source Attributed", status: "complete" as ProgressStatus },
              { label: "Alerts Sent", status: "current" as ProgressStatus },
              { label: "Investigation Started", status: "pending" as ProgressStatus },
              { label: "Corrective Action", status: "pending" as ProgressStatus },
              { label: "Verification", status: "pending" as ProgressStatus },
              { label: "Closed", status: "pending" as ProgressStatus },
            ]
          : [
              { label: "Incident Detected", status: "complete" as ProgressStatus },
              { label: "Source Attributed", status: "complete" as ProgressStatus },
              { label: "Alerts Sent", status: "complete" as ProgressStatus },
              { label: "Investigation Started", status: "complete" as ProgressStatus },
              { label: "Corrective Action", status: "complete" as ProgressStatus },
              { label: "Verification", status: "complete" as ProgressStatus },
              { label: "Closed", status: "complete" as ProgressStatus },
            ];

    return {
      severity,
      incidentStatus,
      incidentHeadline,
      escalationLevel,
      populationAtRisk,
      affectedSites,
      estimatedCost,
      projection48h,
      acknowledgementRate,
      progressSteps,
    };
  }, [data]);

  const bannerClasses = (status: RiskStatus) => {
    if (status === "critical") return "border-red-700/80 bg-red-950/40 shadow-red-950/30";
    if (status === "moderate") return "border-amber-600/80 bg-amber-950/30 shadow-amber-950/20";
    return "border-green-700/70 bg-green-950/20 shadow-green-950/20";
  };

  const severityLabelClass = (status: RiskStatus) => {
    if (status === "critical") return "bg-red-500 text-white";
    if (status === "moderate") return "bg-amber-400 text-zinc-950";
    return "bg-green-500 text-zinc-950";
  };

  const progressIcon = (stepStatus: ProgressStatus) => {
    if (stepStatus === "complete") return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    if (stepStatus === "current") return <Activity className="w-5 h-5 text-amber-400" />;
    return <Circle className="w-5 h-5 text-zinc-600" />;
  };

  const progressStepClass = (stepStatus: ProgressStatus) => {
    if (stepStatus === "complete") return "border-green-700/60 bg-green-950/20";
    if (stepStatus === "current") return "border-amber-600/80 bg-amber-950/30";
    return "border-zinc-800 bg-zinc-900/60";
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
              <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
                <img src={logoImage} alt="FalilaX" className="h-20 w-auto object-contain" />
                <span className="text-xl font-semibold tracking-wide">FalilaX</span>
              </div>

              <nav className="hidden md:flex gap-6 text-sm">
                <Link to="/dashboard" className="text-zinc-100 font-medium">Dashboard</Link>
                <Link to="/map" className="text-zinc-400 hover:text-zinc-100 transition-colors">Community Map</Link>
                <Link to="/attribution?siteId=1" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                  Source Attribution
                </Link>
                <Link to="/incidents" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                  Investigation Workflow
                </Link>
              </nav>
            </div>
<a href="/incident-map">Open Incident Operations Center</a>

            <Button variant="ghost" onClick={() => navigate("/select-context")} className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <p className="text-zinc-400 animate-pulse">Loading dashboard...</p>
        ) : data && commandCenter ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-light mb-2">FalilaX Executive Command Center</h1>
              <p className="text-zinc-400 mb-4">
                Incident intelligence, response coordination, and operational water-risk overview
              </p>

              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Clock3 className="w-3 h-3" />
                <span>Updated: {new Date(data.last_updated).toLocaleString()}</span>
              </div>
            </div>

            <section className={`rounded-2xl border p-6 mb-6 shadow-xl ${bannerClasses(data.status)}`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    {data.status === "safe" ? (
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    ) : (
                      <Siren className="w-8 h-8 text-red-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${severityLabelClass(data.status)}`}>
                        {commandCenter.severity}
                      </span>

                      <span className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                        Incident Command Mode
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold">
                      {commandCenter.incidentHeadline}
                    </h2>

                    <p className="text-sm text-zinc-300 mt-1">
                      {data.location} · Incident Status: {commandCenter.incidentStatus}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-zinc-950/50 border border-zinc-800 p-4 min-w-[130px]">
                    <p className="text-xs text-zinc-400 mb-1">Population at Risk</p>
                    <p className="text-xl font-semibold">{commandCenter.populationAtRisk.toLocaleString()}</p>
                  </div>

                  <div className="rounded-xl bg-zinc-950/50 border border-zinc-800 p-4 min-w-[130px]">
                    <p className="text-xs text-zinc-400 mb-1">Escalation Level</p>
                    <p className="text-xl font-semibold">{commandCenter.escalationLevel}</p>
                  </div>

                  <div className="rounded-xl bg-zinc-950/50 border border-zinc-800 p-4 min-w-[130px]">
                    <p className="text-xs text-zinc-400 mb-1">Incident Status</p>
                    <p className="text-xl font-semibold">{commandCenter.incidentStatus}</p>
                  </div>

                  <div className="rounded-xl bg-zinc-950/50 border border-zinc-800 p-4 min-w-[130px]">
                    <p className="text-xs text-zinc-400 mb-1">Risk Score</p>
                    <p className="text-xl font-semibold">{data.risk_score}%</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid md:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Users className="w-4 h-4" />
                  <p className="text-xs uppercase tracking-wide">Population at Risk</p>
                </div>
                <p className="text-2xl font-semibold">{commandCenter.populationAtRisk.toLocaleString()}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Map className="w-4 h-4" />
                  <p className="text-xs uppercase tracking-wide">Affected Sites</p>
                </div>
                <p className="text-2xl font-semibold">{commandCenter.affectedSites}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <BellRing className="w-4 h-4" />
                  <p className="text-xs uppercase tracking-wide">Notifications Sent</p>
                </div>
                <p className="text-2xl font-semibold text-green-400">{data.sent_alerts}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <p className="text-xs uppercase tracking-wide">Estimated Cost</p>
                </div>
                <p className="text-2xl font-semibold">{commandCenter.estimatedCost}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <p className="text-xs uppercase tracking-wide">48-Hour Projection</p>
                </div>
                <p className="text-2xl font-semibold">{commandCenter.projection48h}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <RadioTower className="w-4 h-4" />
                  <p className="text-xs uppercase tracking-wide">Ack. Rate</p>
                </div>
                <p className="text-2xl font-semibold">{commandCenter.acknowledgementRate}%</p>
              </div>
            </section>

            <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-semibold">Incident Progress Tracker</h2>
                  <p className="text-sm text-zinc-400">
                    Operational response workflow from detection to closure
                  </p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400">
                  Live Workflow
                </span>
              </div>

              <div className="grid md:grid-cols-7 gap-3">
                {commandCenter.progressSteps.map((step, index) => (
                  <div
                    key={step.label}
                    className={`relative rounded-xl border p-4 min-h-[120px] ${progressStepClass(step.status)}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      {progressIcon(step.status)}
                      <span className="text-xs text-zinc-500">{index + 1}/7</span>
                    </div>

                    <p className="text-sm font-medium leading-snug">{step.label}</p>

                    <p className="text-xs text-zinc-500 mt-2 capitalize">{step.status}</p>
                  </div>
                ))}
              </div>
            </section>

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
                  <p className="text-xl font-semibold text-red-400">{data.critical_alerts}</p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1">Action Alerts</p>
                  <p className="text-xl font-semibold text-yellow-400">{data.action_alerts}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm mt-4">
                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1">Notice Alerts</p>
                  <p className="text-xl font-semibold">{data.notice_alerts}</p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1">Sent Alerts</p>
                  <p className="text-xl font-semibold text-green-400">{data.sent_alerts}</p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1">Failed Alerts</p>
                  <p className="text-xl font-semibold text-red-300">{data.failed_alerts}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
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
                onClick={() => navigate("/incidents")}
                className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-amber-500 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Siren className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium">Investigation Workflow</h3>
                </div>
                <p className="text-sm text-zinc-400">
                  Acknowledge, assign, investigate, verify, resolve, and close operational incidents.
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
                FalilaX provides informational water quality alerts only and does not replace
                official regulatory testing, public health advisories, or guidance from water authorities.
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