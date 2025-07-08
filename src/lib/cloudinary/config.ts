/**
 * Cloudinary Configuration
 * Centralized configuration for image uploads and transformations
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Image upload configurations
export const CLOUDINARY_FOLDERS = {
  TEAM_MEMBERS: 'zenith-medical/team-members',
  BLOG_IMAGES: 'zenith-medical/blog-images',
  GENERAL_IMAGES: 'zenith-medical/general',
  THUMBNAILS: 'zenith-medical/thumbnails'
} as const;

// Image transformation presets
export const IMAGE_TRANSFORMATIONS = {
  TEAM_PHOTO: {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto:good',
    format: 'webp',
    fetch_format: 'auto'
  },
  TEAM_PHOTO_SMALL: {
    width: 150,
    height: 150,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto:good',
    format: 'webp'
  },
  BLOG_HERO: {
    width: 1200,
    height: 630,
    crop: 'fill',
    quality: 'auto:good',
    format: 'webp'
  },
  BLOG_THUMBNAIL: {
    width: 400,
    height: 225,
    crop: 'fill',
    quality: 'auto:good',
    format: 'webp'
  },
  GENERAL_OPTIMIZED: {
    quality: 'auto:good',
    format: 'webp',
    fetch_format: 'auto'
  }
} as const;

// Upload options
export const UPLOAD_OPTIONS = {
  TEAM_MEMBER: {
    folder: CLOUDINARY_FOLDERS.TEAM_MEMBERS,
    tags: ['team-member', 'zenith-medical'],
    resource_type: 'image' as const,
    transformation: [IMAGE_TRANSFORMATIONS.TEAM_PHOTO],
    eager: [
      IMAGE_TRANSFORMATIONS.TEAM_PHOTO_SMALL
    ],
    eager_async: true,
    overwrite: true,
    invalidate: true
  },
  BLOG_IMAGE: {
    folder: CLOUDINARY_FOLDERS.BLOG_IMAGES,
    tags: ['blog-image', 'zenith-medical'],
    resource_type: 'image' as const,
    transformation: [IMAGE_TRANSFORMATIONS.BLOG_HERO],
    eager: [
      IMAGE_TRANSFORMATIONS.BLOG_THUMBNAIL
    ],
    eager_async: true,
    overwrite: true,
    invalidate: true
  },
  GENERAL_IMAGE: {
    folder: CLOUDINARY_FOLDERS.GENERAL_IMAGES,
    tags: ['general-image', 'zenith-medical'],
    resource_type: 'image' as const,
    transformation: [IMAGE_TRANSFORMATIONS.GENERAL_OPTIMIZED],
    overwrite: true,
    invalidate: true
  }
} as const;

// Image quality and optimization settings
export const OPTIMIZATION_SETTINGS = {
  AUTO_QUALITY: 'auto:good',
  PROGRESSIVE: true,
  STRIP_METADATA: true,
  FETCH_FORMAT: 'auto'
} as const;

// Validation settings
export const VALIDATION = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  MIN_DIMENSIONS: {
    width: 200,
    height: 200
  },
  MAX_DIMENSIONS: {
    width: 5000,
    height: 5000
  }
} as const;

// Security settings
export const SECURITY_SETTINGS = {
  SANITIZE_FILENAME: true,
  UNIQUE_FILENAME: true,
  OVERWRITE: false,
  INVALIDATE: true
} as const;

export default cloudinary; 