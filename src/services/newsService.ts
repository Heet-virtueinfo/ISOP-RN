import apiClient from '../config/api';
import { NewsArticle } from '../types';

/**
 * Fetch all news from the user API.
 */
export const getNews = async (): Promise<NewsArticle[]> => {
  try {
    const response = await apiClient.get<{ data: any[] }>('/api/user/news');
    return response.data.data.map(item => ({
      id: String(item.id),
      title: item.title ?? '',
      content: item.content ?? '',
      type: item.type ?? 'news',
      imageUrl: item.image_url ?? item.imageUrl ?? null,
      linkUrl: item.link_url ?? item.linkUrl ?? null,
      createdBy: item.created_by ?? '',
      createdAt: item.created_at ?? '',
      updatedAt: item.updated_at ?? '',
    })) as NewsArticle[];
  } catch (error) {
    console.error('[newsService] fetch error:', error);
    return [];
  }
};
