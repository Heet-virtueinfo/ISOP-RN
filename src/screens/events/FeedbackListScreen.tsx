import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  MessageSquare,
  User,
  Clock,
  CheckCircle2,
  Eye,
  MoreVertical,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { colors, spacing, typography } from '../../theme';
import {
  getEventFeedback,
  updateFeedbackStatus,
} from '../../services/feedbackService';
import { Feedback } from '../../types';
import StarRating from '../../components/StarRating';
import CustomLoader from '../../components/CustomLoader';
import AdminHeader from '../../components/AdminHeader';

const FeedbackListScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { eventId, eventTitle } = route.params;

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Management State
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchFeedback = async () => {
      const data = await getEventFeedback(eventId);
      if (isMounted) {
        setFeedbacks(data);
        setLoading(false);
      }
    };

    fetchFeedback();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const handleStatusChange = async (
    status: 'pending' | 'reviewed' | 'resolved',
  ) => {
    if (!selectedFeedback) return;

    setIsUpdating(true);
    try {
      await updateFeedbackStatus(selectedFeedback.id, status);
      Toast.show({
        type: 'success',
        text1: 'Status Synchronized',
        text2: `Review marked as ${status.toUpperCase()}.`,
      });
      setIsStatusModalVisible(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Repository interaction error.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const statusColors = {
    pending: {
      bg: colors.palette.amber.bg,
      text: colors.palette.amber.accent,
      icon: Clock,
    },
    reviewed: {
      bg: colors.palette.indigo.bg,
      text: colors.palette.indigo.accent,
      icon: Eye,
    },
    resolved: {
      bg: colors.palette.emerald.bg,
      text: colors.palette.emerald.accent,
      icon: CheckCircle2,
    },
  };

  const renderFeedback = ({ item }: { item: Feedback }) => {
    const dateStr = item.createdAt?.toDate
      ? item.createdAt
          .toDate()
          .toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
      : new Date(item.createdAt).toLocaleDateString();

    const currentStatus = item.status || 'pending';
    const statusCfg = statusColors[currentStatus as keyof typeof statusColors];
    const StatusIcon = statusCfg.icon;

    return (
      <View style={styles.feedbackCard}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarWrap} activeOpacity={0.7}>
            {item.userImage ? (
              <Image source={{ uri: item.userImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <User size={18} color={colors.brand.primary} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.userName}
              </Text>
              <TouchableOpacity
                style={styles.menuBtn}
                onPress={() => {
                  setSelectedFeedback(item);
                  setIsStatusModalVisible(true);
                }}
              >
                <MoreVertical size={16} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>
            <View style={styles.metaRow}>
              <StarRating rating={item.rating} size={12} />
              <View style={styles.dot} />
              <Text style={styles.date}>{dateStr}</Text>
            </View>
          </View>
        </View>

        {item.comment ? (
          <View style={styles.commentBox}>
            <Text style={styles.comment}>{item.comment}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <StatusIcon size={12} color={statusCfg.text} />
            <Text style={[styles.statusLabel, { color: statusCfg.text }]}>
              {currentStatus.toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionLink}
            onPress={() => {
              setSelectedFeedback(item);
              setIsStatusModalVisible(true);
            }}
          >
            <Text style={styles.actionLinkText}>Update Progress</Text>
            <ChevronRight size={14} color={colors.brand.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Event Reviews"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <CustomLoader
          message="Gathering intelligence..."
          overlay={false}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={item => item.id}
          renderItem={renderFeedback}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <MessageSquare size={40} color={colors.text.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>Secure Area Empty</Text>
              <Text style={styles.emptyText}>
                No executive feedback has been registered for this event yet.
              </Text>
            </View>
          }
        />
      )}

      {/* Status Picker Modal */}
      <Modal
        visible={isStatusModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIndicator} />
              <Text style={styles.modalTitle}>Mission Control</Text>
              <Text style={styles.modalSubtitle}>
                Update Execution Progress
              </Text>
            </View>

            <View style={styles.statusOptions}>
              {(['pending', 'reviewed', 'resolved'] as const).map(status => {
                const cfg = statusColors[status];
                const Icon = cfg.icon;
                const isSelected =
                  selectedFeedback?.status === status ||
                  (!selectedFeedback?.status && status === 'pending');

                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      isSelected && {
                        borderColor: cfg.text,
                        backgroundColor: cfg.bg + '30',
                      },
                    ]}
                    onPress={() => handleStatusChange(status)}
                    disabled={isUpdating}
                  >
                    <View
                      style={[
                        styles.optionIconBox,
                        { backgroundColor: cfg.bg },
                      ]}
                    >
                      <Icon size={20} color={cfg.text} />
                    </View>
                    <View style={styles.optionInfo}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && { color: cfg.text },
                        ]}
                      >
                        Mark as{' '}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                      <Text style={styles.optionDesc}>
                        {status === 'pending' && 'Awaiting initial review.'}
                        {status === 'reviewed' && 'Feedback has been analyzed.'}
                        {status === 'resolved' &&
                          'Corrective actions completed.'}
                      </Text>
                    </View>
                    {isSelected && (
                      <View
                        style={[
                          styles.checkCircle,
                          { backgroundColor: cfg.text },
                        ]}
                      >
                        <Check size={12} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsStatusModalVisible(false)}
              disabled={isUpdating}
            >
              <Text style={styles.closeBtnText}>Abort Change</Text>
            </TouchableOpacity>

            {isUpdating && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.brand.primary} />
                <Text style={styles.loadingText}>
                  Synchronizing Repositories...
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  feedbackCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarWrap: {
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: colors.palette.slate.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    letterSpacing: -0.3,
  },
  menuBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.palette.slate.bg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.text.tertiary,
    marginHorizontal: 8,
  },
  date: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  commentBox: {
    backgroundColor: colors.palette.slate.bg,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  comment: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    fontFamily: typography.fontFamily,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconBox: {
    width: 100,
    height: 100,
    borderRadius: 36,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontFamily: typography.fontFamily,
    lineHeight: 22,
    maxWidth: 240,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.layout.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalIndicator: {
    width: 40,
    height: 5,
    backgroundColor: colors.layout.divider,
    borderRadius: 2.5,
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 4,
    fontWeight: '600',
  },
  statusOptions: {
    gap: spacing.md,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(226, 232, 240, 0.5)',
    backgroundColor: colors.palette.slate.bg,
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
    fontWeight: '500',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    marginTop: spacing.xl,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.palette.slate.bg,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.secondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand.primary,
  },
});

export default FeedbackListScreen;
