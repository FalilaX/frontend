import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  Network,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Waves,
} from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import logoImage from '@/assets/falilax-logo.png';
import watermarkImage from '@/assets/landing-hero.png';

export function LandingPage() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-100">

      {/* =========================================================
          GLOBAL AMBIENT BACKGROUND
      ========================================================= */}
      <div className="pointer-events-none fixed inset-0 z-0">

        {/* Cyan glow */}
        <div className="
          absolute
          -left-48
          -top-48
          h-[38rem]
          w-[38rem]
          rounded-full
          bg-cyan-500/[0.08]
          blur-[140px]
        " />

        {/* Blue glow */}
        <div className="
          absolute
          right-[-14rem]
          top-[10rem]
          h-[36rem]
          w-[36rem]
          rounded-full
          bg-blue-600/[0.08]
          blur-[150px]
        " />

        {/* Very subtle amber warmth */}
        <div className="
          absolute
          bottom-[-20rem]
          left-[35%]
          h-[34rem]
          w-[34rem]
          rounded-full
          bg-amber-500/[0.035]
          blur-[150px]
        " />

        {/* Faint technical grid */}
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />
      </div>

      {/* =========================================================
          DEMO MODE
      ========================================================= */}
      <div className="
        fixed
        right-4
        top-4
        z-50
        rounded-full
        border
        border-white/[0.08]
        bg-[#0d1929]/90
        px-3
        py-1.5
        text-[11px]
        text-slate-500
        shadow-xl
        backdrop-blur-xl
      ">
        Demo Mode · Simulated Data
      </div>

      {/* =========================================================
          HEADER
      ========================================================= */}
      <header className="
        relative
        z-30
        border-b
        border-white/[0.07]
        bg-[#07111f]/80
        backdrop-blur-xl
      ">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">

            {/* LOGO */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="
                group
                flex
                items-center
                gap-3
                rounded-xl
                text-left
              "
            >
              <img
                src={logoImage}
                alt="FalilaX"
                className="
                  h-14
                  w-14
                  object-contain
                  drop-shadow-[0_0_18px_rgba(56,189,248,0.28)]
                  transition
                  duration-300
                  group-hover:drop-shadow-[0_0_24px_rgba(56,189,248,0.42)]
                "
              />

              <div className="hidden sm:block">
                <div className="
                  text-lg
                  font-semibold
                  tracking-tight
                  text-white
                ">
                  FalilaX
                </div>

                <div className="
                  text-[10px]
                  uppercase
                  tracking-[0.22em]
                  text-slate-500
                ">
                  Water Intelligence
                </div>
              </div>
            </button>

            {/* HEADER CTA */}
            <Button
              onClick={() => navigate('/select-context')}
              variant="outline"
              className="
                h-11
                rounded-xl
                border-white/[0.10]
                bg-white/[0.035]
                px-5
                text-slate-200
                shadow-lg
                backdrop-blur
                hover:border-cyan-400/30
                hover:bg-cyan-400/[0.06]
                hover:text-white
              "
            >
              Access Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="relative z-10">

        {/* =======================================================
            HERO
        ======================================================= */}
        <section className="
          relative
          isolate
          min-h-[690px]
          overflow-hidden
          border-b
          border-white/[0.07]
        ">

          {/* HERO IMAGE */}
          <img
            src={watermarkImage}
            alt="FalilaX water risk intelligence"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              opacity-[0.34]
            "
          />

          {/* Navy overlay */}
          <div className="
            absolute
            inset-0
            bg-gradient-to-b
            from-[#07111f]/40
            via-[#07111f]/58
            to-[#07111f]
          " />

          {/* Horizontal atmosphere */}
          <div className="
            absolute
            inset-0
            bg-gradient-to-r
            from-cyan-950/25
            via-transparent
            to-amber-950/10
          " />

          {/* Central illumination */}
          <div className="
            absolute
            left-1/2
            top-[40%]
            h-[30rem]
            w-[50rem]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-sky-400/[0.04]
            blur-[100px]
          " />

          {/* HERO CONTENT */}
          <div className="
            relative
            mx-auto
            flex
            min-h-[690px]
            max-w-7xl
            items-center
            px-6
            py-24
            lg:px-8
          ">
            <div className="mx-auto max-w-4xl text-center">

              {/* Eyebrow */}
              <div className="
                mb-7
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-400/15
                bg-cyan-400/[0.06]
                px-4
                py-2
                text-xs
                font-medium
                uppercase
                tracking-[0.18em]
                text-cyan-200
                backdrop-blur
              ">
                <Sparkles className="h-4 w-4" />
                Source-to-tap intelligence
              </div>

              {/* Hero title */}
              <h1 className="
                text-5xl
                font-light
                leading-[1.04]
                tracking-[-0.045em]
                text-white
                sm:text-6xl
                lg:text-7xl
              ">
                Water Risk Intelligence

                <span className="
                  mt-2
                  block
                  bg-gradient-to-r
                  from-cyan-200
                  via-sky-300
                  to-amber-300
                  bg-clip-text
                  text-transparent
                ">
                  Made Clear
                </span>
              </h1>

              {/* Hero description */}
              <p className="
                mx-auto
                mt-7
                max-w-3xl
                text-lg
                leading-8
                text-slate-300
                sm:text-xl
              ">
                Understand water risk from source to tap.
                FalilaX transforms water-quality, infrastructure, and
                operational data into clear intelligence for homes,
                facilities, communities, and utilities.
              </p>

              {/* CTA buttons */}
              <div className="
                mt-10
                flex
                flex-col
                items-center
                justify-center
                gap-3
                sm:flex-row
              ">

                <Button
                  size="lg"
                  onClick={() => navigate('/select-context')}
                  className="
                    h-12
                    rounded-xl
                    bg-gradient-to-r
                    from-cyan-400
                    to-sky-500
                    px-8
                    font-semibold
                    text-slate-950
                    shadow-[0_14px_45px_rgba(56,189,248,0.20)]
                    hover:from-cyan-300
                    hover:to-sky-400
                  "
                >
                  Explore FalilaX
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <button
                  type="button"
                  onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
                  className="
                    inline-flex
                    h-12
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/[0.09]
                    bg-white/[0.035]
                    px-6
                    text-sm
                    font-medium
                    text-slate-300
                    backdrop-blur
                    transition
                    hover:border-white/[0.15]
                    hover:bg-white/[0.06]
                    hover:text-white
                  "
                >
                  How it works

                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isHowItWorksOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

              </div>

              {/* Product capabilities */}
              <div className="
                mt-12
                flex
                flex-wrap
                items-center
                justify-center
                gap-x-8
                gap-y-4
                text-sm
                text-slate-400
              ">
                <div className="flex items-center gap-2">
                  <Waves className="h-4 w-4 text-cyan-400" />
                  Continuous monitoring
                </div>

                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-sky-400" />
                  Source attribution
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Operational response
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =======================================================
            HOW IT WORKS
        ======================================================= */}
        <section
          className={`
            overflow-hidden
            border-b
            border-white/[0.07]
            transition-all
            duration-500
            ${
              isHowItWorksOpen
                ? 'max-h-[800px] opacity-100'
                : 'max-h-0 opacity-0'
            }
          `}
        >
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

            <div className="mb-10 text-center">
              <p className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-cyan-300
              ">
                Intelligence pipeline
              </p>

              <h2 className="
                mt-3
                text-3xl
                font-light
                tracking-tight
                text-white
                md:text-4xl
              ">
                From measurement to meaningful action
              </h2>

              <p className="
                mx-auto
                mt-4
                max-w-2xl
                text-sm
                leading-6
                text-slate-400
              ">
                FalilaX connects observations, infrastructure context,
                source intelligence, and operational response in one
                continuous workflow.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">

              {[
                {
                  number: '01',
                  title: 'Water Sensing',
                  description:
                    'Measurements and observations enter the FalilaX intelligence layer.',
                },
                {
                  number: '02',
                  title: 'Continuous Analysis',
                  description:
                    'Signals are evaluated against water-quality and operational context.',
                },
                {
                  number: '03',
                  title: 'Source Attribution',
                  description:
                    'Topology and infrastructure evidence help explain where risk may originate.',
                },
                {
                  number: '04',
                  title: 'Clear Response',
                  description:
                    'Complex evidence becomes understandable alerts, investigations, and actions.',
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="
                    group
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-[#0d1929]/75
                    p-6
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:border-cyan-400/20
                    hover:bg-[#101f32]
                    hover:shadow-[0_18px_55px_rgba(8,145,178,0.08)]
                  "
                >
                  <div className="
                    mb-6
                    text-xs
                    font-semibold
                    tracking-[0.18em]
                    text-cyan-300
                  ">
                    {step.number}
                  </div>

                  <h3 className="text-lg font-semibold text-white">
                    {step.title}
                  </h3>

                  <p className="
                    mt-3
                    text-sm
                    leading-6
                    text-slate-400
                  ">
                    {step.description}
                  </p>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* =======================================================
            FEATURES
        ======================================================= */}
        <section className="relative">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

            <div className="mb-12 max-w-2xl">

              <p className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.20em]
                text-cyan-300
              ">
                Understand more
              </p>

              <h2 className="
                mt-3
                text-3xl
                font-light
                tracking-tight
                text-white
                md:text-4xl
              ">
                More than a water-quality dashboard
              </h2>

              <p className="
                mt-4
                text-base
                leading-7
                text-slate-400
              ">
                FalilaX helps explain what is happening, where it may be
                originating, who may be affected, and what should happen next.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-3">

              {/* SOURCE ATTRIBUTION */}
              <div className="
                group
                rounded-3xl
                border
                border-white/[0.08]
                bg-[#0d1929]/70
                p-7
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-cyan-400/25
                hover:shadow-[0_22px_70px_rgba(34,211,238,0.08)]
              ">
                <div className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-cyan-400/10
                  bg-cyan-400/[0.08]
                ">
                  <Network className="h-6 w-6 text-cyan-300" />
                </div>

                <h3 className="
                  mt-6
                  text-xl
                  font-semibold
                  text-white
                ">
                  Source Attribution
                </h3>

                <p className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-400
                ">
                  Connect water observations with infrastructure topology
                  and upstream evidence to understand probable origins.
                </p>
              </div>

              {/* RISK ASSESSMENT */}
              <div className="
                group
                rounded-3xl
                border
                border-white/[0.08]
                bg-[#0d1929]/70
                p-7
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-sky-400/25
                hover:shadow-[0_22px_70px_rgba(56,189,248,0.08)]
              ">
                <div className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-sky-400/10
                  bg-sky-400/[0.08]
                ">
                  <TrendingDown className="h-6 w-6 text-sky-300" />
                </div>

                <h3 className="
                  mt-6
                  text-xl
                  font-semibold
                  text-white
                ">
                  Risk Intelligence
                </h3>

                <p className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-400
                ">
                  Translate complex water-quality and operational signals
                  into clear risk levels, priorities, and decisions.
                </p>
              </div>

              {/* COMMUNITY */}
              <div className="
                group
                rounded-3xl
                border
                border-white/[0.08]
                bg-[#0d1929]/70
                p-7
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-amber-400/25
                hover:shadow-[0_22px_70px_rgba(245,158,11,0.07)]
              ">
                <div className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-amber-400/10
                  bg-amber-400/[0.07]
                ">
                  <MapPin className="h-6 w-6 text-amber-300" />
                </div>

                <h3 className="
                  mt-6
                  text-xl
                  font-semibold
                  text-white
                ">
                  Community Insights
                </h3>

                <p className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-400
                ">
                  Understand affected locations, spatial patterns, and
                  broader community context around water incidents.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* =======================================================
            PLATFORM STATEMENT
        ======================================================= */}
        <section className="
          border-y
          border-white/[0.07]
          bg-[#0a1625]/60
        ">
          <div className="
            mx-auto
            grid
            max-w-7xl
            gap-8
            px-6
            py-14
            md:grid-cols-[1fr_auto]
            md:items-center
            lg:px-8
          ">

            <div>
              <p className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.20em]
                text-cyan-300
              ">
                One intelligence platform
              </p>

              <h2 className="
                mt-3
                max-w-3xl
                text-2xl
                font-light
                tracking-tight
                text-white
                md:text-3xl
              ">
                Different water contexts deserve different information.
              </h2>

              <p className="
                mt-3
                max-w-3xl
                text-sm
                leading-6
                text-slate-400
              ">
                FalilaX adapts the experience for households, schools,
                hospitals, restaurants, and utility operations while
                preserving one shared intelligence foundation.
              </p>
            </div>

            <Button
              onClick={() => navigate('/select-context')}
              className="
                h-12
                rounded-xl
                bg-white
                px-6
                font-semibold
                text-slate-950
                hover:bg-cyan-100
              "
            >
              Choose Your Workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

          </div>
        </section>

      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="
        relative
        z-10
        border-t
        border-white/[0.07]
      ">
        <div className="
          mx-auto
          max-w-7xl
          px-6
          py-8
          text-sm
          text-slate-500
          lg:px-8
        ">

          <p>
            FalilaX provides interpretive risk intelligence and does not
            replace required regulatory testing.
          </p>

          <div className="
            mt-5
            flex
            flex-col
            gap-2
            border-t
            border-white/[0.06]
            pt-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          ">
            <p>© 2026 FalilaX™</p>

            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-600" />
              <p>Professional water intelligence</p>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}