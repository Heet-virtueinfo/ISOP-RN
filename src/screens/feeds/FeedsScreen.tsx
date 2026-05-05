import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Modal,
  Animated,
  Pressable,
  Share,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {
  ThumbsUp,
  MessageSquare,
  ListCheck,
  Send,
  MoreHorizontal,
  Pencil,
  Search,
  Repeat2,
  Check,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import UserHeader from '../../components/UserHeader';
import {
  getTrendingFeed,
  togglePostLike,
  repostPost as repostPostAPI,
  FeedPost,
  FeedMedia,
} from '../../services/feedService';
import { getEcho } from '../../services/echoService';

const renderTextWithHashtags = (text: string) => {
  const parts = text.split(/(#\w+)/g);
  return (
    <Text style={styles.postBody}>
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <Text key={i} style={styles.hashtag}>
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        ),
      )}
    </Text>
  );
};

const MediaGrid = ({ media }: { media: FeedMedia[] }) => {
  if (!media || media.length === 0) return null;

  const images = media.filter(m => m.type === 'image');
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <View style={styles.mediaGrid}>
        <Image
          source={{ uri: images[0].url }}
          style={styles.imageFullWidth}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (images.length === 2) {
    return (
      <View style={[styles.mediaGrid, styles.mediaRow]}>
        <Image
          source={{ uri: images[0].url }}
          style={styles.imageHalf}
          resizeMode="cover"
        />
        <Image
          source={{ uri: images[1].url }}
          style={styles.imageHalf}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (images.length === 3) {
    const topRow = images.slice(0, 2);
    const bottomRow = images.slice(2);
    return (
      <View style={styles.mediaGrid}>
        <View style={styles.mediaRow}>
          {topRow.map((img, i) => (
            <Image
              key={i}
              source={{ uri: img.url }}
              style={styles.imageHalf}
              resizeMode="cover"
            />
          ))}
        </View>
        <View style={styles.mediaRow}>
          <Image
            source={{ uri: bottomRow[0].url }}
            style={styles.imageFullWidth}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  }

  // 4 or more
  const topRow = images.slice(0, 2);
  const bottomRow = images.slice(2, 4);
  const extra = images.length - 4;
  return (
    <View style={styles.mediaGrid}>
      <View style={styles.mediaRow}>
        {topRow.map((img, i) => (
          <Image
            key={i}
            source={{ uri: img.url }}
            style={styles.imageHalf}
            resizeMode="cover"
          />
        ))}
      </View>
      <View style={styles.mediaRow}>
        {bottomRow.map((img, i) => (
          <View key={i} style={styles.imageHalf}>
            <Image
              source={{ uri: img.url }}
              style={styles.imageFullSize}
              resizeMode="cover"
            />
            {i === 1 && extra > 0 && (
              <View style={styles.mediaOverlay}>
                <Text style={styles.mediaOverlayText}>+{extra}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const PostCard = ({
  post,
  onRepost,
  onShare,
  onLikeToggle,
}: {
  post: FeedPost;
  onRepost: () => void;
  onShare: () => void;
  onLikeToggle: (postId: string, liked: boolean, count?: number) => void;
}) => {
  const navigation = useNavigation<any>();
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;

    // 1. Optimistic Update (No count passed yet)
    const newLiked = !post.liked;
    onLikeToggle(post.id, newLiked);

    setLiking(true);
    try {
      // 2. Call API
      const result = await togglePostLike(post.id);
      // 3. Sync Parent with EXPLICIT Server Result
      onLikeToggle(post.id, result.liked, result.likeCount);
    } catch (err) {
      // 4. Rollback on failure
      onLikeToggle(post.id, !newLiked);
      console.error('[PostCard] Like error:', err);
    } finally {
      setLiking(false);
    }
  };

  const handleComment = () => {
    console.log('[FeedsScreen] Navigating to comments for post:', {
      postId: post.id,
      author: post.authorName,
      contentPreview: post.content.slice(0, 40) + '...',
    });
    navigation.navigate('Comments', {
      postId: post.id,
      postAuthorName: post.authorName,
      postContext: post.content.slice(0, 80),
    });
  };

  return (
    <View style={styles.card}>
      {/* Author Row */}
      <View style={styles.authorRow}>
        <View
          style={[styles.authorAvatar, { backgroundColor: post.authorColor }]}
        >
          {post.authorProfileImage ? (
            <Image
              source={{ uri: post.authorProfileImage }}
              style={styles.authorAvatarImg}
            />
          ) : (
            <Text style={styles.authorInitials}>{post.authorInitials}</Text>
          )}
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
          <MoreHorizontal size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.postContent}>
        {renderTextWithHashtags(post.content)}

        <MediaGrid media={post.media} />

        {/* Original post preview (repost) */}
        {post.originalPost && (
          <View style={styles.repostPreview}>
            <View style={styles.repostPreviewHeader}>
              <View
                style={[
                  styles.repostPreviewAvatar,
                  { backgroundColor: post.originalPost.authorColor },
                ]}
              >
                <Text style={styles.repostPreviewInitials}>
                  {post.originalPost.authorInitials}
                </Text>
              </View>
              <View>
                <Text style={styles.repostPreviewName}>
                  {post.originalPost.authorName}
                </Text>
                <Text style={styles.repostPreviewRole} numberOfLines={1}>
                  {post.originalPost.authorRole}
                </Text>
              </View>
            </View>
            <Text style={styles.repostPreviewContent} numberOfLines={3}>
              {post.originalPost.content}
            </Text>
          </View>
        )}

        <View style={styles.reactionsRow}>
          {post.likeCount > 0 && (
            <>
              <View style={styles.emojiGroup}>
                <Text style={styles.emojiIcon}>👍</Text>
              </View>
              <Text style={styles.reactionCount}>{post.likeCount} liked</Text>
            </>
          )}
          {post.commentCount > 0 && (
            <Text style={styles.reactionCount}>
              {post.commentCount} comments
            </Text>
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionBtn, post.liked && styles.actionBtnActive]}
          onPress={handleLike}
          activeOpacity={0.7}
          disabled={liking}
        >
          <ThumbsUp
            size={16}
            color={post.liked ? colors.brand.primary : colors.text.tertiary}
            fill={post.liked ? colors.brand.primary : 'transparent'}
          />
          <Text
            style={[styles.actionLabel, post.liked && styles.actionLabelActive]}
          >
            Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={handleComment}
        >
          <MessageSquare size={16} color={colors.text.tertiary} />
          <Text style={styles.actionLabel}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={onRepost}
        >
          <Repeat2
            size={16}
            color={post.reposted ? colors.brand.primary : colors.text.tertiary}
          />
          <Text
            style={[
              styles.actionLabel,
              post.reposted && styles.actionLabelActive,
            ]}
          >
            Repost
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={onShare}
        >
          <Send size={16} color={colors.text.tertiary} />
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FeedsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showRepostModal, setShowRepostModal] = useState(false);
  const [repostTargetPost, setRepostTargetPost] = useState<FeedPost | null>(
    null,
  );
  const [reposting, setReposting] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // ── Fetch Feed ──────────────────────────────────────────────────────────────

  const loadFeed = useCallback(async (page: number, replace: boolean) => {
    try {
      const result = await getTrendingFeed(page);
      const newPosts = result.posts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setPosts(prev => (replace ? newPosts : [...prev, ...newPosts]));
      setCurrentPage(result.currentPage);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('[FeedsScreen] loadFeed error:', err);
    }
  }, []);

  const handleInitialLoad = useCallback(async () => {
    setLoading(true);
    await loadFeed(1, true);
    setLoading(false);
  }, [loadFeed]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed(1, true);
    setRefreshing(false);
  }, [loadFeed]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadFeed(currentPage + 1, false);
    setLoadingMore(false);
  }, [loadingMore, hasMore, currentPage, loadFeed]);

  useFocusEffect(
    useCallback(() => {
      handleInitialLoad();
    }, [handleInitialLoad]),
  );

  // ── Real-Time Updates (Pusher) ────────────────────────────────────────────
  useEffect(() => {
    let isActive = true;
    const channelName = 'social-feed';
    const eventName = 'PostUpdated';

    const setupPusher = async () => {
      const pusher = getEcho();
      if (!pusher) return;

      try {
        await pusher.subscribe({
          channelName,
          onEvent: (event: any) => {
            if (!isActive) return;
            if (event.eventName === eventName) {
              try {
                const data = JSON.parse(event.data);
                console.log('[FeedsScreen] Real-time update received:', data);
                setPosts(currentPosts =>
                  currentPosts.map(p => {
                    if (p.id === String(data.post_id)) {
                      return {
                        ...p,
                        likeCount: data.likes_count ?? p.likeCount,
                        commentCount: data.comments_count ?? p.commentCount,
                      };
                    }
                    return p;
                  }),
                );
              } catch (err) {
                console.error('[FeedsScreen] Pusher data parse error:', err);
              }
            }
          },
        });
      } catch (err) {
        console.error('[FeedsScreen] Pusher subscribe error:', err);
      }
    };

    setupPusher();

    return () => {
      isActive = false;
      const pusher = getEcho();
      if (pusher) {
        pusher.unsubscribe({ channelName });
      }
    };
  }, []);

  // ── Like sync callback ────────────────────────────────────────────────────
  const handleLikeToggle = useCallback(
    (postId: string, liked: boolean, count?: number) => {
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
                ...p,
                liked,
                likeCount:
                  count !== undefined
                    ? count
                    : liked
                    ? p.likeCount + 1
                    : p.likeCount - 1,
              }
            : p,
        ),
      );
    },
    [],
  );

  // ── Repost ────────────────────────────────────────────────────────────────

  const handleOpenRepost = (post: FeedPost) => {
    setRepostTargetPost(post);
    setShowRepostModal(true);
  };

  const handleRepost = async (postId: string) => {
    try {
      const result = await repostPostAPI(postId);
      if (result) {
        Toast.show({
          type: 'success',
          text1: 'Post Reposted',
          text2: 'The post has been shared to your feed.',
        });
        handleInitialLoad();
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to repost this post.';
      Toast.show({
        type: 'error',
        text1: 'Repost Failed',
        text2: errorMessage,
      });
    }
  };

  const handleOpenShare = async (post: FeedPost) => {
    try {
      const shareUrl = `https://clinicalcurator.isop.org/insight/${post.id}`;
      await Share.share({
        message: `Check out this insight on ISoP: ${post.content.slice(
          0,
          100,
        )}...\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRepostWithThoughts = () => {
    setShowRepostModal(false);
    setTimeout(
      () => navigation.navigate('SharePost', { post: repostTargetPost }),
      300,
    );
  };

  const handleInstantRepost = async () => {
    if (!repostTargetPost || reposting) return;
    setShowRepostModal(false);
    setReposting(true);
    try {
      await repostPostAPI(repostTargetPost.id);
      Toast.show({
        type: 'success',
        text1: 'Post Reposted',
        text2: 'Shared successfully to your feed.',
      });
      handleInitialLoad();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Could not repost. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Repost Failed',
        text2: errorMessage,
      });
    } finally {
      setReposting(false);
    }
  };

  // ── List Header ────────────────────────────────────────────────────────────

  const ListHeader = () => (
    <View style={styles.searchContainer}>
      <Search
        size={16}
        color={colors.text.tertiary}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search insights, experts, or clinical trials..."
        placeholderTextColor={colors.text.tertiary}
      />
    </View>
  );

  const ListFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.brand.primary} />
      </View>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <UserHeader title="Feeds" />

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onRepost={() => handleOpenRepost(item)}
              onShare={() => handleOpenShare(item)}
              onLikeToggle={handleLikeToggle}
            />
          )}
          ListHeaderComponent={<ListHeader />}
          ListFooterComponent={<ListFooter />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No posts yet. Be the first to share!
              </Text>
            </View>
          }
          contentContainerStyle={[styles.listContent, { paddingBottom: 30 }]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.brand.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Pencil size={22} color="white" />
      </TouchableOpacity>

      {/* Success Toast */}
      {showToast && (
        <Animated.View
          style={[
            styles.toastContainer,
            { opacity: toastOpacity, bottom: insets.bottom + 90 },
          ]}
        >
          <View style={styles.toastIconWrap}>
            <Check size={14} color="white" strokeWidth={3} />
          </View>
          <Text style={styles.toastText}>Post reposted successfully</Text>
        </Animated.View>
      )}

      {/* Repost Options Modal */}
      <Modal
        visible={showRepostModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRepostModal(false)}
      >
        <Pressable
          style={styles.repostOverlay}
          onPress={() => setShowRepostModal(false)}
        >
          <Pressable style={styles.repostSheet} onPress={() => {}}>
            <View style={styles.repostHandle} />
            <View style={styles.repostTitleRow}>
              <Text style={styles.repostTitle}>Share Post</Text>
              <TouchableOpacity
                style={styles.repostCloseBtn}
                onPress={() => setShowRepostModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.repostCloseX}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.repostOption}
              activeOpacity={0.75}
              onPress={handleRepostWithThoughts}
            >
              <View style={styles.repostOptionIcon}>
                <ListCheck size={20} color={colors.brand.primary} />
              </View>
              <View style={styles.repostOptionContent}>
                <Text style={styles.repostOptionTitle}>
                  Repost with your thoughts
                </Text>
                <Text style={styles.repostOptionSub}>
                  Share this post with your own commentary
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.repostOption}
              activeOpacity={0.75}
              onPress={handleInstantRepost}
              disabled={reposting}
            >
              <View style={styles.repostOptionIcon}>
                {reposting ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.brand.primary}
                  />
                ) : (
                  <Repeat2 size={20} color={colors.brand.primary} />
                )}
              </View>
              <View style={styles.repostOptionContent}>
                <Text style={styles.repostOptionTitle}>Repost</Text>
                <Text style={styles.repostOptionSub}>
                  Instantly share this post with your network
                </Text>
              </View>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.layout.background },
  listContent: { paddingTop: spacing.sm },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footerLoader: { paddingVertical: spacing.md, alignItems: 'center' },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    color: colors.text.tertiary,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: { marginRight: spacing.xs },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
  },

  // Post Card
  card: {
    backgroundColor: colors.layout.surface,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },

  // Author
  authorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  authorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    flexShrink: 0,
    overflow: 'hidden',
  },
  authorAvatarImg: { width: '100%', height: '100%' },
  authorInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    fontFamily: typography.fontFamily,
  },
  authorInfo: { flex: 1 },
  authorName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  authorRole: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 1,
    fontFamily: typography.fontFamily,
  },
  timeAgo: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  moreBtn: { padding: 4 },

  // Post Content
  postContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  postBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.sm,
  },
  hashtag: { color: colors.brand.primaryLight, fontWeight: '600' },

  // Media Grid
  mediaGrid: {
    width: '100%',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    gap: 8,
  },
  mediaRow: { flexDirection: 'row', width: '100%', gap: 8 },
  imageHalf: {
    flex: 1,
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.layout.surfaceElevated,
    overflow: 'hidden',
    position: 'relative',
  },
  imageFullWidth: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    backgroundColor: colors.layout.surfaceElevated,
    overflow: 'hidden',
    position: 'relative',
  },
  imageFullSize: { width: '100%', height: '100%' },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaOverlayText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
  },

  // Repost preview embed
  repostPreview: {
    borderWidth: 1,
    borderColor: colors.layout.divider,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.layout.surfaceElevated,
  },
  repostPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 6,
  },
  repostPreviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repostPreviewInitials: {
    fontSize: 10,
    fontWeight: '800',
    color: 'white',
    fontFamily: typography.fontFamily,
  },
  repostPreviewName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  repostPreviewRole: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
  repostPreviewContent: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
    fontFamily: typography.fontFamily,
  },

  reactionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emojiGroup: { flexDirection: 'row' },
  emojiIcon: { fontSize: 14 },
  reactionCount: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.layout.divider,
    marginHorizontal: spacing.md,
  },

  // Action Bar
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  actionBtnActive: { backgroundColor: 'rgba(30, 58, 138, 0.06)' },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
  actionLabelActive: { color: colors.brand.primary },

  // FAB
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },

  // Repost Modal
  repostOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  repostSheet: {
    backgroundColor: colors.layout.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: { elevation: 16 },
    }),
  },
  repostHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.layout.divider,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  repostTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  repostTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  repostCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.layout.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repostCloseX: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  repostOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  repostOptionIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.layout.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repostOptionContent: { flex: 1 },
  repostOptionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 3,
  },
  repostOptionSub: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.text.tertiary,
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    backgroundColor: '#1E293B',
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  toastIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});

export default FeedsScreen;
