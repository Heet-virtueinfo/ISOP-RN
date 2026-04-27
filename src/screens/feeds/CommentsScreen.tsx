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
  KeyboardAvoidingView,
} from 'react-native';
import {
  ArrowLeft,
  MoreHorizontal,
  ThumbsUp,
  CornerDownRight,
  Send,
  ChevronDown,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reply {
  id: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  authorColor: string;
  timeAgo: string;
  content: string;
}

interface Comment {
  id: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  authorColor: string;
  timeAgo: string;
  content: string;
  likes: number;
  liked: boolean;
  replies: Reply[];
  hiddenReplies?: number;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: 'c1',
    authorName: 'Dr. Michael Chen',
    authorRole: 'Senior Medical Director, Oncology',
    authorInitials: 'MC',
    authorColor: '#1E3A8A',
    timeAgo: '2h ago',
    content:
      'Excellent breakdown. We observed a similar pattern with the secondary biomarkers in the Q3 cohort. Have you cross-referenced these findings with the latest EMA safety updates?',
    likes: 12,
    liked: false,
    replies: [
      {
        id: 'r1',
        authorName: 'Sarah Jenkins',
        authorRole: 'Lead Pharmacovigilance Scientist',
        authorInitials: 'SJ',
        authorColor: '#0EA5E9',
        timeAgo: '1h ago',
        content:
          '@Dr. Michael Chen We did. The EMA bulletin from last week highlights a minor discrepancy in the reporting timeline, but the core clustering remains statistically significant.',
      },
    ],
    hiddenReplies: 2,
  },
  {
    id: 'c2',
    authorName: 'Dr. James Wilson',
    authorRole: 'Global Head of Drug Safety',
    authorInitials: 'JW',
    authorColor: '#475569',
    timeAgo: '45m ago',
    content:
      "This is critical insight. We need to ensure these signals are integrated into the upcoming PSUR. I've flagged this thread for the regulatory team review tomorrow morning.",
    likes: 0,
    liked: false,
    replies: [],
  },
];

// ─── Reply Card ───────────────────────────────────────────────────────────────

