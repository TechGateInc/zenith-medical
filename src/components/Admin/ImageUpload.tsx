/**
 * Image Upload Component
 * Reusable component for uploading images to Cloudinary with drag-and-drop support
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Camera, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  uploadType: 'team-member' | 'blog-image' | 'general';
  entityId?: string;
  imageType?: 'hero' | 'content';
  category?: string;
  currentImageUrl?: string;
  onUploadSuccess: (uploadResult: UploadResult) => void;
  onUploadError?: (error: string) => void;
  onImageRemove?: () => void;
  maxFileSize?: number; // in MB
  allowedFormats?: string[];
  className?: string;
  disabled?: boolean;
}

interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  uploadType,
  entityId,
  imageType,
  category,
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  onImageRemove,
  maxFileSize = 10,
  allowedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  className = '',
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      errors.push({
        field: 'fileSize',
        message: `File size must be less than ${maxFileSize}MB`,
        code: 'FILE_TOO_LARGE'
      });
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      errors.push({
        field: 'fileFormat',
        message: `File format must be one of: ${allowedFormats.join(', ')}`,
        code: 'INVALID_FORMAT'
      });
    }

    return errors;
  };

  // Handle file upload
  const handleUpload = async (file: File) => {
    // Reset states
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    setIsUploading(true);

    // Validate file
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.map(e => e.message).join(', ');
      setError(errorMessage);
      setIsUploading(false);
      onUploadError?.(errorMessage);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadType', uploadType);
      
      if (entityId) {
        formData.append('entityId', entityId);
      }
      
      if (imageType) {
        formData.append('imageType', imageType);
      }
      
      if (category) {
        formData.append('category', category);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Upload to API
      const response = await fetch('/api/uploads/images', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess(true);
        onUploadSuccess(result.data);
        
        // Reset success state after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    } else {
      setError('Please drop an image file');
    }
  }, []);

  // Handle remove image
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    onImageRemove?.();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${success ? 'border-green-300 bg-green-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {/* Preview Image */}
        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            
            {/* Remove Button */}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}

            {/* Upload Progress Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Loader2 className="mx-auto mb-2 animate-spin" size={24} />
                  <div className="text-sm">{Math.round(uploadProgress)}%</div>
                  <div className="w-32 h-2 bg-gray-300 rounded-full mt-2">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Prompt */}
        {!previewUrl && (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
              {isUploading ? (
                <Loader2 className="animate-spin text-blue-600" size={24} />
              ) : (
                <Camera className="text-gray-600" size={24} />
              )}
            </div>
            
            <div className="text-lg font-medium text-gray-900 mb-2">
              {isUploading ? 'Uploading...' : 'Upload an image'}
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              Drag and drop or click to select a file
            </div>
            
            <div className="text-xs text-gray-500">
              Max {maxFileSize}MB • {allowedFormats.join(', ').toUpperCase()}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="w-48 h-2 bg-gray-300 rounded-full mx-auto">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {Math.round(uploadProgress)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle size={16} className="mr-1" />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-2 flex items-center text-sm text-green-600">
          <CheckCircle size={16} className="mr-1" />
          Image uploaded successfully!
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 