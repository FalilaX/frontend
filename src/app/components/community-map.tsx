import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Building2,
  ChevronRight,
  Database,
  Factory,
  Map,
  MapPin,
  Network,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { API_BASE_URL, API_ENDPOINTS } from "@/app/config/api";
import logoImage from "@/assets/falilax-logo.png";

type RiskStatus = "safe" | "monitoring" | "critical" | "unknown";
type RawRecord = Record<string, unknown>;
type LoadState = "loading" | "ready" | "empty" | "unauthenticated" | "error";

const TOKEN_STORAGE_KEY = "falilax_notification_session_token";

type OperationalSite = {
  id: string;
  name: string;
  type: string;
  network: string;
  serviceArea: string;
  state: string;
  county: string;
  community: string;
  status: RiskStatus;
  parameter?: string;
  measurement?: string;
  lastUpdated?: string;
};

const textValue = (...values: unknown[]) => {
  const match = values.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  return typeof match === "string" ? match.trim() : "";
};

const idValue = (...values: unknown[]) => {
  const match = values.find(
    (value) => typeof value === "string" || typeof value === "number",
  );
  return match == null ? "" : String(match);
};

const nested = (record: RawRecord, key: string): RawRecord => {
  const value = record[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RawRecord)
    : {};
};

const normalizeStatus = (value: unknown): RiskStatus => {
  const status = String(value ?? "").toLowerCase();
  if (["critical", "high", "unsafe", "emergency"].includes(status)) return "critical";
  if (["monitoring", "moderate", "notice", "action", "warning"].includes(status)) return "monitoring";
  if (["safe", "normal", "ok", "clear"].includes(status)) return "safe";
  return "unknown";
};

const collection = (payload: unknown, keys: string[]): RawRecord[] => {
  if (Array.isArray(payload)) return payload.filter(Boolean) as RawRecord[];
  if (!payload || typeof payload !== "object") return [];
  const object = payload as RawRecord;
  for (const key of keys) {
    if (Array.isArray(object[key])) return object[key] as RawRecord[];
  }
  return [];
};

const siteFromLocation = (record: RawRecord, index: number): OperationalSite => {
  const address = nested(record, "address");
  const organization = nested(record, "organization");
  return {
    id: idValue(record.location_id, record.site_id, record.id) || `location-${index}`,
    name: textValue(record.location_name, record.name, record.label, record.location_label) || `Monitoring site ${index + 1}`,
    type: textValue(record.facility_type, record.location_type, record.site_type, record.type) || "Monitoring site",
    network: textValue(record.utility_name, record.network_name, record.organization_name, organization.name) || "Connected water network",
    serviceArea: textValue(record.service_area_name, record.service_area, record.district_name) || "Primary service area",
    state: textValue(record.state_name, record.state, record.state_code, address.state),
    county: textValue(record.county_name, record.county, address.county),
    community: textValue(record.city_name, record.city, record.community_name, address.city),
    status: normalizeStatus(record.status ?? record.risk_level),
    parameter: textValue(record.parameter_name, record.parameter_code),
    lastUpdated: textValue(record.last_updated, record.last_sample_at, record.updated_at),
  };
};

const unique = (items: string[]) => [...new Set(items.filter(Boolean))].sort();

const statusLabel = (status: RiskStatus) => status === "critical" ? "Critical" : status === "monitoring" ? "Monitoring" : status === "safe" ? "Safe" : "Not scored";

const statusClass = (status: RiskStatus) => {
  if (status === "critical") return "text-red-300 bg-red-400/10 border-red-400/20";
  if (status === "monitoring") return "text-amber-300 bg-amber-400/10 border-amber-400/20";
  if (status === "safe") return "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
  return "text-zinc-300 bg-white/[.04] border-zinc-700";
};

