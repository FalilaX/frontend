import { Link } from 'react-router-dom';
import { Shield, TrendingDown, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';
import logoImage from '@/assets/falilax-logo.png';
import watermarkImage from '@/assets/landing-hero.png';

export function LandingPage() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Demo Mode Corner Label */}
      <div className="fixed top-4 right-4 z-50 px-2 py-1 rounded text-xs text-zinc-500 bg-zinc-900 border border-zinc-800">
        Demo Mode · Simulated Data
      </div>

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="FalilaX" className="w-24 h-24" />
            </div>
            <Link to="/select-context">
              <Button variant="outline" className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
                Access Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 relative">
        {/* Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src={watermarkImage}
            alt=""
            className="w-full max-w-4xl opacity-20 object-contain"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="mb-8 text-5xl font-light leading-tight">
            Water Risk Intelligence
            <br />
            <span className="text-amber-400">Made Clear</span>
          </h1>
          <p className="mb-12 text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            FalilaX helps anyone, anywhere understand what's happening with their tap water—at home, at work, and across communities.
          </p>
          <Link to="/select-context">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-medium px-8">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition-colors">
            <Shield className="w-12 h-12 text-amber-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">Source Attribution</h3>
            <p className="text-zinc-400">
              Pinpoint whether issues originate from building infrastructure, distribution lines, or the central system.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition-colors">
            <TrendingDown className="w-12 h-12 text-amber-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">Risk Assessment</h3>
            <p className="text-zinc-400">
              Clear risk levels and recommended actions based on existing water quality data and standards.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition-colors">
            <MapPin className="w-12 h-12 text-amber-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">Community Insights</h3>
            <p className="text-zinc-400">
              Visualize affected areas and understand broader patterns across your community.
            </p>
          </div>
        </div>
      </section>

      {/* How FalilaX Works - Collapsible Section */}
      <section className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
            className="w-full p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center justify-between group"
          >
            <h2 className="text-lg font-light text-zinc-300">How FalilaX Works</h2>
            <ChevronDown
              className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${
                isHowItWorksOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              isHowItWorksOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-6 rounded-b-lg bg-zinc-900/20 border border-t-0 border-zinc-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div className="flex-1">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
                    <span className="text-lg">1</span>
                  </div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-1">Water Sensing</h3>
                  <p className="text-xs text-zinc-500">Continuous monitoring of quality parameters</p>
                </div>

                <div className="hidden md:block text-zinc-700">→</div>

                <div className="flex-1">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
                    <span className="text-lg">2</span>
                  </div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-1">Continuous Analysis</h3>
                  <p className="text-xs text-zinc-500">Real-time assessment against standards</p>
                </div>

                <div className="hidden md:block text-zinc-700">→</div>

                <div className="flex-1">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
                    <span className="text-lg">3</span>
                  </div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-1">Source Attribution</h3>
                  <p className="text-xs text-zinc-500">Identify origin of any issues detected</p>
                </div>

                <div className="hidden md:block text-zinc-700">→</div>

                <div className="flex-1">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
                    <span className="text-lg">4</span>
                  </div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-1">Instant Alerts</h3>
                  <p className="text-xs text-zinc-500">Alert to everyone in affected distribution line or central system</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-6 py-16 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-zinc-500 uppercase tracking-wider mb-4">Designed For</p>
          <div className="flex flex-wrap justify-center gap-6 text-zinc-400">
            <span>Individuals/Homes</span>
            <span className="text-zinc-700">•</span>
            <span>Public Health Officials</span>
            <span className="text-zinc-700">•</span>
            <span>Healthcare Facilities</span>
            <span className="text-zinc-700">•</span>
            <span>Educational Institutions</span>
            <span className="text-zinc-700">•</span>
            <span>Infrastructure Teams</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="grid md:grid-cols-2 gap-6 text-xs text-zinc-500 mb-6">
            <div>
              <p className="mb-2">
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
          <div className="flex items-center justify-between text-sm text-zinc-500 border-t border-zinc-800 pt-6">
            <p>© 2026 FalilaX™ by AfriDrug-Net. Water risk intelligence platform.</p>
            <p>Professional use only</p>
          </div>
        </div>
      </footer>
    </div>
  );
}