import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import logoImage from '../../assets/falilax-logo.png';

const zones = [
  { id: 1, name: 'District 1', status: 'safe', facilities: 12, x: 20, y: 15 },
  { id: 2, name: 'District 2', status: 'safe', facilities: 8, x: 45, y: 20 },
  { id: 3, name: 'District 3', status: 'moderate', facilities: 15, x: 70, y: 25 },
  { id: 4, name: 'District 4', status: 'safe', facilities: 10, x: 30, y: 50 },
  { id: 5, name: 'District 5', status: 'moderate', facilities: 18, x: 55, y: 55 },
  { id: 6, name: 'District 6', status: 'safe', facilities: 14, x: 80, y: 60 },
  { id: 7, name: 'District 7', status: 'safe', facilities: 9, x: 25, y: 80 },
  { id: 8, name: 'District 8', status: 'safe', facilities: 11, x: 60, y: 85 },
] as const;

export function CommunityMap() {
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
                Demo Mode · Simulated Data
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
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-light">Community Water Quality Map</h1>
          <p className="text-zinc-400">
            Regional overview of water quality status across all monitored facilities
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="mb-1 text-xs text-zinc-500">Districts Monitored</p>
            <p className="text-2xl font-light">{zones.length}</p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="mb-1 text-xs text-zinc-500">Total Facilities</p>
            <p className="text-2xl font-light">
              {zones.reduce((sum, zone) => sum + zone.facilities, 0)}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="mb-1 text-xs text-zinc-500">Coverage Area</p>
            <p className="text-2xl font-light">Citywide</p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="mb-1 text-xs text-zinc-500">Active Alerts</p>
            <p className="text-2xl font-light text-amber-400">
              {zones.filter((z) => z.status === 'moderate').length}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-light">Regional Districts</h2>

                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-zinc-400">Safe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-zinc-400">Monitor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-zinc-400">Critical</span>
                  </div>
                </div>
              </div>

              <div className="relative h-96 w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/30">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1736117704303-68f39b863af6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMG1hcCUyMHRvcG9ncmFwaGljfGVufDF8fHx8MTc2OTE3OTA0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="City map"
                  className="absolute inset-0 h-full w-full object-cover opacity-30"
                />

                <div className="absolute inset-0 bg-zinc-950/40" />

                <svg className="absolute inset-0 h-full w-full opacity-10">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="group absolute cursor-pointer"
                    style={{
                      left: `${zone.x}%`,
                      top: `${zone.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                        zone.status === 'safe'
                          ? 'border-emerald-500 bg-emerald-500/20 group-hover:bg-emerald-500/30'
                          : 'border-amber-500 bg-amber-500/20 group-hover:bg-amber-500/30'
                      }`}
                    >
                      <MapPin
                        className={`h-6 w-6 ${
                          zone.status === 'safe' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      />
                    </div>

                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded border border-zinc-700 bg-zinc-900 px-3 py-2 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      <p className="text-sm font-medium">{zone.name}</p>
                      <p className="text-xs text-zinc-400">{zone.facilities} facilities</p>
                      <div
                        className={`mt-1 text-xs ${
                          zone.status === 'safe' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {zone.status === 'safe' ? 'All Safe' : 'Monitoring'}
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  className="pointer-events-none absolute w-max"
                  style={{ left: '55%', top: '55%', transform: 'translate(-50%, -50%)' }}
                >
                  <div className="h-4 w-4 rounded-full bg-amber-500 border-4 border-amber-400/30" />
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded border border-amber-500/20 bg-amber-500/5 p-4">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
                <div className="text-sm text-zinc-300">
                  <p className="mb-1 font-medium">Your Location: District 5</p>
                  <p className="text-zinc-400">
                    Currently monitoring water quality at Lincoln Elementary School
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-sm font-medium text-zinc-400">Regional Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">Total Districts</span>
                  <span className="text-xl font-light">{zones.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">Total Facilities</span>
                  <span className="text-xl font-light">
                    {zones.reduce((sum, zone) => sum + zone.facilities, 0)}
                  </span>
                </div>

                <div className="border-t border-zinc-800 pt-3">
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-zinc-300">Safe Districts</span>
                    <span className="ml-auto text-lg font-light">
                      {zones.filter((z) => z.status === 'safe').length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-zinc-300">Monitoring</span>
                    <span className="ml-auto text-lg font-light">
                      {zones.filter((z) => z.status === 'moderate').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-sm font-medium text-zinc-400">Areas Requiring Attention</h3>
              <div className="space-y-3">
                {zones
                  .filter((z) => z.status === 'moderate')
                  .map((zone) => (
                    <div
                      key={zone.id}
                      className="rounded border border-amber-500/20 bg-amber-500/5 p-3"
                    >
                      <div className="mb-1 flex items-start justify-between">
                        <h4 className="text-sm font-medium">{zone.name}</h4>
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                      </div>
                      <p className="text-xs text-zinc-400">{zone.facilities} facilities affected</p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 text-sm font-medium text-zinc-400">Map Legend</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-zinc-300">Your location</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span className="text-zinc-300">Safe zone</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  <span className="text-zinc-300">Monitoring required</span>
                </div>
              </div>
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
                FalilaX provides interpretive risk intelligence and does not replace regulatory
                testing or official advisories.
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
    </div>
  );
}