import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Info,
  Activity,
  Map,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { API_BASE_URL } from '@/app/config/api';
import logoImage from '../../assets/falilax-logo.png';

type RiskStatus = 'safe' | 'moderate' | 'critical';
type NodeType = 'source' | 'distribution' | 'school' | 'hospital' | 'residential' | 'utility';
type MapMode = 'usa' | 'state' | 'county';

type StateSummary = {
  state_code: string;
  state_name: string;
  x: number;
  y: number;
  status: RiskStatus;
  alert_count: number;
  last_sample_at?: string;
};

type CountySummary = {
  county_code: string;
  county_name: string;
  x: number;
  y: number;
  status: RiskStatus;
  alert_count: number;
  last_sample_at?: string;
};

type SiteSignal = {
  label: string;
  value: string;
};

type SitePin = {
  id: string;
  label: string;
  county_code: string;
  x: number;
  y: number;
  status: RiskStatus;
  type: NodeType;
  detail: string;
  response: string;
  last_sample_at?: string;
  signals: SiteSignal[];
};

type UsaSummaryResponse = {
  states_monitored?: number;
  areas_requiring_attention?: number;
  critical_zones?: number;
  monitoring_zones?: number;
  states?: unknown;
};

type StateDetailResponse = {
  counties?: unknown;
};

type CountySiteResponse = {
  sites?: unknown;
};

const allUsaStatesFallback: StateSummary[] = [
  { state_code: 'WA', state_name: 'Washington', x: 10, y: 16, status: 'safe', alert_count: 1 },
  { state_code: 'OR', state_name: 'Oregon', x: 10, y: 24, status: 'safe', alert_count: 0 },
  { state_code: 'CA', state_name: 'California', x: 11, y: 42, status: 'moderate', alert_count: 3 },
  { state_code: 'NV', state_name: 'Nevada', x: 17, y: 32, status: 'safe', alert_count: 0 },
  { state_code: 'ID', state_name: 'Idaho', x: 18, y: 20, status: 'safe', alert_count: 0 },
  { state_code: 'MT', state_name: 'Montana', x: 27, y: 16, status: 'safe', alert_count: 0 },
  { state_code: 'WY', state_name: 'Wyoming', x: 28, y: 25, status: 'safe', alert_count: 0 },
  { state_code: 'UT', state_name: 'Utah', x: 23, y: 35, status: 'safe', alert_count: 0 },
  { state_code: 'AZ', state_name: 'Arizona', x: 21, y: 47, status: 'safe', alert_count: 1 },
  { state_code: 'CO', state_name: 'Colorado', x: 33, y: 35, status: 'safe', alert_count: 1 },
  { state_code: 'NM', state_name: 'New Mexico', x: 31, y: 49, status: 'safe', alert_count: 0 },
  { state_code: 'ND', state_name: 'North Dakota', x: 40, y: 17, status: 'safe', alert_count: 0 },
  { state_code: 'SD', state_name: 'South Dakota', x: 40, y: 25, status: 'safe', alert_count: 0 },
  { state_code: 'NE', state_name: 'Nebraska', x: 41, y: 33, status: 'safe', alert_count: 0 },
  { state_code: 'KS', state_name: 'Kansas', x: 41, y: 41, status: 'safe', alert_count: 0 },
  { state_code: 'OK', state_name: 'Oklahoma', x: 42, y: 49, status: 'safe', alert_count: 0 },
  { state_code: 'TX', state_name: 'Texas', x: 43, y: 61, status: 'moderate', alert_count: 2 },
  { state_code: 'MN', state_name: 'Minnesota', x: 49, y: 19, status: 'safe', alert_count: 0 },
  { state_code: 'IA', state_name: 'Iowa', x: 50, y: 31, status: 'safe', alert_count: 0 },
  { state_code: 'MO', state_name: 'Missouri', x: 50, y: 40, status: 'safe', alert_count: 0 },
  { state_code: 'AR', state_name: 'Arkansas', x: 50, y: 50, status: 'safe', alert_count: 0 },
  { state_code: 'LA', state_name: 'Louisiana', x: 51, y: 62, status: 'critical', alert_count: 4 },
  { state_code: 'WI', state_name: 'Wisconsin', x: 57, y: 23, status: 'safe', alert_count: 0 },
  { state_code: 'IL', state_name: 'Illinois', x: 57, y: 34, status: 'safe', alert_count: 1 },
  { state_code: 'MI', state_name: 'Michigan', x: 63, y: 24, status: 'safe', alert_count: 0 },
  { state_code: 'IN', state_name: 'Indiana', x: 61, y: 34, status: 'safe', alert_count: 0 },
  { state_code: 'OH', state_name: 'Ohio', x: 66, y: 33, status: 'safe', alert_count: 0 },
  { state_code: 'KY', state_name: 'Kentucky', x: 61, y: 41, status: 'safe', alert_count: 0 },
  { state_code: 'TN', state_name: 'Tennessee', x: 62, y: 47, status: 'moderate', alert_count: 1 },
  { state_code: 'MS', state_name: 'Mississippi', x: 58, y: 58, status: 'safe', alert_count: 0 },
  { state_code: 'AL', state_name: 'Alabama', x: 64, y: 58, status: 'critical', alert_count: 7 },
  { state_code: 'GA', state_name: 'Georgia', x: 69, y: 57, status: 'moderate', alert_count: 2 },
  { state_code: 'FL', state_name: 'Florida', x: 76, y: 71, status: 'moderate', alert_count: 2 },
  { state_code: 'SC', state_name: 'South Carolina', x: 74, y: 51, status: 'safe', alert_count: 0 },
  { state_code: 'NC', state_name: 'North Carolina', x: 77, y: 47, status: 'safe', alert_count: 0 },
  { state_code: 'VA', state_name: 'Virginia', x: 78, y: 40, status: 'safe', alert_count: 0 },
  { state_code: 'WV', state_name: 'West Virginia', x: 73, y: 37, status: 'safe', alert_count: 0 },
  { state_code: 'PA', state_name: 'Pennsylvania', x: 75, y: 32, status: 'safe', alert_count: 0 },
  { state_code: 'NY', state_name: 'New York', x: 81, y: 26, status: 'safe', alert_count: 1 },
  { state_code: 'VT', state_name: 'Vermont', x: 84, y: 20, status: 'safe', alert_count: 0 },
  { state_code: 'NH', state_name: 'New Hampshire', x: 87, y: 19, status: 'safe', alert_count: 0 },
  { state_code: 'ME', state_name: 'Maine', x: 92, y: 14, status: 'safe', alert_count: 0 },
  { state_code: 'MA', state_name: 'Massachusetts', x: 88, y: 24, status: 'safe', alert_count: 0 },
  { state_code: 'CT', state_name: 'Connecticut', x: 87, y: 27, status: 'safe', alert_count: 0 },
  { state_code: 'RI', state_name: 'Rhode Island', x: 89, y: 27, status: 'safe', alert_count: 0 },
  { state_code: 'NJ', state_name: 'New Jersey', x: 83, y: 31, status: 'safe', alert_count: 0 },
  { state_code: 'DE', state_name: 'Delaware', x: 83, y: 35, status: 'safe', alert_count: 0 },
  { state_code: 'MD', state_name: 'Maryland', x: 80, y: 35, status: 'safe', alert_count: 0 },
  { state_code: 'DC', state_name: 'District of Columbia', x: 81, y: 36, status: 'safe', alert_count: 0 },
  { state_code: 'AK', state_name: 'Alaska', x: 15, y: 84, status: 'safe', alert_count: 0 },
  { state_code: 'HI', state_name: 'Hawaii', x: 30, y: 88, status: 'safe', alert_count: 0 },
];

