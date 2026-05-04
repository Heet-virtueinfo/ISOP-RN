import apiClient from '../../config/api';

export const uploadImageToServer = async (
  localUri: string,
  fieldName = 'image',
): Promise<string> => {
  try {
    const filename = localUri.split('/').pop() ?? 'image.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeType =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
        ? 'image/webp'
        : 'image/jpeg';

    const form = new FormData();
    form.append(fieldName, {
      uri: localUri,
      name: filename,
      type: mimeType,
    } as any);

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

export const resolveImage = async (uriOrUrl: string): Promise<string> =>
  uriOrUrl.startsWith('http') ? uriOrUrl : uploadImageToServer(uriOrUrl);

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
    form.append(fieldName, {
      uri: localUri,
      name: filename,
      type: mimeType,
    } as any);

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