const formatTime = (value?: string) => {
  if (!value) return "No timestamp supplied";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

export default function CommunityMap() {
  const navigate = useNavigate();
  const [sites, setSites] = useState<OperationalSite[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadState("loading");
      setErrorMessage("");

      const token = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        setSites([]);
        setLoadState("unauthenticated");
        return;
      }

      const request = async (path: string) => {
        const response = await fetch(`${API_BASE_URL}${path}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        if (response.status === 401) {
          window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          throw new Error("AUTH_REQUIRED");
        }
        if (!response.ok) throw new Error(`${path} returned ${response.status}`);
        return response.json();
      };

      const locationsResult = await request(API_ENDPOINTS.LOCATIONS);
      if (cancelled) return;

      const locationRecords = collection(locationsResult, ["locations", "items", "data", "results"]);
      const connectedSites = locationRecords.map(siteFromLocation);
      setSites(connectedSites);
      if (connectedSites.length) setLoadState("ready");
      else setLoadState("empty");
    };

    load().catch((error) => {
      if (cancelled) return;
      if (error instanceof Error && error.message === "AUTH_REQUIRED") {
        setLoadState("unauthenticated");
        setErrorMessage("");
      } else {
        setLoadState("error");
        setErrorMessage(error instanceof Error ? error.message : "Unable to load connected sites.");
      }
    });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const networks = useMemo(() => unique(sites.map((site) => site.network)), [sites]);
  const network = selectedNetwork || networks[0] || "";
  const networkSites = useMemo(() => sites.filter((site) => !network || site.network === network), [network, sites]);
  const states = useMemo(() => unique(networkSites.map((site) => site.state)), [networkSites]);
  const state = states.includes(selectedState) ? selectedState : states[0] || "";
  const stateSites = useMemo(() => networkSites.filter((site) => !state || site.state === state), [networkSites, state]);
  const counties = useMemo(() => unique(stateSites.map((site) => site.county)), [stateSites]);
  const county = counties.includes(selectedCounty) ? selectedCounty : counties[0] || "";
  const countySites = useMemo(() => stateSites.filter((site) => !county || site.county === county), [county, stateSites]);
  const communities = useMemo(() => unique(countySites.map((site) => site.community)), [countySites]);
  const community = communities.includes(selectedCommunity) ? selectedCommunity : communities[0] || "";
  const visibleSites = useMemo(() => countySites.filter((site) => !community || site.community === community), [community, countySites]);
  const selectedSite = visibleSites.find((site) => site.id === selectedSiteId) ?? visibleSites[0];
  const serviceAreas = unique(networkSites.map((site) => site.serviceArea));
  const activeSignals = sites.filter((site) => site.status === "monitoring" || site.status === "critical").length;
  const criticalSignals = sites.filter((site) => site.status === "critical").length;

  const updateNetwork = (value: string) => {
    setSelectedNetwork(value); setSelectedState(""); setSelectedCounty(""); setSelectedCommunity(""); setSelectedSiteId("");
  };
  const updateState = (value: string) => {
    setSelectedState(value); setSelectedCounty(""); setSelectedCommunity(""); setSelectedSiteId("");
  };
  const updateCounty = (value: string) => {
    setSelectedCounty(value); setSelectedCommunity(""); setSelectedSiteId("");
  };

  return (
    <div className="fx-app-shell min-h-screen bg-[#03131f] text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-cyan-300/10 bg-[#03131f]/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <button type="button" onClick={() => navigate("/")}><img src={logoImage} alt="FalilaX" className="fx-brand-logo" /></button>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        </div>
      </header>

      <main className="container mx-auto max-w-[1440px] px-6 py-8">
        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[.24em] text-cyan-300">Connected operations</p>
            <h1 className="flex items-center gap-3 text-3xl font-semibold"><Map className="h-7 w-7 text-cyan-300" /> Water Network Directory</h1>
            <p className="mt-2 max-w-3xl text-zinc-400">Navigate from an authorized water network to its jurisdictions, communities, and monitored sites. Only backend-connected records are shown.</p>
          </div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs ${loadState === "ready" ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300" : "border-zinc-700 bg-white/[.03] text-zinc-400"}`}>
            <span className={`h-2 w-2 rounded-full ${loadState === "ready" ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" : "bg-zinc-600"}`} />
            {loadState === "ready" ? "Backend connected" : loadState === "loading" ? "Connecting" : loadState === "unauthenticated" ? "Sign in required" : "No live connection"}
          </div>
        </div>

        <section className="mb-6 grid overflow-hidden rounded-2xl border border-cyan-300/10 bg-cyan-300/10 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Connected networks" value={networks.length} icon={<Network />} />
          <Metric label="Service areas" value={serviceAreas.length} icon={<Building2 />} />
          <Metric label="Monitored sites" value={sites.length} icon={<MapPin />} />
          <Metric label="Signals requiring attention" value={activeSignals} icon={<AlertTriangle />} />
        </section>

        {loadState === "loading" && (
          <section className="flex min-h-[480px] items-center justify-center rounded-[28px] border border-cyan-300/15 bg-[#061a29]">
            <div className="text-center text-zinc-400"><RefreshCw className="mx-auto mb-4 h-6 w-6 animate-spin text-cyan-300" />Loading connected networks and sites…</div>
          </section>
        )}

        {(loadState === "empty" || loadState === "unauthenticated" || loadState === "error") && (
          <section className="rounded-[28px] border border-cyan-300/15 bg-[#061a29] p-8 lg:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <Database className="mx-auto h-10 w-10 text-zinc-500" />
              <h2 className="mt-5 text-2xl font-semibold">{loadState === "error" ? "Operational data is unavailable" : loadState === "unauthenticated" ? "Sign in to view authorized sites" : "No connected sites yet"}</h2>
              <p className="mt-3 leading-relaxed text-zinc-400">{loadState === "error" ? errorMessage : loadState === "unauthenticated" ? "The water-network directory is protected. Sign in from the dashboard, then return here in the same browser tab." : "The FalilaX API responded successfully, but it did not return any authorized locations for this account."}</p>
              <Button className="mt-6" variant="outline" onClick={() => loadState === "unauthenticated" ? navigate("/dashboard/utility") : setReloadKey((value) => value + 1)}>{loadState === "unauthenticated" ? <><ArrowLeft className="mr-2 h-4 w-4" /> Go to secure dashboard</> : <><RefreshCw className="mr-2 h-4 w-4" /> Try again</>}</Button>
            </div>
          </section>
        )}

        {loadState === "ready" && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,.72fr)]">
            <section className="overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[#061a29] shadow-[0_30px_80px_rgba(0,0,0,.25)]">
              <div className="border-b border-cyan-300/10 px-6 py-5"><h2 className="text-lg font-medium">Operational hierarchy</h2><p className="mt-1 text-sm text-zinc-500">Selectors are generated from records returned by the API.</p></div>
              <div className="grid gap-4 border-b border-cyan-300/10 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
                <Selector label="Network / utility" value={network} options={networks} onChange={updateNetwork} icon={<Factory />} />
                {states.length > 0 && <Selector label="State / jurisdiction" value={state} options={states} onChange={updateState} icon={<MapPin />} />}
                {counties.length > 0 && <Selector label="County / region" value={county} options={counties} onChange={updateCounty} icon={<Building2 />} />}
                {communities.length > 0 && <Selector label="City / community" value={community} options={communities} onChange={(value) => { setSelectedCommunity(value); setSelectedSiteId(""); }} icon={<Users />} />}
              </div>
              <div className="relative overflow-hidden px-6 py-8">
                <div className="pointer-events-none absolute inset-0 opacity-30 bg-[linear-gradient(to_right,rgba(103,232,249,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(103,232,249,.06)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                    {[network, serviceAreas[0], state, county, community].filter(Boolean).map((item, index, values) => <span key={`${item}-${index}`} className="flex items-center gap-2"><span className={index === values.length - 1 ? "text-cyan-200" : ""}>{item}</span>{index < values.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}</span>)}
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {visibleSites.map((site) => (
                      <button key={site.id} type="button" onClick={() => setSelectedSiteId(site.id)} className={`rounded-2xl border p-5 text-left transition ${selectedSite?.id === site.id ? "border-cyan-300/45 bg-cyan-300/[.07] shadow-[0_0_30px_rgba(34,211,238,.08)]" : "border-cyan-300/10 bg-[#03131f]/90 hover:border-cyan-300/25"}`}>
                        <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate font-medium">{site.name}</p><p className="mt-1 text-xs capitalize text-zinc-500">{site.type.replaceAll("_", " ")}</p></div><span className={`rounded-full border px-2.5 py-1 text-[11px] ${statusClass(site.status)}`}>{statusLabel(site.status)}</span></div>
                        <p className="mt-4 text-xs text-zinc-500">Updated {formatTime(site.lastUpdated)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <aside className="rounded-[28px] border border-cyan-300/15 bg-[#061a29]">
              <div className="border-b border-cyan-300/10 px-6 py-5"><p className="text-[11px] uppercase tracking-[.22em] text-cyan-300">Selected site</p><h2 className="mt-2 text-xl font-medium">{selectedSite?.name}</h2><p className="mt-1 text-sm capitalize text-zinc-500">{selectedSite?.type.replaceAll("_", " ")}</p></div>
              {selectedSite && <div className="space-y-4 p-6">
                <div className={`rounded-2xl border p-5 ${statusClass(selectedSite.status)}`}><p className="text-xs opacity-75">Current signal status</p><p className="mt-2 text-3xl font-semibold">{statusLabel(selectedSite.status)}</p>{selectedSite.parameter && <p className="mt-2 text-sm">{selectedSite.parameter}{selectedSite.measurement ? ` · ${selectedSite.measurement}` : ""}</p>}</div>
                <Detail label="Network" value={selectedSite.network} /><Detail label="Service area" value={selectedSite.serviceArea} />
                {selectedSite.county && <Detail label="County / region" value={selectedSite.county} />}
                {selectedSite.community && <Detail label="City / community" value={selectedSite.community} />}
                <Detail label="Last update" value={formatTime(selectedSite.lastUpdated)} />
                <Button className="w-full" onClick={() => navigate(`/attribution?siteId=${encodeURIComponent(selectedSite.id)}`)}>Open site intelligence <ChevronRight className="ml-2 h-4 w-4" /></Button>
              </div>}
            </aside>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[24px] border border-cyan-300/15 bg-[#061a29] p-6"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-cyan-300" /><h2 className="font-medium">How users connect</h2></div><p className="mt-3 text-sm leading-relaxed text-zinc-400">Access follows organization membership and explicit network, service-area, or site assignments. A user sees only the operational sites authorized for their account; states and counties remain location metadata, not access-control containers.</p></section>
          <section className="rounded-[24px] border border-cyan-300/15 bg-[#061a29] p-6"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-cyan-300" /><h2 className="font-medium">Live posture</h2></div><div className="mt-4 grid grid-cols-2 gap-3"><Detail label="Signals requiring attention" value={String(activeSignals)} /><Detail label="Critical signals" value={String(criticalSignals)} /></div></section>
        </div>
        <div className="mt-8 flex items-start gap-2 text-xs text-zinc-500"><ShieldAlert className="mt-0.5 h-4 w-4" /><p>FalilaX provides interpretive risk intelligence and does not replace official regulatory testing, emergency response, or public health advisories.</p></div>
      </main>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return <div className="bg-[#061a29] p-5"><div className="flex items-center gap-2 text-sm text-zinc-400"><span className="text-cyan-300 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>{label}</div><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}

function Selector({ label, value, options, onChange, icon }: { label: string; value: string; options: string[]; onChange: (value: string) => void; icon: ReactNode }) {
  return <label className="block"><span className="flex items-center gap-2 text-[11px] uppercase tracking-[.16em] text-zinc-500"><span className="text-cyan-300 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-cyan-300/15 bg-[#03131f] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/45">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-cyan-300/10 bg-[#03131f] p-4"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-sm font-medium text-zinc-200">{value}</p></div>;
}
