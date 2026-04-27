import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import {
  Upload,
  Plus,
  Send,
  X,
  Newspaper,
  ExternalLink,
  Radio,
  Bell,
  FileText,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { NewsArticle, NewsType } from '../../types';
import {
  adminCreateNews,
  adminDeleteNews,
  adminGetNews,
  adminUpdateNews,
} from '../../services/admin';
import CustomLoader from '../../components/CustomLoader';
import NewsCard from '../../components/NewsCard';
import AdminHeader from '../../components/AdminHeader';
import Button from '../../components/Button';
import DeleteNewsModal from '../../components/modals/DeleteNewsModal';
import BentoFormTile from '../../components/BentoFormTile';
import InputField from '../../components/InputField';

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
  const [editingId, setEditingId] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchNews = async () => {
      try {
        const data = await adminGetNews();
        if (mounted) {
          setNews(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load news:', err);
        if (mounted) setLoading(false);
      }
    };
    fetchNews();
    return () => {
      mounted = false;
    };
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
      Toast.show({
        type: 'error',
        text1: 'Pick Failed',
        text2: 'Failed to pick image.',
      });
    }
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setLinkUrl('');
    setNewsType('news');
    setImageUri(null);
    setIsCreating(false);
    setEditingId(null);
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Title and Content are required.',
      });
      return;
    }

    setActionLoading(true);
    try {
      if (editingId) {
        const updated = await adminUpdateNews(editingId, {
          title,
          content,
          linkUrl,
          type: newsType,
          imageFile: imageUri,
        });
        setNews(prev => prev.map(n => (n.id === editingId ? updated : n)));
        Toast.show({
          type: 'success',
          text1: 'Updated',
          text2: 'Article updated successfully!',
        });
      } else {
        const created = await adminCreateNews({
          title,
          content,
          linkUrl,
          type: newsType,
          imageFile: imageUri,
        });
        setNews(prev => [created, ...prev]);
        Toast.show({
          type: 'success',
          text1: 'Published',
          text2: 'Article published successfully!',
        });
      }
      handleReset();
    } catch (error) {
      console.error('Publish error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to ${editingId ? 'update' : 'publish'} article.`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingId(article.id);
    setTitle(article.title);
    setContent(article.content);
    setLinkUrl(article.linkUrl || '');
    setNewsType(article.type);
    setImageUri(article.imageUrl || null);
    setIsCreating(true);
  };

  const handleDelete = (article: NewsArticle) => {
    setArticleToDelete(article);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;

    setIsDeleting(true);
    try {
      await adminDeleteNews(articleToDelete.id);
      setNews(prev => prev.filter(n => n.id !== articleToDelete.id));
      Toast.show({
        type: 'success',
        text1: 'Deleted',
        text2: 'Article deleted successfully.',
      });
      setIsDeleteModalVisible(false);
      setArticleToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete article.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderCreateForm = () => (
    <Modal
      visible={isCreating}
      animationType="slide"
      transparent={true}
      onRequestClose={handleReset}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Configure Broadcast' : 'Create New Article'}
            </Text>
            <TouchableOpacity onPress={handleReset} style={styles.closeBtn}>
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
            >
              <BentoFormTile
                icon={Newspaper}
                title="DISTRIBUTION"
                isValid={!!newsType}
              >
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeBtn,
                      newsType === 'news' && styles.typeBtnActiveNews,
                    ]}
                    onPress={() => setNewsType('news')}
                  >
                    <Text
                      style={[
                        styles.typeBtnText,
                        newsType === 'news' && styles.typeBtnTextActive,
                      ]}
                    >
                      EDITORIAL
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeBtn,
                      newsType === 'alert' && styles.typeBtnActiveAlert,
                    ]}
                    onPress={() => setNewsType('alert')}
                  >
                    <Text
                      style={[
                        styles.typeBtnText,
                        newsType === 'alert' && styles.typeBtnTextActive,
                      ]}
                    >
                      URGENT ALERT
                    </Text>
                  </TouchableOpacity>
                </View>
              </BentoFormTile>

              <BentoFormTile
                icon={Send}
                title="CONTENT"
                isValid={!!title && !!content}
              >
                <InputField
                  label="Headline"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter broadcast title..."
                  containerStyle={{ marginBottom: spacing.md }}
                />

                <InputField
                  label="Message body"
                  value={content}
                  onChangeText={setContent}
                  placeholder="Draft the full announcement..."
                  multiline
                  numberOfLines={4}
                  containerStyle={{ marginBottom: 0 }}
                />
              </BentoFormTile>

              <BentoFormTile
                icon={ExternalLink}
                title="ATTACHMENTS"
                isValid={!!linkUrl || !!imageUri}
              >
                <InputField
                  label="Reference link"
                  value={linkUrl}
                  onChangeText={setLinkUrl}
                  placeholder="https://..."
                  autoCapitalize="none"
                  keyboardType="url"
                  containerStyle={{ marginBottom: spacing.lg }}
                />

                <Text style={styles.label}>Cover Visual</Text>
                <TouchableOpacity
                  style={styles.imageUploadBtn}
                  onPress={handlePickImage}
                >
                  <Upload size={20} color={colors.brand.primary} />
                  <Text
                    style={[
                      styles.imageUploadText,
                      imageUri && {
                        color: colors.brand.primary,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {imageUri ? 'Visual Attached' : 'Select Network Asset'}
                  </Text>
                </TouchableOpacity>
              </BentoFormTile>

              <View style={styles.formActions}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Discard"
                    onPress={handleReset}
                    variant="outline"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title={editingId ? 'Update Intelligence' : 'Broadcast'}
                    onPress={handlePublish}
                    leftIcon={Send}
                    loading={actionLoading}
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <AdminHeader title="Broadcast Center" />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Intelligence Pulse Management */}
          <View style={styles.pulseWrapper}>
            <View style={styles.pulseMainCard}>
              <View style={styles.pulseIconContainer}>
                <Radio size={24} color="white" />
              </View>
              <View>
                <Text style={styles.pulseValue}>{news.length}</Text>
                <Text style={styles.pulseLabel}>TOTAL BROADCASTS</Text>
              </View>
            </View>

            <View style={styles.pulseSecondaryRow}>
              <View
                style={[
                  styles.pulseSubCard,
                  { backgroundColor: colors.palette.rose.bg },
                ]}
              >
                <View style={styles.pulseSubIconBox}>
                  <Bell size={18} color={colors.palette.rose.accent} />
                </View>
                <Text
                  style={[
                    styles.pulseSubValue,
                    { color: colors.palette.rose.accent },
                  ]}
                >
                  {news.filter(n => n.type === 'alert').length}
                </Text>
                <Text style={styles.pulseSubLabel}>INTEL ALERTS</Text>
              </View>

              <View
                style={[
                  styles.pulseSubCard,
                  { backgroundColor: colors.palette.indigo.bg },
                ]}
              >
                <View style={styles.pulseSubIconBox}>
                  <FileText size={18} color={colors.palette.indigo.accent} />
                </View>
                <Text
                  style={[
                    styles.pulseSubValue,
                    { color: colors.palette.indigo.accent },
                  ]}
                >
                  {news.filter(n => n.type === 'news').length}
                </Text>
                <Text style={styles.pulseSubLabel}>EDITORIALS</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setIsCreating(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.createBtnText}>Draft New Announcement</Text>
          </TouchableOpacity>

          {loading ? (
            <CustomLoader
              message="Synchronizing transmissions..."
              overlay={false}
              style={{ marginTop: 40 }}
            />
          ) : news.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No broadcasts on record.</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {news.map(article => (
                <NewsCard
                  key={article.id}
                  article={article}
                  isAdmin={true}
                  onDelete={() => handleDelete(article)}
                  onEdit={() => handleEdit(article)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {renderCreateForm()}

        <DeleteNewsModal
          visible={isDeleteModalVisible}
          onClose={() => {
            setIsDeleteModalVisible(false);
            setArticleToDelete(null);
          }}
          onConfirm={confirmDelete}
          article={articleToDelete}
          loading={isDeleting}
        />
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
  pulseWrapper: {
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  pulseMainCard: {
    backgroundColor: colors.brand.primary,
    borderRadius: 24,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  pulseIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseSecondaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pulseSubCard: {
    flex: 1,
    borderRadius: 22,
    padding: spacing.lg,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  pulseSubIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  pulseValue: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
  },
  pulseLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
    marginTop: 2,
  },
  pulseSubValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  pulseSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.primary,
    paddingVertical: spacing.md,
    borderRadius: 20,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
    gap: 8,
  },
  scrollContent: {
    paddingBottom: spacing.xxl * 2,
  },
  createBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
    opacity: 0.5,
  },
  emptyText: {
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
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
    borderColor: colors.ui.inputBorder,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.palette.slate.bg,
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
    borderColor: colors.ui.inputBorder,
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
    marginBottom: spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.layout.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  modalTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: 4,
  },
  formContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl * 2,
    paddingTop: spacing.lg,
  },
});

export default AdminNewsScreen;