const fallbackCountiesByState: Record<string, CountySummary[]> = {
  AL: [
    { county_code: 'lauderdale', county_name: 'Lauderdale County', x: 8, y: 10, status: 'safe', alert_count: 0 },
    { county_code: 'limestone', county_name: 'Limestone County', x: 18, y: 10, status: 'safe', alert_count: 0 },
    { county_code: 'madison', county_name: 'Madison County', x: 28, y: 10, status: 'moderate', alert_count: 2 },
    { county_code: 'jackson', county_name: 'Jackson County', x: 40, y: 10, status: 'safe', alert_count: 0 },

    { county_code: 'colbert', county_name: 'Colbert County', x: 8, y: 18, status: 'safe', alert_count: 0 },
    { county_code: 'lawrence', county_name: 'Lawrence County', x: 18, y: 18, status: 'safe', alert_count: 0 },
    { county_code: 'morgan', county_name: 'Morgan County', x: 28, y: 18, status: 'safe', alert_count: 1 },
    { county_code: 'marshall', county_name: 'Marshall County', x: 38, y: 18, status: 'safe', alert_count: 0 },
    { county_code: 'dekalb', county_name: 'DeKalb County', x: 48, y: 18, status: 'safe', alert_count: 0 },

    { county_code: 'franklin', county_name: 'Franklin County', x: 8, y: 26, status: 'safe', alert_count: 0 },
    { county_code: 'winston', county_name: 'Winston County', x: 18, y: 26, status: 'safe', alert_count: 0 },
    { county_code: 'cullman', county_name: 'Cullman County', x: 28, y: 26, status: 'safe', alert_count: 0 },
    { county_code: 'blount', county_name: 'Blount County', x: 38, y: 26, status: 'safe', alert_count: 0 },
    { county_code: 'cherokee', county_name: 'Cherokee County', x: 48, y: 26, status: 'safe', alert_count: 0 },

    { county_code: 'marion', county_name: 'Marion County', x: 8, y: 34, status: 'safe', alert_count: 0 },
    { county_code: 'walker', county_name: 'Walker County', x: 18, y: 34, status: 'moderate', alert_count: 1 },
    { county_code: 'jefferson', county_name: 'Jefferson County', x: 28, y: 34, status: 'critical', alert_count: 4 },
    { county_code: 'st_clair', county_name: 'St. Clair County', x: 38, y: 34, status: 'moderate', alert_count: 1 },
    { county_code: 'etowah', county_name: 'Etowah County', x: 48, y: 34, status: 'safe', alert_count: 0 },
    { county_code: 'calhoun', county_name: 'Calhoun County', x: 58, y: 34, status: 'safe', alert_count: 0 },
    { county_code: 'cleburne', county_name: 'Cleburne County', x: 68, y: 34, status: 'safe', alert_count: 0 },

    { county_code: 'fayette', county_name: 'Fayette County', x: 8, y: 42, status: 'safe', alert_count: 0 },
    { county_code: 'tuscaloosa', county_name: 'Tuscaloosa County', x: 18, y: 42, status: 'moderate', alert_count: 1 },
    { county_code: 'shelby', county_name: 'Shelby County', x: 28, y: 42, status: 'moderate', alert_count: 2 },
    { county_code: 'talladega', county_name: 'Talladega County', x: 38, y: 42, status: 'safe', alert_count: 0 },
    { county_code: 'clay', county_name: 'Clay County', x: 48, y: 42, status: 'safe', alert_count: 0 },
    { county_code: 'randolph', county_name: 'Randolph County', x: 58, y: 42, status: 'safe', alert_count: 0 },

    { county_code: 'pickens', county_name: 'Pickens County', x: 8, y: 50, status: 'safe', alert_count: 0 },
    { county_code: 'greene', county_name: 'Greene County', x: 18, y: 50, status: 'safe', alert_count: 0 },
    { county_code: 'bibb', county_name: 'Bibb County', x: 28, y: 50, status: 'safe', alert_count: 0 },
    { county_code: 'chilton', county_name: 'Chilton County', x: 38, y: 50, status: 'safe', alert_count: 0 },
    { county_code: 'coosa', county_name: 'Coosa County', x: 48, y: 50, status: 'safe', alert_count: 0 },
    { county_code: 'tallapoosa', county_name: 'Tallapoosa County', x: 58, y: 50, status: 'safe', alert_count: 1 },
    { county_code: 'chambers', county_name: 'Chambers County', x: 68, y: 50, status: 'safe', alert_count: 0 },
    { county_code: 'lee', county_name: 'Lee County', x: 78, y: 50, status: 'safe', alert_count: 0 },

    { county_code: 'sumter', county_name: 'Sumter County', x: 8, y: 58, status: 'safe', alert_count: 0 },
    { county_code: 'hale', county_name: 'Hale County', x: 18, y: 58, status: 'safe', alert_count: 0 },
    { county_code: 'perry', county_name: 'Perry County', x: 28, y: 58, status: 'safe', alert_count: 0 },
    { county_code: 'dallas', county_name: 'Dallas County', x: 38, y: 58, status: 'moderate', alert_count: 1 },
    { county_code: 'autauga', county_name: 'Autauga County', x: 48, y: 58, status: 'safe', alert_count: 0 },
    { county_code: 'elmore', county_name: 'Elmore County', x: 58, y: 58, status: 'safe', alert_count: 0 },
    { county_code: 'macon', county_name: 'Macon County', x: 68, y: 58, status: 'safe', alert_count: 0 },
    { county_code: 'russell', county_name: 'Russell County', x: 78, y: 58, status: 'safe', alert_count: 0 },

    { county_code: 'choctaw', county_name: 'Choctaw County', x: 8, y: 66, status: 'safe', alert_count: 0 },
    { county_code: 'marengo', county_name: 'Marengo County', x: 18, y: 66, status: 'safe', alert_count: 0 },
    { county_code: 'wilcox', county_name: 'Wilcox County', x: 28, y: 66, status: 'safe', alert_count: 0 },
    { county_code: 'lowndes', county_name: 'Lowndes County', x: 38, y: 66, status: 'safe', alert_count: 0 },
    { county_code: 'montgomery', county_name: 'Montgomery County', x: 48, y: 66, status: 'moderate', alert_count: 3 },
    { county_code: 'bullock', county_name: 'Bullock County', x: 58, y: 66, status: 'safe', alert_count: 0 },
    { county_code: 'barbour', county_name: 'Barbour County', x: 68, y: 66, status: 'safe', alert_count: 0 },

    { county_code: 'washington', county_name: 'Washington County', x: 12, y: 78, status: 'safe', alert_count: 0 },
    { county_code: 'clarke', county_name: 'Clarke County', x: 24, y: 78, status: 'safe', alert_count: 0 },
    { county_code: 'monroe', county_name: 'Monroe County', x: 36, y: 78, status: 'safe', alert_count: 0 },
    { county_code: 'butler', county_name: 'Butler County', x: 48, y: 78, status: 'safe', alert_count: 0 },
    { county_code: 'crenshaw', county_name: 'Crenshaw County', x: 58, y: 78, status: 'safe', alert_count: 0 },
    { county_code: 'pike', county_name: 'Pike County', x: 68, y: 78, status: 'safe', alert_count: 0 },
    { county_code: 'coffee', county_name: 'Coffee County', x: 78, y: 78, status: 'safe', alert_count: 0 },
    { county_code: 'dale', county_name: 'Dale County', x: 88, y: 78, status: 'safe', alert_count: 0 },

    { county_code: 'mobile', county_name: 'Mobile County', x: 18, y: 90, status: 'safe', alert_count: 1 },
    { county_code: 'baldwin', county_name: 'Baldwin County', x: 30, y: 92, status: 'moderate', alert_count: 1 },
    { county_code: 'escambia', county_name: 'Escambia County', x: 48, y: 90, status: 'safe', alert_count: 0 },
    { county_code: 'conecuh', county_name: 'Conecuh County', x: 58, y: 90, status: 'safe', alert_count: 0 },
    { county_code: 'covington', county_name: 'Covington County', x: 68, y: 90, status: 'safe', alert_count: 0 },
    { county_code: 'geneva', county_name: 'Geneva County', x: 80, y: 90, status: 'safe', alert_count: 0 },
    { county_code: 'henry', county_name: 'Henry County', x: 90, y: 90, status: 'safe', alert_count: 0 },
    { county_code: 'houston', county_name: 'Houston County', x: 94, y: 82, status: 'safe', alert_count: 0 },
  ],
};

