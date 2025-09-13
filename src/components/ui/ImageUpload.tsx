import React, { useState, useRef } from 'react';
import { Upload, X, User, UserCheck, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  className?: string;
}

const DEFAULT_AVATARS = {
  men: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  women: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
};

export default function ImageUpload({ currentImage, onImageChange, className = '' }: ImageUploadProps) {
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDefault, setSelectedDefault] = useState<'men' | 'women' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine current image source
  const getCurrentImageType = () => {
    if (!currentImage) return 'none';
    if (currentImage === DEFAULT_AVATARS.men) return 'men';
    if (currentImage === DEFAULT_AVATARS.women) return 'women';
    return 'custom';
  };

  const currentImageType = getCurrentImageType();

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPG, PNG, or GIF)';
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsUploading(true);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      setIsUploading(false);
      return;
    }

    try {
      // Convert file to base64 for local storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageChange(result);
        setSelectedDefault(null);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read the image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadError('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleDefaultSelection = (type: 'men' | 'women') => {
    setSelectedDefault(type);
    onImageChange(DEFAULT_AVATARS[type]);
    setUploadError('');
  };

  const handleRemoveImage = () => {
    onImageChange('');
    setSelectedDefault(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-2">
        Testimonial Image
      </div>

      {/* Current Image Preview */}
      {currentImage && (
        <div className="relative inline-block">
          <img
            src={currentImage}
            alt="Testimonial avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Upload Section */}
      <div className="space-y-3">
        <div className="text-xs text-gray-600 mb-2">
          Choose an option below:
        </div>

        {/* Custom Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">
              {isUploading ? 'Uploading...' : 'Upload Custom Image'}
            </span>
          </button>
          <div className="text-xs text-gray-500 mt-1">
            Supports JPG, PNG, GIF (max 5MB)
          </div>
        </div>

        {/* Default Avatar Options */}
        <div>
          <div className="text-xs text-gray-600 mb-2">Or choose a default avatar:</div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => handleDefaultSelection('men')}
              className={`flex flex-col items-center space-y-1 p-3 rounded-lg border-2 transition-all ${
                currentImageType === 'men'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <img
                src={DEFAULT_AVATARS.men}
                alt="Male avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className="text-xs text-gray-600">Male</span>
            </button>

            <button
              type="button"
              onClick={() => handleDefaultSelection('women')}
              className={`flex flex-col items-center space-y-1 p-3 rounded-lg border-2 transition-all ${
                currentImageType === 'women'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <img
                src={DEFAULT_AVATARS.women}
                alt="Female avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className="text-xs text-gray-600">Female</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        {currentImageType === 'none' && 'Please select an image or choose a default avatar'}
        {currentImageType === 'custom' && 'Custom image uploaded successfully'}
        {currentImageType === 'men' && 'Using default male avatar'}
        {currentImageType === 'women' && 'Using default female avatar'}
      </div>
    </div>
  );
}