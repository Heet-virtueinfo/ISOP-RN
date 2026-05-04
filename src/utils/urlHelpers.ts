import { BASE_URL } from '../config/api';

/**
 * Normalizes a URL and returns any necessary headers for ngrok.
 * @param url The URL or relative path
 * @returns { uri: string, headers: Record<string, string> }
 */
export const normalizeUrl = (url: string | null | undefined) => {
  if (!url) return { uri: '', headers: {} };

  let uri = url;

  // 1. If it's a relative path, prepend the BASE_URL
  if (!url.startsWith('http') && !url.startsWith('file://') && !url.startsWith('data:')) {
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    uri = `${cleanBase}${cleanPath}`;
  }

  // 2. Handle ngrok browser warning
  const isNgrok = uri.includes('ngrok-free.dev') || uri.includes('ngrok.io');
  const headers: Record<string, string> = {};

  if (isNgrok) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }

  return { uri, headers };
};
