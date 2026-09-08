import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Factory,
  Home,
  School,
  ShieldCheck,
  Utensils,
  Waves,
} from 'lucide-react';

import logoImage from '@/assets/falilax-logo.png';

const contexts = [
  {
    id: 'home',
    eyebrow: 'HOUSEHOLD',
    title: 'Home Water',
    icon: Home,
    description:
      'Understand the quality, safety, and reliability of the water reaching your household.',
    accent: 'cyan',
  },
  {
    id: 'school',
    eyebrow: 'EDUCATION',
    title: 'Campus Water Safety',
    icon: School,
    description:
      'Monitor drinking water conditions across classrooms, cafeterias, dormitories, and facilities.',
    accent: 'sky',
  },
  {
    id: 'hospital',
    eyebrow: 'HEALTHCARE',
    title: 'Healthcare Water Safety',
    icon: Building2,
    description:
      'Focus on clinical water risk, critical areas, compliance, and facility response.',
    accent: 'teal',
  },
  {
    id: 'restaurant',
    eyebrow: 'FOOD SERVICE',
    title: 'Food-Service Water Safety',
    icon: Utensils,
    description:
      'Track water conditions that matter for kitchens, ice, sanitation, and food-service operations.',
    accent: 'amber',
  },
  {
    id: 'utility',
    eyebrow: 'UTILITY OPERATIONS',
    title: 'Utility Intelligence',
    icon: Factory,
    description:
      'Access network-wide monitoring, Digital Twin intelligence, incidents, source attribution, and operations.',
    accent: 'violet',
  },
] as const;

const accentStyles = {
  cyan: {
    icon: 'text-cyan-300',
    iconBackground: 'bg-cyan-400/[0.08]',
    iconBorder: 'border-cyan-400/10',
    hoverBorder: 'hover:border-cyan-400/30',
    glow: 'hover:shadow-[0_22px_70px_rgba(34,211,238,0.09)]',
  },

  sky: {
    icon: 'text-sky-300',
    iconBackground: 'bg-sky-400/[0.08]',
    iconBorder: 'border-sky-400/10',
    hoverBorder: 'hover:border-sky-400/30',
    glow: 'hover:shadow-[0_22px_70px_rgba(56,189,248,0.09)]',
  },

  teal: {
    icon: 'text-teal-300',
    iconBackground: 'bg-teal-400/[0.08]',
    iconBorder: 'border-teal-400/10',
    hoverBorder: 'hover:border-teal-400/30',
    glow: 'hover:shadow-[0_22px_70px_rgba(45,212,191,0.09)]',
  },

  amber: {
    icon: 'text-amber-300',
    iconBackground: 'bg-amber-400/[0.07]',
    iconBorder: 'border-amber-400/10',
    hoverBorder: 'hover:border-amber-400/30',
    glow: 'hover:shadow-[0_22px_70px_rgba(245,158,11,0.08)]',
  },

  violet: {
    icon: 'text-violet-300',
    iconBackground: 'bg-violet-400/[0.08]',
    iconBorder: 'border-violet-400/10',
    hoverBorder: 'hover:border-violet-400/30',
    glow: 'hover:shadow-[0_22px_70px_rgba(139,92,246,0.09)]',
  },
} as const;

