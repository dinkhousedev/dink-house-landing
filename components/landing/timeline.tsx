import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Construction, PartyPopper } from "lucide-react";

import { Reveal, SectionHeading } from "./shared";

type Status = "done" | "next" | "upcoming";

const MILESTONES: {
  title: string;
  date: string;
  place: string;
  text: string;
  status: Status;
}[] = [
  {
    title: "Land signing",
    date: "September 4, 2025",
    place: "City of Nolanville",
    text: "Land acquisition signed in Nolanville, kicking off The Dink House project.",
    status: "done",
  },
  {
    title: "Breaking ground",
    date: "February 2027",
    place: "Construction begins",
    text: "Site prep and foundation, then the indoor and outdoor courts, specialized flooring, lighting, and amenities.",
    status: "next",
  },
  {
    title: "Grand opening",
    date: "Date TBA",
    place: "Facility launch",
    text: "Ribbon cutting, exhibition matches, and a community tournament to open the doors.",
    status: "upcoming",
  },
];

const GROUNDBREAKING = new Date("2027-02-01T00:00:00-06:00");

function useDaysUntil(target: Date) {
  // Computed after mount so server and client HTML match.
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(
      Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86_400_000)),
    );
  }, [target]);

  return days;
}

function Marker({ status }: { status: Status }) {
  if (status === "done") {
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-dink-lime text-black shadow-[0_0_30px_rgba(179,255,0,0.5)]">
        <Check size={22} strokeWidth={3} />
      </span>
    );
  }
  if (status === "next") {
    return (
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-dink-lime bg-black text-dink-lime">
        <span className="absolute inset-0 animate-ping rounded-full border-2 border-dink-lime opacity-40 motion-reduce:hidden" />
        <Construction size={20} />
      </span>
    );
  }

  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/20 bg-black text-white/50">
      <PartyPopper size={20} />
    </span>
  );
}

export default function Timeline() {
  const days = useDaysUntil(GROUNDBREAKING);

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      id="timeline"
    >
      <div className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <SectionHeading
          accent="the build."
          description="From signed land to opening day. Here's where we are and what's next."
          eyebrow="Roadmap"
          title="Follow"
        />
        {days !== null && days > 0 && (
          <Reveal className="flex items-baseline gap-3 rounded-2xl border border-dink-lime/30 bg-dink-lime/5 px-6 py-4">
            <span className="font-display text-5xl leading-none text-dink-lime tabular-nums">
              {days}
            </span>
            <span className="text-sm font-semibold uppercase tracking-wider text-white/70">
              days until
              <br />
              February 2027
            </span>
          </Reveal>
        )}
      </div>

      <div className="relative">
        {/* Track: horizontal on desktop, vertical on mobile */}
        <div
          aria-hidden
          className="absolute left-6 top-6 h-[calc(100%-3rem)] w-0.5 bg-white/10 md:left-6 md:right-6 md:top-6 md:h-0.5 md:w-auto"
        />
        <motion.div
          aria-hidden
          className="absolute left-6 top-6 hidden h-0.5 origin-left bg-gradient-to-r from-dink-lime to-dink-lime/40 md:block"
          initial={{ width: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-100px 0px" }}
          whileInView={{ width: "calc(50% - 1.5rem)" }}
        />
        <motion.div
          aria-hidden
          className="absolute left-6 top-6 w-0.5 origin-top bg-gradient-to-b from-dink-lime to-dink-lime/40 md:hidden"
          initial={{ height: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-100px 0px" }}
          whileInView={{ height: "45%" }}
        />

        <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          {MILESTONES.map((m, i) => (
            <li key={m.title} className="flex gap-5 md:flex-col md:gap-6">
              <Reveal className="shrink-0" delay={i * 0.15} y={0}>
                <Marker status={m.status} />
              </Reveal>
              <Reveal className="flex-1" delay={i * 0.15 + 0.1}>
                <div
                  className={`h-full rounded-2xl border p-6 transition-colors ${
                    m.status === "next"
                      ? "border-dink-lime/50 bg-dink-lime/5"
                      : "border-white/10 bg-dink-gray/40"
                  }`}
                >
                  <p
                    className={`text-xs font-bold uppercase tracking-[0.2em] ${
                      m.status === "upcoming"
                        ? "text-white/50"
                        : "text-dink-lime"
                    }`}
                  >
                    {m.status === "done"
                      ? "Complete"
                      : m.status === "next"
                        ? "Up next"
                        : "Coming"}
                    {" · "}
                    {m.date}
                  </p>
                  <h3 className="mt-3 font-display text-3xl uppercase leading-none text-white">
                    {m.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-white/60">
                    {m.place}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-default-500">
                    {m.text}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
