import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

import { Reveal } from "./shared";

const STATS = [
  {
    value: 11,
    suffix: "",
    label: "Courts",
    detail: "Planned, built to USA Pickleball spec",
  },
  {
    value: 6,
    suffix: "",
    label: "Indoor",
    detail: "Climate-controlled, year-round",
  },
  {
    value: 5,
    suffix: "",
    label: "Outdoor",
    detail: "LED-lit for evening play",
  },
  {
    value: 24,
    suffix: "/7",
    label: "Access",
    detail: "Members enter by app + key fob",
  },
];

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setValue(to);

      return;
    }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });

    return () => controls.stop();
  }, [inView, reduceMotion, to]);

  return (
    <span ref={ref} aria-label={`${to}${suffix}`} className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section
      className="relative border-b border-white/10 bg-black"
      id="highlights"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal
            key={stat.label}
            className="group relative border-white/10 px-4 py-10 sm:px-8 sm:py-14 [&:not(:last-child)]:border-r max-lg:[&:nth-child(2)]:border-r-0 max-lg:[&:nth-child(-n+2)]:border-b"
            delay={i * 0.08}
          >
            <p className="font-display text-6xl leading-none text-white transition-colors group-hover:text-dink-lime sm:text-7xl lg:text-8xl">
              <CountUp suffix={stat.suffix} to={stat.value} />
            </p>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-dink-lime">
              {stat.label}
            </p>
            <p className="mt-1 text-sm text-default-500">{stat.detail}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
