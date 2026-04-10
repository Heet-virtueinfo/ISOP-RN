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
  Modal,
} from 'react-native';
import { Plus, Trash2, Send, File, Link2, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
// @ts-ignore
import { pick, types, isCancel } from '@react-native-documents/picker';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { ResourceItem, ResourceCategory, ResourceType } from '../../types';
import {
  addResourceItem,
  deleteResourceItem,
  listenToResources,
  updateResourceItem,
} from '../../services/resourceService';
import { uploadDocumentToCloudinary } from '../../services/uploadService';
import CustomLoader from '../../components/CustomLoader';
import ResourceCard from '../../components/ResourceCard';
import UserHeader from '../../components/UserHeader';
import Button from '../../components/Button';
import DeleteResourceModal from '../../components/modals/DeleteResourceModal';

type InputMode = 'url' | 'file';

const AdminLibraryScreen = () => {
  const navigation = useNavigation();
  const { userProfile } = useAuth();

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('guideline');
  const [resourceType, setResourceType] = useState<ResourceType>('pdf');
  const [inputMode, setInputMode] = useState<InputMode>('file');

  // File upload state
  const [pickedFile, setPickedFile] = useState<{
    name: string;
    uri: string;
    type: string;
    size?: number;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Deletion state
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<ResourceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToResources(data => {
      setResources(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePickDocument = async () => {
    try {
      const result = await pick({
        type: [
          types.pdf,
          types.doc,
          types.docx,
          types.xls,
          types.xlsx,
          types.ppt,
          types.pptx,
          types.plainText,
        ],
        allowMultiSelection: false,
      });

      const file = result[0];
      setPickedFile({
        name: file.name || 'document',
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        size: file.size ?? undefined,
      });

      // Auto-detect resource type from mime type
      if (file.type?.includes('pdf')) {
        setResourceType('pdf');
      } else {
        setResourceType('link');
      }
    } catch (err: any) {
      if (!isCancel(err)) {
        console.error('Document picker error:', err);
        Toast.show({
          type: 'error',
          text1: 'Pick Failed',
          text2: 'Failed to pick document.'
        });
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Title is required.'
      });
      return;
    }

    if (inputMode === 'url' && !url.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'URL is required.'
      });
      return;
    }

    if (inputMode === 'file' && !pickedFile && !editingId) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please pick a file to upload.'
      });
      return;
    }

    setActionLoading(true);
    try {
      let finalUrl = url;

      if (inputMode === 'file' && pickedFile) {
        setUploadProgress(true);
        const uploadedUrl = await uploadDocumentToCloudinary(
          pickedFile.uri,
          pickedFile.name,
          pickedFile.type,
          'isop-library'
        );
        setUploadProgress(false);

        if (!uploadedUrl) {
          Toast.show({
            type: 'error',
            text1: 'Upload Failed',
            text2: 'Could not upload the file. Please try again.'
          });
          setActionLoading(false);
          return;
        }
        finalUrl = uploadedUrl;
      }

      if (editingId) {
        await updateResourceItem(editingId, {
          title,
          description,
          url: finalUrl,
          category,
          type: resourceType,
        });
        Toast.show({
          type: 'success',
          text1: 'Updated',
          text2: 'Resource updated successfully!'
        });
      } else {
        await addResourceItem({
          title,
          description,
          url: finalUrl,
          category,
          type: resourceType,
          createdBy: userProfile?.uid || 'Admin',
        });
        Toast.show({
          type: 'success',
          text1: 'Published',
          text2: 'Resource published successfully!'
        });
      }

      handleReset();
    } catch (error) {
      console.error('Publish error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to ${editingId ? 'update' : 'publish'} resource.`
      });
    } finally {
      setActionLoading(false);
      setUploadProgress(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setUrl('');
    setCategory('guideline');
    setResourceType('pdf');
    setPickedFile(null);
    setInputMode('file');
    setIsCreating(false);
    setEditingId(null);
  };

  const handleDelete = (resource: ResourceItem) => {
    setResourceToDelete(resource);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) return;

    setIsDeleting(true);
    try {
      await deleteResourceItem(resourceToDelete.id);
      Toast.show({
        type: 'success',
        text1: 'Deleted',
        text2: 'Resource deleted successfully.',
      });
      setIsDeleteModalVisible(false);
      setResourceToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete resource.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (item: ResourceItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || '');
    setUrl(item.url || '');
    setCategory(item.category);
    setResourceType(item.type);
    setInputMode(item.url?.includes('cloudinary') ? 'file' : 'url'); // Basic heuristic
    setIsCreating(true);
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
            <Text style={styles.modalTitle}>{editingId ? 'Edit Resource' : 'Add Resource'}</Text>
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
              {/* Category selector */}
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                {(['guideline', 'training', 'presentation', 'other'] as ResourceCategory[]).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.pill, category === cat && styles.pillActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Title */}
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Document title..."
                placeholderTextColor={colors.text.tertiary}
              />

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Short description..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                textAlignVertical="top"
              />

              {/* Mode Toggle */}
              <Text style={styles.label}>Source</Text>
              <View style={styles.modeToggleRow}>
                <TouchableOpacity
                  style={[styles.modeToggleBtn, inputMode === 'file' && styles.modeToggleBtnActive]}
                  onPress={() => setInputMode('file')}
                >
                  <File size={16} color={inputMode === 'file' ? 'white' : colors.text.tertiary} />
                  <Text style={[styles.modeToggleText, inputMode === 'file' && styles.modeToggleTextActive]}>Upload File</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeToggleBtn, inputMode === 'url' && styles.modeToggleBtnActive]}
                  onPress={() => setInputMode('url')}
                >
                  <Link2 size={16} color={inputMode === 'url' ? 'white' : colors.text.tertiary} />
                  <Text style={[styles.modeToggleText, inputMode === 'url' && styles.modeToggleTextActive]}>Enter URL</Text>
                </TouchableOpacity>
              </View>

              {/* File Upload Area */}
              {inputMode === 'file' && (
                pickedFile ? (
                  <View style={styles.filePickedCard}>
                    <File size={24} color={colors.brand.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.filePickedName} numberOfLines={1}>{pickedFile.name}</Text>
                      <Text style={styles.filePickedSize}>{formatFileSize(pickedFile.size)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setPickedFile(null)} style={styles.filePickedRemove}>
                      <X size={18} color={colors.status.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.filePickerBtn} onPress={handlePickDocument}>
                    <File size={28} color={colors.brand.primary} />
                    <Text style={styles.filePickerTitle}>Tap to pick a document</Text>
                    <Text style={styles.filePickerSub}>PDF, Word (.doc/.docx), Excel (.xls/.xlsx), PowerPoint, TXT</Text>
                  </TouchableOpacity>
                )
              )}

              {/* URL Input */}
              {inputMode === 'url' && (
                <>
                  <Text style={styles.label}>Resource URL *</Text>
                  <TextInput
                    style={styles.input}
                    value={url}
                    onChangeText={setUrl}
                    placeholder="https://..."
                    placeholderTextColor={colors.text.tertiary}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </>
              )}

              {uploadProgress && (
                <View style={styles.uploadingBanner}>
                  <CustomLoader size={16} overlay={false} color={colors.brand.primary} />
                  <Text style={styles.uploadingText}>Uploading to cloud...</Text>
                </View>
              )}

              <View style={styles.formActions}>
                <View style={{ flex: 1 }}>
                  <Button title="Cancel" onPress={handleReset} variant="outline" />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title={editingId ? "Update" : "Publish"}
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
        <UserHeader
          title="Manage Library"
          showBack={true}
          onBackPress={() => navigation.goBack()}
          showActions={false}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.createBtn} onPress={() => setIsCreating(true)}>
            <Plus size={20} color="white" />
            <Text style={styles.createBtnText}>Add Resource</Text>
          </TouchableOpacity>

          {loading ? (
            <CustomLoader message="Loading library..." overlay={false} style={{ marginTop: 40 }} />
          ) : resources.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No resources added yet.</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {resources.map(item => (
                <ResourceCard
                  key={item.id}
                  resource={item}
                  isAdmin={true}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {renderCreateForm()}

        <DeleteResourceModal
          visible={isDeleteModalVisible}
          onClose={() => {
            setIsDeleteModalVisible(false);
            setResourceToDelete(null);
          }}
          onConfirm={confirmDelete}
          resource={resourceToDelete}
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
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.palette.slate.bg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
  },
  pillActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  pillText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  pillTextActive: {
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
    height: 80,
    paddingTop: spacing.md,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
    backgroundColor: colors.palette.slate.bg,
  },
  modeToggleBtnActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  modeToggleText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  modeToggleTextActive: {
    color: 'white',
  },
  filePickerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.brand.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.sm,
    backgroundColor: 'rgba(79, 70, 229, 0.03)',
    gap: 8,
  },
  filePickerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  filePickerSub: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  filePickedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderWidth: 1,
    borderColor: colors.brand.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  filePickedName: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  filePickedSize: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  filePickedRemove: {
    padding: 4,
  },
  uploadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(79, 70, 229, 0.06)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  uploadingText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.brand.primary,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.layout.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  modalTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  closeBtn: {
    padding: 4,
  },
  formContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
});

export default AdminLibraryScreen;
