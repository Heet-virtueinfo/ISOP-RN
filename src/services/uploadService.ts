import { Platform } from 'react-native';
import { CLOUDINARY_CONFIG } from '../config/cloudinary';

export const uploadImageToCloudinary = async (
  localFileUri: string,
  folder?: string,
): Promise<string | null> => {
  if (!localFileUri) return null;

  // 1. Prepare the image data for multipart/form-data
  const data = new FormData();

  // 2. Add Cloudinary credentials and folder configuration
  // It is often better to append these before the file
  data.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
  data.append('cloud_name', CLOUDINARY_CONFIG.CLOUD_NAME);

  if (folder) {
    data.append('folder', folder);
  }

  // Use a unique name for each upload to avoid conflicts and verify new uploads
  const filename = `${new Date().getTime()}_upload.jpg`;

  // Format URI properly for the specific platform
  const cleanUri =
    Platform.OS === 'android'
      ? localFileUri.startsWith('file://') ||
        localFileUri.startsWith('content://')
        ? localFileUri
        : `file://${localFileUri}`
      : localFileUri;

  const fileToUpload = {
    uri: cleanUri,
    type: 'image/jpeg', // Standardized for profile images
    name: filename,
  };

  data.append('file', fileToUpload as any);

  try {
    // 3. Send POST request to Cloudinary API
    const response = await fetch(CLOUDINARY_CONFIG.API_URL, {
      method: 'POST',
      body: data,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();

    if (result.secure_url) {
      console.log('Success! Public URL:', result.secure_url);
      return result.secure_url;
    } else {
      console.error(
        'Cloudinary Upload Error:',
        result.error?.message || 'Unknown error',
      );
      return null;
    }
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
};

export const uploadDocumentToCloudinary = async (
  localFileUri: string,
  fileName: string,
  mimeType: string,
  folder?: string,
): Promise<string | null> => {
  if (!localFileUri) return null;

  const data = new FormData();
  data.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
  data.append('cloud_name', CLOUDINARY_CONFIG.CLOUD_NAME);

  if (folder) {
    data.append('folder', folder);
  }

  const cleanUri =
    Platform.OS === 'android'
      ? localFileUri.startsWith('file://') ||
        localFileUri.startsWith('content://')
        ? localFileUri
        : `file://${localFileUri}`
      : localFileUri;

  const fileToUpload = {
    uri: cleanUri,
    type: mimeType,
    name: fileName,
  };

  data.append('file', fileToUpload as any);
  // Using resource_type: auto allows Cloudinary to treat the PDF as a media asset
  // which is often more accessible than the 'raw' resource type.
  data.append('resource_type', 'auto');

  try {
    const response = await fetch(CLOUDINARY_CONFIG.API_URL, {
      method: 'POST',
      body: data,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();

    if (result.secure_url) {
      console.log('Document uploaded! URL:', result.secure_url);
      return result.secure_url;
    } else {
      console.error(
        'Cloudinary Document Upload Error:',
        result.error?.message || 'Unknown error',
      );
      return null;
    }
  } catch (error) {
    console.error('Document upload failed:', error);
    return null;
  }
};
