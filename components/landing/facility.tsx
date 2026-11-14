import type { ReactNode } from "react";

import Image from "next/image";
import {
  Clock,
  Coffee,
  Droplet,
  GraduationCap,
  Lightbulb,
  ShoppingBag,
  Thermometer,
  Trophy,
} from "lucide-react";

import {
  Reveal,
  SectionHeading,
  SPOTLIGHT_STYLE,
  trackSpotlight,
} from "./shared";

import { MEDIA_URLS } from "@/config/media-urls";

function Tile({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal className={className} delay={delay}>
      <div
        className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-dink-gray/60 transition-colors duration-300 hover:border-dink-lime/50"
        onMouseMove={trackSpotlight}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={SPOTLIGHT_STYLE}
        />
        {children}
      </div>
    </Reveal>
  );
}

function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-dink-lime/10 text-dink-lime ring-1 ring-dink-lime/30">
      {children}
    </span>
  );
}

const AMENITIES = [
  { Icon: Lightbulb, label: "LED lighting" },
  { Icon: Droplet, label: "Water stations" },
  { Icon: ShoppingBag, label: "Pro shop" },
  { Icon: Coffee, label: "Lounge area" },
];

export default function Facility() {
  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      id="facility"
    >
      <SectionHeading
        accent="One address."
        className="mb-12"
        description="Six climate-controlled indoor courts (planned) beside five outdoor courts, so the Texas heat, rain, or a cold snap never cancels your game."
        eyebrow="The facility"
        title="Eleven courts."
      />

      <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 md:grid-cols-4">
        {/* Hero rendering */}
        <Tile className="md:col-span-2 md:row-span-2">
          <div className="relative h-full min-h-[360px]">
            <Image
              fill
              alt="Aerial rendering of The Dink House building and outdoor courts"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              src={MEDIA_URLS.courtImages[3]}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-md">
              Architectural rendering
            </span>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="font-display text-4xl uppercase leading-none text-white sm:text-5xl">
                Bell County&apos;s first
                <br />
                <span className="text-dink-lime">indoor courts</span>
              </p>
              <p className="mt-3 max-w-md text-sm text-white/70 sm:text-base">
                Purpose-built in Nolanville with tournament-grade surfaces
                inside and out.
              </p>
            </div>
          </div>
        </Tile>

        {/* 24/7 access */}
        <Tile className="md:col-span-2" delay={0.08}>
          <div className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <IconBadge>
                  <Clock size={22} />
                </IconBadge>
                <h3 className="mt-4 text-xl font-bold text-white">
                  Open whenever you are
                </h3>
                <p className="mt-1 max-w-sm text-sm text-default-500">
                  Members get 24/7 entry with the app and a secure key fob.
                  Sunrise drills or midnight doubles.
                </p>
              </div>
              <span className="font-display text-5xl leading-none text-dink-lime">
                24/7
              </span>
            </div>
            {/* 24-hour bar: every hour lit */}
            <div aria-hidden className="flex items-end gap-1">
              {Array.from({ length: 24 }, (_, h) => (
                <span
                  key={h}
                  className="flex-1 rounded-sm bg-dink-lime/80 transition-all duration-500 group-hover:bg-dink-lime"
                  style={{
                    height: `${10 + Math.round(Math.abs(Math.sin((h + 3) / 4)) * 22)}px`,
                    transitionDelay: `${h * 20}ms`,
                  }}
                />
              ))}
            </div>
            <div
              aria-hidden
              className="-mt-4 flex justify-between text-[10px] uppercase tracking-wider text-default-400"
            >
              <span>12a</span>
              <span>6a</span>
              <span>12p</span>
              <span>6p</span>
              <span>12a</span>
            </div>
          </div>
        </Tile>

        {/* Climate */}
        <Tile delay={0.12}>
          <div className="flex h-full flex-col gap-4 p-6">
            <IconBadge>
              <Thermometer size={22} />
            </IconBadge>
            <h3 className="text-lg font-bold text-white">Climate-controlled</h3>
            <p className="text-sm text-default-500">
              Comfortable indoor play in August and January alike.
            </p>
          </div>
        </Tile>

        {/* Tournament ready */}
        <Tile delay={0.16}>
          <div className="flex h-full flex-col gap-4 p-6">
            <IconBadge>
              <Trophy size={22} />
            </IconBadge>
            <h3 className="text-lg font-bold text-white">Tournament ready</h3>
            <p className="text-sm text-default-500">
              Every court built to USA Pickleball tournament standards.
            </p>
          </div>
        </Tile>

        {/* Outdoor rendering */}
        <Tile className="md:col-span-2" delay={0.08}>
          <div className="relative h-full min-h-[240px]">
            <Image
              fill
              alt="Rendering of the outdoor courts with shaded courtside seating"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              src={MEDIA_URLS.courtImages[0]}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex max-w-xs flex-col justify-end p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white">
                Five outdoor courts
              </h3>
              <p className="mt-1 text-sm text-white/70">
                Lit for after-work play, with shaded seating courtside.
              </p>
            </div>
          </div>
        </Tile>

        {/* Coaches */}
        <Tile delay={0.12}>
          <div className="flex h-full flex-col gap-4 p-6">
            <IconBadge>
              <GraduationCap size={22} />
            </IconBadge>
            <h3 className="text-lg font-bold text-white">Certified coaches</h3>
            <p className="text-sm text-default-500">
              Private lessons, clinics, and beginner classes.
            </p>
          </div>
        </Tile>

        {/* Amenities */}
        <Tile delay={0.16}>
          <div className="flex h-full flex-col gap-4 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-dink-lime">
              Amenities
            </p>
            <ul className="grid gap-3">
              {AMENITIES.map(({ Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 text-sm font-semibold text-white/90"
                >
                  <Icon className="text-dink-lime" size={18} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </Tile>
      </div>
    </section>
  );
}