export function ContextSelection() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-100">

      {/* =========================================================
          AMBIENT BACKGROUND
      ========================================================= */}
      <div className="pointer-events-none fixed inset-0 z-0">

        <div
          className="
            absolute
            -left-48
            -top-48
            h-[36rem]
            w-[36rem]
            rounded-full
            bg-cyan-500/[0.08]
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            right-[-12rem]
            top-[8rem]
            h-[34rem]
            w-[34rem]
            rounded-full
            bg-blue-600/[0.07]
            blur-[145px]
          "
        />

        <div
          className="
            absolute
            bottom-[-18rem]
            left-[38%]
            h-[32rem]
            w-[32rem]
            rounded-full
            bg-amber-500/[0.035]
            blur-[150px]
          "
        />

        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />
      </div>

      {/* =========================================================
          HEADER
      ========================================================= */}
      <header
        className="
          relative
          z-30
          border-b
          border-white/[0.07]
          bg-[#07111f]/80
          backdrop-blur-xl
        "
      >
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Brand */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="group flex items-center gap-3 text-left"
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
                <div className="text-lg font-semibold tracking-tight text-white">
                  FalilaX
                </div>

                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Water Intelligence
                </div>
              </div>
            </button>

            {/* Header controls */}
            <div className="flex items-center gap-3">

              <div
                className="
                  hidden
                  rounded-full
                  border
                  border-white/[0.08]
                  bg-white/[0.035]
                  px-3
                  py-1.5
                  text-[11px]
                  text-slate-500
                  sm:block
                "
              >
                Demo Mode &middot; Simulated Data
              </div>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.09]
                  bg-white/[0.035]
                  px-4
                  py-2.5
                  text-sm
                  text-slate-300
                  transition
                  hover:border-white/[0.15]
                  hover:bg-white/[0.06]
                  hover:text-white
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-8 lg:pt-20">

        {/* =======================================================
            PAGE INTRODUCTION
        ======================================================= */}
        <div className="mx-auto mb-14 max-w-3xl text-center">

          <div
            className="
              mb-6
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
            "
          >
            <Waves className="h-4 w-4" />
            Choose your workspace
          </div>

          <h1
            className="
              text-4xl
              font-light
              tracking-[-0.04em]
              text-white
              sm:text-5xl
              lg:text-6xl
            "
          >
            Water intelligence,

            <span
              className="
                mt-2
                block
                bg-gradient-to-r
                from-cyan-200
                via-sky-300
                to-amber-300
                bg-clip-text
                text-transparent
              "
            >
              shaped around your world.
            </span>
          </h1>

          <p
            className="
              mx-auto
              mt-6
              max-w-2xl
              text-base
              leading-7
              text-slate-400
              sm:text-lg
            "
          >
            FalilaX changes what it prioritizes according to where water risk
            matters. Select the workspace that best represents your environment.
          </p>

        </div>

        {/* =======================================================
            CONTEXT GRID
        ======================================================= */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12">

          {contexts.map((context) => {
            const Icon = context.icon;
            const accent = accentStyles[context.accent];

            let layoutClass = 'lg:col-span-4';

            if (context.id === 'restaurant') {
              layoutClass = 'lg:col-span-4 lg:col-start-3';
            }

            if (context.id === 'utility') {
              layoutClass = 'lg:col-span-4';
            }

            return (
              <button
                key={context.id}
                type="button"
                onClick={() => navigate(`/dashboard/${context.id}`)}
                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-[26px]
                  border
                  border-white/[0.08]
                  bg-[#0d1929]/78
                  p-7
                  text-left
                  shadow-[0_16px_50px_rgba(0,0,0,0.12)]
                  backdrop-blur
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-[#101f32]/90
                  ${accent.hoverBorder}
                  ${accent.glow}
                  ${layoutClass}
                `}
              >

                {/* Top highlight */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-x-10
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-white/25
                    to-transparent
                  "
                />

                {/* Very subtle internal glow */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-52
                    w-52
                    rounded-full
                    bg-white/[0.015]
                    blur-3xl
                    transition
                    group-hover:bg-white/[0.03]
                  "
                />

                <div className="relative flex min-h-[260px] flex-col">

                  {/* Card top */}
                  <div className="flex items-start justify-between">

                    <div
                      className={`
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        ${accent.iconBorder}
                        ${accent.iconBackground}
                      `}
                    >
                      <Icon className={`h-6 w-6 ${accent.icon}`} />
                    </div>

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/[0.06]
                        bg-white/[0.025]
                        text-slate-600
                        transition-all
                        duration-300
                        group-hover:translate-x-1
                        group-hover:border-white/[0.12]
                        group-hover:text-white
                      "
                    >
                      <ArrowRight className="h-4 w-4" />
                    </div>

                  </div>

                  {/* Card bottom */}
                  <div className="mt-auto pt-10">

                    <div
                      className="
                        mb-2
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.18em]
                        text-slate-500
                      "
                    >
                      {context.eyebrow}
                    </div>

                    <h2 className="text-xl font-semibold tracking-tight text-white">
                      {context.title}
                    </h2>

                    <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                      {context.description}
                    </p>

                    <div
                      className="
                        mt-6
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-slate-300
                        transition
                        group-hover:text-white
                      "
                    >
                      Open workspace
                      <ArrowRight
                        className="
                          h-4
                          w-4
                          transition-transform
                          group-hover:translate-x-1
                        "
                      />
                    </div>

                  </div>
                </div>
              </button>
            );
          })}

        </div>

        {/* =======================================================
            PLATFORM MESSAGE
        ======================================================= */}
        <div
          className="
            mt-16
            flex
            flex-col
            gap-5
            border-t
            border-white/[0.07]
            pt-8
            text-sm
            text-slate-500
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />

            <span>
              One intelligence platform. Different operational contexts.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-slate-600" />
            Source-to-tap water intelligence
          </div>

        </div>

      </main>
    </div>
  );
}