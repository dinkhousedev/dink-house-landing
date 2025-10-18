"use client";

import { useState, useEffect, useCallback } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { Image } from "@heroui/react";
import { Button } from "@heroui/react";

interface ImageCarouselProps {
  images: Array<{ src: string; srcSet?: string; alt: string }>;
  autoplayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const ImageCarousel = ({
  images,
  autoplayInterval = 5000,
  showControls = true,
  showIndicators = true,
  className = "",
}: ImageCarouselProps) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  const imageIndex = ((page % images.length) + images.length) % images.length;

  const paginate = useCallback(
    (newDirection: number) => {
      setPage([page + newDirection, newDirection]);
    },
    [page],
  );

  const goToSlide = (index: number) => {
    const newDirection = index > imageIndex ? 1 : -1;

    setPage([index, newDirection]);
  };

  // Auto-advance slides
  useEffect(() => {
    if (isPaused || !autoplayInterval) return;

    const interval = setInterval(() => {
      paginate(1);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isPaused, autoplayInterval, paginate]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <LazyMotion features={domAnimation}>
        <div className="relative w-full h-full">
          <AnimatePresence custom={direction} initial={false}>
            <m.div
              key={page}
              animate="center"
              className="absolute inset-0 flex items-center justify-center"
              custom={direction}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              exit="exit"
              initial="enter"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              variants={slideVariants}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
            >
              <Image
                alt={images[imageIndex].alt}
                className="h-full w-full object-cover object-center"
                loading="lazy"
                sizes="(max-width: 640px) 640px, (max-width: 1024px) 800px, 1200px"
                src={images[imageIndex].src}
                srcSet={images[imageIndex].srcSet}
              />
            </m.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        {showControls && images.length > 1 && (
          <>
            <Button
              isIconOnly
              aria-label="Previous image"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onPress={() => paginate(-1)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
            <Button
              isIconOnly
              aria-label="Next image"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onPress={() => paginate(1)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </>
        )}

        {/* Dot Indicators */}
        {showIndicators && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === imageIndex
                    ? "w-6 bg-white"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}
      </LazyMotion>
    </div>
  );
};

export default ImageCarousel;
