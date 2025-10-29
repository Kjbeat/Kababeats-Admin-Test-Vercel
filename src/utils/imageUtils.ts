/**
 * Utility functions for handling images and artwork URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api/admin';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api/admin', '');

// Cloudflare R2 bucket URL for images and audio
const R2_BASE_URL = 'https://pub-6f3847c4d3f4471284d44c6913bcf6f0.r2.dev';

/**
 * Converts a relative image path to a full URL
 * @param imagePath - The relative path from the backend
 * @returns Full URL for the image
 */
export function getImageUrl(imagePath: string | undefined | null): string | null {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // For images and audio files, use the R2 bucket URL
  if (imagePath.startsWith('/')) {
    return `${R2_BASE_URL}${imagePath}`;
  }
  
  // If it's a relative path without leading slash, add it
  return `${R2_BASE_URL}/${imagePath}`;
}

/**
 * Gets a placeholder image URL for beats without artwork
 * @returns Placeholder image URL
 */
export function getPlaceholderImageUrl(): string {
  // Use a data URI for a simple placeholder to avoid external dependencies
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#6366f1"/>
      <text x="200" y="200" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">Beat Artwork</text>
    </svg>
  `)}`;
}

/**
 * Gets the artwork URL for a beat
 * @param beat - The beat object
 * @returns Full URL for the artwork or null if not available
 */
export function getBeatArtworkUrl(beat: { artwork?: string }): string | null {
  return getImageUrl(beat.artwork);
}

/**
 * Gets the audio file URL for a beat
 * @param beat - The beat object
 * @returns Full URL for the audio file or null if not available
 */
export function getBeatAudioUrl(beat: { audioFile?: string }): string | null {
  if (!beat.audioFile) return null;
  
  // If it's already a full URL, return as is
  if (beat.audioFile.startsWith('http://') || beat.audioFile.startsWith('https://')) {
    return beat.audioFile;
  }
  
  // If it's a relative path, prepend the R2 base URL
  if (beat.audioFile.startsWith('/')) {
    return `${R2_BASE_URL}${beat.audioFile}`;
  }
  
  // If it's a relative path without leading slash, add it
  return `${R2_BASE_URL}/${beat.audioFile}`;
}
