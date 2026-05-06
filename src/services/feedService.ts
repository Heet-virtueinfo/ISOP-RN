import { Platform } from 'react-native';
import apiClient from '../config/api';

export interface FeedMedia {
  url: string;
  type: 'image' | 'video';
  order: number;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  authorColor: string;
  authorProfileImage: string | null;
  timeAgo: string;
  createdAt: string;
  content: string;
  visibility: 'public' | 'connections' | 'anyone';
  allowComments: boolean;
  isArticle: boolean;
  media: FeedMedia[];
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  liked: boolean;
  reposted: boolean;
  originalPost: FeedPost | null;
}

export interface FeedComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  authorColor: string;
  authorProfileImage: string | null;
  timeAgo: string;
  createdAt: string;
  content: string;
  likes: number;
  liked: boolean;
  parentId: string | null;
  replies: FeedComment[];
}

export interface PaginatedFeed {
  posts: FeedPost[];
  currentPage: number;
  lastPage: number;
  hasMore: boolean;
}

export interface PaginatedComments {
  comments: FeedComment[];
  currentPage: number;
  lastPage: number;
  hasMore: boolean;
}

export interface FollowUser {
  id: string;
  name: string;
  role: string;
  profileImage: string | null;
  isFollowing: boolean;
}

const AVATAR_COLORS = [
  '#4F46E5',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
];

const colorForId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const initialsFor = (name: string): string => {
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? 'U').toUpperCase();
};

const formatTimeAgo = (dateStr: string): string => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export const normalizePost = (raw: any): FeedPost => {
  const authorId = String(raw.user_id ?? raw.author_id ?? raw.user?.id ?? '');
  const authorName =
    raw.user?.display_name ??
    raw.user?.name ??
    raw.author?.name ??
    raw.author_name ??
    'Unknown';
  const mediaArr: FeedMedia[] = (raw.media ?? []).map((m: any) => ({
    url: m.url ?? m.media_url ?? '',
    type: m.type ?? 'image',
    order: m.order ?? 0,
  }));

  const firstImage = mediaArr.find(m => m.type === 'image')?.url ?? null;

  return {
    id: String(raw.id ?? ''),
    authorId,
    authorName,
    authorRole: raw.user?.role ?? raw.author?.role ?? raw.author_role ?? '',
    authorInitials: initialsFor(authorName),
    authorColor: colorForId(authorId),
    authorProfileImage:
      raw.user?.profile_image ??
      raw.author?.profile_image ??
      raw.author_profile_image ??
      null,
    timeAgo: formatTimeAgo(raw.created_at ?? ''),
    createdAt: raw.created_at ?? '',
    content: raw.content ?? '',
    visibility: raw.visibility ?? 'public',
    allowComments: raw.allow_comments ?? true,
    isArticle: raw.is_article ?? false,
    media: mediaArr,
    imageUrl: firstImage,
    likeCount: raw.likes_count ?? raw.like_count ?? 0,
    commentCount: raw.comments_count ?? raw.comment_count ?? 0,
    repostCount: raw.reposts_count ?? raw.repost_count ?? 0,
    liked: raw.liked_by_me ?? raw.is_liked ?? false,
    reposted: raw.reposted_by_me ?? raw.is_reposted ?? false,
    originalPost: raw.original_post ? normalizePost(raw.original_post) : null,
  };
};

export const normalizeComment = (raw: any): FeedComment => {
  const authorId = String(raw.user_id ?? raw.author_id ?? raw.user?.id ?? '');
  const authorName =
    raw.user?.display_name ??
    raw.user?.name ??
    raw.author?.name ??
    raw.author_name ??
    'Unknown';

  return {
    id: String(raw.id ?? ''),
    authorId,
    authorName,
    authorRole: raw.user?.role ?? raw.author?.role ?? '',
    authorInitials: initialsFor(authorName),
    authorColor: colorForId(authorId),
    authorProfileImage:
      raw.user?.profile_image ?? raw.author?.profile_image ?? null,
    timeAgo: formatTimeAgo(raw.created_at ?? ''),
    createdAt: raw.created_at ?? '',
    content: raw.content ?? '',
    likes: raw.likes_count ?? raw.like_count ?? raw.likes ?? 0,
    liked: raw.liked_by_me ?? raw.is_liked ?? false,
    parentId: raw.parent_id ? String(raw.parent_id) : null,
    replies: (raw.replies ?? []).map(normalizeComment),
  };
};

