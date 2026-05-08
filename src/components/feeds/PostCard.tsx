import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import {
  ThumbsUp,
  MessageSquare,
  Send,
  MoreHorizontal,
  Repeat2,
  Repeat1,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { FeedPost, FeedMedia, togglePostLike } from '../../services/feedService';
import MediaGrid from './MediaGrid';

// ── Helper ────────────────────────────────────────────────────────────────────

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

// ── Props ─────────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: FeedPost;
  onRepost: () => void;
  onShare: () => void;
  onLikeToggle: (postId: string, liked: boolean, count?: number) => void;
  onPressImage: (index: number, images: FeedMedia[]) => void;
  onDelete: (postId: string) => void;
  currentUserId: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

const PostCard = ({
  post,
  onRepost,
  onShare,
  onLikeToggle,
  onPressImage,
  onDelete,
  currentUserId,
}: PostCardProps) => {
  const navigation = useNavigation<any>();
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;

    // 1. Optimistic update
    const newLiked = !post.liked;
    onLikeToggle(post.id, newLiked);

    setLiking(true);
    try {
      // 2. Call API
      const result = await togglePostLike(post.id);
      // 3. Sync with server result
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
    navigation.navigate('Comments', {
      postId: post.id,
      postAuthorName: post.authorName,
      postContext: post.content.slice(0, 80),
    });
  };

  const handleMoreOptions = () => {
    const isOwner = String(post.authorId) === String(currentUserId);
    const options: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }> = [{ text: 'Cancel', style: 'cancel' }];

    if (isOwner) {
      options.push({
        text: 'Delete Post',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post? This action cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => onDelete(post.id),
              },
            ],
          );
        },
      });
    }
    Alert.alert('Post Options', undefined, options);
  };

  return (
    <View style={styles.card}>
      {/* Repost Indicator (simple reposts without thoughts) */}
      {post.originalPost && !post.content && (
        <View style={styles.repostedIndicator}>
          <Repeat2 size={12} color={colors.text.tertiary} />
          <Text style={styles.repostedIndicatorText}>
            {post.authorName} reposted
          </Text>
        </View>
      )}

      {/* Author Row */}
      <View
        style={[
          styles.authorRow,
          post.originalPost && !post.content && styles.authorRowInstantRepost,
        ]}
      >
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
        {String(post.authorId) === String(currentUserId) && (
          <TouchableOpacity
            style={styles.moreBtn}
            activeOpacity={0.7}
            onPress={handleMoreOptions}
          >
            <MoreHorizontal size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.postContent}>
        {renderTextWithHashtags(post.content)}

        <MediaGrid media={post.media} onPressImage={onPressImage} />

        {/* Original post preview (repost embed) */}
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
                  {post.originalPost.authorRole} • {post.originalPost.timeAgo}
                </Text>
              </View>
            </View>
            <View style={styles.repostPreviewBody}>
              <Text
                style={[
                  styles.repostPreviewContent,
                  post.originalPost.imageUrl &&
                    styles.repostPreviewContentWithImage,
                ]}
                numberOfLines={3}
              >
                {post.originalPost.content}
              </Text>
              {post.originalPost.imageUrl && (
                <Image
                  source={{ uri: post.originalPost.imageUrl }}
                  style={styles.repostPreviewImage}
                  resizeMode="cover"
                />
              )}
            </View>
          </View>
        )}

        {/* Reactions row */}
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
          {post.originalPost?.reposted || post.reposted ? (
            <Repeat1
              size={16}
              color={colors.brand.primary}
              fill={colors.brand.primary}
            />
          ) : (
            <Repeat2 size={16} color={colors.text.tertiary} />
          )}
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

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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

  // Repost indicator
  repostedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  repostedIndicatorText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.tertiary,
  },

  // Author row
  authorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  authorRowInstantRepost: {
    paddingBottom: 0,
    paddingTop: spacing.xs,
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
  timeAgo: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  moreBtn: { padding: 4 },

  // Post content
  postContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  postBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.sm,
  },
  hashtag: { color: colors.brand.primaryLight, fontWeight: '600' },

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
  repostPreviewBody: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  repostPreviewContent: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
    fontFamily: typography.fontFamily,
  },
  repostPreviewContentWithImage: {
    flex: 1,
  },
  repostPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.layout.divider,
  },

  // Reactions
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

  // Action bar
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
});

export default PostCard;
