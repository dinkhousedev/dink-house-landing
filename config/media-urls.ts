// Media URLs Configuration
// This file provides centralized management of all media URLs served via AWS CloudFront CDN

/**
 * Get the CloudFront base URL from environment variables
 * Falls back to a placeholder for development
 */
export const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || "https://dznfm70a0fusp.cloudfront.net";

/**
 * Base paths for different media types
 */
export const MEDIA_PATHS = {
  images: {
    badges: "media/images/badges",
    courts: "media/images/courts",
    campaigns: "media/images/campaigns",
  },
  video: "media/video",
  logos: "media/logos",
} as const;

/**
 * Build a full CloudFront URL for a media file
 * @param path - The path to the media file (e.g., "media/images/badges/gold_badge.png")
 * @returns Full HTTPS URL to the media file via CloudFront
 */
export function getMediaUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${CLOUDFRONT_URL}/${cleanPath}`;
}

/**
 * Get URL for a badge image
 * @param badgeName - Badge filename (e.g., "gold_badge.png")
 */
export function getBadgeUrl(badgeName: string): string {
  return getMediaUrl(`${MEDIA_PATHS.images.badges}/${badgeName}`);
}

/**
 * Get URL for a court image
 * @param imageName - Image filename (e.g., "IMG_20251001_085746.jpg")
 */
export function getCourtImageUrl(imageName: string): string {
  return getMediaUrl(`${MEDIA_PATHS.images.courts}/${imageName}`);
}

/**
 * Get URL for a campaign image
 * @param imageName - Image filename (e.g., "ball_machine.jpg")
 */
export function getCampaignImageUrl(imageName: string): string {
  return getMediaUrl(`${MEDIA_PATHS.images.campaigns}/${imageName}`);
}

/**
 * Get URL for a video
 * @param videoName - Video filename (e.g., "VID_20251001_113443.mp4")
 */
export function getVideoUrl(videoName: string): string {
  return getMediaUrl(`${MEDIA_PATHS.video}/${videoName}`);
}

/**
 * Get URL for a logo
 * @param logoName - Logo filename (e.g., "dinklogo.jpg")
 */
export function getLogoUrl(logoName: string): string {
  return getMediaUrl(`${MEDIA_PATHS.logos}/${logoName}`);
}

/**
 * Pre-defined media URLs for commonly used assets
 */
export const MEDIA_URLS = {
  // Badges
  badges: {
    bronze: getBadgeUrl("bronze_badge.png"),
    silver: getBadgeUrl("silver_badge.png"),
    gold: getBadgeUrl("gold_badge.png"),
    diamond: getBadgeUrl("diamond_badge.png"),
    founder: getBadgeUrl("Founder_badge.png"),
  },

  // Court images (for carousel)
  courtImages: [
    getCourtImageUrl("IMG_20251001_085741.jpg"),
    getCourtImageUrl("IMG_20251001_085743.jpg"),
    getCourtImageUrl("IMG_20251001_085746.jpg"),
    getCourtImageUrl("IMG_20251001_085747.jpg"),
    getCourtImageUrl("IMG_20251001_085749.jpg"),
    getCourtImageUrl("IMG_20251001_085750.jpg"),
  ],

  // Videos
  videos: [
    getVideoUrl("VID_20251001_113443.mp4"),
    getVideoUrl("VID_20251001_113600.mp4"),
  ],

  // Logos
  logo: getLogoUrl("dinklogo.jpg"),
} as const;
