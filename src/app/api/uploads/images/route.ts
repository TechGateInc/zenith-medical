/**
 * Image Upload API Route
 * Handles image uploads to Cloudinary for team members, blog posts, and general images
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  uploadTeamMemberPhoto,
  uploadBlogImage,
  uploadGeneralImage,
  uploadServiceImage,
  validateImage,
  type UploadResult
} from '@/lib/cloudinary/image-upload';

export async function POST(request: NextRequest) {
  try {
    // Check authentication for admin operations
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('uploadType') as string;
    const entityId = formData.get('entityId') as string;
    const imageType = formData.get('imageType') as string;
    const category = formData.get('category') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!uploadType) {
      return NextResponse.json(
        { error: 'Upload type is required' },
        { status: 400 }
      );
    }

    // Validate file
    const validationErrors = validateImage(file);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    let uploadResult: UploadResult;

    // Handle different upload types
    switch (uploadType) {
      case 'team-member':
        if (!entityId) {
          return NextResponse.json(
            { error: 'Member ID is required for team member photos' },
            { status: 400 }
          );
        }
        uploadResult = await uploadTeamMemberPhoto(file, entityId);
        break;

      case 'blog-image':
        if (!entityId) {
          return NextResponse.json(
            { error: 'Blog ID is required for blog images' },
            { status: 400 }
          );
        }
        const blogImageType = (imageType as 'hero' | 'content') || 'content';
        uploadResult = await uploadBlogImage(file, entityId, blogImageType);
        break;

      case 'service':
        if (!entityId) {
          return NextResponse.json(
            { error: 'Service ID is required for service images' },
            { status: 400 }
          );
        }
        uploadResult = await uploadServiceImage(file, entityId);
        break;

      case 'general':
        const imageCategory = category || 'general';
        uploadResult = await uploadGeneralImage(file, imageCategory);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid upload type' },
          { status: 400 }
        );
    }

    // Return upload result
    return NextResponse.json({
      success: true,
      data: {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        url: uploadResult.url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        created_at: uploadResult.created_at,
        eager: uploadResult.eager
      }
    });

  } catch (error) {
    console.error('Image upload failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle image deletion
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get public_id from query params
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Import deleteImage dynamically to avoid import issues
    const { deleteImage } = await import('@/lib/cloudinary/image-upload');
    const success = await deleteImage(publicId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Image deletion failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Deletion failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get image information
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get public_id from query params
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Import getImageMetadata dynamically
    const { getImageMetadata } = await import('@/lib/cloudinary/image-upload');
    const metadata = await getImageMetadata(publicId);

    if (metadata) {
      return NextResponse.json({
        success: true,
        data: metadata
      });
    } else {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Failed to get image metadata:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get image information',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 