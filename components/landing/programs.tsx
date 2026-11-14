import type { LucideIcon } from "lucide-react";

import { GraduationCap, PartyPopper, Trophy, Users } from "lucide-react";

import { Reveal, SectionHeading } from "./shared";

type Program = {
  Icon: LucideIcon;
  title: string;
  text: string;
  tag?: string;
};

const PROGRAMS: Program[] = [
  {
    Icon: Users,
    title: "Open play",
    text: "Drop in, rotate partners, meet the regulars. Sessions for every skill level from first-timer to 5.0.",
  },
  {
    Icon: GraduationCap,
    title: "Lessons & clinics",
    text: "Private lessons, group clinics, and beginner classes with certified coaches.",
  },
  {
    Icon: Trophy,
    title: "Moneyball",
    text: "Our doubles team tournament. Grab a partner and play for a purse that grows with every team that enters.",
    tag: "At the facility",
  },
  {
    Icon: PartyPopper,
    title: "Social events",
    text: "Leagues, mixers, and community nights that turn court time into friendships.",
  },
];

export default function Programs() {
  return (
    <section
      className="relative overflow-hidden border-y border-white/10 bg-dink-gray/40"
      id="programs"
    >
      <div
        aria-hidden
        className="court-pattern absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <SectionHeading
          accent="your way."
          className="mb-12"
          description="Whether you're picking up a paddle for the first time or chasing a medal, there's a spot on the court for you."
          eyebrow="Programs"
          title="Play it"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((program, i) => {
            const body = (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl text-white/20 transition-colors group-hover:text-dink-lime/60">
                    0{i + 1}
                  </span>
                  {program.tag && (
                    <span className="rounded-full bg-dink-lime px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                      {program.tag}
                    </span>
                  )}
                </div>
                <program.Icon
                  className="mt-8 text-dink-lime transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"
                  size={36}
                  strokeWidth={1.75}
                />
                <h3 className="mt-5 text-xl font-bold text-white">
                  {program.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-default-500">
                  {program.text}
                </p>
              </>
            );

            return (
              <Reveal key={program.title} className="h-full" delay={i * 0.08}>
                <div className="group flex h-full flex-col rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-dink-lime/60 hover:shadow-[0_20px_60px_-20px_rgba(179,255,0,0.35)]">
                  {body}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
