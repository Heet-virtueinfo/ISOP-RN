import apiClient from '../config/api';

export const updateUserProfile = async (data: any) => {
  try {
    const form = new FormData();
    // Assuming PUT doesn't play well with multipart/form-data in some Laravel setups without _method spoofing,
    // we use POST and specify _method=PUT to be safe, or just use POST depending on the postman schema.
    // Given Postman lists PUT /api/user/profile, we will try PUT directly first.
    // If there is an image, we build a FormData object.

    if (data.profileImage && !data.profileImage.startsWith('http')) {
      const filename = data.profileImage.split('/').pop() ?? 'profile.jpg';
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      form.append('profile_image', {
        uri: data.profileImage,
        name: filename,
        type: mimeType,
      } as any);
    }

    // Append other data
    Object.keys(data).forEach(key => {
      if (key !== 'profileImage' && key !== 'uid') {
        form.append(key, data[key]);
      }
    });

    // We use spoofing for Laravel PUT requests involving files.
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
