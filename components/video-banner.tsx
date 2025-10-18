import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import { MEDIA_URLS } from "@/config/media-urls";
import { logger } from "@/lib/logger";

const VIDEO_URLS = MEDIA_URLS.videos;
const LOGO_URL = MEDIA_URLS.logo;

export default function VideoBanner() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [logoFaded, setLogoFaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Trigger logo fade-out after a short delay on mount
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setLogoFaded(true);
    }, 2000); // Wait 2 seconds before starting fade

    return () => clearTimeout(fadeTimer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleVideoEnded = () => {
      // Switch to the next video when current one ends
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEO_URLS.length);
    };

    const handleCanPlay = () => {
      video.play().catch((error) => {
        logger.warn("Video autoplay failed:", error);
      });
    };

    video.addEventListener("ended", handleVideoEnded);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("ended", handleVideoEnded);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Reset and play video when index changes
  useEffect(() => {
    const video = videoRef.current;

    if (video && isClient) {
      video.load();
      // Attempt to play after a short delay to ensure load completes
      setTimeout(() => {
        video.play().catch((error) => {
          logger.warn("Video autoplay failed:", error);
        });
      }, 100);
    }
  }, [currentVideoIndex, isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        controls={false}
        loop={VIDEO_URLS.length <= 1}
        preload="auto"
      >
        <source src={VIDEO_URLS[currentVideoIndex]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Centered Logo with Fade-Out */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[3000ms] ease-out ${
          logoFaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="relative w-[200px] h-[200px] sm:w-[200px] sm:h-[200px] lg:w-[200px] lg:h-[200px] rounded-2xl overflow-hidden">
          <Image
            fill
            priority
            alt="The Dink House Logo"
            className="object-contain"
            sizes="(max-width: 640px) 200px, (max-width: 1024px) 300px, 400px"
            src={LOGO_URL}
          />
        </div>
      </div>
    </div>
  );
}
