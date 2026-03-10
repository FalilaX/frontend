import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Network,
  Droplets,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Info,
  Clock,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '@/app/config/api';
import logoImage from '@/assets/falilax-logo.png';

type AttributionPrimary = {
  source?: string;
  confidence?: number | string;
  indicator?: string;
};

type AttributionBreakdownItem = {
  source?: string;
  probability?: number | string;
  factors?: unknown;
};

type AttributionRecommendations = {
  immediate?: unknown;
  followUp?: unknown;
};

type AttributionResponse = {
  primary?: AttributionPrimary;
  breakdown?: AttributionBreakdownItem[];
  recommendations?: AttributionRecommendations;
  updated_at?: string;
};

const fallbackAttributionData: AttributionResponse = {
  primary: {
    source: 'building',
    confidence: 68,
    indicator: 'Lead levels elevated at tap, decreasing upstream',
  },
  breakdown: [
    {
      source: 'Building Plumbing',
      probability: 68,
      factors: ['Pipe age (32 years)', 'Recent pressure changes', 'Inconsistent filtration'],
    },
    {
      source: 'Distribution System',
      probability: 22,
      factors: ['Shared line maintenance', 'Minor corrosion detected'],
    },
    {
      source: 'Central Water System',
      probability: 10,
      factors: ['Source water tested safe', 'Treatment effective'],
    },
  ],
  recommendations: {
    immediate: [
      'Test all building taps independently',
      'Inspect internal plumbing system',
      'Check filtration equipment operation',
    ],
    followUp: [
      'Schedule pipe replacement assessment',
      'Review water treatment logs',
      'Monitor distribution line pressure',
    ],
  },
};

function toFiniteNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.map((item) => String(item));
}

