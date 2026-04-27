import { Platform } from 'react-native';
import apiClient from '../config/api';

export const updateUserProfile = async (data: any) => {
  try {
    const form = new FormData();

    if (data.profileImage && !data.profileImage.startsWith('http')) {
      const filename = data.profileImage.split('/').pop() ?? 'profile.jpg';
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      const mimeType =
        ext === 'png'
          ? 'image/png'
          : ext === 'webp'
          ? 'image/webp'
          : 'image/jpeg';

      const cleanUri =
        Platform.OS === 'android' && !data.profileImage.startsWith('file://')
          ? `file://${data.profileImage}`
          : data.profileImage;

      form.append('profile_image', {
        uri: cleanUri,
        name: filename,
        type: mimeType,
      } as any);
    }

    Object.keys(data).forEach(key => {
      if (key !== 'profileImage' && key !== 'uid') {
        form.append(key, data[key]);
      }
    });

    form.append('_method', 'PUT');

    await apiClient.post('/api/user/profile', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Update User Profile Error:', error);
    throw error;
  }
};

export const deleteUserProfile = async () => {
  try {
    await apiClient.delete('/api/user/profile');
    return { success: true };
  } catch (error) {
    console.error('Delete User Profile Error:', error);
    throw error;
  }
};
