import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Globe,
  ChevronDown,
  ImagePlus,
  Video,
  FileText,
  MoreHorizontal,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

type Audience = 'Public' | 'Anyone' | 'Connections';

const SharePostScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { userProfile } = useAuth();
  
  const originalPost = route.params?.post;

  const [postText, setPostText] = useState('');
  const [audience, setAudience] = useState<Audience>('Anyone');
  const [posting, setPosting] = useState(false);
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const getInitial = (name?: string) => name?.charAt(0).toUpperCase() || 'U';

  const handlePost = async () => {
    setPosting(true);
    // Simulate API call
    await new Promise(r => setTimeout(() => r(null), 1200));
    setPosting(false);
    navigation.goBack();
  };

  const audiences: Audience[] = ['Public', 'Anyone', 'Connections'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <X size={22} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Share Post</Text>

        <TouchableOpacity
          style={[styles.postBtn, posting && { opacity: 0.7 }]}
          onPress={handlePost}
          disabled={posting}
          activeOpacity={0.85}
        >
          {posting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Author Row ─────────────────────────────────────────────────── */}
          <View style={styles.authorRow}>
            <View style={styles.avatarWrap}>
              {userProfile?.profileImage ? (
                <Image
                  source={{ uri: userProfile.profileImage }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{getInitial(userProfile?.displayName)}</Text>
                </View>
              )}
            </View>

            <View style={styles.authorMeta}>
              <Text style={styles.authorName}>
                {userProfile?.displayName || 'You'}
              </Text>
              <TouchableOpacity
                style={styles.audiencePill}
                onPress={() => setShowAudiencePicker(v => !v)}
                activeOpacity={0.7}
              >
                <Globe size={13} color={colors.text.secondary} />
                <Text style={styles.audienceText}>{audience}</Text>
                <ChevronDown size={13} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Audience Dropdown ──────────────────────────────────────────── */}
          {showAudiencePicker && (
            <View style={styles.audienceDropdown}>
              {audiences.map(a => (
                <TouchableOpacity
                  key={a}
                  style={[
                    styles.audienceOption,
                    audience === a && styles.audienceOptionActive,
                  ]}
                  onPress={() => {
                    setAudience(a);
                    setShowAudiencePicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Globe
                    size={14}
                    color={audience === a ? colors.brand.primary : colors.text.tertiary}
                  />
                  <Text
                    style={[
                      styles.audienceOptionText,
                      audience === a && styles.audienceOptionTextActive,
                    ]}
                  >
                    {a}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Text Input ────────────────────────────────────────────────── */}
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Add your thoughts..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            autoFocus
            value={postText}
            onChangeText={setPostText}
            textAlignVertical="top"
          />

          {/* ── Original Post Preview ──────────────────────────────────────── */}
          {originalPost && (
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View style={[styles.previewAvatar, { backgroundColor: originalPost.authorColor || colors.brand.primary }]}>
                  {originalPost.authorProfileImage ? (
                    <Image source={{ uri: originalPost.authorProfileImage }} style={styles.previewAvatarImg} />
                  ) : (
                    <Text style={styles.previewAvatarText}>{originalPost.authorInitials || getInitial(originalPost.authorName)}</Text>
                  )}
                </View>
                <View style={styles.previewMeta}>
                  <Text style={styles.previewAuthorName}>{originalPost.authorName}</Text>
                  <Text style={styles.previewAuthorRole} numberOfLines={2}>
                    {originalPost.authorRole} • {originalPost.timeAgo?.toLowerCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.previewContent}>
                {originalPost.content}
              </Text>
              
              {originalPost.imageUrl && (
                <Image 
                  source={{ uri: originalPost.imageUrl }} 
                  style={styles.previewImage} 
                  resizeMode="cover" 
                />
              )}
            </View>
          )}
        </ScrollView>

        {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
        <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <TouchableOpacity style={styles.toolbarBtn} activeOpacity={0.7}>
            <ImagePlus size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarBtn} activeOpacity={0.7}>
            <Video size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarBtn} activeOpacity={0.7}>
            <FileText size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarBtn} activeOpacity={0.7}>
            <MoreHorizontal size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.layout.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  postBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  postBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },

  // Body
  body: { flex: 1, backgroundColor: '#F8F9FA' },
  bodyContent: { padding: spacing.lg, paddingBottom: spacing.xl },

  // Author
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  authorMeta: { gap: 4 },
  authorName: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  audiencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  audienceText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },

  // Audience dropdown
  audienceDropdown: {
    backgroundColor: colors.layout.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    marginBottom: spacing.md,
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  audienceOptionActive: { backgroundColor: 'rgba(30,58,138,0.05)' },
  audienceOptionText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  audienceOptionTextActive: { color: colors.brand.primary },

  // Text input
  textInput: {
    fontFamily: typography.fontFamily,
    fontSize: 17,
    color: '#334155',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },

  // Preview Card
  previewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  previewAvatarImg: {
    width: '100%',
    height: '100%',
  },
  previewAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  previewMeta: {
    flex: 1,
  },
  previewAuthorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  previewAuthorRole: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  previewContent: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },

  // Toolbar
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 24,
  },
  toolbarBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SharePostScreen;