function formatRefreshTime(value?: string): string {
  if (!value) return '12 minutes ago';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function normalizeSourceLabel(value?: string): string {
  const v = String(value ?? '').toLowerCase();

  if (v.includes('building')) return 'Building Plumbing';
  if (v.includes('distribution')) return 'Distribution System';
  if (v.includes('central')) return 'Central Water System';
  if (v.includes('source')) return 'Central Water System';
  if (v.includes('treatment')) return 'Central Water System';
  if (v.includes('service')) return 'Service Line';
  return value || 'Unknown Source';
}

function normalizeSourceProbabilityColor(probability: number): string {
  if (probability >= 50) return 'text-amber-400';
  if (probability >= 20) return 'text-yellow-400';
  return 'text-emerald-400';
}

function sourceIcon(source?: string) {
  const v = String(source ?? '').toLowerCase();

  if (v.includes('building')) return <Building2 className="w-6 h-6 text-amber-400" />;
  if (v.includes('distribution')) return <Network className="w-6 h-6 text-amber-400" />;
  if (v.includes('central') || v.includes('source') || v.includes('treatment')) {
    return <Droplets className="w-6 h-6 text-emerald-400" />;
  }

  return <AlertCircle className="w-6 h-6 text-zinc-400" />;
}

export function SourceAttribution() {
  const [showDetails, setShowDetails] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [attributionData, setAttributionData] = useState<AttributionResponse>(fallbackAttributionData);

  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId') || '1';

  useEffect(() => {
    const loadAttribution = async () => {
      try {
        setApiLoading(true);
        setApiError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/source-attribution/${siteId}`);

        if (!response.ok) {
          throw new Error(`Source attribution endpoint error: ${response.status}`);
        }

        const result = await response.json();
        console.log('FalilaX source attribution:', result);

        setAttributionData({
          primary: {
            source: result?.primary?.source ?? fallbackAttributionData.primary?.source,
            confidence: toFiniteNumber(
              result?.primary?.confidence ?? fallbackAttributionData.primary?.confidence,
              68,
            ),
            indicator: result?.primary?.indicator ?? fallbackAttributionData.primary?.indicator,
          },
          breakdown:
            Array.isArray(result?.breakdown) && result.breakdown.length > 0
              ? result.breakdown.map((item: AttributionBreakdownItem) => ({
                  source: item?.source,
                  probability: toFiniteNumber(item?.probability, 0),
                  factors: toStringArray(item?.factors, []),
                }))
              : fallbackAttributionData.breakdown,
          recommendations: {
            immediate: toStringArray(
              result?.recommendations?.immediate,
              toStringArray(fallbackAttributionData.recommendations?.immediate, []),
            ),
            followUp: toStringArray(
              result?.recommendations?.followUp,
              toStringArray(fallbackAttributionData.recommendations?.followUp, []),
            ),
          },
          updated_at: result?.updated_at,
        });
      } catch (error) {
        console.warn('Source attribution unavailable, using fallback demo:', error);
        setApiError(error instanceof Error ? error.message : 'Unknown error');
        setAttributionData(fallbackAttributionData);
      } finally {
        setApiLoading(false);
      }
    };

    loadAttribution();
  }, [siteId]);

  const primaryConfidence = toFiniteNumber(attributionData.primary?.confidence, 0);

  const confidenceLabel = useMemo(() => {
    if (primaryConfidence >= 75) return 'High Confidence';
    if (primaryConfidence >= 50) return 'Moderate Confidence';
    return 'Low Confidence';
  }, [primaryConfidence]);

  const primaryWhyTags = useMemo(() => {
    const source = String(attributionData.primary?.source ?? '').toLowerCase();

    if (source.includes('building')) {
      return ['Upstream stable', 'Neighbors stable', 'Premise vulnerability signals'];
    }
    if (source.includes('distribution')) {
      return ['Shared line anomaly', 'Cross-site signal pattern', 'Line-level disturbance likely'];
    }
    return ['Upstream evidence stronger', 'Treatment-linked indicators', 'System-wide pattern'];
  }, [attributionData.primary?.source]);

  const breakdownItems =
    Array.isArray(attributionData.breakdown) && attributionData.breakdown.length > 0
      ? attributionData.breakdown
      : fallbackAttributionData.breakdown ?? [];

  const immediateActions = toStringArray(
    attributionData.recommendations?.immediate,
    toStringArray(fallbackAttributionData.recommendations?.immediate, []),
  );

  const followUpActions = toStringArray(
    attributionData.recommendations?.followUp,
    toStringArray(fallbackAttributionData.recommendations?.followUp, []),
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
              <nav className="flex gap-6 text-sm">
                <Link to="/dashboard" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                  Dashboard
                </Link>
                <Link to="/map" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                  Community Map
                </Link>
                <Link to={`/attribution?siteId=${siteId}`} className="text-zinc-100 font-medium">
                  Source Attribution
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-2 py-1 rounded text-xs text-zinc-500 bg-zinc-900 border border-zinc-800">
                Demo Mode · Simulated Data
              </div>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light mb-2">Source Attribution Analysis</h1>
          <p className="text-zinc-400 mb-4">Identifying the most likely origin of water quality issues</p>
          <p className="text-sm text-zinc-500 mb-2">Selected Site ID: {siteId}</p>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Assessment Type: Inferred
            </span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-zinc-800 text-zinc-200 border border-zinc-700">
                <p className="text-xs leading-relaxed">
                  Attribution based on comparing patterns across supply chain, not direct measurement at every segment.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock className="w-3 h-3" />
            <span>Analysis refreshed: {formatRefreshTime(attributionData.updated_at)}</span>
            <span className="text-zinc-600 ml-2">Next update: ~48 minutes</span>
          </div>

          {apiLoading && (
            <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-blue-400">
              Loading source attribution...
            </div>
          )}

          {!apiLoading && apiError && (
            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-400">
              Using fallback attribution view · {apiError}
            </div>
          )}

          {!apiLoading && !apiError && (
            <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
              Source attribution connected successfully
            </div>
          )}
        </div>

        <div className="mb-8 p-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-full bg-amber-500/20">
              {sourceIcon(attributionData.primary?.source)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-light mb-2">
                {normalizeSourceLabel(attributionData.primary?.source)} Issue Likely
              </h2>
              <p className="text-zinc-300 mb-4">{attributionData.primary?.indicator ?? 'No indicator available'}</p>

              <div className="mb-4">
                <p className="text-xs font-medium text-zinc-500 mb-2">Why:</p>
                <div className="flex flex-wrap gap-2">
                  {primaryWhyTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Confidence Score</span>
                    <span className="text-sm font-medium text-amber-400">{primaryConfidence}%</span>
                  </div>
                  <Progress value={primaryConfidence} className="h-2" />
                </div>
                <div className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
                  <span className="text-sm font-medium text-amber-400">{confidenceLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <h2 className="text-xl font-light mb-6">Water Source Flow & Attribution</h2>

              <div className="space-y-4">
                {breakdownItems.map((item, index) => {
                  const probability = toFiniteNumber(item.probability, 0);
                  const isTop = index === 0 || probability >= 50;
                  const cardClasses = isTop
                    ? 'p-6 rounded-lg bg-amber-500/10 border-2 border-amber-500/50'
                    : 'p-6 rounded-lg bg-zinc-800/50 border-2 border-zinc-700';

                  const factors = toStringArray(item.factors, []);

                  return (
                    <div key={`${item.source ?? 'source'}-${index}`} className="relative">
                      <div className={cardClasses}>
                        <div className="flex items-center gap-4 mb-3">
                          <div className={`p-2 rounded ${isTop ? 'bg-amber-500/20' : 'bg-zinc-700/40'}`}>
                            {sourceIcon(item.source)}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-medium mb-1 ${isTop ? 'text-amber-400' : 'text-zinc-100'}`}>
                              {normalizeSourceLabel(item.source)}
                            </h3>
                            <p className="text-sm text-zinc-400">
                              {index === 0 ? 'Most likely contributing segment' : 'Secondary contributing segment'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-light ${normalizeSourceProbabilityColor(probability)}`}>
                              {probability}%
                            </p>
                            <p className="text-xs text-zinc-500">Probability</p>
                          </div>
                        </div>

                        <div className="pl-12 space-y-1 text-sm text-zinc-400">
                          {factors.map((factor, factorIndex) => (
                            <p key={`${factor}-${factorIndex}`}>• {factor}</p>
                          ))}
                        </div>
                      </div>

                      {index < breakdownItems.length - 1 && (
                        <div className="absolute left-1/2 -bottom-4 w-0.5 h-4 bg-gradient-to-b from-zinc-700 to-transparent"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-zinc-300">
                  <p className="font-medium mb-1">Analysis Method</p>
                  <p className="text-zinc-400">
                    Attribution determined by comparing water quality measurements at multiple points
                    along the supply chain, combined with infrastructure age and maintenance records.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Immediate Actions
              </h3>
              <div className="space-y-3">
                {immediateActions.map((action, index) => (
                  <div key={index} className="p-3 rounded bg-zinc-800/50 border border-zinc-700">
                    <div className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-xs text-amber-400 font-medium">
                        {index + 1}
                      </span>
                      <p className="text-sm text-zinc-300">{action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">Follow-up Actions</h3>
              <div className="space-y-2 text-sm">
                {followUpActions.map((action, index) => (
                  <div key={index} className="flex gap-2 text-zinc-400">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0"></span>
                    <p>{action}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between text-left group"
              >
                <h2 className="text-xl font-light flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Why this conclusion?
                </h2>
                {showDetails ? (
                  <ChevronUp className="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                )}
              </button>

              {showDetails && (
                <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3 text-sm text-zinc-300">
                  <p className="text-zinc-400 mb-3">
                    This attribution is based on analyzing water quality at different points in your supply chain:
                  </p>
                  <div className="space-y-2">
                    {breakdownItems.flatMap((item, index) =>
                      toStringArray(item.factors, [])
                        .slice(0, index === 0 ? 3 : 1)
                        .map((factor, factorIndex) => (
                          <div key={`${item.source ?? 'source'}-${factor}-${factorIndex}`} className="flex gap-2">
                            <span className="text-amber-400 flex-shrink-0">•</span>
                            <p>
                              <span className="text-zinc-100">{normalizeSourceLabel(item.source)}:</span> {factor}
                            </p>
                          </div>
                        )),
                    )}
                  </div>
                  <p className="text-zinc-400 mt-4 pt-3 border-t border-zinc-800">
                    These factors together point to{' '}
                    {normalizeSourceLabel(attributionData.primary?.source).toLowerCase()} as the primary source,
                    with {confidenceLabel.toLowerCase()} based on available data quality and sampling coverage.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <h2 className="text-xl font-light mb-4 text-zinc-300">
                Data Sources <span className="text-xs text-zinc-500">(Simulated for Demo)</span>
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-zinc-300">Public utility water quality reports</p>
                    <p className="text-zinc-500 text-xs">Municipal system monitoring data</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-zinc-300">EPA historical datasets</p>
                    <p className="text-zinc-500 text-xs">Federal water quality standards and trends</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-zinc-300">Building-level test records</p>
                    <p className="text-zinc-500 text-xs">On-site sampling and laboratory analysis</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-zinc-300">Third-party laboratory inputs</p>
                    <p className="text-zinc-500 text-xs">Independent certification and validation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 mt-16 py-8 bg-zinc-950/50">
        <div className="container mx-auto px-6">
          <div className="text-xs text-zinc-500">
            <p>
              <span className="font-medium text-zinc-400">Responsibility Statement:</span>{' '}
              FalilaX provides interpretive risk intelligence and does not replace regulatory testing or official advisories.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}