const ReplyCard = ({ reply }: { reply: Reply }) => (
  <View style={styles.replyCard}>
    <View style={[styles.replyAvatar, { backgroundColor: reply.authorColor }]}>
      <Text style={styles.replyAvatarText}>{reply.authorInitials}</Text>
    </View>
    <View style={styles.replyBody}>
      <View style={styles.replyHeader}>
        <View style={styles.replyAuthorMeta}>
          <Text style={styles.replyAuthorName}>{reply.authorName}</Text>
          <Text style={styles.replyAuthorRole}>{reply.authorRole}</Text>
        </View>
        <Text style={styles.replyTime}>{reply.timeAgo}</Text>
      </View>
      <Text style={styles.replyContent}>{reply.content}</Text>
      <View style={styles.replyActions}>
        <TouchableOpacity style={styles.replyActionBtn} activeOpacity={0.7}>
          <Text style={styles.replyActionText}>Like</Text>
        </TouchableOpacity>
        <Text style={styles.dot}>•</Text>
        <TouchableOpacity style={styles.replyActionBtn} activeOpacity={0.7}>
          <Text style={styles.replyActionText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ─── Comment Card ─────────────────────────────────────────────────────────────

const CommentCard = ({ comment }: { comment: Comment }) => {
  const [liked, setLiked] = useState(comment.liked);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [repliesExpanded, setRepliesExpanded] = useState(false);

  const handleLike = () => {
    setLiked(prev => {
      setLikeCount(c => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  return (
    <View style={styles.commentCard}>
      {/* Author */}
      <View style={styles.commentTop}>
        <View style={[styles.commentAvatar, { backgroundColor: comment.authorColor }]}>
          <Text style={styles.commentAvatarText}>{comment.authorInitials}</Text>
        </View>
        <View style={styles.commentMeta}>
          <View style={styles.commentMetaRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.commentAuthorName}>{comment.authorName}</Text>
              <Text style={styles.commentAuthorRole}>{comment.authorRole}</Text>
            </View>
            <Text style={styles.commentTime}>{comment.timeAgo}</Text>
          </View>
          <Text style={styles.commentContent}>{comment.content}</Text>

          {/* Actions */}
          <View style={styles.commentActions}>
            <TouchableOpacity
              style={styles.commentActionBtn}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <ThumbsUp
                size={14}
                color={liked ? colors.brand.primary : colors.text.tertiary}
                fill={liked ? colors.brand.primary : 'transparent'}
              />
              <Text style={[styles.commentActionText, liked && styles.commentActionTextActive]}>
                Like
              </Text>
            </TouchableOpacity>
            <Text style={styles.dot}>•</Text>
            <TouchableOpacity style={styles.commentActionBtn} activeOpacity={0.7}>
              <CornerDownRight size={14} color={colors.text.tertiary} />
              <Text style={styles.commentActionText}>Reply</Text>
            </TouchableOpacity>
            {likeCount > 0 && (
              <>
                <Text style={styles.dot}>•</Text>
                <View style={styles.likeCountRow}>
                  <ThumbsUp size={13} color={colors.brand.primaryLight} fill={colors.brand.primaryLight} />
                  <Text style={styles.likeCountText}>{likeCount}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <View style={styles.repliesSection}>
          {comment.replies.map(r => (
            <ReplyCard key={r.id} reply={r} />
          ))}

          {!!comment.hiddenReplies && !repliesExpanded && (
            <TouchableOpacity
              style={styles.expandRepliesBtn}
              onPress={() => setRepliesExpanded(true)}
              activeOpacity={0.7}
            >
              <ChevronDown size={15} color={colors.brand.primaryLight} />
              <Text style={styles.expandRepliesText}>
                Expand {comment.hiddenReplies} more{' '}
                {comment.hiddenReplies === 1 ? 'reply' : 'replies'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const CommentsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { userProfile } = useAuth();

  const postAuthorName: string = route.params?.postAuthorName || 'this member';
  const postContext: string =
    route.params?.postContext || 'post on adverse event clustering in phase III trials';

  const [comments] = useState<Comment[]>(SAMPLE_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const inputRef = useRef<TextInput>(null);

  const getInitial = () =>
    userProfile?.displayName?.charAt(0).toUpperCase() || 'U';

  const handleSend = () => {
    if (!newComment.trim()) return;
    // TODO: integrate with Firestore
    setNewComment('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.brand.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
        <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
          <MoreHorizontal size={22} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Comments List ──────────────────────────────────────────────────── */}
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <View style={styles.contextBanner}>
              <Text style={styles.contextText}>
                {'Replying to '}
                <Text style={styles.contextAuthor}>{postAuthorName}'s </Text>
                {postContext}.
              </Text>
            </View>
          }
          renderItem={({ item }) => <CommentCard comment={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyboardShouldPersistTaps="handled"
        />

        {/* ── Input Bar ──────────────────────────────────────────────────────── */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, spacing.sm) },
          ]}
        >
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
          <View style={styles.inputWrap}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Add a comment..."
              placeholderTextColor={colors.text.tertiary}
              value={newComment}
              onChangeText={setNewComment}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !newComment.trim() && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!newComment.trim()}
              activeOpacity={0.8}
            >
              <Send size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 17,
    fontWeight: '800',
    color: colors.brand.primary,
    textAlign: 'center',
    marginHorizontal: spacing.xs,
  },
  moreBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Context banner
  contextBanner: {
    backgroundColor: colors.layout.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
    marginBottom: spacing.xs,
  },
  contextText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  contextAuthor: {
    fontWeight: '800',
    color: colors.text.primary,
  },

  // List
  listContent: { paddingBottom: spacing.xl },
  separator: { height: 1, backgroundColor: colors.layout.divider },

  // Comment card
  commentCard: {
    backgroundColor: colors.layout.surface,
    paddingTop: spacing.md,
  },
  commentTop: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  commentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  commentAvatarText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
  },
  commentMeta: { flex: 1 },
  commentMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  commentAuthorName: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  commentAuthorRole: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  commentTime: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.tertiary,
    marginLeft: 6,
    marginTop: 2,
  },
  commentContent: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: spacing.sm,
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  commentActionTextActive: { color: colors.brand.primary },
  dot: { fontSize: 12, color: colors.text.tertiary },
  likeCountRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  likeCountText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primaryLight,
  },

  // Replies section
  repliesSection: {
    marginLeft: 60,
    marginRight: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.layout.surfaceElevated,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },

  // Reply card
  replyCard: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  replyAvatarText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    color: 'white',
  },
  replyBody: { flex: 1 },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  replyAuthorMeta: { flex: 1 },
  replyAuthorName: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    color: colors.text.primary,
  },
  replyAuthorRole: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  replyTime: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.tertiary,
    marginLeft: 4,
  },
  replyContent: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 6,
  },
  replyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyActionBtn: { paddingVertical: 2 },
  replyActionText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.tertiary,
  },

  // Expand replies
  expandRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: spacing.sm,
  },
  expandRepliesText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primaryLight,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.layout.surface,
    borderTopWidth: 1,
    borderTopColor: colors.layout.divider,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  myAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  myAvatarImg: { width: '100%', height: '100%' },
  myAvatarText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.surfaceElevated,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    gap: spacing.xs,
  },
  textInput: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.text.tertiary },
});

export default CommentsScreen;