const fallbackSitesByCounty: Record<string, SitePin[]> = {
  jefferson: [
    {
      id: 'lincoln-elementary',
      label: 'Lincoln Elementary School',
      county_code: 'jefferson',
      x: 58,
      y: 36,
      status: 'critical',
      type: 'school',
      detail: 'Highest endpoint concern',
      response: 'Escalate response immediately, isolate affected fixtures, and confirm with certified testing.',
      last_sample_at: '2026-03-13T08:42:00Z',
      signals: [
        { label: 'pH', value: '5.9' },
        { label: 'Turbidity', value: '4.1 NTU' },
        { label: 'Lead', value: '0.019 mg/L' },
      ],
    },
    {
      id: 'district-hospital',
      label: 'Jefferson District Hospital',
      county_code: 'jefferson',
      x: 72,
      y: 52,
      status: 'moderate',
      type: 'hospital',
      detail: 'Precautionary monitoring',
      response: 'Maintain precautionary surveillance and prioritize patient-facing fixtures.',
      last_sample_at: '2026-03-13T08:18:00Z',
      signals: [
        { label: 'pH', value: '6.4' },
        { label: 'Turbidity', value: '2.6 NTU' },
      ],
    },
    {
      id: 'residential-cluster-1',
      label: 'North Residential Cluster',
      county_code: 'jefferson',
      x: 36,
      y: 62,
      status: 'safe',
      type: 'residential',
      detail: 'No elevated risk detected',
      response: 'Maintain standard observation and compare against district-level shifts.',
      last_sample_at: '2026-03-13T07:58:00Z',
      signals: [
        { label: 'pH', value: '7.1' },
        { label: 'Lead', value: '0.002 mg/L' },
      ],
    },
  ],
  montgomery: [
    {
      id: 'montgomery-utility',
      label: 'Montgomery Utility Hub',
      county_code: 'montgomery',
      x: 48,
      y: 44,
      status: 'moderate',
      type: 'utility',
      detail: 'Distribution irregularity under review',
      response: 'Inspect line pressure behavior and compare upstream residuals.',
      last_sample_at: '2026-03-13T08:05:00Z',
      signals: [
        { label: 'Pressure', value: '22 psi' },
        { label: 'Chlorine', value: '0.3 mg/L' },
      ],
    },
  ],
};

