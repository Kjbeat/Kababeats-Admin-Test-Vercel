// Utility functions for uploading files to Cloudflare R2 storage

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api/admin';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload a file to Cloudflare R2 storage
 * @param file - The file to upload
 * @param fileType - Type of file (playlist, profile, etc.)
 * @param onProgress - Optional progress callback
 * @param accessToken - Authentication token
 * @returns Promise with upload result
 */
export async function uploadToR2(
  file: File,
  fileType: string = 'playlist',
  onProgress?: (progress: UploadProgress) => void,
  accessToken?: string
): Promise<UploadResult> {
  try {
    // Step 1: Get upload URL from backend
    const uploadResponse = await fetch(`${API_BASE_URL}/media/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken || localStorage.getItem('admin_access_token')}`,
      },
      body: JSON.stringify({
        fileType,
        originalName: file.name,
        contentType: file.type,
        size: file.size,
      }),
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({ error: { message: 'Failed to get upload URL' } }));
      throw new Error(errorData.error?.message || 'Failed to get upload URL');
    }

    const uploadData = await uploadResponse.json();
    if (!uploadData.success) {
      throw new Error(uploadData.error?.message || 'Failed to get upload URL');
    }

    // Step 2: Upload file to R2
    const uploadToR2Response = await fetch(uploadData.data.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadToR2Response.ok) {
      throw new Error('Failed to upload file to storage');
    }

    // Step 3: Confirm upload
    const confirmResponse = await fetch(`${API_BASE_URL}/media/confirm-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken || localStorage.getItem('admin_access_token')}`,
      },
      body: JSON.stringify({
        key: uploadData.data.key,
        fileType,
      }),
    });

    if (!confirmResponse.ok) {
      throw new Error('Failed to confirm upload');
    }

    const confirmData = await confirmResponse.json();
    if (!confirmData.success) {
      throw new Error(confirmData.error?.message || 'Failed to confirm upload');
    }

    // Step 4: Return the final URL
    const finalUrl = `https://pub-6f3847c4d3f4471284d44c6913bcf6f0.r2.dev/${uploadData.data.key}`;
    
    return {
      success: true,
      url: finalUrl,
      key: uploadData.data.key,
    };

  } catch (error) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload an image file to R2 storage
 * @param file - Image file to upload
 * @param onProgress - Optional progress callback
 * @param accessToken - Authentication token
 * @returns Promise with upload result
 */
export async function uploadImageToR2(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  accessToken?: string
): Promise<UploadResult> {
  return uploadToR2(file, 'playlist', onProgress, accessToken);
}
