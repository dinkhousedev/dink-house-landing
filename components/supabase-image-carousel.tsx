"use client";

import { useState, useEffect } from "react";

import ImageCarousel from "./image-carousel";

import { CAROUSEL_IMAGES } from "@/config/carousel-images";
import { getCourtImageUrl } from "@/config/media-urls";

interface SupabaseImageCarouselProps {
  autoplayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
}

export const SupabaseImageCarousel = ({
  autoplayInterval = 5000,
  showControls = true,
  showIndicators = true,
  className = "",
}: SupabaseImageCarouselProps) => {
  const [images, setImages] = useState<
    Array<{ src: string; srcSet?: string; alt: string }>
  >([]);

  useEffect(() => {
    // Build image URLs from CloudFront CDN
    const imageData = CAROUSEL_IMAGES.map((filename) => {
      const imageUrl = getCourtImageUrl(filename);

      return {
        src: imageUrl,
        alt: filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      };
    });

    setImages(imageData);
  }, []);

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
