/**
 * Cloudinary Image Upload Utilities
 * Helper functions for uploading and managing images
 */

import cloudinary, { 
  UPLOAD_OPTIONS, 
  VALIDATION,
  IMAGE_TRANSFORMATIONS
} from './config';

// Types
export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  version: number;
  created_at: string;
  etag: string;
  eager?: Array<{
    transformation: string;
    width: number;
    height: number;
    url: string;
    secure_url: string;
  }>;
}

export interface ImageUploadOptions {
  folder?: string;
  public_id?: string;
  tags?: string[];
  transformation?: any;
  eager?: any[];
  context?: Record<string, string>;
  metadata?: Record<string, string>;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Image validation
export function validateImage(file: File): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check file size
  if (file.size > VALIDATION.MAX_FILE_SIZE) {
    errors.push({
      field: 'fileSize',
      message: `File size must be less than ${VALIDATION.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      code: 'FILE_TOO_LARGE'
    });
  }

  // Check file format
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !VALIDATION.ALLOWED_FORMATS.includes(fileExtension as any)) {
    errors.push({
      field: 'fileFormat',
      message: `File format must be one of: ${VALIDATION.ALLOWED_FORMATS.join(', ')}`,
      code: 'INVALID_FORMAT'
    });
  }

  return errors;
}

// Convert file to base64 data URL
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Generate unique public ID
export function generatePublicId(prefix: string, fileName: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFileName = fileName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace special chars
    .toLowerCase();
  
  return `${prefix}_${sanitizedFileName}_${timestamp}_${randomSuffix}`;
}

// Upload team member photo
export async function uploadTeamMemberPhoto(
  file: File,
  memberId: string,
  options: Partial<ImageUploadOptions> = {}
): Promise<UploadResult> {
  // Validate image
  const validationErrors = validateImage(file);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
  }

  try {
    // Convert file to data URL
    const dataURL = await fileToDataURL(file);

    // Generate unique public ID
    const publicId = generatePublicId('team_member', `${memberId}_${file.name}`);

    // Upload options
    const uploadOptions = {
      ...UPLOAD_OPTIONS.TEAM_MEMBER,
      public_id: publicId,
      context: {
        member_id: memberId,
        original_filename: file.name,
        upload_date: new Date().toISOString(),
        ...options.context
      },
      metadata: {
        type: 'team_member_photo',
        member_id: memberId,
        ...options.metadata
      },
      ...options
    };

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURL, uploadOptions);

    return result as UploadResult;
  } catch (error) {
    console.error('Team member photo upload failed:', error);
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Upload blog image
export async function uploadBlogImage(
  file: File,
  blogId: string,
  imageType: 'hero' | 'content' = 'content',
  options: Partial<ImageUploadOptions> = {}
): Promise<UploadResult> {
  // Validate image
  const validationErrors = validateImage(file);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
  }

  try {
    // Convert file to data URL
    const dataURL = await fileToDataURL(file);

    // Generate unique public ID
    const publicId = generatePublicId('blog_image', `${blogId}_${imageType}_${file.name}`);

    // Upload options
    const uploadOptions = {
      ...UPLOAD_OPTIONS.BLOG_IMAGE,
      public_id: publicId,
      context: {
        blog_id: blogId,
        image_type: imageType,
        original_filename: file.name,
        upload_date: new Date().toISOString(),
        ...options.context
      },
      metadata: {
        type: 'blog_image',
        blog_id: blogId,
        image_type: imageType,
        ...options.metadata
      },
      ...options
    };

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURL, uploadOptions);

    return result as UploadResult;
  } catch (error) {
    console.error('Blog image upload failed:', error);
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Upload general image
export async function uploadGeneralImage(
  file: File,
  category: string,
  options: Partial<ImageUploadOptions> = {}
): Promise<UploadResult> {
  // Validate image
  const validationErrors = validateImage(file);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
  }

  try {
    // Convert file to data URL
    const dataURL = await fileToDataURL(file);

    // Generate unique public ID
    const publicId = generatePublicId('general', `${category}_${file.name}`);

    // Upload options
    const uploadOptions = {
      ...UPLOAD_OPTIONS.GENERAL_IMAGE,
      public_id: publicId,
      context: {
        category,
        original_filename: file.name,
        upload_date: new Date().toISOString(),
        ...options.context
      },
      metadata: {
        type: 'general_image',
        category,
        ...options.metadata
      },
      ...options
    };

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURL, uploadOptions);

    return result as UploadResult;
  } catch (error) {
    console.error('General image upload failed:', error);
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Image deletion failed:', error);
    return false;
  }
}

// Get optimized image URL with transformations
export function getOptimizedImageUrl(
  publicId: string,
  transformationType: keyof typeof IMAGE_TRANSFORMATIONS,
  additionalTransformations: any = {}
): string {
  const baseTransformation = IMAGE_TRANSFORMATIONS[transformationType];
  const transformation = { ...baseTransformation, ...additionalTransformations };
  
  return cloudinary.url(publicId, transformation);
}

// Get responsive image URLs for different screen sizes
export function getResponsiveImageUrls(publicId: string, baseWidth: number = 400): {
  small: string;
  medium: string;
  large: string;
  original: string;
} {
  return {
    small: cloudinary.url(publicId, {
      width: Math.round(baseWidth * 0.5),
      quality: 'auto:good',
      format: 'webp',
      fetch_format: 'auto'
    }),
    medium: cloudinary.url(publicId, {
      width: baseWidth,
      quality: 'auto:good',
      format: 'webp',
      fetch_format: 'auto'
    }),
    large: cloudinary.url(publicId, {
      width: Math.round(baseWidth * 1.5),
      quality: 'auto:good',
      format: 'webp',
      fetch_format: 'auto'
    }),
    original: cloudinary.url(publicId, {
      quality: 'auto:good',
      format: 'webp',
      fetch_format: 'auto'
    })
  };
}

// Batch upload images
export async function batchUploadImages(
  files: File[],
  uploadFunction: (file: File, ...args: any[]) => Promise<UploadResult>,
  ...args: any[]
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const result = await uploadFunction(file, ...args);
      results.push(result);
    } catch (error) {
      errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (errors.length > 0) {
    console.warn('Some uploads failed:', errors);
  }

  return results;
}

// Get image metadata
export async function getImageMetadata(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.api.resource(publicId, {
      image_metadata: true,
      colors: true,
      faces: true,
      quality_analysis: true
    });
    return result;
  } catch (error) {
    console.error('Failed to get image metadata:', error);
    return null;
  }
} 