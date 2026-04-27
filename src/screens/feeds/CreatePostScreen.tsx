import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Switch,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Globe,
  ChevronDown,
  ImagePlus,
  Video,
  FileText,
  BarChart2,
  MoreHorizontal,
  MessageSquare,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

type Audience = 'Public' | 'Anyone' | 'Connections';

const CreatePostScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { userProfile } = useAuth();

  const [postText, setPostText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [audience, setAudience] = useState<Audience>('Public');
  const [allowComments, setAllowComments] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const getInitial = () =>
    userProfile?.displayName?.charAt(0).toUpperCase() || 'U';

  // ── Image Picker ─────────────────────────────────────────────────────────────

  const handlePickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 4, quality: 0.8 },
      response => {
        if (response.didCancel || response.errorCode) return;
        const uris = (response.assets || [])
          .map(a => a.uri)
          .filter(Boolean) as string[];
        setImages(prev => [...prev, ...uris].slice(0, 4));
      },
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handlePost = async () => {
    if (!postText.trim() && images.length === 0) {
      Alert.alert('Empty Post', 'Write something or add an image to post.');
      return;
    }
    setPosting(true);
    // TODO: integrate with Firestore feedService
    await new Promise(r => setTimeout(() => r(null), 1200));
    setPosting(false);
    navigation.goBack();
  };

  // ── Image Grid ────────────────────────────────────────────────────────────────

  const renderImageGrid = () => {
    if (images.length === 0) return null;

    if (images.length === 1) {
      return (
        <View style={styles.imageGrid}>
          <TouchableOpacity
            style={styles.imageFullWidth}
            onPress={() => handleRemoveImage(0)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: images[0] }} style={styles.imageFullWidth} resizeMode="cover" />
            <View style={styles.imageRemoveBadge}>
              <X size={12} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    if (images.length === 2) {
      return (
        <View style={[styles.imageGrid, styles.imageRow]}>
          {images.map((uri, i) => (
            <TouchableOpacity
              key={i}
              style={styles.imageHalf}
              onPress={() => handleRemoveImage(i)}
              activeOpacity={0.9}
            >
              <Image source={{ uri }} style={styles.imageHalf} resizeMode="cover" />
              <View style={styles.imageRemoveBadge}>
                <X size={12} color="white" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // 3 or 4 images: first row = 2 halves, second row = full or 2 halves
    const topRow = images.slice(0, 2);
    const bottomRow = images.slice(2);
    return (
      <View style={styles.imageGrid}>
        <View style={styles.imageRow}>
          {topRow.map((uri, i) => (
            <TouchableOpacity
              key={i}
              style={styles.imageHalf}
              onPress={() => handleRemoveImage(i)}
              activeOpacity={0.9}
            >
              <Image source={{ uri }} style={styles.imageHalf} resizeMode="cover" />
              <View style={styles.imageRemoveBadge}>
                <X size={12} color="white" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.imageRow}>
          {bottomRow.map((uri, i) => (
            <TouchableOpacity
              key={i + 2}
              style={bottomRow.length === 1 ? styles.imageFullWidth : styles.imageHalf}
              onPress={() => handleRemoveImage(i + 2)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri }}
                style={bottomRow.length === 1 ? styles.imageFullWidth : styles.imageHalf}
                resizeMode="cover"
              />
              <View style={styles.imageRemoveBadge}>
                <X size={12} color="white" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // ── Audience Picker ───────────────────────────────────────────────────────────

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

        <Text style={styles.headerTitle}>Create Post</Text>

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
                  <Text style={styles.avatarText}>{getInitial()}</Text>
                </View>
              )}
              <View style={styles.onlineDot} />
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
            placeholder="Share an update, clinical observation, or recent finding..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            autoFocus
            value={postText}
            onChangeText={setPostText}
            textAlignVertical="top"
          />

          {/* ── Image Grid ────────────────────────────────────────────────── */}
          {renderImageGrid()}
        </ScrollView>

        {/* ── Allow Comments Toggle ─────────────────────────────────────────── */}
        <View style={styles.commentsRow}>
          <MessageSquare size={18} color={colors.text.secondary} />
          <Text style={styles.commentsLabel}>Allow comments on this post</Text>
          <Switch
            value={allowComments}
            onValueChange={setAllowComments}
            trackColor={{ false: colors.layout.divider, true: colors.brand.primaryLight }}
            thumbColor="white"
          />
        </View>

        {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
        <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={handlePickImage}
            activeOpacity={0.7}
          >
            <ImagePlus size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.toolbarBtn} activeOpacity={0.7}>
            <Video size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarBtn} activeOpacity={0.7}>
            <FileText size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarBtn} activeOpacity={0.7}>
            <BarChart2 size={24} color={colors.text.secondary} />
          </TouchableOpacity> */}

          {images.length > 0 && (
            <TouchableOpacity style={styles.toolbarBtn} activeOpacity={0.7}>
              <MoreHorizontal size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
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
    backgroundColor: colors.layout.background,
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 17,
    fontWeight: '800',
    color: colors.brand.primary,
    letterSpacing: -0.3,
  },
  postBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.round,
    minWidth: 72,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
    }),
  },
  postBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
  },

  // Body
  body: { flex: 1, backgroundColor: colors.layout.surface },
  bodyContent: { padding: spacing.md, paddingBottom: spacing.xl },

  // Author
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.status.success,
    borderWidth: 2,
    borderColor: 'white',
  },
  authorMeta: { gap: 6 },
  authorName: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  audiencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: colors.layout.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.round,
  },
  audienceText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },

  // Audience dropdown
  audienceDropdown: {
    backgroundColor: colors.layout.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
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
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 26,
    minHeight: 160,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },

  // Image grid
  imageGrid: { marginBottom: spacing.md, gap: 4 },
  imageRow: { flexDirection: 'row', gap: 4 },
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
  imageRemoveBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Comments toggle
  commentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.layout.divider,
    backgroundColor: colors.layout.surface,
    gap: spacing.sm,
  },
  commentsLabel: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },

  // Toolbar
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.layout.divider,
    backgroundColor: colors.layout.surface,
    gap: spacing.xs,
  },
  toolbarBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
  },
});

export default CreatePostScreen;
