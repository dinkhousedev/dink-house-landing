import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";

interface SpotlightImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

const SpotlightImage: React.FC<SpotlightImageProps> = ({
  src,
  alt,
  priority = false,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoAnimating, setIsAutoAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile flashlight animation
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const animateFlashlight = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const randomX = Math.random() * rect.width;
      const randomY = Math.random() * rect.height;

      setMousePosition({ x: randomX, y: randomY });
    };

    // Start animation after a short delay
    const startDelay = setTimeout(() => {
      setIsAutoAnimating(true);
      animateFlashlight(); // First position

      // Continue animating every 2.5 seconds
      animationIntervalRef.current = setInterval(animateFlashlight, 2500);
    }, 500);

    return () => {
      clearTimeout(startDelay);
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isMobile]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      setIsAutoAnimating(false);
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({ x, y });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return;

      setIsAutoAnimating(false);
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }

      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      setMousePosition({ x, y });
    };

    const container = containerRef.current;

    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("touchmove", handleTouchMove);

      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        ref={containerRef}
        animate={{ opacity: 1 }}
        className="relative w-full h-full overflow-hidden cursor-none"
        initial={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <Image
          fill
          alt={alt}
          className="object-cover"
          priority={priority}
          sizes="100vw"
          src={src}
        />

        <div className="absolute inset-0 bg-black/80 spotlight-overlay" />

        <div
          className={`spotlight-effect ${isMobile && isAutoAnimating ? "flashlight-mode" : ""}`}
          style={
            {
              "--mouse-x": `${mousePosition.x}px`,
              "--mouse-y": `${mousePosition.y}px`,
              opacity: 1,
              transition: "opacity 0.3s ease",
            } as React.CSSProperties
          }
        />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center" />
        </div>
      </m.div>
    </LazyMotion>
  );
};

export default SpotlightImage;
