import NextLink from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  KeyRound,
  LineChart,
  Smartphone,
} from "lucide-react";

import { Reveal, SectionHeading } from "./shared";

const FEATURES = [
  {
    Icon: CalendarCheck,
    title: "Book courts",
    text: "Reserve indoor or outdoor courts in a couple of taps.",
  },
  {
    Icon: KeyRound,
    title: "24/7 entry",
    text: "Your app and key fob open the doors any hour.",
  },
  {
    Icon: LineChart,
    title: "Track your play",
    text: "See your visits and stay on top of your game.",
  },
  {
    Icon: BellRing,
    title: "Stay in the loop",
    text: "Open play, events, and facility updates as they happen.",
  },
];

/** Illustrative phone mock. Not a screenshot of the shipping app. */
function PhoneMock() {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[290px]">
      <div
        aria-hidden
        className="absolute -inset-10 rounded-full bg-dink-lime/20 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        className="relative rounded-[2.75rem] border-[10px] border-neutral-800 bg-black p-4 shadow-2xl ring-1 ring-white/10"
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="mx-auto mb-4 h-5 w-24 rounded-full bg-neutral-900" />
        <p className="text-[11px] uppercase tracking-wider text-white/40">
          Welcome back
        </p>
        <p className="font-display text-2xl uppercase text-white">
          The Dink <span className="text-dink-lime">House</span>
        </p>

        <div className="mt-4 rounded-2xl bg-dink-lime p-4 text-black">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
            Your next game
          </p>
          <p className="mt-1 text-lg font-bold leading-tight">
            Court 3 · Indoor
          </p>
          <p className="text-sm font-semibold">Tonight, 7:00 PM</p>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dink-lime/15 text-dink-lime">
              <KeyRound size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Front door</p>
              <p className="text-[11px] text-white/50">Tap to unlock</p>
            </div>
          </div>
          <span className="h-5 w-9 rounded-full bg-dink-lime p-0.5">
            <span className="ml-auto block h-4 w-4 rounded-full bg-black" />
          </span>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Open play</p>
            <p className="text-[11px] text-dink-lime">6 spots left</p>
          </div>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < 6 ? "bg-dink-lime" : "bg-white/15"}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-around border-t border-white/10 pt-3 text-white/40">
          <CalendarCheck size={18} />
          <KeyRound className="text-dink-lime" size={18} />
          <LineChart size={18} />
          <BellRing size={18} />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        className="absolute -left-10 top-24 hidden rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md sm:block"
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-dink-lime">✓</span> Court booked
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        className="absolute -right-8 bottom-28 hidden rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md sm:block"
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
      >
        🔓 Door unlocked
      </motion.div>
    </div>
  );
}

export default function AppShowcase() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <PhoneMock />
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHeading
            accent="in your pocket."
            description="The Dink House member app runs the whole experience, from booking to the front door."
            eyebrow="Member app"
            title="Your membership,"
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {FEATURES.map(({ Icon, title, text }, i) => (
              <Reveal key={title} className="flex gap-4" delay={i * 0.08}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dink-lime/10 text-dink-lime ring-1 ring-dink-lime/30">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-default-500">
                    {text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            delay={0.2}
          >
            <NextLink
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-dink-lime px-7 text-sm font-bold uppercase tracking-wider text-dink-lime transition-colors hover:bg-dink-lime hover:text-black"
              href="/test"
            >
              <Smartphone size={18} />
              Join the beta
              <ArrowRight
                className="transition-transform group-hover:translate-x-1"
                size={16}
              />
            </NextLink>
            <p className="text-sm text-default-500">
              Testing now on iPhone and Android
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
