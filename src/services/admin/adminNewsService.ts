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

const normalizeNewsArticle = (data: any): NewsArticle => ({
  id: String(data.id || ''),
  title: data.title || '',
  content: data.content || '',
  type: data.type || 'news',
  imageUrl: data.image_url || data.imageUrl || null,
  linkUrl: data.link_url || data.linkUrl || null,
  createdBy: String(data.created_by || data.createdBy || ''),
  createdAt: data.created_at || data.createdAt || new Date().toISOString(),
  updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
});

// ---------------------------------------------------------------------------
// News CRUD
// ---------------------------------------------------------------------------

/** GET /api/admin/news */
export const adminGetNews = async (): Promise<NewsArticle[]> => {
  try {
    const res = await apiClient.get('/api/admin/news');
    const raw = res.data.news ?? res.data.data ?? res.data;
    return Array.isArray(raw) ? raw.map(normalizeNewsArticle) : [];
  } catch (error: any) {
    console.error('[Admin] adminGetNews failed:', error?.message);
    throw error;
  }
};

/** POST /api/admin/news */
export const adminCreateNews = async (
  data: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> & {
    imageFile?: string | null;
  },
): Promise<NewsArticle> => {
  try {
    const form = new FormData();
    if (data.title) form.append('title', data.title);
    if (data.content) form.append('content', data.content);
    if (data.linkUrl) form.append('link_url', data.linkUrl);
    if (data.type) form.append('type', data.type);

    if (data.imageFile && !data.imageFile.startsWith('http')) {
      const filename = data.imageFile.split('/').pop() ?? 'image.jpg';
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      const mimeType =
        ext === 'png'
          ? 'image/png'
          : ext === 'webp'
            ? 'image/webp'
            : 'image/jpeg';
      form.append('image', {
        uri: data.imageFile,
        name: filename,
        type: mimeType,
      } as any);
    } else if (data.imageFile && data.imageFile.startsWith('http')) {
      form.append('image_url', data.imageFile);
    } else if (data.imageUrl) {
      form.append('image_url', data.imageUrl);
    }

    const res = await apiClient.post('/api/admin/news', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const result = res.data.data ?? res.data.news ?? res.data;
    const normalized = normalizeNewsArticle(result);

    // Resilience: Merge original data if response is missing title/content
    return {
      ...normalized,
      title: normalized.title || data.title || '',
      content: normalized.content || data.content || '',
      type: normalized.type || data.type || 'news',
      linkUrl: normalized.linkUrl || data.linkUrl || null,
      imageUrl: normalized.imageUrl || data.imageFile || data.imageUrl || null,
    };
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
    const form = new FormData();
    form.append('_method', 'PUT');

    if (data.title) form.append('title', data.title);
    if (data.content) form.append('content', data.content);
    if (data.linkUrl) form.append('link_url', data.linkUrl);
    if (data.type) form.append('type', data.type);

    if (data.imageFile && !data.imageFile.startsWith('http')) {
      const filename = data.imageFile.split('/').pop() ?? 'image.jpg';
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      const mimeType =
        ext === 'png'
          ? 'image/png'
          : ext === 'webp'
            ? 'image/webp'
            : 'image/jpeg';
      form.append('image', {
        uri: data.imageFile,
        name: filename,
        type: mimeType,
      } as any);
    } else if (data.imageFile && data.imageFile.startsWith('http')) {
      form.append('image_url', data.imageFile);
    } else if (data.imageUrl) {
      form.append('image_url', data.imageUrl);
    }

    const res = await apiClient.post(`/api/admin/news/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log('[AdminNews] Update response:', res.data);

    const result = res.data.data ?? res.data.news ?? res.data;
    const normalized = normalizeNewsArticle(result);

    // Resilience: Merge original data if response is missing fields
    return {
      ...normalized,
      title: normalized.title || data.title || '',
      content: normalized.content || data.content || '',
      type: normalized.type || data.type || 'news',
      linkUrl: normalized.linkUrl || data.linkUrl || null,
      imageUrl: normalized.imageUrl || data.imageFile || data.imageUrl || null,
    };
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
