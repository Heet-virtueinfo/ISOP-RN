/**
 * src/services/admin/adminNewsService.ts
 *
 * Admin news operations against the Laravel API.
 */

import apiClient from '../../config/api';
import { NewsArticle } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Upload a single image and return the stored URL. */
const uploadImage = async (localUri: string): Promise<string> => {
  const filename = localUri.split('/').pop() ?? 'image.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  const form = new FormData();
  form.append('image', { uri: localUri, name: filename, type: mimeType } as any);

  const res = await apiClient.post('/api/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url ?? res.data.path ?? res.data;
};

// ---------------------------------------------------------------------------
// News CRUD
// ---------------------------------------------------------------------------

/** GET /api/admin/news */
export const adminGetNews = async (): Promise<NewsArticle[]> => {
  try {
    const res = await apiClient.get('/api/admin/news');
    const raw = res.data.news ?? res.data.data ?? res.data;
    return Array.isArray(raw) ? raw : [];
  } catch (error: any) {
    console.error('[Admin] adminGetNews failed:', error?.message);
    throw error;
  }
};

/** POST /api/admin/news */
export const adminCreateNews = async (
  data: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> & { imageFile?: string | null },
): Promise<NewsArticle> => {
  try {
    let imageUrl = data.imageUrl;
    if (data.imageFile && !data.imageFile.startsWith('http')) {
      imageUrl = await uploadImage(data.imageFile);
    }

    const payload = { ...data, image_url: imageUrl, imageFile: undefined };
    const res = await apiClient.post('/api/admin/news', payload);
    return res.data.data ?? res.data;
  } catch (error: any) {
    console.error('[Admin] adminCreateNews failed:', error?.message);
    throw error;
  }
};

/** PUT /api/admin/news/:id */
export const adminUpdateNews = async (
  id: string,
  data: Partial<NewsArticle> & { imageFile?: string | null },
): Promise<NewsArticle> => {
  try {
    let imageUrl = data.imageUrl;
    if (data.imageFile && !data.imageFile.startsWith('http')) {
      imageUrl = await uploadImage(data.imageFile);
    }

    const payload = { ...data, image_url: imageUrl, imageFile: undefined };
    const res = await apiClient.put(`/api/admin/news/${id}`, payload);
    return res.data.data ?? res.data;
  } catch (error: any) {
    console.error('[Admin] adminUpdateNews failed:', error?.message);
    throw error;
  }
};

/** DELETE /api/admin/news/:id */
export const adminDeleteNews = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/admin/news/${id}`);
  } catch (error: any) {
    console.error('[Admin] adminDeleteNews failed:', error?.message);
    throw error;
  }
};
