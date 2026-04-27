/**
 * src/services/admin/adminResourceService.ts
 *
 * Admin resource operations against the Laravel API.
 */

import apiClient from '../../config/api';
import { ResourceItem } from '../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const normalizeResource = (data: any): ResourceItem => {
  if (!data || typeof data !== 'object') {
    return {
      id: '',
      title: '',
      description: '',
      category: 'guideline',
      type: 'pdf',
      url: '',
      createdBy: '',
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: String(data.id || data.uid || ''),
    title: data.title || '',
    description: data.description || '',
    category: data.category || 'guideline',
    type: data.type || 'pdf',
    url: data.url || '',
    createdBy: String(data.created_by || data.createdBy || ''),
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
  };
};

// ---------------------------------------------------------------------------
// Resource CRUD
// ---------------------------------------------------------------------------

/** GET /api/admin/resources */
export const adminGetResources = async (): Promise<ResourceItem[]> => {
  try {
    const res = await apiClient.get('/api/admin/resources');
    const raw = res.data.resources ?? res.data.data ?? res.data;
    return Array.isArray(raw) ? raw.map(normalizeResource) : [];
  } catch (error: any) {
    console.error('[Admin] adminGetResources failed:', error?.message);
    throw error;
  }
};

/** POST /api/admin/resources */
export const adminCreateResource = async (
  data: Omit<ResourceItem, 'id' | 'createdAt' | 'createdBy'> & {
    localFile?: string | null;
  },
): Promise<ResourceItem> => {
  try {
    const form = new FormData();
    if (data.title) form.append('title', data.title);
    if (data.description) form.append('description', data.description);
    if (data.category) form.append('category', data.category);
    if (data.type) form.append('type', data.type);

    if (data.localFile && !data.localFile.startsWith('http')) {
      const filename = data.localFile.split('/').pop() ?? 'document.pdf';
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'pdf';
      const mimeTypeMap: Record<string, string> = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ppt: 'application/vnd.ms-powerpoint',
        pptx:
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      };
      const mimeType = mimeTypeMap[ext] ?? 'application/octet-stream';
      form.append('file', {
        uri: data.localFile,
        name: filename,
        type: mimeType,
      } as any);
    }

    if (data.url !== undefined && data.url !== null) {
      form.append('url', data.url);
    }

    const res = await apiClient.post('/api/admin/resources', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const result = res.data.resource ?? res.data.data ?? res.data;
    const normalized = normalizeResource(result);

    // Fallback if API response is partial
    if (!normalized.title && data.title) normalized.title = data.title;
    if (!normalized.description && data.description)
      normalized.description = data.description;

    return normalized;
  } catch (error: any) {
    console.error('[Admin] adminCreateResource failed:', error?.message);
    throw error;
  }
};

/** PUT /api/admin/resources/:id */
export const adminUpdateResource = async (
  id: string,
  data: Partial<ResourceItem> & { localFile?: string | null },
): Promise<ResourceItem> => {
  try {
    const form = new FormData();
    form.append('_method', 'PUT');

    if (data.title) form.append('title', data.title);
    if (data.description !== undefined)
      form.append('description', data.description || '');
    if (data.category) form.append('category', data.category);
    if (data.type) form.append('type', data.type);

    if (data.localFile && !data.localFile.startsWith('http')) {
      const filename = data.localFile.split('/').pop() ?? 'document.pdf';
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'pdf';
      const mimeTypeMap: Record<string, string> = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ppt: 'application/vnd.ms-powerpoint',
        pptx:
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      };
      const mimeType = mimeTypeMap[ext] ?? 'application/octet-stream';
      form.append('file', {
        uri: data.localFile,
        name: filename,
        type: mimeType,
      } as any);
    }

    if (data.url !== undefined && data.url !== null) {
      form.append('url', data.url);
    }

    const res = await apiClient.post(`/api/admin/resources/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const result = res.data.resource ?? res.data.data ?? res.data;
    // If the API returns success but not the resource, we might need to fallback.
    // However, usually these APIs return the resource.
    const normalized = normalizeResource(result);

    // Fallback: If title is missing from response, use the data we sent
    if (!normalized.title && data.title) {
      normalized.title = data.title;
    }
    if (!normalized.description && data.description) {
      normalized.description = data.description;
    }
    if (!normalized.id || normalized.id === 'undefined') {
      normalized.id = id;
    }

    return normalized;
  } catch (error: any) {
    console.error('[Admin] adminUpdateResource failed:', error?.message);
    throw error;
  }
};

/** DELETE /api/admin/resources/:id */
export const adminDeleteResource = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/admin/resources/${id}`);
  } catch (error: any) {
    console.error('[Admin] adminDeleteResource failed:', error?.message);
    throw error;
  }
};
