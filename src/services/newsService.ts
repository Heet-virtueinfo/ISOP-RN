import apiClient from '../config/api';
import { NewsArticle } from '../types';

export const getNews = async (): Promise<NewsArticle[]> => {
  try {
    const response = await apiClient.get<{ news: any[] }>('/api/user/news');
    const raw = response.data?.news;
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.map(item => ({
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
