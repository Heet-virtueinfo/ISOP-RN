import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Upload, Plus, Trash2, Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
// @ts-ignore
import { launchImageLibrary } from 'react-native-image-picker';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { NewsArticle, NewsType } from '../../types';
import {
  addNewsArticle,
  deleteNewsArticle,
  listenToAllNews,
} from '../../services/newsService';
import CustomLoader from '../../components/CustomLoader';
import NewsCard from '../../components/NewsCard';
import UserHeader from '../../components/UserHeader';
import Button from '../../components/Button';

const AdminNewsScreen = () => {
  const navigation = useNavigation();
  const { userProfile } = useAuth();

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [newsType, setNewsType] = useState<NewsType>('news');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToAllNews(data => {
      setNews(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri || null);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Validation', 'Title and Content are required.');
      return;
    }

    setActionLoading(true);
    try {
      await addNewsArticle({
        title,
        content,
        linkUrl,
        type: newsType,
        imageUrl: imageUri,
        createdBy: userProfile?.uid || 'Admin',
      });
      // Reset form
      setTitle('');
      setContent('');
      setLinkUrl('');
      setNewsType('news');
      setImageUri(null);
      setIsCreating(false);
      Alert.alert('Success', 'Article published successfully!');
    } catch (error) {
      console.error('Publish error:', error);
      Alert.alert('Error', 'Failed to publish article.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id: string, itemTitle: string) => {
    Alert.alert(
      'Delete Article',
      `Are you sure you want to delete "${itemTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNewsArticle(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete article.');
            }
          },
        },
      ]
    );
  };

  const renderCreateForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create New Article</Text>

      <Text style={styles.label}>Type</Text>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeBtn, newsType === 'news' && styles.typeBtnActiveNews]}
          onPress={() => setNewsType('news')}
        >
          <Text style={[styles.typeBtnText, newsType === 'news' && styles.typeBtnTextActive]}>
            General News
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, newsType === 'alert' && styles.typeBtnActiveAlert]}
          onPress={() => setNewsType('alert')}
        >
          <Text style={[styles.typeBtnText, newsType === 'alert' && styles.typeBtnTextActive]}>
            Urgent Alert
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter headline..."
        placeholderTextColor={colors.text.tertiary}
      />

      <Text style={styles.label}>Content *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={content}
        onChangeText={setContent}
        placeholder="Write the full announcement..."
        placeholderTextColor={colors.text.tertiary}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.label}>External Link (Optional)</Text>
      <TextInput
        style={styles.input}
        value={linkUrl}
        onChangeText={setLinkUrl}
        placeholder="https://..."
        placeholderTextColor={colors.text.tertiary}
        autoCapitalize="none"
        keyboardType="url"
      />

      <Text style={styles.label}>Cover Image (Optional)</Text>
      <TouchableOpacity style={styles.imageUploadBtn} onPress={handlePickImage}>
        <Upload size={20} color={colors.text.tertiary} />
        <Text style={styles.imageUploadText}>
          {imageUri ? 'Image Selected (Tap to change)' : 'Upload from Library'}
        </Text>
      </TouchableOpacity>

      <View style={styles.formActions}>
        <View style={{ flex: 1 }}>
          <Button title="Cancel" onPress={() => setIsCreating(false)} variant="outline" />
        </View>
        <View style={{ flex: 1 }}>
          <Button title="Publish" onPress={handlePublish} leftIcon={Send} loading={actionLoading} />
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <UserHeader title="Manage News & Alerts" showBack={true} onBackPress=
          {() => navigation.goBack()} showActions={false} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isCreating ? (
            renderCreateForm()
          ) : (
            <>
              <TouchableOpacity style={styles.createBtn} onPress={() => setIsCreating(true)}>
                <Plus size={20} color="white" />
                <Text style={styles.createBtnText}>Create Announcement</Text>
              </TouchableOpacity>

              {loading ? (
                <CustomLoader message="Loading articles..." overlay={false} style={{ marginTop: 40 }} />
              ) : news.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No news published yet.</Text>
                </View>
              ) : (
                <View style={styles.listContainer}>
                  {news.map(article => (
                    <View key={article.id} style={styles.adminCardOuter}>
                      <NewsCard article={article} />
                      <TouchableOpacity
                        style={styles.deleteOverlay}
                        onPress={() => handleDelete(article.id, article.title)}
                      >
                        <Trash2 size={20} color={colors.status.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 50 : spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.layout.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    gap: 8,
  },
  createBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
    fontSize: 14,
  },
  listContainer: {
    gap: spacing.md,
  },
  adminCardOuter: {
    position: 'relative',
  },
  deleteOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  formContainer: {
    backgroundColor: colors.layout.surface,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  formTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  typeBtnActiveNews: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  typeBtnActiveAlert: {
    backgroundColor: colors.status.error,
    borderColor: colors.status.error,
  },
  typeBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  typeBtnTextActive: {
    color: 'white',
  },
  input: {
    backgroundColor: colors.palette.slate.bg,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
  },
  textArea: {
    height: 120,
    paddingTop: spacing.md,
  },
  imageUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.palette.slate.bg,
  },
  imageUploadText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});

export default AdminNewsScreen;
