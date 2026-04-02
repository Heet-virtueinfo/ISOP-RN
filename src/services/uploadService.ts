import { CLOUDINARY_CONFIG } from '../config/cloudinary';

/**
 * Uploads a local image file to Cloudinary and returns its secure public URL.
 * 
 * @param localFileUri Local path to the image file
 * @param folder Optional Cloudinary folder to store the image in
 * @returns Promise<string | null> The secure URL of the uploaded image or null if failed
 */
export const uploadImageToCloudinary = async (
  localFileUri: string,
  folder?: string
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
  
  const fileToUpload = {
    uri: localFileUri.startsWith('file://') ? localFileUri : `file://${localFileUri}`,
    type: 'image/jpeg',
    name: filename,
  };

  data.append('file', fileToUpload as any);

  try {
    // 3. Send POST request to Cloudinary API
    const response = await fetch(CLOUDINARY_CONFIG.API_URL, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();

    if (result.secure_url) {
      console.log('Success! Public URL:', result.secure_url);
      return result.secure_url;
    } else {
      console.error('Cloudinary Upload Error:', result.error?.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
};
