"use client";

import ImageCarousel from "./image-carousel";

interface SimpleImageCarouselProps {
  autoplayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
}

export const SimpleImageCarousel = ({
  autoplayInterval = 5000,
  showControls = true,
  showIndicators = true,
  className = "",
}: SimpleImageCarouselProps) => {
  // Hardcoded image URLs from your Supabase public bucket
  const supabaseUrl = "https://wchxzbuuwssrnaxshseu.supabase.co";
  const bucketPath = "dink-files/images_landing";

  // List your image filenames here
  const imageFilenames = [
    "image1.jpg",
    "image2.jpg",
    "image3.png",
    // Add more filenames as needed
  ];

  const images = imageFilenames.map((filename) => ({
    src: `${supabaseUrl}/storage/v1/object/public/${bucketPath}/${filename}`,
    alt: filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
  }));

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

export default SimpleImageCarousel;