const normalizeFollowUser = (raw: any): FollowUser => ({
  id: String(raw.id ?? ''),
  name: raw.name ?? 'Unknown',
  role: raw.role ?? '',
  profileImage: raw.profile_image ?? null,
  isFollowing: raw.is_following ?? false,
});

export const getFeed = async (page = 1): Promise<PaginatedFeed> => {
  try {
    const response = await apiClient.get('/api/feed', { params: { page } });
    const data = response.data;
    const raw = data.data ?? data.posts ?? data ?? [];
    const posts = Array.isArray(raw) ? raw.map(normalizePost) : [];
    return {
      posts,
      currentPage: data.current_page ?? page,
      lastPage: data.last_page ?? 1,
      hasMore: (data.current_page ?? page) < (data.last_page ?? 1),
    };
  } catch (error) {
    console.error('[feedService] getFeed failed:', error);
    return { posts: [], currentPage: page, lastPage: 1, hasMore: false };
  }
};

export const getTrendingFeed = async (page = 1): Promise<PaginatedFeed> => {
  try {
    const response = await apiClient.get('/api/feed/trending', {
      params: { page },
    });
    const data = response.data;
    const raw = data.data ?? data.posts ?? data ?? [];
    const posts = Array.isArray(raw) ? raw.map(normalizePost) : [];
    return {
      posts,
      currentPage: data.current_page ?? page,
      lastPage: data.last_page ?? 1,
      hasMore: (data.current_page ?? page) < (data.last_page ?? 1),
    };
  } catch (error) {
    console.error('[feedService] getTrendingFeed failed:', error);
    return { posts: [], currentPage: page, lastPage: 1, hasMore: false };
  }
};

export const createPost = async (payload: {
  content: string;
  visibility?: string;
  allow_comments?: boolean;
  is_article?: boolean;
  media?: FeedMedia[];
}): Promise<FeedPost | null> => {
  try {
    const response = await apiClient.post('/api/posts', payload);
    const raw = response.data?.post ?? response.data?.data ?? response.data;
    console.log('[feedService] createPost success:', raw);
    return normalizePost(raw);
  } catch (error) {
    console.error('[feedService] createPost failed:', error);
    throw error;
  }
};

export const getPostById = async (id: string): Promise<FeedPost | null> => {
  try {
    const response = await apiClient.get(`/api/posts/${id}`);
    const raw = response.data?.post ?? response.data?.data ?? response.data;
    return normalizePost(raw);
  } catch (error) {
    console.error(`[feedService] getPostById(${id}) failed:`, error);
    return null;
  }
};

export const togglePostLike = async (
  postId: string,
): Promise<{ liked: boolean; likeCount: number }> => {
  try {
    const response = await apiClient.post(`/api/posts/${postId}/like`);
    const data = response.data;
    return {
      liked: data.liked ?? data.is_liked ?? false,
      likeCount: data.likes_count ?? data.like_count ?? 0,
    };
  } catch (error) {
    console.error(`[feedService] togglePostLike(${postId}) failed:`, error);
    throw error;
  }
};

export const repostPost = async (
  postId: string,
  content?: string,
  visibility?: string,
): Promise<FeedPost | null> => {
  try {
    const body: Record<string, string> = {};
    if (content) body.content = content;
    if (visibility) body.visibility = visibility;

    const response = await apiClient.post(`/api/posts/${postId}/repost`, body);
    const raw = response.data?.post ?? response.data?.data ?? response.data;
    console.log('[feedService] repostPost success');
    return normalizePost(raw);
  } catch (error) {
    console.error(`[feedService] repostPost(${postId}) failed:`, error);
    throw error;
  }
};

