import React, { useEffect, useState, useMemo } from 'react';
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
  StatusBar,
} from 'react-native';
import { 
  Plus, 
  Trash2, 
  Send, 
  File, 
  Link2, 
  X, 
  Search, 
  Layers, 
  HardDrive, 
  FileText,
  Globe,
  PlusCircle,
  ArrowRight
} from 'lucide-react-native';
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
import BentoFormTile from '../../components/BentoFormTile';
import InputField from '../../components/InputField';

type InputMode = 'url' | 'file';

const AdminLibraryScreen = () => {
  const navigation = useNavigation();
  const { userProfile } = useAuth();

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Intelligence Pulse Stats
  const stats = useMemo(() => {
    return {
      total: resources.length,
      pdfs: resources.filter(r => r.type === 'pdf').length,
      links: resources.filter(r => r.type === 'link' || r.type === 'video').length,
      training: resources.filter(r => r.category === 'training').length,
    };
  }, [resources]);

  const filteredResources = useMemo(() => {
    let result = resources;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.category.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [resources, searchQuery]);

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
    if (!bytes) return 'Scalable';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Asset title is missing.' });
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
          Toast.show({ type: 'error', text1: 'Upload Failed', text2: 'Cloud uplink failed.' });
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
        Toast.show({ type: 'success', text1: 'Asset Updated', text2: 'Library intelligence synchronized.' });
      } else {
        await addResourceItem({
          title,
          description,
          url: finalUrl,
          category,
          type: resourceType,
          createdBy: userProfile?.uid || 'Admin',
        });
        Toast.show({ type: 'success', text1: 'Asset Published', text2: 'New intelligence added to library.' });
      }

      handleReset();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Operation Failed', text2: 'Firebase interaction error.' });
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
      Toast.show({ type: 'success', text1: 'Asset Purged', text2: 'Resource removed from ecosystem.' });
      setIsDeleteModalVisible(false);
      setResourceToDelete(null);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Purge Failed', text2: 'Resource remains in repository.' });
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
    setInputMode(item.url?.includes('cloudinary') ? 'file' : 'url');
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
            <View>
              <Text style={styles.modalTitle}>{editingId ? 'Configure Asset' : 'Ingest Resource'}</Text>
              <Text style={styles.modalSub}>{editingId ? 'Refining existing library intelligence' : 'Adding strategic data to ecosystem'}</Text>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.closeBtn}>
              <X size={20} color={colors.text.primary} />
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
              <BentoFormTile icon={Layers} title="CORE CONTEXT" isValid={title.length > 2}>
                <InputField
                  label="Asset Title"
                  placeholder="e.g. Clinical Protocol 2024"
                  value={title}
                  onChangeText={setTitle}
                />
                <InputField
                  label="Intelligence Summary"
                  placeholder="Key takeaways and summary..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.innerLabel}>Classification</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                  {(['guideline', 'training', 'presentation', 'other'] as ResourceCategory[]).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.pill, category === cat && styles.pillActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>
                        {cat.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </BentoFormTile>

              <BentoFormTile icon={HardDrive} title="DATA SOURCE" isValid={inputMode === 'file' ? !!pickedFile || !!editingId : !!url}>
                <View style={styles.modeToggleRow}>
                  <TouchableOpacity
                    style={[styles.modeToggleBtn, inputMode === 'file' && styles.modeToggleBtnActive]}
                    onPress={() => setInputMode('file')}
                  >
                    <File size={16} color={inputMode === 'file' ? 'white' : colors.text.tertiary} />
                    <Text style={[styles.modeToggleText, inputMode === 'file' && styles.modeToggleTextActive]}>Uplink File</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeToggleBtn, inputMode === 'url' && styles.modeToggleBtnActive]}
                    onPress={() => setInputMode('url')}
                  >
                    <Link2 size={16} color={inputMode === 'url' ? 'white' : colors.text.tertiary} />
                    <Text style={[styles.modeToggleText, inputMode === 'url' && styles.modeToggleTextActive]}>External Link</Text>
                  </TouchableOpacity>
                </View>

                {inputMode === 'file' ? (
                  pickedFile ? (
                    <View style={styles.fileCard}>
                      <View style={styles.fileIconBox}>
                        <FileText size={20} color={colors.brand.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fileName} numberOfLines={1}>{pickedFile.name}</Text>
                        <Text style={styles.fileMeta}>{formatFileSize(pickedFile.size)} • Cloud Secured</Text>
                      </View>
                      <TouchableOpacity onPress={() => setPickedFile(null)} style={styles.fileRemove}>
                        <X size={16} color={colors.status.error} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.uploadArea} onPress={handlePickDocument}>
                      <View style={styles.uploadIconWrap}>
                        <PlusCircle size={28} color={colors.brand.primary} />
                      </View>
                      <Text style={styles.uploadTitle}>Initialize Document Ingest</Text>
                      <Text style={styles.uploadSub}>PDF, DOC, XLS, PPT (Max 10MB)</Text>
                    </TouchableOpacity>
                  )
                ) : (
                  <InputField
                    label="Resource URL"
                    placeholder="https://isop.org/resource-node..."
                    value={url}
                    onChangeText={setUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                    leftIcon={Globe}
                  />
                )}
              </BentoFormTile>

              {uploadProgress && (
                <View style={styles.uplinkBanner}>
                  <CustomLoader size={16} overlay={false} color={colors.brand.primary} />
                  <Text style={styles.uplinkText}>Synchronizing with Cloud Repository...</Text>
                </View>
              )}

              <View style={styles.footerActions}>
                <Button 
                  title={editingId ? "Update Intelligence" : "Broadcast Asset"} 
                  onPress={handlePublish} 
                  loading={actionLoading}
                  leftIcon={Send}
                  style={styles.publishBtn}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <UserHeader
        title="Intelligence Base"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showActions={false}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intelligence Hub Dashboard */}
        <View style={styles.hubContainer}>
          <View style={styles.hubHeader}>
            <View>
              <Text style={styles.hubTitle}>Intelligence Pulse</Text>
              <Text style={styles.hubSub}>{stats.total} Strategic Assets Online</Text>
            </View>
            <TouchableOpacity style={styles.hubAdd} onPress={() => setIsCreating(true)}>
              <Plus size={18} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: colors.status.error + '10' }]}>
                <FileText size={18} color={colors.status.error} />
              </View>
              <Text style={styles.metricValue}>{stats.pdfs}</Text>
              <Text style={styles.metricLabel}>PDF Docs</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: colors.brand.secondary + '10' }]}>
                <Globe size={18} color={colors.brand.secondary} />
              </View>
              <Text style={styles.metricValue}>{stats.links}</Text>
              <Text style={styles.metricLabel}>External</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: colors.status.success + '10' }]}>
                <Layers size={18} color={colors.status.success} />
              </View>
              <Text style={styles.metricValue}>{stats.training}</Text>
              <Text style={styles.metricLabel}>Training</Text>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Search size={18} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search intelligence base..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <CustomLoader message="Decrypting repository..." overlay={false} style={{ marginTop: 40 }} />
        ) : filteredResources.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <HardDrive size={40} color={colors.layout.divider} />
            </View>
            <Text style={styles.emptyText}>Intelligence repository empty.</Text>
            <Text style={styles.emptySub}>No assets match your current parameters.</Text>
          </View>
        ) : (
          <View style={styles.resourceList}>
            {filteredResources.map(item => (
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hubContainer: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
    }),
  },
  hubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  hubTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -0.5,
    fontFamily: typography.fontFamily,
  },
  hubSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginTop: 2,
    fontFamily: typography.fontFamily,
  },
  hubAdd: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.layout.background,
    borderRadius: 20,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.5)',
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.background,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    padding: 0,
  },
  resourceList: {
    gap: spacing.md,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: colors.layout.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  emptySub: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontFamily: typography.fontFamily,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.layout.background,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    height: '92%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    letterSpacing: -0.5,
  },
  modalSub: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginTop: 2,
    fontFamily: typography.fontFamily,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.layout.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  formContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 3,
  },
  innerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginTop: spacing.md,
    marginLeft: 4,
  },
  catScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'white',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: colors.layout.divider,
  },
  pillActive: {
    backgroundColor: colors.brand.primary + '08',
    borderColor: colors.brand.primary,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.tertiary,
  },
  pillTextActive: {
    color: colors.brand.primary,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.lg,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: colors.layout.divider,
  },
  modeToggleBtnActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
  modeToggleTextActive: {
    color: 'white',
  },
  uploadArea: {
    height: 160,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.brand.primary + '20',
    backgroundColor: colors.brand.primary + '03',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  uploadIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.brand.primary + '08',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
  },
  uploadSub: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: spacing.md,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.brand.primary + '20',
  },
  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand.primary + '08',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  fileMeta: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
    fontWeight: '600',
    fontFamily: typography.fontFamily,
  },
  fileRemove: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.status.error + '08',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uplinkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.brand.primary + '08',
    padding: 16,
    borderRadius: 20,
    marginVertical: spacing.md,
  },
  uplinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
  },
  footerActions: {
    marginTop: spacing.xl,
  },
  publishBtn: {
    height: 60,
    borderRadius: 20,
  },
});

export default AdminLibraryScreen;
