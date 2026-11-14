import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Button } from "@heroui/button";
import { ArrowDown, Bell, MapPin, Pause, Play } from "lucide-react";

import { MEDIA_URLS } from "@/config/media-urls";

const VIDEOS: readonly string[] = MEDIA_URLS.videos;
const POSTER = MEDIA_URLS.courtImages[0];
const EASE = [0.22, 1, 0.36, 1] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 28, filter: "blur(12px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.9, delay, ease: EASE },
});

export default function Hero({ onJoin }: { onJoin: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const [videoIndex, setVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Autoplay unless the visitor asked for reduced motion; restart on source change.
  useEffect(() => {
    const video = videoRef.current;

    if (!video || reduceMotion) return;
    video.play().catch(() => setIsPlaying(false));
  }, [videoIndex, reduceMotion]);

  const togglePlayback = () => {
    const video = videoRef.current;

    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  };

  const scrollToContent = () => {
    document
      .getElementById("highlights")
      ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      aria-label="The Dink House"
      className="relative isolate flex min-h-[calc(100svh-4rem)] w-full overflow-hidden bg-black"
    >
      {/* Media layer */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 scale-110"
        style={reduceMotion ? undefined : { y: mediaY }}
      >
        <video
          key={VIDEOS[videoIndex]}
          ref={videoRef}
          muted
          playsInline
          className="h-full w-full object-cover"
          loop={VIDEOS.length === 1}
          poster={POSTER}
          preload="metadata"
          src={VIDEOS[videoIndex]}
          onEnded={() => setVideoIndex((i) => (i + 1) % VIDEOS.length)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      </motion.div>

      {/* Legibility overlays + court lines */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/50 to-black/10"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-transparent to-black/40"
      />
      <div
        aria-hidden
        className="court-pattern absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_right,black,transparent_70%)]"
      />

      <motion.div
        className="mx-auto flex w-full max-w-7xl flex-col justify-end gap-10 px-4 pb-24 pt-20 sm:px-6 sm:pb-28 lg:flex-row lg:items-end lg:justify-between lg:px-8"
        style={
          reduceMotion ? undefined : { y: contentY, opacity: contentOpacity }
        }
      >
        <div className="flex max-w-3xl flex-col gap-6">
          <motion.div
            {...rise(0)}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-dink-lime px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-black">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
              </span>
              Opening 2027
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/80 backdrop-blur-md">
              <MapPin size={14} />
              Nolanville, TX
            </span>
          </motion.div>

          <h1 className="font-display uppercase">
            <motion.span
              {...rise(0.1)}
              className="block text-[clamp(56px,11vw,148px)] leading-[0.85] text-white"
            >
              The Dink
            </motion.span>
            <motion.span
              {...rise(0.22)}
              className="mt-2 inline-block bg-dink-lime px-3 text-[clamp(56px,11vw,148px)] leading-[0.85] text-black shadow-[0_0_60px_rgba(179,255,0,0.35)]"
            >
              House
            </motion.span>
          </h1>

          <motion.p
            {...rise(0.36)}
            className="max-w-xl text-base leading-7 text-white/75 sm:text-lg"
          >
            Bell County&apos;s first indoor pickleball facility. Eleven planned
            championship courts (six climate-controlled indoors, five outside)
            with 24/7 member access in the heart of Central Texas.
          </motion.p>

          <motion.div
            {...rise(0.48)}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Button
              className="btn-athletic h-12 bg-dink-lime px-8 text-base font-bold uppercase text-black shadow-[0_0_30px_rgba(179,255,0,0.35)] hover:bg-dink-lime-dark"
              radius="full"
              size="lg"
              startContent={<Bell size={18} />}
              onPress={onJoin}
            >
              Get notified
            </Button>
            <Button
              className="h-12 border-white/30 px-8 text-base font-bold uppercase text-white backdrop-blur-md hover:border-dink-lime hover:text-dink-lime"
              radius="full"
              size="lg"
              variant="bordered"
              onPress={scrollToContent}
            >
              Explore the facility
            </Button>
          </motion.div>
        </div>

        {/* Next milestone card */}
        <motion.div
          {...rise(0.6)}
          className="hidden w-72 shrink-0 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl lg:block"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-dink-lime">
            Next milestone
          </p>
          <p className="mt-2 font-display text-3xl uppercase leading-none text-white">
            Breaking ground
          </p>
          <p className="mt-1 text-sm text-white/60">February 2027</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              animate={{ width: "50%" }}
              className="h-full rounded-full bg-dink-lime"
              initial={{ width: 0 }}
              transition={{ duration: 1.4, delay: 1, ease: EASE }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] uppercase tracking-wider text-white/50">
            <span>Land signed</span>
            <span>Grand opening</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <button
        aria-label="Scroll to facility highlights"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60 transition-colors hover:text-dink-lime sm:flex"
        type="button"
        onClick={scrollToContent}
      >
        Scroll
        <ArrowDown
          className="animate-bounce motion-reduce:animate-none"
          size={18}
        />
      </button>

      {/* Video control (WCAG 2.2.2: moving media must be pausable) */}
      <button
        aria-label={
          isPlaying ? "Pause background video" : "Play background video"
        }
        className="absolute bottom-6 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:border-dink-lime hover:text-dink-lime sm:right-6"
        type="button"
        onClick={togglePlayback}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </section>
  );
}
