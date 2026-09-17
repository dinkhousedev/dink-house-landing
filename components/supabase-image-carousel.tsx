"use client";

import { useMemo } from "react";

import ImageCarousel from "./image-carousel";

import { CAROUSEL_IMAGES } from "@/config/carousel-images";
import { getCourtImageUrl } from "@/config/media-urls";

interface SupabaseImageCarouselProps {
  autoplayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
}

// Pre-compute images at module level for better SSR compatibility
const CAROUSEL_IMAGE_DATA = CAROUSEL_IMAGES.map((filename) => {
  const imageUrl = getCourtImageUrl(filename);

  return {
    src: imageUrl,
    alt: filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
  };
});

export const SupabaseImageCarousel = ({
  autoplayInterval = 5000,
  showControls = true,
  showIndicators = true,
  className = "",
}: SupabaseImageCarouselProps) => {
  // Use pre-computed images - no state needed
  const images = useMemo(() => CAROUSEL_IMAGE_DATA, []);

  if (images.length === 0) {
    return null;
  }

  return (
    <ImageCarousel
      autoplayInterval={autoplayInterval}
      className={className}
      images={images}
      showControls={showControls}
      showIndicators={showIndicators}
    />
  );
};

export default SupabaseImageCarousel;
