import React, { useState, useRef } from 'react';
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
} from 'react-native';
import {
  ThumbsUp,
  MessageSquare,
  ListCheck,
  Send,
  MoreHorizontal,
  Image as ImageIcon,
  FileText,
  Pencil,
  Search,
  Repeat2,
  Check,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Reaction {
  type: 'like' | 'love';
  count: number;
}

interface FeedPost {
  id: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  authorColor: string;
  timeAgo: string;
  content: string;
  codeBlock?: string;
  imageUrl?: string;
  hashtags: string[];
  reactions: Reaction[];
  liked: boolean;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE_POSTS: FeedPost[] = [
  {
    id: '1',
    authorName: 'Dr. Elena Rodriguez',
    authorRole: 'Senior Safety Physician • Pharmacovigilance',
    authorInitials: 'ER',
    authorColor: '#4F46E5',
    timeAgo: '2H AGO',
    content:
      'Exciting insights from the latest signal detection analysis. We are seeing a significant trend in RWD regarding #DrugSafety and oncology treatments.\n\nImplementation of the new validation logic for signal scoring:',
    codeBlock:
      'if (signal_score > threshold) {\n  validateBatch(batch_id);\n  notifyQPO(signal_alert);\n}',
    hashtags: ['#Pharmacovigilance', '#RWD', '#ISoP2024'],
    reactions: [{ type: 'like', count: 42 }],
    liked: false,
  },
  {
    id: '2',
    authorName: 'Sarah J. Miller',
    authorRole: 'Head of Global Regulatory Affairs',
    authorInitials: 'SM',
    authorColor: '#0EA5E9',
    timeAgo: '5H AGO',
    content:
      'The upcoming EMA workshop on #RiskManagement strategies is now open for registration. A must-attend for anyone navigating the complex GVP modules this year.',
    imageUrl:
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80',
    hashtags: ['#RegulatoryAffairs', '#EMA', '#GlobalHealth'],
    reactions: [{ type: 'like', count: 18 }],
    liked: false,
  },
  {
    id: '3',
    authorName: 'Prof. James Okonkwo',
    authorRole: 'Clinical Epidemiologist • ISoP Board',
    authorInitials: 'JO',
    authorColor: '#10B981',
    timeAgo: '1D AGO',
    content:
      'Our latest publication on #ADR clustering using ML is now live in DIPS Journal. This work bridges pharmacoepidemiology with modern data science to detect rare adverse events faster than ever before.',
    hashtags: ['#MachineLearning', '#Pharmacoepidemiology', '#ISoP'],
    reactions: [{ type: 'like', count: 91 }],
    liked: false,
  },
];

// ─── Hashtag Parser ──────────────────────────────────────────────────────────

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

// ─── Post Card ────────────────────────────────────────────────────────────────

const PostCard = ({
  post,
  onRepost,
  onShare,
}: {
  post: FeedPost;
  onRepost: () => void;
  onShare: () => void;
}) => {
  const navigation = useNavigation<any>();
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.reactions[0]?.count ?? 0);

  const handleLike = () => {
    setLiked(prev => {
      setLikeCount(c => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const handleComment = () => {
    navigation.navigate('Comments', {
      postId: post.id,
      postAuthorName: post.authorName,
      postContext: 'post on adverse event clustering in phase III trials',
    });
  };

  return (
    <View style={styles.card}>
      {/* Author Row */}
      <View style={styles.authorRow}>
        <View style={[styles.authorAvatar, { backgroundColor: post.authorColor }]}>
          <Text style={styles.authorInitials}>{post.authorInitials}</Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          <Text style={styles.authorRole} numberOfLines={1}>
            {post.authorRole}
          </Text>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
          <MoreHorizontal size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.postContent}>
        {renderTextWithHashtags(post.content)}

        {post.codeBlock && (
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{post.codeBlock}</Text>
          </View>
        )}

        {post.imageUrl && (
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.tagRow}>
          {post.hashtags.map(tag => (
            <Text key={tag} style={styles.hashtag}>
              {tag}{' '}
            </Text>
          ))}
        </View>

        <View style={styles.reactionsRow}>
          <View style={styles.emojiGroup}>
            <Text style={styles.emojiIcon}>👍</Text>
            <Text style={styles.emojiIcon}>❤️</Text>
          </View>
          <Text style={styles.reactionCount}>
            {likeCount} professionals liked this
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionBtn, liked && styles.actionBtnActive]}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <ThumbsUp
            size={16}
            color={liked ? colors.brand.primary : colors.text.tertiary}
            fill={liked ? colors.brand.primary : 'transparent'}
          />
          <Text style={[styles.actionLabel, liked && styles.actionLabelActive]}>
            Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={handleComment}>
          <MessageSquare size={16} color={colors.text.tertiary} />
          <Text style={styles.actionLabel}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={onRepost}>
          <Repeat2 size={16} color={colors.text.tertiary} />
          <Text style={styles.actionLabel}>Repost</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={onShare}>
          <Send size={16} color={colors.text.tertiary} />
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────


const FeedsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const [posts] = useState<FeedPost[]>(SAMPLE_POSTS);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [repostPost, setRepostPost] = useState<FeedPost | null>(null);

  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const handleOpenRepost = (post: FeedPost) => {
    setRepostPost(post);
    setShowRepostModal(true);
  };

  const handleOpenShare = async (post: FeedPost) => {
    try {
      const shareUrl = `https://clinicalcurator.isop.org/insight/vb-${post.id}`;
      await Share.share({
        message: `"Check out this insight from Clinical Curator: ${post.content}"\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRepostWithThoughts = () => {
    setShowRepostModal(false);
    setTimeout(() => navigation.navigate('SharePost', { post: repostPost }), 300);
  };

  const handleInstantRepost = () => {
    setShowRepostModal(false);

    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowToast(false);
    });
  };

  const getInitial = () =>
    userProfile?.displayName?.charAt(0).toUpperCase() || 'U';

  const ListHeader = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={16} color={colors.text.tertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search insights, experts, or clinical trials..."
          placeholderTextColor={colors.text.tertiary}
        />
      </View>

      {/* Create Post Box */}
      {/* <View style={styles.createPostCard}>
        <View style={styles.createPostTop}>
          <View style={styles.myAvatar}>
            {userProfile?.profileImage ? (
              <Image
                source={{ uri: userProfile.profileImage }}
                style={styles.myAvatarImg}
              />
            ) : (
              <Text style={styles.myAvatarText}>{getInitial()}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.createPostInput}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Text style={styles.createPostPlaceholder}>
              Share an update, link, or thought...
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.createPostActions}>
          <TouchableOpacity
            style={styles.createPostBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <ImageIcon size={16} color={colors.brand.primaryLight} />
            <Text style={styles.createPostBtnText}>Media</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createPostBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <FileText size={16} color={colors.text.secondary} />
            <Text style={styles.createPostBtnText}>Article</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.postBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Text style={styles.postBtnText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View> */}
    </>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.xs) }]}>
        <Text style={styles.headerTitle}>Feeds</Text>
        <View style={styles.headerActions}>
          <View style={styles.headerActionPod}>
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifBadge} />
            </TouchableOpacity>
            <View style={styles.headerAvatar}>
              {userProfile?.profileImage ? (
                <Image
                  source={{ uri: userProfile.profileImage }}
                  style={styles.headerAvatarImg}
                />
              ) : (
                <View style={styles.headerAvatarPlaceholder}>
                  <Text style={styles.headerAvatarText}>{getInitial()}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Feed List */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onRepost={() => handleOpenRepost(item)}
            onShare={() => handleOpenShare(item)}
          />
        )}
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={[styles.listContent, { paddingBottom: 30 }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Pencil size={22} color="white" />
      </TouchableOpacity>

      {/* ── Success Toast ─────────── */}
      {showToast && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity, bottom: insets.bottom + 90 }]}>
          <View style={styles.toastIconWrap}>
            <Check size={14} color="white" strokeWidth={3} />
          </View>
          <Text style={styles.toastText}>Post reposted successfully</Text>
        </Animated.View>
      )}

      {/* ── Repost Options Modal (top-level, outside FlatList) ─────────── */}
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
          <Pressable style={styles.repostSheet} onPress={() => { }}>
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
                <Text style={styles.repostOptionTitle}>Repost with your thoughts</Text>
                <Text style={styles.repostOptionSub}>Share this post with your own commentary</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.repostOption}
              activeOpacity={0.75}
              onPress={handleInstantRepost}
            >
              <View style={styles.repostOptionIcon}>
                <Repeat2 size={20} color={colors.brand.primary} />
              </View>
              <View style={styles.repostOptionContent}>
                <Text style={styles.repostOptionTitle}>Repost</Text>
                <Text style={styles.repostOptionSub}>Instantly share this post with your network</Text>
              </View>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.layout.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
    height: 80,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerActions: {},
  headerActionPod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 3,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  notifBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 1,
  },
  notifIcon: { fontSize: 16 },
  notifBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.status.error,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  headerAvatar: { marginRight: 2 },
  headerAvatarImg: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: 'white' },
  headerAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
    fontFamily: typography.fontFamily,
  },

  // List
  listContent: { paddingTop: spacing.sm },

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

  // Create Post
  createPostCard: {
    backgroundColor: colors.layout.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  createPostTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  myAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  myAvatarImg: { width: '100%', height: '100%' },
  myAvatarText: { fontSize: 16, fontWeight: '800', color: 'white', fontFamily: typography.fontFamily },
  createPostInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.layout.background,
  },
  createPostPlaceholder: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
  createPostActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  createPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.layout.background,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  createPostBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    fontFamily: typography.fontFamily,
  },
  postBtn: {
    marginLeft: 'auto',
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radius.round,
    backgroundColor: colors.brand.primary,
  },
  postBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: 'white',
    fontFamily: typography.fontFamily,
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
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
  },
  authorInitials: { fontSize: 16, fontWeight: '800', color: 'white', fontFamily: typography.fontFamily },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: '800', color: colors.text.primary, fontFamily: typography.fontFamily },
  authorRole: { fontSize: 12, color: colors.text.secondary, marginTop: 1, fontFamily: typography.fontFamily },
  timeAgo: { fontSize: 11, color: colors.text.tertiary, marginTop: 2, fontWeight: '600', fontFamily: typography.fontFamily },
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

  codeBlock: {
    backgroundColor: '#F1F5F9',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand.primary,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#334155',
    lineHeight: 20,
  },

  postImage: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.layout.surfaceElevated,
  },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },

  reactionsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emojiGroup: { flexDirection: 'row' },
  emojiIcon: { fontSize: 14 },
  reactionCount: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },

  // Divider
  divider: { height: 1, backgroundColor: colors.layout.divider, marginHorizontal: spacing.md },

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
  actionLabel: { fontSize: 12, fontWeight: '600', color: colors.text.tertiary, fontFamily: typography.fontFamily },
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
      ios: { shadowColor: colors.brand.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 16 },
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
    position: 'relative',
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
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
