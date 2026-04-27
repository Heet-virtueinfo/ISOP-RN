import apiClient from '../config/api';
import { ResourceItem } from '../types';

/**
 * Fetch all resources from the user API.
 */
export const getResources = async (): Promise<ResourceItem[]> => {
  try {
    const response = await apiClient.get<{ data: any[] }>('/api/user/resources');
    // Map basic fields
    return response.data.data.map(item => ({
      id: String(item.id),
      title: item.title ?? '',
      description: item.description ?? '',
      category: item.category ?? 'other',
      type: item.type ?? 'link',
      url: item.url ?? '',
      createdBy: item.created_by ?? '',
      createdAt: item.created_at ?? '',
    })) as ResourceItem[];
  } catch (error) {
    console.error('[resourceService] fetch error:', error);
    return [];
  }
};

