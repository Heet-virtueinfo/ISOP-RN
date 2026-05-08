import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Search, PlusCircle, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import UserHeader from '../../components/UserHeader';
import {
  getTrendingFeed,
  getFeed,
  repostPost as repostPostAPI,
  deletePost as deletePostAPI,
  FeedPost,
  FeedMedia,
} from '../../services/feedService';
import { getEcho } from '../../services/echoService';
import { Share } from 'react-native';

// Feed-specific components
import PostCard from '../../components/feeds/PostCard';
import FullImageViewer from '../../components/feeds/FullImageViewer';
import RepostModal from '../../components/feeds/RepostModal';
import UndoRepostModal from '../../components/feeds/UndoRepostModal';

// ── Screen ────────────────────────────────────────────────────────────────────

const FeedsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();

  // ── Feed State ─────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'my_feed'>(
    'trending',
  );

  // ── Modal / Repost State ───────────────────────────────────────────────────
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showConfirmUndoModal, setShowConfirmUndoModal] = useState(false);
  const [repostTargetPost, setRepostTargetPost] = useState<FeedPost | null>(
    null,
  );
  const [reposting, setReposting] = useState(false);

  // ── Toast State ────────────────────────────────────────────────────────────
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // ── Image Viewer State ─────────────────────────────────────────────────────
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<FeedMedia[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  // ── Fetch Feed ─────────────────────────────────────────────────────────────

  const loadFeed = useCallback(
    async (page: number, replace: boolean, tab: 'trending' | 'my_feed') => {
      try {
        const result =
          tab === 'trending'
            ? await getTrendingFeed(page)
            : await getFeed(page);
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
    },
    [],
  );

  const handleInitialLoad = useCallback(async () => {
    setLoading(true);
    await loadFeed(1, true, activeTab);
    setLoading(false);
  }, [loadFeed, activeTab]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed(1, true, activeTab);
    setRefreshing(false);
  }, [loadFeed, activeTab]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadFeed(currentPage + 1, false, activeTab);
    setLoadingMore(false);
  }, [loadingMore, hasMore, currentPage, loadFeed, activeTab]);

  useFocusEffect(
    useCallback(() => {
      handleInitialLoad();
    }, [handleInitialLoad]),
  );

  useEffect(() => {
    handleInitialLoad();
  }, [activeTab]);

  // ── Real-Time Updates (Pusher) ─────────────────────────────────────────────
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

  // ── Like Sync ──────────────────────────────────────────────────────────────
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

  const handlePressImage = useCallback((index: number, images: FeedMedia[]) => {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerVisible(true);
  }, []);

  // ── Delete Post ────────────────────────────────────────────────────────────
  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      await deletePostAPI(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      Toast.show({
        type: 'success',
        text1: 'Post Deleted',
        text2: 'Your post has been deleted successfully.',
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to delete the post. Please try again.';
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: errorMessage,
      });
    }
  }, []);

  // ── Repost ─────────────────────────────────────────────────────────────────
  const handleOpenRepost = (post: FeedPost) => {
    setRepostTargetPost(post);
    if (post.reposted || post.originalPost?.reposted) {
      setShowConfirmUndoModal(true);
    } else {
      setShowRepostModal(true);
    }
  };

  const handleInstantRepost = async () => {
    if (!repostTargetPost || reposting) return;
    const isUndoing = !!repostTargetPost.reposted;
    setShowRepostModal(false);
    setReposting(true);
    try {
      await repostPostAPI(repostTargetPost.id);
      Toast.show({
        type: 'success',
        text1: isUndoing ? 'Repost Removed' : 'Post Reposted',
        text2: isUndoing
          ? 'Post removed from your feed.'
          : 'Shared successfully to your feed.',
      });
      handleInitialLoad();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Could not process request. Please try again.';
      Toast.show({
        type: 'error',
        text1: isUndoing ? 'Undo Failed' : 'Repost Failed',
        text2: errorMessage,
      });
    } finally {
      setReposting(false);
    }
  };

  const handleRepostWithThoughts = () => {
    setShowRepostModal(false);
    setTimeout(
      () => navigation.navigate('SharePost', { post: repostTargetPost }),
      300,
    );
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

  // ── Sub-components ─────────────────────────────────────────────────────────

  const ListHeader = () => (
    <View style={styles.searchContainer}>
      <Search size={16} color={colors.text.tertiary} style={styles.searchIcon} />
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

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'trending' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('trending')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'trending' && styles.tabTextActive,
            ]}
          >
            Trending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'my_feed' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('my_feed')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'my_feed' && styles.tabTextActive,
            ]}
          >
            My Feed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Feed List */}
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
              onPressImage={handlePressImage}
              onDelete={handleDeletePost}
              currentUserId={String(userProfile?.uid ?? '')}
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
          contentContainerStyle={{ paddingBottom: 30 }}
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

      {/* FAB – Create Post */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 20 }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <PlusCircle size={22} color="white" />
      </TouchableOpacity>

      {/* Legacy animated toast (kept for safety) */}
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

      {/* Repost Bottom-Sheet Modal */}
      <RepostModal
        visible={showRepostModal}
        reposting={reposting}
        isAlreadyReposted={!!repostTargetPost?.reposted}
        onClose={() => setShowRepostModal(false)}
        onRepostWithThoughts={handleRepostWithThoughts}
        onInstantRepost={handleInstantRepost}
      />

      {/* Undo Repost Confirmation Modal */}
      <UndoRepostModal
        visible={showConfirmUndoModal}
        onClose={() => setShowConfirmUndoModal(false)}
        onConfirm={handleInstantRepost}
      />

      {/* Full-Screen Image Viewer */}
      <FullImageViewer
        visible={viewerVisible}
        images={viewerImages}
        index={viewerIndex}
        onClose={() => setViewerVisible(false)}
        onIndexChange={setViewerIndex}
      />
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.layout.background },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footerLoader: { paddingVertical: spacing.md, alignItems: 'center' },
  emptyState: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    color: colors.text.tertiary,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    margin: spacing.md,
    backgroundColor: colors.layout.surface,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.md - 2,
  },
  tabButtonActive: { backgroundColor: colors.brand.primary },
  tabText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  tabTextActive: { color: 'white' },

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

  // Legacy toast
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
    backgroundColor: colors.brand.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastText: { fontWeight: '500', color: 'white' },
});

export default FeedsScreen;
