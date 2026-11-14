import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import NextHead from "next/head";
import { useRouter } from "next/router";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Bell } from "lucide-react";

import DefaultLayout from "@/layouts/default";
import { MEDIA_URLS } from "@/config/media-urls";
import Hero from "@/components/landing/hero";
import Marquee from "@/components/landing/marquee";
import Stats from "@/components/landing/stats";
import Facility from "@/components/landing/facility";
import Programs from "@/components/landing/programs";
import Gallery from "@/components/landing/gallery";
import Timeline from "@/components/landing/timeline";
import ServiceArea from "@/components/landing/service-area";
import AppShowcase from "@/components/landing/app-showcase";
import FinalCta from "@/components/landing/final-cta";

const FAQsSection = dynamic(() => import("@/components/faqs"), {
  ssr: false,
});
const WaitlistModal = dynamic(() => import("@/components/WaitlistModal"), {
  ssr: false,
});

export default function IndexPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signupSource, setSignupSource] = useState("website");

  // Sticky mobile CTA: shown once the hero is gone, hidden again at the closing CTA.
  const finalCtaRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [pastHero, setPastHero] = useState(false);
  const finalInView = useInView(finalCtaRef);

  useMotionValueEvent(scrollY, "change", (y) =>
    setPastHero(y > window.innerHeight * 0.85),
  );
  const showStickyCta = pastHero && !finalInView && !isModalOpen;

  useEffect(() => {
    if (!router.isReady) return;

    const fromPath = router.pathname === "/newsletter";
    const fromQuery = router.query.join === "newsletter";
    const fromHash = window.location.hash === "#join";

    if (!fromPath && !fromQuery && !fromHash) return;

    setSignupSource("flyer");
    setIsModalOpen(true);

    if (!fromQuery) return;

    const { join: _join, ...rest } = router.query;

    void router.replace({ pathname: router.pathname, query: rest }, undefined, {
      shallow: true,
    });
  }, [router.isReady, router.pathname, router.query.join]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <DefaultLayout>
      <NextHead>
        {MEDIA_URLS.courtImages.slice(0, 1).map((src) => (
          <link key={src} as="image" href={src} rel="preload" />
        ))}
      </NextHead>

      <MotionConfig reducedMotion="user">
        <div className="relative bg-background">
          <Hero onJoin={handleOpenModal} />
          <Marquee />
          <Stats />
          <Facility />
          <Programs />
          <Gallery />
          <Timeline />
          <ServiceArea />
          <AppShowcase />
          <FAQsSection showCta={false} />
          <div ref={finalCtaRef}>
            <FinalCta onJoin={handleOpenModal} />
          </div>
        </div>

        <AnimatePresence>
          {showStickyCta && (
            <motion.div
              animate={{ y: 0, opacity: 1 }}
              className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/85 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:hidden"
              exit={{ y: 80, opacity: 0 }}
              initial={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-dink-lime text-sm font-bold uppercase tracking-wider text-black"
                type="button"
                onClick={handleOpenModal}
              >
                <Bell size={18} />
                Get notified when we open
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>

      <WaitlistModal
        isOpen={isModalOpen}
        source={signupSource}
        onClose={handleCloseModal}
      />
    </DefaultLayout>
  );
}
