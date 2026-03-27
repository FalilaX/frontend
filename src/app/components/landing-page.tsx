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
      
      {/* Demo Mode */}
      <div className="fixed top-4 right-4 z-50 px-2 py-1 rounded text-xs text-zinc-500 bg-zinc-900 border border-zinc-800">
        Demo Mode · Simulated Data
      </div>

      {/* HEADER */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm relative z-20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">

            {/* 🔥 BIG LOGO */}
            <div className="flex items-center gap-3">
              <img
                src={logoImage}
                alt="FalilaX"
                className="h-36 md:h-40 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,200,0,0.3)]"
              />
            </div>

            <Link to="/select-context">
              <Button
                variant="outline"
                className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100"
              >
                Access Dashboard
              </Button>
            </Link>

          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative w-full h-[650px] md:h-[750px] flex items-center justify-center overflow-hidden">

        {/* 🔥 FULL BACKGROUND IMAGE */}
        <div className="absolute inset-0">
          <img
            src={watermarkImage}
            alt=""
            className="w-full h-full object-cover scale-110 opacity-30"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* CONTENT */}
        <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
          <h1 className="mb-8 text-5xl md:text-6xl font-light leading-tight">
            Water Risk Intelligence
            <br />
            <span className="text-amber-400">Made Clear</span>
          </h1>

          <p className="mb-12 text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            FalilaX helps anyone, anywhere understand what&apos;s happening with their tap
            water—at home, at work, and across communities.
          </p>

          <Link to="/select-context">
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-medium px-8"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

          <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition">
            <Shield className="w-12 h-12 text-amber-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">Source Attribution</h3>
            <p className="text-zinc-400">
              Pinpoint whether issues originate from building infrastructure,
              distribution lines, or the central system.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition">
            <TrendingDown className="w-12 h-12 text-amber-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">Risk Assessment</h3>
            <p className="text-zinc-400">
              Clear risk levels and recommended actions based on existing water
              quality data and standards.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/30 transition">
            <MapPin className="w-12 h-12 text-amber-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">Community Insights</h3>
            <p className="text-zinc-400">
              Visualize affected areas and understand broader patterns across your community.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">

          <button
            onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
            className="w-full p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 flex items-center justify-between"
          >
            <h2 className="text-lg font-light text-zinc-300">
              How FalilaX Works
            </h2>
            <ChevronDown
              className={`w-5 h-5 transition ${
                isHowItWorksOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              isHowItWorksOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-6 bg-zinc-900/20 border border-t-0 border-zinc-800">

              <div className="grid md:grid-cols-4 gap-4 text-center">

                <div>
                  <h3 className="text-sm text-zinc-300">1. Water Sensing</h3>
                </div>

                <div>
                  <h3 className="text-sm text-zinc-300">2. Continuous Analysis</h3>
                </div>

                <div>
                  <h3 className="text-sm text-zinc-300">3. Source Attribution</h3>
                </div>

                <div>
                  <h3 className="text-sm text-zinc-300">4. Instant Alerts</h3>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 mt-16">
        <div className="container mx-auto px-6 py-8 text-sm text-zinc-500">

          <p className="mb-2">
            FalilaX provides interpretive risk intelligence and does not replace regulatory testing.
          </p>

          <div className="flex justify-between mt-4">
            <p>© 2026 FalilaX™</p>
            <p>Professional use only</p>
          </div>

        </div>
      </footer>

    </div>
  );
}