export const deletePost = async (postId: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/api/posts/${postId}`);
    console.log(`[feedService] deletePost(${postId}) success`);
    return true;
  } catch (error) {
    console.error(`[feedService] deletePost(${postId}) failed:`, error);
    throw error;
  }
};

export const getPostComments = async (
  postId: string,
  page = 1,
): Promise<PaginatedComments> => {
  try {
    const response = await apiClient.get(`/api/posts/${postId}/comments`, {
      params: { page },
    });
    const data = response.data;
    const raw = data.data ?? data.comments ?? data ?? [];
    const comments = Array.isArray(raw) ? raw.map(normalizeComment) : [];

    return {
      comments,
      currentPage: data.current_page ?? page,
      lastPage: data.last_page ?? 1,
      hasMore: (data.current_page ?? page) < (data.last_page ?? 1),
    };
  } catch (error) {
    console.error(`[feedService] getPostComments(${postId}) failed:`, error);
    return { comments: [], currentPage: page, lastPage: 1, hasMore: false };
  }
};

export const addComment = async (
  postId: string,
  content: string,
  parentId?: string | null,
): Promise<FeedComment | null> => {
  try {
    const body: Record<string, any> = { content, parent_id: parentId ?? null };
    const response = await apiClient.post(
      `/api/posts/${postId}/comments`,
      body,
    );
    const raw = response.data?.comment ?? response.data?.data ?? response.data;
    console.log('[feedService] addComment success');
    return normalizeComment(raw);
  } catch (error) {
    console.error(`[feedService] addComment(${postId}) failed:`, error);
    throw error;
  }
};

export const toggleCommentLike = async (
  commentId: string,
): Promise<{ liked: boolean; likeCount: number }> => {
  try {
    const response = await apiClient.post(`/api/comments/${commentId}/like`);
    const data = response.data;
    return {
      liked: data.liked ?? data.is_liked ?? false,
      likeCount: data.likes_count ?? data.like_count ?? 0,
    };
  } catch (error) {
    console.error(
      `[feedService] toggleCommentLike(${commentId}) failed:`,
      error,
    );
    throw error;
  }
};

export const deleteComment = async (commentId: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/api/comments/${commentId}`);
    console.log(`[feedService] deleteComment(${commentId}) success`);
    return true;
  } catch (error) {
    console.error(`[feedService] deleteComment(${commentId}) failed:`, error);
    throw error;
  }
};

export const toggleFollow = async (
  userUuid: string,
): Promise<{ following: boolean }> => {
  try {
    const response = await apiClient.post(`/api/users/${userUuid}/follow`);
    const data = response.data;
    return {
      following: data.following ?? data.is_following ?? false,
    };
  } catch (error) {
    console.error(`[feedService] toggleFollow(${userUuid}) failed:`, error);
    throw error;
  }
};

export const getUserFollowers = async (
  userUuid: string,
  page = 1,
): Promise<{ users: FollowUser[]; hasMore: boolean }> => {
  try {
    const response = await apiClient.get(`/api/users/${userUuid}/followers`, {
      params: { page },
    });
    const data = response.data;
    const raw = data.data ?? data.followers ?? data ?? [];
    return {
      users: Array.isArray(raw) ? raw.map(normalizeFollowUser) : [],
      hasMore: (data.current_page ?? page) < (data.last_page ?? 1),
    };
  } catch (error) {
    console.error(`[feedService] getUserFollowers(${userUuid}) failed:`, error);
    return { users: [], hasMore: false };
  }
};

export const getUserFollowing = async (
  userUuid: string,
  page = 1,
): Promise<{ users: FollowUser[]; hasMore: boolean }> => {
  try {
    const response = await apiClient.get(`/api/users/${userUuid}/following`, {
      params: { page },
    });
    const data = response.data;
    const raw = data.data ?? data.following ?? data ?? [];
    return {
      users: Array.isArray(raw) ? raw.map(normalizeFollowUser) : [],
      hasMore: (data.current_page ?? page) < (data.last_page ?? 1),
    };
  } catch (error) {
    console.error(`[feedService] getUserFollowing(${userUuid}) failed:`, error);
    return { users: [], hasMore: false };
  }
};

export const uploadMedia = async (
  file: { uri: string; name?: string; type?: string },
  mediaType: 'image' | 'video' = 'image',
): Promise<FeedMedia | null> => {
  try {
    const filename =
      file.name || file.uri.split('/').pop() || `upload_${Date.now()}.jpg`;

    // Use provided type or fallback to extension-based MIME
    let mimeType = file.type;
    if (!mimeType) {
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      mimeType =
        mediaType === 'video'
          ? 'video/mp4'
          : ext === 'png'
          ? 'image/png'
          : ext === 'webp'
          ? 'image/webp'
          : 'image/jpeg';
    }

    // Apply the specific URI logic for iOS/Android compatibility
    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
      name: file.name || 'image_' + Date.now() + '.jpg',
      type: file.type || 'image/jpeg',
    } as any);

    formData.append('type', mediaType);

    const response = await apiClient.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data?.media ?? response.data?.data ?? response.data;
    console.log('[feedService] uploadMedia success:', data);
    return {
      url: data.url ?? data.media_url ?? '',
      type: mediaType,
      order: 0,
    };
  } catch (error) {
    console.error('[feedService] uploadMedia failed:', error);
    throw error;
  }
};
