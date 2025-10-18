import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@heroui/button";
import {
  ArrowRight,
  Home,
  Sun,
  Lightbulb,
  Droplet,
  ShoppingBag,
  Coffee,
  ShieldCheck,
  Award,
} from "lucide-react";

import DefaultLayout from "@/layouts/default";

// Dynamically import below-the-fold components
const VideoBanner = dynamic(() => import("@/components/video-banner"), {
  ssr: false,
});
const SupabaseImageCarousel = dynamic(
  () => import("@/components/supabase-image-carousel"),
  { ssr: false },
);
const RoadmapStepper = dynamic(() => import("@/components/roadmap-stepper"), {
  ssr: false,
});
const FAQsSection = dynamic(() => import("@/components/faqs"), {
  ssr: false,
});
const WaitlistModal = dynamic(() => import("@/components/WaitlistModal"), {
  ssr: false,
});

// Feature data for better maintainability
const FACILITY_FEATURES = [
  { Icon: Home, text: "5 Indoor Courts" },
  { Icon: Sun, text: "5 Outdoor Courts" },
  { Icon: Lightbulb, text: "LED Lighting" },
  { Icon: Droplet, text: "Water Stations" },
  { Icon: ShoppingBag, text: "Pro Shop" },
  { Icon: Coffee, text: "Lounge Area" },
  { Icon: ShieldCheck, text: "Certified Coaches" },
  { Icon: Award, text: "Tournament Ready" },
] as const;

export default function IndexPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations on mount
    setIsLoaded(true);
  }, []);

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
                <ArrowRight className="flex-none" size={20} strokeWidth={2} />
              }
              radius="full"
              variant="solid"
            >
              Coming Soon - Opening 2026
            </Button>

            <div className="flex flex-col gap-6">
              {/* Hero Title */}
              <div
                className={`text-start font-bold leading-[1.2] tracking-tighter transition-all duration-1000 ease-out ${
                  isLoaded
                    ? "opacity-100 blur-0 translate-x-0"
                    : "opacity-0 blur-[16px] translate-x-[15px]"
                }`}
                style={{ transitionDelay: "100ms" }}
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
              </div>

              {/* Description */}
              <div
                className={`text-start font-normal leading-6 sm:leading-7 text-default-500 text-sm sm:text-base lg:text-lg max-w-xl lg:max-w-2xl transition-all duration-1000 ease-out ${
                  isLoaded
                    ? "opacity-100 blur-0 translate-x-0"
                    : "opacity-0 blur-[16px] translate-x-[15px]"
                }`}
                style={{ transitionDelay: "300ms" }}
              >
                Bell County&apos;s first indoor pickleball facility featuring 10
                championship courts in the heart of Central Texas. Experience
                year-round play with 5 climate-controlled indoor courts and 5
                outdoor courts. Proudly serving Belton, Killeen, Copperas Cove,
                Fort Hood, Temple, and the surrounding communities.
              </div>

              {/* Call-to-Action Buttons */}
              <div
                className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-6 transition-all duration-1000 ease-out ${
                  isLoaded
                    ? "opacity-100 blur-0 translate-x-0"
                    : "opacity-0 blur-[16px] translate-x-[15px]"
                }`}
                style={{ transitionDelay: "500ms" }}
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
              </div>

              {/* Feature Highlights */}
              <div
                className={`mt-4 flex flex-wrap gap-3 sm:gap-4 lg:gap-6 transition-all duration-1000 ease-out ${
                  isLoaded
                    ? "opacity-100 blur-0 translate-x-0"
                    : "opacity-0 blur-[16px] translate-x-[15px]"
                }`}
                style={{ transitionDelay: "600ms" }}
              >
                {FACILITY_FEATURES.map((feature, index) => {
                  const IconComponent = feature.Icon;

                  return (
                    <div
                      key={`feature-${index}`}
                      className="flex items-center gap-2 text-xs sm:text-small text-default-500"
                    >
                      <IconComponent
                        className="text-dink-lime"
                        size={20}
                        strokeWidth={2}
                      />
                      <span className="font-semibold">{feature.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
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
