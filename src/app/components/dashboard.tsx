import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Minus,
  Map,
  Activity,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { API_BASE_URL } from '@/app/config/api';
import logoImage from '@/assets/falilax-logo.png';

type RiskLevel = 'safe' | 'moderate' | 'critical';
type TrendState = 'stable' | 'fluctuating' | 'escalating';

type DashboardOverview = {
  risk_level?: string;
  overall?: string;
  overall_risk?: string;
  confidence_score?: number | string;
  model_confidence?: number | string;
  confidence?: number | string;
  risk_trend?: string;
  trend?: string;
  change_status?: string;
  change_since?: string;
  delta?: string;
  last_updated?: string;
  signals_refreshed_at?: string;
  recommended_actions?: unknown;
  recommendations?: unknown;
  actions?: unknown;
};

type DashboardStatsOverview = {
  total_parameters?: number;
  total_measurements?: number;
  total_alerts?: number;
  alert_tiers?: { tier: string; count: number }[];
  latest_measurements?: {
    parameter_code?: string;
    value?: number | string;
    unit?: string;
    quality_flag?: string;
    source_type?: string;
  }[];
  top_alert_parameters?: { parameter_code: string; count: number }[];
};

type DashboardRiskSummary = {
  total_alerts?: number;
  action_alerts?: number;
  critical_alerts?: number;
  top_risky_parameters?: { parameter_code: string; count: number }[];
  hotspot_scopes?: { scope_type: string; scope_id?: number | null; count: number }[];
};

type MeasurementItem = {
  parameter_code?: string;
  parameter?: string;
  name?: string;
  measured_value?: number | string;
  value?: number | string;
  unit?: string;
  threshold?: number | string;
  limit?: number | string;
  status?: string;
  trend?: string;
};

type AlertTimelineItem = {
  date?: string;
  critical?: number | string;
  action?: number | string;
  notice?: number | string;
};

type LiveParameter = {
  name: string;
  value: number;
  unit: string;
  limit: number;
  status: 'safe' | 'moderate' | 'critical';
  trend: 'increasing' | 'decreasing' | 'stable';
  category: string;
};

type AttributionPrimary = {
  source?: string;
  confidence?: number | string;
  indicator?: string;
};

type AttributionBreakdownItem = {
  source?: string;
  probability?: number | string;
  factors?: string[];
};

type AttributionResponse = {
  primary?: AttributionPrimary;
  breakdown?: AttributionBreakdownItem[];
  updated_at?: string;
};

type FlowNode = {
  label: string;
  status: 'safe' | 'moderate' | 'critical';
  detail: string;
  confidence: number;
};

const fallbackData = {
  overall: 'moderate' as RiskLevel,
  confidence: 78,
  lastUpdated: 'January 20, 2026',
  changeStatus: 'escalating' as TrendState,
  changeSince: '+6%',
  parameters: [
    { name: 'Lead', value: 12, unit: 'ppb', limit: 15, status: 'moderate', trend: 'increasing', category: 'heavy-metals' },
    { name: 'Copper', value: 0.9, unit: 'ppm', limit: 1.3, status: 'safe', trend: 'decreasing', category: 'heavy-metals' },
    { name: 'Chlorine', value: 3.2, unit: 'ppm', limit: 4.0, status: 'safe', trend: 'stable', category: 'disinfectant' },
    { name: 'pH', value: 7.8, unit: '', limit: 8.5, status: 'safe', trend: 'stable', category: 'physical' },
    { name: 'Turbidity', value: 0.8, unit: 'NTU', limit: 1.0, status: 'moderate', trend: 'increasing', category: 'physical' },
  ] as LiveParameter[],
  recommendations: [
    'Increase testing frequency to twice-weekly to protect student and staff health',
    'Notify school administration and facilities team within 48 hours',
    'Consider temporary bottled water for drinking fountains if turbidity continues to rise',
  ],
};