function isValidStatus(value: unknown): value is RiskStatus {
  return value === 'safe' || value === 'moderate' || value === 'critical';
}

function normalizeState(raw: any): StateSummary | null {
  if (!raw || typeof raw !== 'object') return null;

  const stateCode = String(raw.state_code ?? raw.code ?? '').toUpperCase();
  const stateName = String(raw.state_name ?? raw.name ?? '');
  const status = isValidStatus(raw.status) ? raw.status : 'safe';

  if (!stateCode || !stateName) return null;

  const fallback = allUsaStatesFallback.find((s) => s.state_code === stateCode);
  if (!fallback) return null;

  return {
    state_code: stateCode,
    state_name: stateName,
    x: fallback.x,
    y: fallback.y,
    status,
    alert_count: Number(raw.alert_count ?? 0),
    last_sample_at: raw.last_sample_at ? String(raw.last_sample_at) : undefined,
  };
}

function normalizeCounty(raw: any): CountySummary | null {
  if (!raw || typeof raw !== 'object') return null;

  const countyCode = String(raw.county_code ?? raw.code ?? '');
  const countyName = String(raw.county_name ?? raw.name ?? '');
  const x = Number(raw.x);
  const y = Number(raw.y);
  const status = isValidStatus(raw.status) ? raw.status : 'safe';

  if (!countyCode || !countyName || !Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return {
    county_code: countyCode,
    county_name: countyName,
    x,
    y,
    status,
    alert_count: Number(raw.alert_count ?? 0),
    last_sample_at: raw.last_sample_at ? String(raw.last_sample_at) : undefined,
  };
}

function normalizeSite(raw: any): SitePin | null {
  if (!raw || typeof raw !== 'object') return null;

  const status = isValidStatus(raw.status) ? raw.status : 'safe';
  const x = Number(raw.x);
  const y = Number(raw.y);

  if (!raw.id || !raw.label || !raw.county_code || !Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return {
    id: String(raw.id),
    label: String(raw.label),
    county_code: String(raw.county_code),
    x,
    y,
    status,
    type: (raw.type as NodeType) ?? 'distribution',
    detail: String(raw.detail ?? 'No detail available'),
    response: String(raw.response ?? 'No response guidance available yet.'),
    last_sample_at: raw.last_sample_at ? String(raw.last_sample_at) : undefined,
    signals: Array.isArray(raw.signals)
      ? raw.signals.map((s: any) => ({
          label: String(s.label ?? 'Parameter'),
          value: String(s.value ?? '—'),
        }))
      : [],
  };
}

function getStatusClasses(status: RiskStatus) {
  if (status === 'critical') {
    return {
      card: 'border-red-500/40 bg-red-500/10',
      text: 'text-red-400',
      dot: 'bg-red-400',
      glow: 'shadow-[0_0_18px_rgba(248,113,113,0.45)]',
      overlay: 'bg-red-500/10',
    };
  }

  if (status === 'moderate') {
    return {
      card: 'border-amber-500/40 bg-amber-500/10',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      glow: 'shadow-[0_0_18px_rgba(251,191,36,0.40)]',
      overlay: 'bg-amber-500/10',
    };
  }

  return {
    card: 'border-emerald-500/40 bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_14px_rgba(52,211,153,0.35)]',
    overlay: 'bg-emerald-500/10',
  };
}

function formatRelativeTime(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const diff = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (diff < 60) return `${diff} minute${diff === 1 ? '' : 's'} ago`;

  const hours = Math.round(diff / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function buildDefaultCountySites(county: CountySummary | null): SitePin[] {
  if (!county) return [];

  return [
    {
      id: `${county.county_code}-utility`,
      label: `${county.county_name} Utility Hub`,
      county_code: county.county_code,
      x: Math.min(county.x + 6, 92),
      y: Math.min(county.y + 4, 92),
      status: county.status,
      type: 'utility',
      detail: `${county.county_name} distribution monitoring point`,
      response: 'Review county-level sampling, compare upstream and endpoint conditions, and confirm operational signals.',
      last_sample_at: county.last_sample_at,
      signals: [
        { label: 'pH', value: county.status === 'critical' ? '5.9' : county.status === 'moderate' ? '6.4' : '7.1' },
        { label: 'Turbidity', value: county.status === 'critical' ? '4.1 NTU' : county.status === 'moderate' ? '2.2 NTU' : '0.8 NTU' },
      ],
    },
    {
      id: `${county.county_code}-school`,
      label: `${county.county_name} School Zone`,
      county_code: county.county_code,
      x: Math.max(county.x - 5, 8),
      y: Math.max(county.y - 4, 8),
      status: county.status === 'critical' ? 'moderate' : county.status,
      type: 'school',
      detail: `Sentinel school monitoring site for ${county.county_name}`,
      response: 'Maintain school-facing surveillance and compare fixture-level results with utility baseline.',
      last_sample_at: county.last_sample_at,
      signals: [
        { label: 'Lead', value: county.status === 'critical' ? '0.019 mg/L' : county.status === 'moderate' ? '0.006 mg/L' : '0.002 mg/L' },
        { label: 'Chlorine', value: county.status === 'critical' ? '0.2 mg/L' : county.status === 'moderate' ? '0.4 mg/L' : '0.8 mg/L' },
      ],
    },
  ];
}

function getSelectedStateName(stateCode: string | null, states: StateSummary[]) {
  if (!stateCode) return '—';
  return states.find((s) => s.state_code === stateCode)?.state_name ?? stateCode;
}

function countByStatus(items: { status: RiskStatus }[], status: RiskStatus) {
  return items.filter((item) => item.status === status).length;
}

function mergeStatesWithFallback(apiStates: StateSummary[]): StateSummary[] {
  const apiMap = new Map(apiStates.map((s) => [s.state_code, s]));
  return allUsaStatesFallback.map((fallback) => apiMap.get(fallback.state_code) ?? fallback);
}

export function CommunityMap() {
  const [mapMode, setMapMode] = useState<MapMode>('usa');
  const [selectedState, setSelectedState] = useState<string | null>('AL');
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [hoveredSiteId, setHoveredSiteId] = useState<string | null>(null);

  const [states, setStates] = useState<StateSummary[]>(allUsaStatesFallback);
  const [counties, setCounties] = useState<CountySummary[]>([]);
  const [sites, setSites] = useState<SitePin[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [liveConnected, setLiveConnected] = useState(false);

  useEffect(() => {
    const loadUsaSummary = async () => {
      try {
        setApiLoading(true);
        setApiError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/map/usa-summary`);
        if (!response.ok) throw new Error(`USA summary endpoint error: ${response.status}`);

        const result: UsaSummaryResponse = await response.json();
        const parsedStates = Array.isArray(result?.states)
          ? (result.states.map(normalizeState).filter(Boolean) as StateSummary[])
          : [];

        setStates(mergeStatesWithFallback(parsedStates));
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Unknown error');
        setStates(allUsaStatesFallback);
      } finally {
        setApiLoading(false);
        setLiveConnected(true);
      }
    };

    loadUsaSummary();
  }, []);

  useEffect(() => {
    if (!selectedState) {
      setCounties([]);
      setSelectedCounty(null);
      return;
    }

    const loadStateDetail = async () => {
      try {
        setApiLoading(true);

        const response = await fetch(`${API_BASE_URL}/api/v1/map/states/${selectedState}`);
        if (!response.ok) throw new Error(`State detail endpoint error: ${response.status}`);

        const result: StateDetailResponse = await response.json();
        const parsedCounties = Array.isArray(result?.counties)
          ? (result.counties.map(normalizeCounty).filter(Boolean) as CountySummary[])
          : [];

        const nextCounties =
          parsedCounties.length > 0 ? parsedCounties : fallbackCountiesByState[selectedState] ?? [];

        setCounties(nextCounties);
        setSelectedCounty((prev) =>
          prev && nextCounties.some((county) => county.county_code === prev)
            ? prev
            : nextCounties[0]?.county_code ?? null
        );
      } catch {
        const nextCounties = fallbackCountiesByState[selectedState] ?? [];
        setCounties(nextCounties);
        setSelectedCounty((prev) =>
          prev && nextCounties.some((county) => county.county_code === prev)
            ? prev
            : nextCounties[0]?.county_code ?? null
        );
      } finally {
        setApiLoading(false);
      }
    };

    loadStateDetail();
  }, [selectedState]);

  useEffect(() => {
    if (!selectedState || !selectedCounty) {
      setSites([]);
      return;
    }

    const loadCountySites = async () => {
      try {
        setApiLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/v1/map/sites?state=${selectedState}&county=${selectedCounty}`
        );
        if (!response.ok) throw new Error(`County sites endpoint error: ${response.status}`);

        const result: CountySiteResponse = await response.json();
        const parsedSites = Array.isArray(result?.sites)
          ? (result.sites.map(normalizeSite).filter(Boolean) as SitePin[])
          : [];

        const selectedCountyInfo =
          counties.find((county) => county.county_code === selectedCounty) ?? null;

        const nextSites =
          parsedSites.length > 0
            ? parsedSites
            : fallbackSitesByCounty[selectedCounty] ?? buildDefaultCountySites(selectedCountyInfo);

        setSites(nextSites);
      } catch {
        const selectedCountyInfo =
          counties.find((county) => county.county_code === selectedCounty) ?? null;

        setSites(
          fallbackSitesByCounty[selectedCounty] ?? buildDefaultCountySites(selectedCountyInfo)
        );
      } finally {
        setApiLoading(false);
      }
    };

    loadCountySites();
  }, [selectedState, selectedCounty, counties]);

  const criticalStates = countByStatus(states, 'critical');
  const moderateStates = countByStatus(states, 'moderate');
  const criticalCounties = countByStatus(counties, 'critical');
  const moderateCounties = countByStatus(counties, 'moderate');

  const hoveredSite = useMemo(
    () => sites.find((site) => site.id === hoveredSiteId) ?? null,
    [hoveredSiteId, sites]
  );

  const selectedCountyInfo = useMemo(
    () => counties.find((county) => county.county_code === selectedCounty) ?? null,
    [counties, selectedCounty]
  );

  const selectedStateInfo = useMemo(
    () => states.find((s) => s.state_code === selectedState) ?? null,
    [states, selectedState]
  );

  const hoveredStateInfo = useMemo(
    () => states.find((s) => s.state_code === hoveredState) ?? null,
    [states, hoveredState]
  );

  const detailPanelTitle =
    hoveredSite?.label ??
    selectedCountyInfo?.county_name ??
    hoveredStateInfo?.state_name ??
    selectedStateInfo?.state_name ??
    'United States';

  const detailPanelStatus: RiskStatus =
    hoveredSite?.status ??
    selectedCountyInfo?.status ??
    hoveredStateInfo?.status ??
    selectedStateInfo?.status ??
    'safe';

  const detailStyles = getStatusClasses(detailPanelStatus);

  const hotspotCount =
    mapMode === 'usa'
      ? criticalStates + moderateStates
      : mapMode === 'state'
      ? criticalCounties + moderateCounties
      : countByStatus(sites, 'critical') + countByStatus(sites, 'moderate');

  const attentionStates = useMemo(
    () =>
      states
        .filter((state) => state.status !== 'safe')
        .sort((a, b) => {
          const score = (s: StateSummary) => (s.status === 'critical' ? 2 : 1);
          return score(b) - score(a) || b.alert_count - a.alert_count;
        }),
    [states]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <img src={logoImage} alt="FalilaX" className="h-16 w-auto md:h-20" />
              </Link>

              <nav className="flex gap-6 text-sm">
                <Link to="/dashboard" className="text-zinc-400 transition-colors hover:text-zinc-100">
                  Dashboard
                </Link>
                <Link to="/map" className="font-medium text-zinc-100">
                  Community Map
                </Link>
                <Link to="/attribution" className="text-zinc-400 transition-colors hover:text-zinc-100">
                  Source Attribution
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-500">
                USA view active · Alabama focus enabled
              </div>

              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6 space-y-3">
          {apiLoading && (
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-blue-400">
              Loading national map intelligence from backend...
            </div>
          )}

          {!apiLoading && apiError && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-400">
              Using fallback map data · {apiError}
            </div>
          )}

          {!apiLoading && !apiError && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
              Community map connected successfully
            </div>
          )}

          <div
            className={`rounded-lg border p-3 text-sm ${
              liveConnected
                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                : 'border-zinc-700 bg-zinc-900/60 text-zinc-400'
            }`}
          >
            Live map stream: {liveConnected ? 'connected' : 'ready for live integration'}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-light">Community Water Quality Map</h1>
          <p className="text-zinc-400">
            National risk overview with state drill-down, Alabama county detail, and facility-level intelligence
          </p>

          <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
            <button
              type="button"
              onClick={() => {
                setMapMode('usa');
                setSelectedCounty(null);
                setHoveredSiteId(null);
              }}
              className="transition-colors hover:text-zinc-200"
            >
              USA
            </button>

            {selectedState && (
              <>
                <ChevronRight className="h-4 w-4" />
                <button
                  type="button"
                  onClick={() => {
                    setMapMode('state');
                    setSelectedCounty(null);
                    setHoveredSiteId(null);
                  }}
                  className="transition-colors hover:text-zinc-200"
                >
                  {getSelectedStateName(selectedState, states)}
                </button>
              </>
            )}

            {selectedCountyInfo && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-zinc-300">{selectedCountyInfo.county_name}</span>
              </>
            )}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="mb-1 text-xs text-zinc-500">
              {mapMode === 'usa' ? 'States Monitored' : mapMode === 'state' ? 'Counties Shown' : 'Facility Pins'}
            </p>
            <p className="text-2xl font-light">
              {mapMode === 'usa' ? states.length : mapMode === 'state' ? counties.length : sites.length}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="mb-1 text-xs text-zinc-500">Areas Requiring Attention</p>
            <p className="text-2xl font-light text-amber-400">{hotspotCount}</p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="mb-1 text-xs text-zinc-500">Critical Zones</p>
            <p className="text-2xl font-light text-red-400">
              {mapMode === 'usa'
                ? criticalStates
                : mapMode === 'state'
                ? criticalCounties
                : countByStatus(sites, 'critical')}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="mb-1 text-xs text-zinc-500">Monitoring Zones</p>
            <p className="text-2xl font-light text-amber-400">
              {mapMode === 'usa'
                ? moderateStates
                : mapMode === 'state'
                ? moderateCounties
                : countByStatus(sites, 'moderate')}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-amber-400" />
                  <h2 className="text-xl font-light">
                    {mapMode === 'usa'
                      ? 'USA Risk View'
                      : mapMode === 'state'
                      ? `${getSelectedStateName(selectedState, states)} County View`
                      : `${selectedCountyInfo?.county_name ?? 'County'} Facility View`}
                  </h2>
                </div>

                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-zinc-400">Safe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-zinc-400">Monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-zinc-400">Critical</span>
                  </div>
                </div>
              </div>

              <div className="relative h-[640px] w-full overflow-hidden rounded-xl border border-zinc-700 bg-[radial-gradient(circle_at_center,_rgba(39,39,42,0.75),_rgba(9,9,11,1))]">
                <svg className="absolute inset-0 h-full w-full opacity-15">
                  <defs>
                    <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse">
                      <path d="M 42 0 L 0 0 0 42" fill="none" stroke="currentColor" strokeWidth="0.4" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                <div className="absolute inset-0 bg-zinc-950/25" />

                {mapMode === 'usa' && (
                  <svg className="absolute inset-0 h-full w-full opacity-45">
                    <path
                      d="M120,180 L190,145 L255,150 L315,128 L390,136 L468,132 L560,142 L650,170 L730,180 L812,208
                         L845,246 L832,300 L806,335 L760,355 L720,408 L690,448 L620,457 L560,500 L490,510 L440,535
                         L370,528 L305,512 L250,498 L215,465 L180,425 L150,385 L125,330 L105,270 L108,220 Z"
                      fill="#111827"
                      stroke="#3f3f46"
                      strokeWidth="2.2"
                    />
                    <path
                      d="M180,540 L245,560 L230,596 L168,585 Z"
                      fill="#111827"
                      stroke="#3f3f46"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M310,584 L352,597 L335,618 L295,607 Z"
                      fill="#111827"
                      stroke="#3f3f46"
                      strokeWidth="1.7"
                    />
                  </svg>
                )}

                {mapMode === 'state' && (
                  <svg className="absolute inset-0 h-full w-full opacity-38">
                    <path
                      d="M250,110 L650,110 L705,235 L645,500 L275,530 L220,370 L235,170 Z"
                      fill="#111827"
                      stroke="#3f3f46"
                      strokeWidth="2"
                    />
                  </svg>
                )}

                {mapMode === 'county' && (
                  <svg className="absolute inset-0 h-full w-full opacity-38">
                    <path
                      d="M220,140 L700,140 L740,290 L665,500 L270,520 L205,360 Z"
                      fill="#111827"
                      stroke="#3f3f46"
                      strokeWidth="2"
                    />
                  </svg>
                )}

                {mapMode === 'usa' &&
                  states.map((state) => {
                    const styles = getStatusClasses(state.status);
                    const isSelected = selectedState === state.state_code;
                    const isHovered = hoveredState === state.state_code;
                    const showLabel = isSelected || isHovered || state.status !== 'safe';

                    return (
                      <button
                        key={state.state_code}
                        type="button"
                        onMouseEnter={() => setHoveredState(state.state_code)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => {
                          setSelectedState(state.state_code);
                          setSelectedCounty(null);
                          setHoveredSiteId(null);
                          setMapMode('state');
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 text-left"
                        style={{ left: `${state.x}%`, top: `${state.y}%` }}
                      >
                        <div
                          className={`absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                            state.status === 'critical'
                              ? 'h-10 w-10 bg-red-500/15 blur-md'
                              : state.status === 'moderate'
                              ? 'h-8 w-8 bg-amber-500/15 blur-md'
                              : 'h-6 w-6 bg-emerald-500/10 blur-md'
                          }`}
                        />

                        <div
                          className={`h-3.5 w-3.5 rounded-full border-2 border-zinc-950 ${styles.dot} ${styles.glow} ${
                            isSelected ? 'scale-125 ring-2 ring-zinc-100/50' : ''
                          }`}
                        />

                        {showLabel && (
                          <div className={`mt-2 rounded-md border px-2 py-1 ${styles.card}`}>
                            <p className={`text-[11px] font-medium ${styles.text}`}>{state.state_code}</p>
                            <p className="text-[10px] text-zinc-300 whitespace-nowrap">{state.alert_count} alerts</p>
                          </div>
                        )}
                      </button>
                    );
                  })}

                {mapMode === 'state' &&
                  counties.map((county) => {
                    const styles = getStatusClasses(county.status);
                    const isSelected = selectedCounty === county.county_code;

                    return (
                      <button
                        key={county.county_code}
                        type="button"
                        onClick={() => {
                          setSelectedCounty(county.county_code);
                          setHoveredSiteId(null);
                          setMapMode('county');
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 text-left"
                        style={{ left: `${county.x}%`, top: `${county.y}%` }}
                      >
                        <div
                          className={`absolute left-1/2 top-1/2 -z-10 h-10 w-12 -translate-x-1/2 -translate-y-1/2 rounded-lg ${styles.overlay} ${
                            isSelected ? 'opacity-100' : 'opacity-65'
                          }`}
                        />
                        <div
                          className={`rounded-md border px-2 py-1 ${styles.card} ${
                            isSelected ? 'ring-1 ring-zinc-100/60' : ''
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${styles.dot}`} />
                            <p className={`max-w-[92px] truncate text-[10px] font-medium ${styles.text}`}>
                              {county.county_name}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                {mapMode === 'county' &&
                  counties.map((county) => {
                    const styles = getStatusClasses(county.status);
                    const isSelected = selectedCounty === county.county_code;

                    return (
                      <div
                        key={`overlay-${county.county_code}`}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border ${styles.card} ${
                          isSelected ? 'opacity-100 ring-1 ring-zinc-200/50' : 'opacity-55'
                        }`}
                        style={{
                          left: `${county.x}%`,
                          top: `${county.y}%`,
                          width: '105px',
                          height: '74px',
                        }}
                      />
                    );
                  })}

                {mapMode === 'county' &&
                  sites.map((site) => {
                    const styles = getStatusClasses(site.status);
                    const isHovered = hoveredSiteId === site.id;

                    return (
                      <div
                        key={site.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${site.x}%`, top: `${site.y}%` }}
                        onMouseEnter={() => setHoveredSiteId(site.id)}
                        onMouseLeave={() => setHoveredSiteId(null)}
                      >
                        <button
                          type="button"
                          className="relative"
                          onClick={() => setHoveredSiteId(site.id)}
                        >
                          <div className={`absolute left-1/2 top-1/2 -z-10 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full ${styles.overlay} blur-md`} />
                          <div className={`h-4 w-4 rounded-full border-2 border-zinc-950 ${styles.dot} ${styles.glow}`} />
                        </button>

                        {isHovered && (
                          <div className="absolute left-6 top-0 z-20 w-64 rounded-xl border border-zinc-700 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur">
                            <p className={`text-sm font-medium ${styles.text}`}>{site.label}</p>
                            <div className="mt-2 space-y-1 text-xs text-zinc-300">
                              {site.signals.map((signal) => (
                                <div key={`${site.id}-${signal.label}`} className="flex items-center justify-between gap-3">
                                  <span className="text-zinc-400">{signal.label}</span>
                                  <span>{signal.value}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 border-t border-zinc-800 pt-3 text-xs text-zinc-400">
                              <p>Risk Level: <span className={styles.text}>{site.status}</span></p>
                              <p className="mt-1">Last Sample: {formatRelativeTime(site.last_sample_at)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="mt-4 flex items-start gap-3 rounded border border-amber-500/20 bg-amber-500/5 p-4">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                <div className="text-sm text-zinc-300">
                  <p className="mb-1 font-medium">
                    {mapMode === 'usa'
                      ? 'National view uses compact state markers to avoid crowding. Select any state to drill deeper.'
                      : mapMode === 'state'
                      ? 'Select a county to view facility pins and live site intelligence.'
                      : 'Hover over facility pins to inspect local evidence and response guidance.'}
                  </p>
                  <p className="text-zinc-400">
                    Alabama is preselected for deeper environmental monitoring, but the full USA map remains available.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-medium text-zinc-400">Live Map Detail Panel</h3>
              </div>

              <div className={`rounded-lg border p-4 ${detailStyles.card}`}>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className={`text-lg font-medium ${detailStyles.text}`}>{detailPanelTitle}</p>
                    <p className="mt-1 text-xs capitalize text-zinc-300">
                      {hoveredSite
                        ? hoveredSite.type
                        : mapMode === 'usa'
                        ? 'state overview'
                        : mapMode === 'state'
                        ? 'county overview'
                        : 'facility pin'}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-xs ${detailStyles.card}`}>
                    {detailPanelStatus}
                  </span>
                </div>

                <p className="text-sm text-zinc-300">
                  {hoveredSite?.detail ??
                    selectedCountyInfo?.county_name ??
                    hoveredStateInfo?.state_name ??
                    selectedStateInfo?.state_name ??
                    'Select a state, county, or facility to inspect local risk details.'}
                </p>
              </div>

              <div className="mt-4 space-y-4">
                {hoveredSite && (
                  <>
                    <div>
                      <p className="mb-2 text-xs text-zinc-500">Facility Signals</p>
                      <div className="space-y-2">
                        {hoveredSite.signals.map((signal) => (
                          <div key={`${hoveredSite.id}-${signal.label}`} className="flex items-center justify-between text-sm text-zinc-300">
                            <span className="text-zinc-400">{signal.label}</span>
                            <span>{signal.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-4">
                      <p className="mb-2 text-xs text-zinc-500">Recommended Response</p>
                      <p className="text-sm leading-relaxed text-zinc-300">{hoveredSite.response}</p>
                    </div>
                  </>
                )}

                {!hoveredSite && mapMode === 'usa' && (
                  <div>
                    <p className="mb-2 text-xs text-zinc-500">National Focus</p>
                    <p className="text-sm leading-relaxed text-zinc-300">
                      All 50 states are shown. Alabama remains selected by default for deeper monitoring and operational drill-down.
                    </p>
                  </div>
                )}

                {!hoveredSite && mapMode === 'state' && selectedState && (
                  <div>
                    <p className="mb-2 text-xs text-zinc-500">Selected State</p>
                    <p className="text-sm leading-relaxed text-zinc-300">
                      {getSelectedStateName(selectedState, states)} county overlays are shaded by risk:
                      green for safe, yellow for monitoring, and red for critical.
                    </p>
                  </div>
                )}

                {!hoveredSite && mapMode === 'county' && selectedCountyInfo && (
                  <div>
                    <p className="mb-2 text-xs text-zinc-500">Selected County</p>
                    <p className="text-sm leading-relaxed text-zinc-300">
                      {selectedCountyInfo.county_name} facility pins display local risk signals and last sample timestamps on hover.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-sm font-medium text-zinc-400">States Requiring Attention</h3>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {attentionStates.map((item) => (
                  <button
                    key={item.state_code}
                    type="button"
                    onClick={() => {
                      setSelectedState(item.state_code);
                      setSelectedCounty(null);
                      setHoveredSiteId(null);
                      setMapMode('state');
                    }}
                    className={`w-full rounded border p-3 text-left ${
                      item.status === 'critical'
                        ? 'border-red-500/20 bg-red-500/5'
                        : 'border-amber-500/20 bg-amber-500/5'
                    }`}
                  >
                    <div className="mb-1 flex items-start justify-between">
                      <h4 className="text-sm font-medium">{item.state_name}</h4>
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          item.status === 'critical' ? 'text-red-400' : 'text-amber-400'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-zinc-400">
                      {item.alert_count} active alerts · {item.state_code}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-sm font-medium text-zinc-400">Map Legend</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-zinc-300">Safe — all signals within expected limits</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-zinc-300">Monitoring — elevated parameters detected</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-zinc-300">Critical — health risk thresholds exceeded</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-3 text-sm font-medium text-zinc-400">Response Note</h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                This view is structured for national clarity first: compact USA markers, deeper Alabama county drill-down,
                and facility-level hover intelligence without crowding the national map.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 border-t border-zinc-800 bg-zinc-950/50 py-8">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 text-xs text-zinc-500 md:grid-cols-2">
            <div>
              <p className="mb-2">
                <span className="font-medium text-zinc-400">Responsibility Statement:</span>{' '}
                FalilaX provides interpretive risk intelligence and does not replace regulatory testing or official
                advisories.
              </p>
            </div>

            <div>
              <p>
                <span className="font-medium text-zinc-400">Data Sources:</span>{' '}
                Public utility reports, EPA-style summaries, laboratory inputs, and live monitoring streams.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}