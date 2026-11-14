import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

import { Reveal, SectionHeading } from "./shared";

// Rough compass placement around Nolanville (center 200,200). Decorative, not to scale.
const TOWNS = [
  { name: "Killeen", x: 128, y: 214 },
  { name: "Fort Hood", x: 104, y: 146 },
  { name: "Copperas Cove", x: 66, y: 250 },
  { name: "Belton", x: 282, y: 196 },
  { name: "Temple", x: 318, y: 128 },
  { name: "Salado", x: 300, y: 300 },
];

function Radar() {
  return (
    <svg
      aria-hidden
      className="h-auto w-full max-w-[520px] overflow-visible"
      viewBox="0 0 400 400"
    >
      <defs>
        <radialGradient cx="50%" cy="50%" id="radar-fill" r="50%">
          <stop offset="0%" stopColor="#B3FF00" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#B3FF00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sweep" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#B3FF00" stopOpacity="0" />
          <stop offset="100%" stopColor="#B3FF00" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <circle cx="200" cy="200" fill="url(#radar-fill)" r="190" />
      {[60, 120, 180].map((r) => (
        <circle
          key={r}
          cx="200"
          cy="200"
          fill="none"
          r={r}
          stroke="#B3FF00"
          strokeDasharray="2 6"
          strokeOpacity="0.3"
        />
      ))}
      <line
        stroke="#ffffff"
        strokeOpacity="0.06"
        x1="10"
        x2="390"
        y1="200"
        y2="200"
      />
      <line
        stroke="#ffffff"
        strokeOpacity="0.06"
        x1="200"
        x2="200"
        y1="10"
        y2="390"
      />

      {/* Sweep */}
      <motion.g
        animate={{ rotate: 360 }}
        style={{ originX: "200px", originY: "200px" }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      >
        <path
          d="M200 200 L390 200 A190 190 0 0 0 334 66 Z"
          fill="url(#sweep)"
        />
      </motion.g>

      {/* Spokes + towns */}
      {TOWNS.map((t, i) => (
        <motion.g
          key={t.name}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1 }}
        >
          <line
            stroke="#B3FF00"
            strokeOpacity="0.25"
            x1="200"
            x2={t.x}
            y1="200"
            y2={t.y}
          />
          <circle cx={t.x} cy={t.y} fill="#ffffff" r="4" />
          <text
            className="fill-white/70 text-[11px] font-semibold uppercase tracking-wider"
            textAnchor={t.x < 200 ? "end" : "start"}
            x={t.x + (t.x < 200 ? -8 : 8)}
            y={t.y + 4}
          >
            {t.name}
          </text>
        </motion.g>
      ))}

      {/* Home base */}
      <motion.circle
        animate={{ r: [10, 34], opacity: [0.6, 0] }}
        cx="200"
        cy="200"
        fill="none"
        r="10"
        stroke="#B3FF00"
        strokeWidth="2"
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <circle cx="200" cy="200" fill="#B3FF00" r="9" />
      <text
        className="fill-dink-lime font-display text-[18px] uppercase tracking-wider"
        textAnchor="middle"
        x="200"
        y="232"
      >
        Nolanville
      </text>
    </svg>
  );
}

export default function ServiceArea() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-gradient-to-b from-black via-dink-gray/40 to-black">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading
            accent="Central Texas."
            description="Right in the middle of Bell County, a short drive from wherever you play now."
            eyebrow="Location"
            title="Built for"
          />
          <Reveal className="mt-8" delay={0.15}>
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <MapPin className="text-dink-lime" size={18} />
              Nolanville, Texas
            </p>
            <ul className="flex flex-wrap gap-2">
              {TOWNS.map((t) => (
                <li
                  key={t.name}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:border-dink-lime hover:text-dink-lime"
                >
                  {t.name}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal className="flex justify-center" delay={0.1}>
          <Radar />
        </Reveal>
      </div>
    </section>
  );
}