const fallbackFlow: FlowNode[] = [
  {
    label: 'Central Source',
    status: 'safe',
    detail: 'Source water stable',
    confidence: 10,
  },
  {
    label: 'Distribution Line',
    status: 'moderate',
    detail: 'Minor shared-line disturbance',
    confidence: 22,
  },
  {
    label: 'Building Plumbing',
    status: 'critical',
    detail: 'Most likely contamination origin',
    confidence: 68,
  },
  {
    label: 'Tap Endpoint',
    status: 'moderate',
    detail: 'Elevated risk observed at endpoint',
    confidence: 54,
  },
];

function toFiniteNumber(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toStringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)) : fallback;
}

function normalizeRiskLevel(value?: string): RiskLevel {
  const v = String(value ?? '').toLowerCase();
  if (v.includes('critical') || v.includes('high')) return 'critical';
  if (v.includes('moderate') || v.includes('medium') || v.includes('monitor')) return 'moderate';
  return 'safe';
}

function normalizeTrend(value?: string): TrendState {
  const v = String(value ?? '').toLowerCase();
  if (v.includes('escalat') || v.includes('increase') || v.includes('rising')) return 'escalating';
  if (v.includes('fluct')) return 'fluctuating';
  return 'stable';
}

function formatDateLabel(value?: string): string {
  if (!value) return fallbackData.lastUpdated;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function formatMinutesAgo(value?: string): string {
  if (!value) return '12 minutes ago';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '12 minutes ago';

  const diffMs = Date.now() - d.getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));

  if (mins < 60) return `${mins} minutes ago`;

  const hrs = Math.round(mins / 60);
  return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
}

function mapMeasurementStatus(value?: string): 'safe' | 'moderate' | 'critical' {
  const v = String(value ?? '').toLowerCase();
  if (v.includes('critical') || v.includes('high')) return 'critical';
  if (v.includes('moderate') || v.includes('monitor') || v.includes('warning')) return 'moderate';
  return 'safe';
}

function mapMeasurementName(item: MeasurementItem): string {
  return item.name || item.parameter || item.parameter_code || 'Unknown Parameter';
}

function normalizeSourceLabel(value?: string): string {
  const v = String(value ?? '').toLowerCase();

  if (v.includes('building')) return 'Building Plumbing';
  if (v.includes('distribution')) return 'Distribution Line';
  if (v.includes('central')) return 'Central Source';
  if (v.includes('source')) return 'Central Source';
  if (v.includes('treatment')) return 'Central Source';
  if (v.includes('service')) return 'Service Line';

  return value || 'Unknown Source';
}

function inferFlowStatus(probability: number, isPrimary = false): 'safe' | 'moderate' | 'critical' {
  if (isPrimary || probability >= 50) return 'critical';
  if (probability >= 20) return 'moderate';
  return 'safe';
}

