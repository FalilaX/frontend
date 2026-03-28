import { Link, useNavigate } from 'react-router-dom';
import { Home, School, Building2, Utensils, Factory, ArrowLeft } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import logoImage from '@/assets/falilax-logo.png';

const contexts = [
  {
    id: 'home',
    title: 'Home',
    icon: Home,
    description: 'Residential water quality monitoring',
  },
  {
    id: 'school',
    title: 'School',
    icon: School,
    description: 'Educational facility oversight',
  },
  {
    id: 'hospital',
    title: 'Hospital',
    icon: Building2,
    description: 'Healthcare facility compliance',
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    icon: Utensils,
    description: 'Food service safety',
  },
  {
    id: 'utility',
    title: 'Utility',
    icon: Factory,
    description: 'Water system management',
  },
];

export function ContextSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* DEMO MODE */}
      <div className="fixed top-4 right-4 z-50 px-2 py-1 rounded text-xs text-zinc-500 bg-zinc-900 border border-zinc-800">
        Demo Mode · Simulated Data
      </div>

      {/* HEADER */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">

            <Link to="/" className="flex items-center gap-3">
              {/* ✅ BIGGER + CLEAN LOGO */}
              <img
                src={logoImage}
                alt="FalilaX"
                className="h-20 w-auto object-contain"
              />
              <span className="text-xl font-semibold tracking-wide">
                FalilaX
              </span>
            </Link>

            {/* ✅ FIXED BACK BUTTON */}
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">

          {/* TITLE */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light mb-4">
              Select Your Context
            </h1>

            <p className="text-xl text-zinc-400">
              Choose the type of facility to access tailored water quality insights
            </p>
          </div>

          {/* GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contexts.map((context) => {
              const Icon = context.icon;

              return (
                <div
                  key={context.id}
                  onClick={() => navigate('/dashboard')}
                  className="group cursor-pointer p-8 rounded-lg bg-zinc-900/50 border-2 border-zinc-800 hover:border-amber-500/50 transition-all hover:bg-zinc-900"
                >
                  <div className="flex flex-col items-center text-center">

                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                      <Icon className="w-8 h-8 text-amber-400" />
                    </div>

                    <h3 className="text-xl font-medium mb-2">
                      {context.title}
                    </h3>

                    <p className="text-sm text-zinc-400">
                      {context.description}
                    </p>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}