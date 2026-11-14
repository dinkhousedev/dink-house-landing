import type { ReactNode } from "react";

import { motion } from "framer-motion";
import clsx from "clsx";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      viewport={{ once: true, margin: "-80px 0px" }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={clsx(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-dink-lime">
        <span className="h-px w-8 bg-dink-lime" />
        {eyebrow}
      </span>
      <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-wide text-white sm:text-5xl lg:text-6xl">
        {title}
        {accent && (
          <>
            {" "}
            <span className="text-dink-lime">{accent}</span>
          </>
        )}
      </h2>
      {description && (
        <p
          className={clsx(
            "max-w-2xl text-base leading-7 text-default-500 sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}

/** Tracks the pointer inside a card so a radial highlight can follow it. */
export function trackSpotlight(event: React.MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();

  event.currentTarget.style.setProperty(
    "--x",
    `${event.clientX - rect.left}px`,
  );
  event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
}

export const SPOTLIGHT_STYLE = {
  background:
    "radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), rgba(179, 255, 0, 0.14), transparent 45%)",
} as const;