function getFlowNodeClasses(status: 'safe' | 'moderate' | 'critical') {
  if (status === 'critical') {
    return {
      card: 'border-red-500/40 bg-red-500/10',
      text: 'text-red-400',
      dot: 'bg-red-400',
      trail: 'from-red-500/0 via-red-400 to-red-500/0',
      glow: 'shadow-[0_0_20px_rgba(248,113,113,0.45)]',
      pulseDuration: '1.1s',
    };
  }
  if (status === 'moderate') {
    return {
      card: 'border-amber-500/40 bg-amber-500/10',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      trail: 'from-amber-500/0 via-amber-400 to-amber-500/0',
      glow: 'shadow-[0_0_18px_rgba(251,191,36,0.4)]',
      pulseDuration: '1.8s',
    };
  }
  return {
    card: 'border-emerald-500/40 bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    trail: 'from-emerald-500/0 via-emerald-400 to-emerald-500/0',
    glow: 'shadow-[0_0_14px_rgba(52,211,153,0.35)]',
    pulseDuration: '2.6s',
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function simulateSensorDrift(params: LiveParameter[]): LiveParameter[] {
  return params.map((param) => {
    const drift = (Math.random() - 0.5) * 0.4;
    let nextValue = param.value;

    if (param.name.toLowerCase().includes('lead')) {
      nextValue = clamp(param.value + drift * 0.6, 8, 18);
    } else if (param.name.toLowerCase().includes('turbidity')) {
      nextValue = clamp(param.value + drift * 0.15, 0.3, 1.4);
    } else if (param.name.toLowerCase().includes('chlorine')) {
      nextValue = clamp(param.value + drift * 0.2, 2.5, 4.2);
    } else if (param.name.toLowerCase().includes('ph')) {
      nextValue = clamp(param.value + drift * 0.05, 7.1, 8.3);
    } else {
      nextValue = clamp(param.value + drift * 0.2, 0, Math.max(param.limit * 1.2, 1));
    }

    let nextStatus: 'safe' | 'moderate' | 'critical';
    if (nextValue >= param.limit) nextStatus = 'critical';
    else if (nextValue >= param.limit * 0.75) nextStatus = 'moderate';
    else nextStatus = 'safe';

    let nextTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (nextValue > param.value + 0.02) nextTrend = 'increasing';
    else if (nextValue < param.value - 0.02) nextTrend = 'decreasing';

    return {
      ...param,
      value: Number(nextValue.toFixed(2)),
      status: nextStatus,
      trend: nextTrend,
    };
  });
}

function formatEvidenceValue(param?: LiveParameter): string {
  if (!param) return '—';
  return `${param.value} ${param.unit}`.trim();
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'parameters'>('overview');
  const [isInsightExpanded, setIsInsightExpanded] = useState(false);

  const [healthData, setHealthData] = useState<unknown>(null);
  const [overviewData, setOverviewData] = useState<DashboardOverview | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsOverview | null>(null);
  const [riskSummaryData, setRiskSummaryData] = useState<DashboardRiskSummary | null>(null);
  const [latestMeasurements, setLatestMeasurements] = useState<MeasurementItem[]>([]);
  const [alertTimeline, setAlertTimeline] = useState<AlertTimelineItem[]>([]);
  const [attributionData, setAttributionData] = useState<AttributionResponse | null>(null);
  const [streamedParameters, setStreamedParameters] = useState<LiveParameter[]>([]);
  const [streamingActive, setStreamingActive] = useState(true);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const selectedSiteId = '1';

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setApiLoading(true);
        setApiError(null);

        const [
          healthResponse,
          overviewResponse,
          riskSummaryResponse,
          measurementsResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/health`),
          fetch(`${API_BASE_URL}/api/v1/dashboard/overview`),
          fetch(`${API_BASE_URL}/api/v1/dashboard/risk-summary`),
          fetch(`${API_BASE_URL}/api/v1/measurements/latest`),
        ]);

        if (!healthResponse.ok) throw new Error(`Health endpoint error: ${healthResponse.status}`);
        if (!overviewResponse.ok) throw new Error(`Overview endpoint error: ${overviewResponse.status}`);
        if (!riskSummaryResponse.ok) throw new Error(`Risk summary endpoint error: ${riskSummaryResponse.status}`);
        if (!measurementsResponse.ok) throw new Error(`Measurements endpoint error: ${measurementsResponse.status}`);

        const health = await healthResponse.json();
        const overview = await overviewResponse.json();
        const riskSummary = await riskSummaryResponse.json();
        const measurements = await measurementsResponse.json();

        setHealthData(health);
        setDashboardStats(overview && typeof overview === 'object' ? overview : null);
        setRiskSummaryData(riskSummary && typeof riskSummary === 'object' ? riskSummary : null);

        const measurementItems = Array.isArray(measurements)
          ? measurements
          : Array.isArray((measurements as { items?: unknown[] })?.items)
          ? (measurements as { items: MeasurementItem[] }).items
          : [];

        setLatestMeasurements(measurementItems);

        try {
          const timelineResponse = await fetch(`${API_BASE_URL}/api/v1/alerts/timeline?days=7`);
          if (!timelineResponse.ok) {
            setAlertTimeline([]);
          } else {
            const timeline = await timelineResponse.json();
            const timelineItems = Array.isArray(timeline)
              ? timeline
              : Array.isArray((timeline as { items?: unknown[] })?.items)
              ? (timeline as { items: AlertTimelineItem[] }).items
              : [];
            setAlertTimeline(timelineItems);
          }
        } catch {
          setAlertTimeline([]);
        }

        try {
          const attributionResponse = await fetch(
            `${API_BASE_URL}/api/v1/source-attribution/${selectedSiteId}`
          );

          if (!attributionResponse.ok) {
            setAttributionData(null);
          } else {
            const attribution = await attributionResponse.json();
            setAttributionData(attribution && typeof attribution === 'object' ? attribution : null);
          }
        } catch {
          setAttributionData(null);
        }
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setApiLoading(false);
      }
    };

    loadDashboard();
  }, [selectedSiteId]);

  const currentRiskLevel = useMemo(() => {
    return normalizeRiskLevel(
      overviewData?.risk_level ?? overviewData?.overall ?? overviewData?.overall_risk ?? fallbackData.overall,
    );
  }, [overviewData]);

  const currentConfidence = toFiniteNumber(
    overviewData?.confidence_score ??
      overviewData?.model_confidence ??
      overviewData?.confidence ??
      fallbackData.confidence,
    fallbackData.confidence,
  );

  const currentTrend = useMemo(() => {
    return normalizeTrend(
      overviewData?.risk_trend ?? overviewData?.trend ?? overviewData?.change_status ?? fallbackData.changeStatus,
    );
  }, [overviewData]);

  const currentChangeSince =
    typeof (overviewData?.change_since ?? overviewData?.delta) === 'string'
      ? String(overviewData?.change_since ?? overviewData?.delta)
      : fallbackData.changeSince;

  const currentLastUpdated = formatDateLabel(
    overviewData?.last_updated ?? overviewData?.signals_refreshed_at ?? fallbackData.lastUpdated,
  );

  const currentRecommendations = toStringArray(
    overviewData?.recommended_actions ??
      overviewData?.recommendations ??
      overviewData?.actions ??
      fallbackData.recommendations,
    fallbackData.recommendations,
  );

  const baseParameters: LiveParameter[] =
    latestMeasurements.length > 0
      ? latestMeasurements.map((item) => {
          const value = toFiniteNumber(item.measured_value ?? item.value, 0);
          const limit = toFiniteNumber(item.threshold ?? item.limit, 100);
          const rawTrend = String(item.trend ?? 'stable').toLowerCase();

          return {
            name: mapMeasurementName(item),
            value,
            unit: item.unit ?? '',
            limit: limit > 0 ? limit : 100,
            status: mapMeasurementStatus(item.status),
            trend:
              rawTrend.includes('increase') || rawTrend.includes('up')
                ? 'increasing'
                : rawTrend.includes('decrease') || rawTrend.includes('down')
                ? 'decreasing'
                : 'stable',
            category: 'live',
          };
        })
      : fallbackData.parameters;

  useEffect(() => {
    if (baseParameters.length > 0 && streamedParameters.length === 0) {
      setStreamedParameters(baseParameters);
    }
  }, [baseParameters, streamedParameters.length]);

  useEffect(() => {
    if (!streamingActive || streamedParameters.length === 0) return;

    const interval = setInterval(() => {
      setStreamedParameters((prev) => simulateSensorDrift(prev));
    }, 2500);

    return () => clearInterval(interval);
  }, [streamingActive, streamedParameters.length]);

  const liveParameters: LiveParameter[] =
    streamedParameters.length > 0 ? streamedParameters : baseParameters;

  const contaminationFlow: FlowNode[] = useMemo(() => {
    const breakdown = attributionData?.breakdown;

    if (Array.isArray(breakdown) && breakdown.length > 0) {
      const mapped = breakdown.map((item, index) => {
        const probability = toFiniteNumber(item.probability, 0);
        const factors = Array.isArray(item.factors) ? item.factors : [];

        return {
          label: normalizeSourceLabel(item.source),
          status: inferFlowStatus(probability, index === 0),
          detail:
            factors.length > 0
              ? factors[0]
              : index === 0
              ? 'Most likely contamination origin'
              : 'Secondary contributing segment',
          confidence: probability,
        } as FlowNode;
      });

      const hasTapNode = mapped.some((node) => node.label.toLowerCase().includes('tap'));
      if (!hasTapNode) {
        mapped.push({
          label: 'Tap Endpoint',
          status: currentRiskLevel === 'critical' ? 'critical' : 'moderate',
          detail: 'Observed endpoint water quality condition',
          confidence: Math.max(35, Math.round(currentConfidence * 0.7)),
        });
      }

      return mapped;
    }

    return fallbackFlow;
  }, [attributionData, currentRiskLevel, currentConfidence]);

  const navAlertCount = toFiniteNumber(
    riskSummaryData?.action_alerts ?? dashboardStats?.total_alerts ?? 0,
    0,
  );

  const liveSignalsRefreshedLabel = formatMinutesAgo(
    overviewData?.signals_refreshed_at ?? overviewData?.last_updated,
  );

  const totalParametersTracked = toFiniteNumber(dashboardStats?.total_parameters, 136);
  const totalMeasurementsTracked = toFiniteNumber(dashboardStats?.total_measurements, liveParameters.length);
  const totalAlertsTracked = toFiniteNumber(dashboardStats?.total_alerts, navAlertCount);

  const attributionEvidence = useMemo(() => {
    const findParam = (matchers: string[]) =>
      liveParameters.find((p) =>
        matchers.some((m) => p.name.toLowerCase().includes(m)),
      );

    const pHParam = findParam(['ph']);
    const leadParam = findParam(['lead']);
    const copperParam = findParam(['copper']);
    const turbidityParam = findParam(['turbidity']);
    const chlorineParam = findParam(['chlorine']);

    return {
      'Central Source': [
        { label: 'pH', value: formatEvidenceValue(pHParam) },
        { label: 'Chlorine', value: formatEvidenceValue(chlorineParam) },
      ],
      'Distribution Line': [
        { label: 'pH', value: formatEvidenceValue(pHParam) },
        { label: 'Lead', value: formatEvidenceValue(leadParam) },
      ],
      'Building Plumbing': [
        { label: 'pH', value: formatEvidenceValue(pHParam) },
        { label: 'Lead', value: formatEvidenceValue(leadParam) },
        { label: 'Copper', value: formatEvidenceValue(copperParam) },
      ],
      'Tap Endpoint': [
        { label: 'Turbidity', value: formatEvidenceValue(turbidityParam) },
        { label: 'Lead', value: formatEvidenceValue(leadParam) },
      ],
    };
  }, [liveParameters]);

  const nonSafeParams = liveParameters.filter((p) => p.status !== 'safe');
  const showSystemInsight = nonSafeParams.length >= 2;

  const riskBadgeClasses =
    currentRiskLevel === 'critical'
      ? 'bg-red-500/10 border-red-500/30 text-red-400'
      : currentRiskLevel === 'moderate'
      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

  const riskIcon =
    currentRiskLevel === 'critical' ? (
      <AlertTriangle className="w-5 h-5 text-red-400" />
    ) : currentRiskLevel === 'moderate' ? (
      <AlertTriangle className="w-5 h-5 text-amber-400" />
    ) : (
      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
    );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <img src={logoImage} alt="FalilaX" className="w-24 h-24" />
              </Link>
              <nav className="flex gap-6 text-sm items-center">
                <Link to="/dashboard" className="text-zinc-100 font-medium">Dashboard</Link>
                <Link to="/map" className="text-zinc-400 hover:text-zinc-100 transition-colors">Community Map</Link>
                <Link to="/attribution" className="text-zinc-400 hover:text-zinc-100 transition-colors">Source Attribution</Link>
                <Link to="/alerts" className="text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-2">
                  Alerts
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {navAlertCount}
                  </span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-2 py-1 rounded text-xs bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500">Demo Mode · Simulated Data</span>
                <div className="h-4 w-px bg-zinc-800" />
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">LIVE DATA</span>
                </div>
                <span className="text-zinc-500">Signals refreshed: {liveSignalsRefreshedLabel}</span>
                <span className="text-zinc-500">Next model update: ~48 minutes</span>
              </div>
              <Link to="/select-context">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Change Context
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          {apiLoading && (
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-blue-400">
              Connecting to FalilaX backend...
            </div>
          )}

          {apiError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
              Backend connection failed: {apiError}
            </div>
          )}

          {!apiLoading && !apiError && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
              Backend connected successfully
              {healthData ? ` · ${JSON.stringify(healthData)}` : ''}
            </div>
          )}
        </div>

        <div className="mb-8 p-8 rounded-lg bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 border border-zinc-800">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-light mb-1">Water Risk Intelligence Made Clear</h1>
              <p className="text-sm text-zinc-500 mb-2">
                Water Risk Forecast (Next 24–48 Hours)
              </p>
              <p className="text-zinc-400">Lincoln Elementary School · District 5</p>
              <p className="mt-2 text-xs text-zinc-500 text-center md:text-left">
                Powered by multi-signal water quality analysis and infrastructure risk modeling.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${streamingActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}></div>
                <span className={`text-xs ${streamingActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {streamingActive ? 'Live sensor stream active' : 'Live sensor stream paused'}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${riskBadgeClasses}`}>
              {riskIcon}
              <span className="text-sm font-medium capitalize">{currentRiskLevel} Risk</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded bg-zinc-800/50">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm text-zinc-400">Model Confidence</p>
                <div
                  className="text-zinc-500 hover:text-zinc-300 cursor-help"
                  title="Confidence reflects consistency of water quality signals across multiple monitoring points and parameters."
                >
                  <Info className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-light">{currentConfidence}%</span>
              </div>
              <Progress value={currentConfidence} className="h-1.5" />
            </div>

            <div className="p-4 rounded bg-zinc-800/50">
              <p className="text-sm text-zinc-400 mb-1">Risk Trend</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-light capitalize">
                  {currentTrend === 'escalating' ? 'Increasing' : currentTrend}
                </span>
                {currentTrend === 'escalating' && <TrendingUp className="w-5 h-5 text-amber-400" />}
                {currentTrend === 'stable' && <Minus className="w-5 h-5 text-emerald-400" />}
              </div>
              <p className="text-xs text-zinc-500">
                <span className="text-amber-400">{currentChangeSince}</span> since last update
              </p>
            </div>

            <div className="p-4 rounded bg-zinc-800/50">
              <p className="text-sm text-zinc-400 mb-1">Last Updated</p>
              <p className="text-lg font-light">{currentLastUpdated}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="p-4 rounded bg-zinc-800/30 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Total Parameters Tracked</p>
              <p className="text-xl font-light">{totalParametersTracked}</p>
            </div>

            <div className="p-4 rounded bg-zinc-800/30 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Total Measurements Ingested</p>
              <p className="text-xl font-light">{totalMeasurementsTracked}</p>
            </div>

            <div className="p-4 rounded bg-zinc-800/30 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">Total Alerts Logged</p>
              <p className="text-xl font-light">{totalAlertsTracked}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-2 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('parameters')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'parameters'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-100'
            }`}
          >
            Parameters
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-light flex items-center gap-2">
                      <Activity className="w-5 h-5 text-amber-400" />
                      Live Contamination Propagation
                    </h2>

                    <Button
                      variant="outline"
                      className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-100"
                      onClick={() => setStreamingActive((prev) => !prev)}
                    >
                      {streamingActive ? 'Pause Live Stream' : 'Resume Live Stream'}
                    </Button>
                  </div>

                  <p className="text-sm text-zinc-400 mb-6">
                    Estimated contamination movement across the water delivery chain
                  </p>

                  <div className="overflow-x-auto">
                    <div className="min-w-[980px] flex items-center gap-4">
                      {contaminationFlow.map((node, index) => {
                        const styles = getFlowNodeClasses(node.status);
                        const isLast = index === contaminationFlow.length - 1;

                        return (
                          <div key={`${node.label}-${index}`} className="flex items-center gap-4">
                            <div className={`relative w-56 rounded-xl border p-4 ${styles.card}`}>
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className={`text-lg font-medium ${styles.text}`}>{node.label}</p>
                                  <p className="text-sm text-zinc-300 mt-1">{node.detail}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`text-lg font-semibold ${styles.text}`}>{node.confidence}%</p>
                                </div>
                              </div>

                              <div className="relative mt-3 h-2 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${styles.dot}`}
                                  style={{ width: `${Math.min(node.confidence, 100)}%` }}
                                />
                              </div>

                              <div className="mt-3 pt-3 border-t border-zinc-800/80">
                                <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">
                                  Supporting Measurement Evidence
                                </p>
                                <div className="space-y-1">
                                  {(attributionEvidence[node.label as keyof typeof attributionEvidence] ?? []).map((evidence, idx) => (
                                    <div key={`${node.label}-evidence-${idx}`} className="flex items-center justify-between text-xs">
                                      <span className="text-zinc-400">{evidence.label}</span>
                                      <span className="text-zinc-300">{evidence.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="mt-4 flex items-center gap-2">
                                <div
                                  className={`w-2.5 h-2.5 rounded-full ${styles.dot} ${styles.glow}`}
                                  style={{
                                    animation: streamingActive
                                      ? `nodePulse ${styles.pulseDuration} ease-in-out infinite`
                                      : 'none',
                                  }}
                                />
                                <span className="text-xs text-zinc-400">Live propagation estimate</span>
                              </div>
                            </div>

                            {!isLast && (
                              <div className="relative w-20 h-8 flex items-center">
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-700 rounded-full overflow-hidden">
                                  <div
                                    className={`absolute inset-y-0 w-16 bg-gradient-to-r ${styles.trail} blur-[2px]`}
                                    style={{
                                      animation: streamingActive
                                        ? `trailSweep ${styles.pulseDuration} linear infinite`
                                        : 'none',
                                    }}
                                  />
                                </div>

                                <div
                                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${styles.dot} ${styles.glow}`}
                                  style={{
                                    animation: streamingActive
                                      ? `flowPulse ${styles.pulseDuration} linear infinite`
                                      : 'none',
                                  }}
                                />

                                <ArrowRight className={`absolute right-0 w-4 h-4 ${styles.text}`} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-zinc-800/30 border border-zinc-800">
                    <p className="text-sm text-zinc-400">
                      Propagation model highlights stronger movement signals through the
                      <span className="text-amber-400 font-medium"> highest-attribution segment</span>,
                      with pulse speed increasing as severity rises.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <h2 className="text-xl font-light mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    Recommended Actions
                  </h2>

                  <div className="space-y-3">
                    {currentRecommendations.map((rec, index) => (
                      <div key={index} className="flex gap-3 p-3 rounded bg-zinc-800/30">
                        <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-xs text-amber-400 font-medium">
                          {index + 1}
                        </div>
                        <p className="text-zinc-300 flex-1">{rec}</p>
                      </div>
                    ))}
                  </div>

                  {showSystemInsight && (
                    <div className="mt-4 border-t border-zinc-800 pt-4">
                      <button
                        onClick={() => setIsInsightExpanded(!isInsightExpanded)}
                        className="flex items-center gap-2 w-full text-left text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                      >
                        <span className="text-base">🧠</span>
                        <span className="font-medium">System Insight</span>
                        {isInsightExpanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                      </button>

                      {isInsightExpanded && (
                        <div className="mt-3 p-3 rounded bg-zinc-800/20">
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {nonSafeParams.map((param) => (
                              <span
                                key={param.name}
                                className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              >
                                {param.name}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            Risk signals suggest the issue originates within the building plumbing infrastructure rather than the municipal supply system.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <h2 className="text-xl font-light mb-4">Quick Actions</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Link to={`/attribution?siteId=${selectedSiteId}`}>
                      <Button variant="outline" className="w-full justify-start border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-100">
                        View Source Attribution
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>

                    <Link to="/map">
                      <Button variant="outline" className="w-full justify-start border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-100">
                        <Map className="w-4 h-4 mr-2" />
                        Community Map
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      className="w-full justify-start border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-100"
                      onClick={() => alert('PDF export functionality - demo only')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Risk Report (PDF)
                    </Button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'parameters' && (
              <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h2 className="text-xl font-light">Water Quality Parameters</h2>
                  <Button
                    variant="outline"
                    className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-100"
                    onClick={() => setStreamingActive((prev) => !prev)}
                  >
                    {streamingActive ? 'Pause Live Stream' : 'Resume Live Stream'}
                  </Button>
                </div>

                <div className="space-y-4">
                  {liveParameters.map((param) => (
                    <div key={param.name} className="p-4 rounded bg-zinc-800/30 border border-zinc-800">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{param.name}</h3>
                          <p className="text-sm text-zinc-400">
                            Limit: {param.limit} {param.unit}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {param.status === 'critical' && (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20">
                              Critical
                            </span>
                          )}
                          {param.status === 'moderate' && (
                            <span className="px-2 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Monitor
                            </span>
                          )}
                          {param.status === 'safe' && (
                            <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Safe
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-light">{param.value}</span>
                        <span className="text-sm text-zinc-400">{param.unit}</span>
                      </div>

                      <Progress
                        value={Math.min((param.value / (param.limit || 1)) * 100, 100)}
                        className="h-1.5 mt-2"
                      />

                      <div className="mt-2 text-xs text-zinc-500">
                        Trend: {param.trend}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">Risk Intelligence Summary</h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded bg-zinc-800/30 border border-zinc-800">
                  <p className="text-[11px] text-zinc-500 mb-1">ACTION Alerts</p>
                  <p className="text-lg font-light text-amber-400">
                    {toFiniteNumber(riskSummaryData?.action_alerts, 0)}
                  </p>
                </div>

                <div className="p-3 rounded bg-zinc-800/30 border border-zinc-800">
                  <p className="text-[11px] text-zinc-500 mb-1">CRITICAL Alerts</p>
                  <p className="text-lg font-light text-red-400">
                    {toFiniteNumber(riskSummaryData?.critical_alerts, 0)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Top Risk Parameters</p>
                <div className="space-y-2">
                  {(riskSummaryData?.top_risky_parameters ?? []).slice(0, 5).map((item) => (
                    <div key={item.parameter_code} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300">{item.parameter_code}</span>
                      <span className="text-zinc-500">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">Alert Timeline</h3>
              <div className="space-y-3">
                {(alertTimeline.length > 0 ? alertTimeline : [{ date: '', critical: 0, action: 0, notice: 0 }]).map(
                  (item, index) => {
                    const critical = toFiniteNumber(item.critical, 0);
                    const action = toFiniteNumber(item.action, 0);
                    const notice = toFiniteNumber(item.notice, 0);
                    const total = critical + action + notice;
                    const isLast = index === (alertTimeline.length > 0 ? alertTimeline.length : 1) - 1;
                    const dotColor =
                      critical > 0 ? 'bg-red-400' : action > 0 ? 'bg-amber-400' : 'bg-emerald-400';

                    return (
                      <div key={`${item.date ?? 'timeline'}-${index}`} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full mt-1 ${dotColor}`}></div>
                          {!isLast && <div className="w-px h-full bg-zinc-800 mt-1"></div>}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-xs text-zinc-500">{formatShortDate(item.date)}</p>
                          <p className="text-sm text-zinc-300 mt-0.5">
                            {total > 0 ? `${total} alerts recorded` : 'No alerts recorded'}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 mt-16 py-8 bg-zinc-950/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6 text-xs text-zinc-500">
            <div>
              <p>
                <span className="font-medium text-zinc-400">Responsibility Statement:</span>{' '}
                FalilaX provides interpretive risk intelligence and does not replace regulatory testing or official advisories.
              </p>
            </div>
            <div>
              <p>
                <span className="font-medium text-zinc-400">Data Sources (simulated):</span>{' '}
                Public utility reports, EPA datasets, and laboratory inputs.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes flowPulse {
          0% {
            transform: translate(0, -50%) scale(0.92);
            opacity: 0.25;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translate(60px, -50%) scale(1.08);
            opacity: 0.18;
          }
        }

        @keyframes trailSweep {
          0% {
            transform: translateX(-72px);
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          100% {
            transform: translateX(84px);
            opacity: 0;
          }
        }

        @keyframes nodePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.22);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}