import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";

import DefaultLayout from "@/layouts/default";
import FAQsSection from "@/components/faqs";
import WaitlistModal from "@/components/WaitlistModal";
import RoadmapStepper from "@/components/roadmap-stepper";
import SupabaseImageCarousel from "@/components/supabase-image-carousel";
import VideoBanner from "@/components/video-banner";

// Animation variants for cleaner code organization
const fadeInVariants = {
  hidden: {
    filter: "blur(16px)",
    opacity: 0,
    x: 15,
  },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
    x: 0,
  },
};

// Animation configuration constants
const ANIMATION_CONFIG = {
  bounce: 0,
  duration: 0.8,
  type: "spring" as const,
};

const STAGGER_DELAYS = {
  title: 0.1,
  description: 0.3,
  buttons: 0.5,
  features: 0.6,
};

// Feature data for better maintainability
const FACILITY_FEATURES = [
  { icon: "solar:home-smile-angle-bold", text: "5 Indoor Courts" },
  { icon: "solar:sun-2-bold", text: "5 Outdoor Courts" },
  { icon: "solar:lightbulb-bolt-bold", text: "LED Lighting" },
  { icon: "solar:waterdrops-bold", text: "Water Stations" },
  { icon: "solar:shop-2-bold", text: "Pro Shop" },
  { icon: "solar:cup-hot-bold", text: "Lounge Area" },
  { icon: "solar:shield-check-bold", text: "Certified Coaches" },
  { icon: "solar:medal-ribbon-star-bold", text: "Tournament Ready" },
] as const;

export default function IndexPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <DefaultLayout>
      {/* Video Banner */}
      <VideoBanner />

      <div className="flex min-h-screen w-full flex-col bg-background">
        {/* Hero Banner */}
        <main className="mx-auto mt-16 sm:mt-20 lg:mt-24 flex w-full max-w-7xl flex-col items-start px-4 sm:px-6 lg:px-8 xl:px-12">
          <section className="flex flex-col items-start justify-center gap-4 sm:gap-6 w-full lg:max-w-4xl xl:max-w-5xl">
            {/* Coming Soon Badge */}
            <Button
              className="h-9 animate-pulse-slow overflow-hidden bg-dink-lime px-3 sm:px-4 py-2 text-xs sm:text-small font-bold uppercase leading-5 text-black"
              endContent={
                <Icon
                  className="flex-none outline-hidden [&>path]:stroke-2"
                  icon="solar:arrow-right-linear"
                  width={20}
                />
              }
              radius="full"
              variant="solid"
            >
              Coming Soon - Opening 2026
            </Button>

            <LazyMotion features={domAnimation}>
              <m.div
                animate="visible"
                className="flex flex-col gap-6"
                exit="hidden"
                initial="hidden"
                transition={{
                  duration: 0.25,
                  ease: "easeInOut",
                }}
                variants={{
                  hidden: { width: "auto" },
                  visible: { width: "auto" },
                }}
              >
                <AnimatePresence mode="wait">
                  {/* Hero Title */}
                  <m.div
                    key="hero-title"
                    animate="visible"
                    className="text-start font-bold leading-[1.2] tracking-tighter"
                    initial="hidden"
                    transition={{
                      ...ANIMATION_CONFIG,
                      delay: STAGGER_DELAYS.title,
                      duration: ANIMATION_CONFIG.duration + 0.8,
                    }}
                    variants={fadeInVariants}
                  >
                    <div className="font-display uppercase">
                      <span className="block text-[clamp(40px,8vw,100px)] leading-[0.9] text-black dark:text-white">
                        THE DINK
                      </span>
                      <span className="mt-2 inline-block bg-dink-lime px-2 sm:px-3 text-[clamp(40px,8vw,100px)] leading-[0.9] text-black">
                        HOUSE
                      </span>
                      <span className="mt-3 sm:mt-4 block text-[clamp(18px,3vw,36px)] tracking-wider text-dink-lime">
                        Coming Soon
                      </span>
                    </div>
                  </m.div>

                  {/* Description */}
                  <m.div
                    key="hero-description"
                    animate="visible"
                    className="text-start font-normal leading-6 sm:leading-7 text-default-500 text-sm sm:text-base lg:text-lg max-w-xl lg:max-w-2xl"
                    initial="hidden"
                    transition={{
                      ...ANIMATION_CONFIG,
                      delay: STAGGER_DELAYS.description,
                      duration: ANIMATION_CONFIG.duration + 0.9,
                    }}
                    variants={fadeInVariants}
                  >
                    Bell County&apos;s first indoor pickleball facility
                    featuring 10 championship courts in the heart of Central
                    Texas. Experience year-round play with 5 climate-controlled
                    indoor courts and 5 outdoor courts. Proudly serving Belton,
                    Killeen, Copperas Cove, Fort Hood, Temple, and the
                    surrounding communities.
                  </m.div>

                  {/* Call-to-Action Buttons */}
                  <m.div
                    key="hero-buttons"
                    animate="visible"
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-6"
                    initial="hidden"
                    transition={{
                      ...ANIMATION_CONFIG,
                      delay: STAGGER_DELAYS.buttons,
                      duration: ANIMATION_CONFIG.duration + 1.0,
                    }}
                    variants={fadeInVariants}
                  >
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                      <Button
                        className="h-10 w-full bg-dink-lime px-[15px] text-sm font-bold uppercase text-black transition-colors hover:bg-dink-lime-dark sm:h-12 sm:w-auto sm:px-8 sm:text-base"
                        radius="full"
                        size="lg"
                        onPress={handleOpenModal}
                      >
                        Get Notified When We Open
                      </Button>
                    </div>
                  </m.div>

                  {/* Feature Highlights */}
                  <m.div
                    key="hero-features"
                    animate="visible"
                    className="mt-4 flex flex-wrap gap-3 sm:gap-4 lg:gap-6"
                    initial="hidden"
                    transition={{
                      ...ANIMATION_CONFIG,
                      delay: STAGGER_DELAYS.features,
                      duration: ANIMATION_CONFIG.duration + 1.1,
                    }}
                    variants={fadeInVariants}
                  >
                    {FACILITY_FEATURES.map((feature, index) => (
                      <div
                        key={`feature-${index}`}
                        className="flex items-center gap-2 text-xs sm:text-small text-default-500"
                      >
                        <Icon
                          className="text-dink-lime"
                          icon={feature.icon}
                          width={20}
                        />
                        <span className="font-semibold">{feature.text}</span>
                      </div>
                    ))}
                  </m.div>
                </AnimatePresence>
              </m.div>
            </LazyMotion>
          </section>
        </main>
      </div>

      {/* Image Carousel Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="w-full">
          <SupabaseImageCarousel
            autoplayInterval={5000}
            className="w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl overflow-hidden"
            showControls={true}
            showIndicators={true}
          />
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <RoadmapStepper />
      </section>

      {/* Post-Roadmap CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-black via-gray-900 to-black border-2 border-dink-lime rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-white">Want Updates on Our </span>
            <span className="text-dink-lime">Progress?</span>
          </h2>
          <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
            Get notified of construction milestones, opening dates, and
            exclusive pre-launch membership offers
          </p>
          <Button
            className="h-12 w-full bg-dink-lime px-[15px] text-base font-bold uppercase text-black transition-colors hover:bg-dink-lime-dark sm:w-auto"
            radius="full"
            size="lg"
            onPress={handleOpenModal}
          >
            Join Our Notification List
          </Button>
        </div>
      </section>

      {/* FAQs Section */}
      <FAQsSection />

      {/* Waitlist Modal */}
      <WaitlistModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </DefaultLayout>
  );
}
