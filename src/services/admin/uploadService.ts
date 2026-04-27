/**
 * src/services/admin/uploadService.ts
 *
 * Shared file upload helpers: image and document uploads via the Laravel API.
 * Used by all admin services that need to upload files before saving data.
 */

import apiClient from '../../config/api';

// ---------------------------------------------------------------------------
// Image upload
// ---------------------------------------------------------------------------

/**
 * POST /api/upload/image
 * Uploads a local image file and returns the stored URL.
 *
 * @param localUri - Local file path (e.g. from image picker)
 * @param fieldName - FormData field name (default: 'image')
 */
export const uploadImageToServer = async (
  localUri: string,
  fieldName = 'image',
): Promise<string> => {
  try {
    const filename = localUri.split('/').pop() ?? 'image.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeType =
      ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    const form = new FormData();
    form.append(fieldName, { uri: localUri, name: filename, type: mimeType } as any);

    const res = await apiClient.post('/api/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const url = res.data.url ?? res.data.path ?? res.data;
    console.log('[Upload] Image uploaded successfully:', url);
    return url;
  } catch (error: any) {
    console.error('[Upload] uploadImageToServer failed:', error?.message);
    throw error;
  }
};

/**
 * Resolve an image: if it's already a remote URL return it as-is,
 * otherwise upload it and return the remote URL.
 */
export const resolveImage = async (uriOrUrl: string): Promise<string> =>
  uriOrUrl.startsWith('http') ? uriOrUrl : uploadImageToServer(uriOrUrl);

// ---------------------------------------------------------------------------
// Document upload
// ---------------------------------------------------------------------------

/**
 * POST /api/upload/document
 * Uploads a local document file (PDF, DOCX, PPT, etc.) and returns the stored URL.
 *
 * @param localUri - Local file path
 * @param fieldName - FormData field name (default: 'document')
 */
export const uploadDocumentToServer = async (
  localUri: string,
  fieldName = 'document',
): Promise<string> => {
  try {
    const filename = localUri.split('/').pop() ?? 'document.pdf';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'pdf';
    const mimeTypeMap: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    const mimeType = mimeTypeMap[ext] ?? 'application/octet-stream';

    const form = new FormData();
    form.append(fieldName, { uri: localUri, name: filename, type: mimeType } as any);

    const res = await apiClient.post('/api/upload/document', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const url = res.data.url ?? res.data.path ?? res.data;
    console.log('[Upload] Document uploaded successfully:', url);
    return url;
  } catch (error: any) {
    console.error('[Upload] uploadDocumentToServer failed:', error?.message);
    throw error;
  }
};
