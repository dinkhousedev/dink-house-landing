import { motion } from "framer-motion";

const WORDS = [
  "Indoor courts",
  "Outdoor courts",
  "Open 24/7",
  "Tournaments",
  "Lessons",
  "Leagues",
  "Pro shop",
  "Community",
];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((word) => (
        <span
          key={word}
          className="flex items-center gap-6 pr-6 font-display text-2xl uppercase tracking-wider text-black sm:text-3xl"
        >
          {word}
          <span className="inline-block h-2.5 w-2.5 rotate-45 bg-black" />
        </span>
      ))}
    </div>
  );
}

/** Decorative ticker. MotionConfig reducedMotion="user" stops it for those who ask. */
export default function Marquee() {
  return (
    <div
      aria-hidden
      className="relative z-10 -mt-px overflow-hidden border-y border-black bg-dink-lime py-3"
    >
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        className="flex w-max"
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        <Row />
        <Row />
      </motion.div>
    </div>
  );
}
