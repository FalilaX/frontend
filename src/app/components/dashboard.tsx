import { Localize, useLanguage } from "@/app/i18n/language";
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
  ClipboardCheck,
} from "lucide-react";

import AlertFeed from "@/app/components/AlertFeed";
import { authenticatedFetch } from "@/app/utils/auth-session";
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
  const { locale } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [readinessUtilityId, setReadinessUtilityId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await authenticatedFetch(
          `${API_BASE_URL}/api/v1/alerts/dashboard/summary`,
        );

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

    const loadAuthorizedUtility = async () => {
      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/api/v1/utilities?limit=1`,
        );
        if (!response.ok) {
          throw new Error(`Utilities API error: ${response.status}`);
        }
        const utilities: Array<{ id: number }> = await response.json();
        setReadinessUtilityId(utilities[0]?.id ?? null);
      } catch (error) {
        console.warn("Unable to resolve an authorized utility:", error);
        setReadinessUtilityId(null);
      }
    };

    loadDashboard();
    loadAuthorizedUtility();
  }, []);

  const readinessPath = readinessUtilityId
    ? `/readiness?utilityId=${readinessUtilityId}`
    : null;

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
        ? "Critical incident requires action"
        : data.status === "moderate"
          ? "Elevated conditions detected"
          : "Network operating normally";

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
        ? 182000
        : data.status === "moderate"
          ? 46500
          : 0;

    const projection48h =
      data.status === "critical"
        ? 18200
        : data.status === "moderate"
          ? 6100
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
    <div className="fx-app-shell min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-6 mt-3 ml-auto w-fit max-w-[calc(100%-3rem)] px-3 py-1.5 rounded text-xs text-zinc-500 bg-zinc-900 border border-zinc-800"><Localize>{" Live Backend · Deployed API "}</Localize></div>

      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
                <img src={logoImage} alt="FalilaX" className="fx-brand-logo" />
              </div>

              <nav className="hidden md:flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link to="/dashboard" className="text-zinc-100 font-medium"><Localize>{"Dashboard"}</Localize></Link>
<Link to="/analytics" className="text-zinc-400 hover:text-zinc-100 transition-colors"><Localize>{" Analytics "}</Localize></Link>
                <Link to="/map" className="text-zinc-400 hover:text-zinc-100 transition-colors"><Localize>{"Community Map"}</Localize></Link>
                <Link to="/map" className="text-zinc-400 hover:text-zinc-100 transition-colors"><Localize>{" Source Attribution "}</Localize></Link>                <Link
                  to="/readiness?utilityId={readinessUtilityId}"
                  onClick={(event) => {
                    if (!readinessUtilityId) event.preventDefault()
                  }}
                  aria-disabled={!readinessUtilityId}
                  className={`transition-colors ${readinessUtilityId ? "text-zinc-400 hover:text-zinc-100" : "cursor-not-allowed text-zinc-600"}`}
                >
                  <Localize>{" Readiness "}</Localize>
                </Link>
              </nav>
            </div>
            <a
              href="/incident-map"
              className="hidden xl:inline-flex rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-sm font-medium text-cyan-200 transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white"
            ><Localize>{" Operations Center "}</Localize></a>

            <Button variant="ghost" onClick={() => navigate("/")} className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /><Localize>{" Back "}</Localize></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <p className="text-zinc-400 animate-pulse"><Localize>{"Loading dashboard..."}</Localize></p>
        ) : data && commandCenter ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-light mb-2"><Localize>{"FalilaX Executive Command Center"}</Localize></h1>
              <p className="text-zinc-400 mb-4"><Localize>{" Incident intelligence, response coordination, and operational water-risk overview "}</Localize></p>

              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Clock3 className="w-3 h-3" />
                <span><Localize>{"Updated: "}</Localize>{new Date(data.last_updated).toLocaleString(locale)}</span>
              </div>
            </div>

            <section className={`relative mb-6 overflow-hidden rounded-[28px] border shadow-2xl ${bannerClasses(data.status)}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.08),transparent_34%)]" />
              <div className="relative grid xl:grid-cols-[minmax(0,1fr)_minmax(560px,0.9fr)]">
                <div className="p-7 md:p-9">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-black/20">
                      {data.status === "safe" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                      ) : (
                        <Siren className={`h-5 w-5 ${data.status === "critical" ? "text-red-300" : "text-amber-300"}`} />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400"><Localize>{"Current operational posture"}</Localize></p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${data.status === "safe" ? "bg-emerald-400" : data.status === "critical" ? "bg-red-400" : "bg-amber-400"}`} />
                        <span className="text-xs font-semibold text-zinc-300"><Localize>{"Live command view"}</Localize></span>
                      </div>
                    </div>
                  </div>

                  <h2 className="mt-7 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-white md:text-4xl">
                    <Localize>{commandCenter.incidentHeadline}</Localize>
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {data.location}<Localize>{" · The response team is tracking the latest network evidence and notification status. "}</Localize></p>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] ${severityLabelClass(data.status)}`}>
                      <Localize>{commandCenter.severity}</Localize>
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1.5 text-xs text-zinc-300">
                      <Localize>{commandCenter.incidentStatus}</Localize>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-t border-white/[0.07] bg-black/10 xl:border-l xl:border-t-0">
                  {[
                    ["Population at risk", commandCenter.populationAtRisk.toLocaleString(locale)],
                    ["Escalation", commandCenter.escalationLevel],
                    ["Incident status", commandCenter.incidentStatus],
                    ["Risk score", `${data.risk_score}%`],
                  ].map(([label, value], index) => (
                    <div
                      key={label}
                      className={`flex min-h-[116px] flex-col justify-center px-6 py-5 ${index % 2 === 0 ? "border-r border-white/[0.07]" : ""} ${index < 2 ? "border-b border-white/[0.07]" : ""}`}
                    >
                      <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-zinc-500"><Localize>{label}</Localize></p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-white"><Localize>{value}</Localize></p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid md:grid-cols-2 xl:grid-cols-6 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Users className="w-4 h-4" />
                  <p className="text-xs uppercase tracking-wide"><Localize>{"Population at Risk"}</Localize></p>
                </div>
                <p className="text-2xl font-semibold">{commandCenter.populationAtRisk.toLocaleString(locale)}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Map className="w-4 h-4" />
                  <p className="text-xs uppercase tracking-wide"><Localize>{"Affected Sites"}</Localize></p>
                </div>
                <p className="text-2xl font-semibold">{commandCenter.affectedSites}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <BellRing className="w-4 h-4" />
                  <p className="text-xs uppercase tracking-wide"><Localize>{"Notifications Sent"}</Localize></p>
                </div>
                <p className="text-2xl font-semibold text-green-400">{data.sent_alerts}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <p className="text-xs uppercase tracking-wide"><Localize>{"Estimated Cost"}</Localize></p>
                </div>
                <p className="text-2xl font-semibold">{commandCenter.estimatedCost.toLocaleString(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <p className="text-xs uppercase tracking-wide"><Localize>{"48-Hour Projection"}</Localize></p>
                </div>
                <p className="text-2xl font-semibold">{typeof commandCenter.projection48h === "number" ? commandCenter.projection48h.toLocaleString(locale) : <Localize>{commandCenter.projection48h}</Localize>}</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <RadioTower className="w-4 h-4" />
                  <p className="text-xs uppercase tracking-wide"><Localize>{"Ack. Rate"}</Localize></p>
                </div>
                <p className="text-2xl font-semibold">{commandCenter.acknowledgementRate}%</p>
              </div>
            </section>

            <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-xl font-semibold"><Localize>{"Incident Progress Tracker"}</Localize></h2>
                  <p className="text-sm text-zinc-400"><Localize>{" Operational response workflow from detection to closure "}</Localize></p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400"><Localize>{" Live Workflow "}</Localize></span>
              </div>

              <div className="grid md:grid-cols-7 gap-3">
                {commandCenter.progressSteps.map((step, index) => (
                  <div
                    key={step.label}
                    className={`relative rounded-xl border p-4 min-h-[120px] ${progressStepClass(step.status)}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      {progressIcon(step.status)}
                      <span className="text-xs text-zinc-500">{index + 1}/7</span>
                    </div>

                    <p className="text-sm font-medium leading-snug"><Localize>{step.label}</Localize></p>

                    <p className="text-xs text-zinc-500 mt-2 capitalize"><Localize>{step.status}</Localize></p>
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-zinc-900 rounded-xl p-6 mb-6 border border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-2xl font-semibold">{data.location}</h2>
                <div className="flex items-center gap-2">
                  {statusIcon(data.status)}
                  <span className="text-lg"><Localize>{statusText(data.status)}</Localize></span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span><Localize>{"Risk Score"}</Localize></span>
                  <span>{data.risk_score}%</span>
                </div>
                <Progress value={data.risk_score} />
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1"><Localize>{"Active Alerts"}</Localize></p>
                  <p className="text-xl font-semibold">{data.alerts}</p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1"><Localize>{"Critical Alerts"}</Localize></p>
                  <p className="text-xl font-semibold text-red-400">{data.critical_alerts}</p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1"><Localize>{"Action Alerts"}</Localize></p>
                  <p className="text-xl font-semibold text-yellow-400">{data.action_alerts}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm mt-4">
                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1"><Localize>{"Notice Alerts"}</Localize></p>
                  <p className="text-xl font-semibold">{data.notice_alerts}</p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1"><Localize>{"Sent Alerts"}</Localize></p>
                  <p className="text-xl font-semibold text-green-400">{data.sent_alerts}</p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <p className="text-zinc-400 mb-1"><Localize>{"Failed Alerts"}</Localize></p>
                  <p className="text-xl font-semibold text-red-300">{data.failed_alerts}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-6 mb-6">
              <div
                onClick={() => navigate("/map")}
                className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-amber-500 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Map className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium"><Localize>{"Community Map"}</Localize></h3>
                </div>
                <p className="text-sm text-zinc-400"><Localize>{" View regional water risk distribution and alert clusters. "}</Localize></p>
              </div>

              <div
                onClick={() => navigate("/map")}
                className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-amber-500 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Network className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium"><Localize>{"Source Attribution"}</Localize></h3>
                </div>
                <p className="text-sm text-zinc-400"><Localize>{" Identify the most likely source of water quality issues. "}</Localize></p>
              </div>

              <div
                onClick={() => navigate("/incidents")}
                className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-amber-500 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Siren className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium"><Localize>{"Investigation Workflow"}</Localize></h3>
                </div>
                <p className="text-sm text-zinc-400"><Localize>{" Acknowledge, assign, investigate, verify, resolve, and close operational incidents. "}</Localize></p>
              </div>

              <div
                onClick={() => readinessPath && navigate(readinessPath)}
                className={`p-6 bg-zinc-900 rounded-xl border border-zinc-800 transition ${readinessPath ? "cursor-pointer hover:border-amber-500" : "cursor-not-allowed opacity-60"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <ClipboardCheck className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium"><Localize>{"Demo Readiness"}</Localize></h3>
                </div>
                <p className="text-sm text-zinc-400"><Localize>{" Confirm system, geographic, and data-source representation before a demonstration. "}</Localize></p>
              </div>

              <div
                onClick={() => setShowDetails(!showDetails)}
                className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-amber-500 transition cursor-pointer"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-medium"><Localize>{"System Activity"}</Localize></h3>
                  </div>
                  {showDetails ? <ChevronUp /> : <ChevronDown />}
                </div>

                {showDetails && (
                  <div className="mt-4 text-sm text-zinc-400 space-y-1">
                    <p><Localize>{"• Sensor ingestion pipeline operational"}</Localize></p>
                    <p><Localize>{"• Alert engine operational"}</Localize></p>
                    <p><Localize>{"• Dashboard summary connected to live backend"}</Localize></p>
                    <p><Localize>{"• Email alerts active"}</Localize></p>
                    <p><Localize>{"• SMS pending Twilio toll-free approval"}</Localize></p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium"><Localize>{"Risk Intelligence"}</Localize></h3>
                </div>
                <p className="text-sm text-zinc-400"><Localize>{" FalilaX combines threshold detection, anomaly tracking, and alert intelligence. "}</Localize></p>
              </div>

              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <Droplets className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium"><Localize>{"Water Monitoring"}</Localize></h3>
                </div>
                <p className="text-sm text-zinc-400"><Localize>{" Live interpretation of water measurements across monitored sites. "}</Localize></p>
              </div>

              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-3 mb-3">
                  <Info className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-medium"><Localize>{"Decision Support"}</Localize></h3>
                </div>
                <p className="text-sm text-zinc-400"><Localize>{" Clear alerts and context-aware guidance for faster response. "}</Localize></p>
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
              <p><Localize>{" FalilaX provides informational water quality alerts only and does not replace official regulatory testing, public health advisories, or guidance from water authorities. "}</Localize></p>
            </div>
          </>
        ) : (
          <p className="text-zinc-500"><Localize>{"No dashboard data available."}</Localize></p>
        )}
      </main>
    </div>
  );
}



