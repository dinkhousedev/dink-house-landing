import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Bell } from "lucide-react";

import { Reveal } from "./shared";

import { siteConfig } from "@/config/site";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "@/components/icons";

const SOCIALS = [
  { href: siteConfig.links.instagram, label: "Instagram", Icon: InstagramIcon },
  { href: siteConfig.links.facebook, label: "Facebook", Icon: FacebookIcon },
  { href: siteConfig.links.tiktok, label: "TikTok", Icon: TikTokIcon },
  { href: siteConfig.links.youtube, label: "YouTube", Icon: YouTubeIcon },
];

/** Court outline, drawn in black on the lime band. */
function CourtLines() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full opacity-[0.12]"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 880 440"
    >
      <g fill="none" stroke="#000" strokeWidth="4">
        <rect height="400" width="840" x="20" y="20" />
        <line x1="440" x2="440" y1="20" y2="420" />
        <line x1="300" x2="300" y1="20" y2="420" />
        <line x1="580" x2="580" y1="20" y2="420" />
        <line x1="20" x2="300" y1="220" y2="220" />
        <line x1="580" x2="860" y1="220" y2="220" />
      </g>
    </svg>
  );
}

export default function FinalCta({ onJoin }: { onJoin: () => void }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-dink-lime px-6 py-16 text-center sm:px-12 sm:py-20">
          <CourtLines />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/60">
              Early signups hear it first
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl font-display text-5xl uppercase leading-[0.9] text-black sm:text-7xl">
              Be first on the court.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-black/75 sm:text-lg">
              Get construction milestones, the opening date, and pre-launch
              membership offers before anyone else.
            </p>
            <Button
              className="mt-8 h-14 bg-black px-10 text-base font-bold uppercase text-dink-lime transition-transform hover:scale-105"
              radius="full"
              size="lg"
              startContent={<Bell size={18} />}
              onPress={onJoin}
            >
              Join the list
            </Button>
            <div className="mt-10 flex items-center justify-center gap-3">
              {SOCIALS.map(({ href, label, Icon }) => (
                <Link
                  key={label}
                  isExternal
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-black/10 text-black transition-colors hover:bg-black hover:text-dink-lime"
                  href={href}
                >
                  <Icon size={20} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
