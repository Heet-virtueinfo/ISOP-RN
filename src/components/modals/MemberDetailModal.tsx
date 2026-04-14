import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import {
  X,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Shield,
  Clock,
  ExternalLink,
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { AppEvent } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MemberDetailModalProps {
  visible: boolean;
  onClose: () => void;
  member: {
    uid: string;
    displayName: string;
    email: string;
    profileImage?: string | null;
    phoneNumber?: string;
    events: { eventId: string; enrolledAt: any }[];
  } | null;
  eventsMap: Record<string, AppEvent>;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  visible,
  onClose,
  member,
  eventsMap,
}) => {
  if (!member) return null;

  const handleEmail = () => {
    Linking.openURL(`mailto:${member.email}`);
  };

  const handlePhone = () => {
    if (member.phoneNumber) {
      Linking.openURL(`tel:${member.phoneNumber}`);
    }
  };

  const initials = member.displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Executive Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIndicator} />
              <Text style={styles.modalTitle}>Executive Profile</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {/* Command Suite Hero */}
            <View style={styles.heroSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarGlass}>
                  {member.profileImage ? (
                    <Image
                      source={{ uri: member.profileImage }}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.avatar, styles.initialsAvatar]}>
                      <Text style={styles.initialsText}>{initials}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.statusBadge}>
                  <Shield size={10} color="white" />
                  <Text style={styles.statusText}>VERIFIED</Text>
                </View>
              </View>
              <Text style={styles.displayName}>{member.displayName}</Text>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>COMMUNICATION CHANNELS</Text>
              <View style={styles.infoCard}>
                <TouchableOpacity
                  style={styles.infoRow}
                  onPress={handleEmail}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: colors.brand.primary + '10' },
                    ]}
                  >
                    <Mail size={18} color={colors.brand.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>SECURE EMAIL</Text>
                    <Text
                      style={styles.infoValue}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {member.email}
                    </Text>
                  </View>
                  <ExternalLink size={16} color={colors.text.tertiary} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.infoRow}
                  onPress={handlePhone}
                  disabled={!member.phoneNumber}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: colors.brand.secondary + '10' },
                    ]}
                  >
                    <Phone size={18} color={colors.brand.secondary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>DIRECT LINE</Text>
                    <Text style={styles.infoValue}>
                      {member.phoneNumber || 'Not provided'}
                    </Text>
                  </View>
                  {member.phoneNumber && (
                    <ExternalLink size={16} color={colors.text.tertiary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Engagement Timeline */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>OPERATIONAL HISTORY</Text>
                <View style={styles.countPill}>
                  <Text style={styles.countPillText}>
                    {member.events.length} LOGS
                  </Text>
                </View>
              </View>

              {member.events.length > 0 ? (
                <View style={styles.timelineContainer}>
                  {member.events.map((ev, index) => {
                    const event = eventsMap[ev.eventId];
                    return (
                      <View key={ev.eventId} style={styles.timelineItem}>
                        <View style={styles.timelineLeading}>
                          <View style={styles.timelineDot} />
                          {index !== member.events.length - 1 && (
                            <View style={styles.timelineLine} />
                          )}
                        </View>
                        <View style={styles.timelineContent}>
                          <View style={styles.participationCard}>
                            <View style={styles.eventInfo}>
                              <Text style={styles.eventTitle} numberOfLines={1}>
                                {event?.title || 'Classified Event'}
                              </Text>
                              <View style={styles.dateRow}>
                                <Clock size={12} color={colors.brand.primary} />
                                <Text style={styles.enrolledDate}>
                                  {ev.enrolledAt?.toDate?.()
                                    ? ev.enrolledAt
                                        .toDate()
                                        .toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                        })
                                    : 'Recently'}
                                </Text>
                              </View>
                            </View>
                            {/* <TouchableOpacity style={styles.viewEventBtn}>
                              <ChevronRight size={18} color={colors.brand.primary} />
                            </TouchableOpacity> */}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Calendar size={32} color={colors.text.tertiary + '40'} />
                  <Text style={styles.emptyText}>
                    No event participation history detected.
                  </Text>
                </View>
              )}
            </View>

            <View style={{ height: spacing.xxl * 2 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.layout.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    height: SCREEN_HEIGHT * 0.9,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIndicator: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.brand.primary,
  },
  modalTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: colors.palette.slate.bg,
    borderRadius: 12,
  },
  scrollContainer: {
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatarGlass: {
    padding: 8,
    borderRadius: 58,
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(79, 70, 229, 0.1)',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.palette.slate.bg,
  },
  initialsAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontFamily: typography.fontFamily,
    fontSize: 36,
    fontWeight: '900',
    color: colors.brand.primary,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.status.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusText: {
    fontFamily: typography.fontFamily,
    fontSize: 8,
    fontWeight: '900',
    color: 'white',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  displayName: {
    fontFamily: typography.fontFamily,
    fontSize: 26,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    color: colors.text.tertiary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.layout.divider,
    opacity: 0.5,
  },
  countPill: {
    backgroundColor: colors.brand.primary + '10',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countPillText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '900',
    color: colors.brand.primary,
  },
  timelineContainer: {
    paddingLeft: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeading: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: colors.brand.primary,
    marginTop: 22,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.brand.primary + '10',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  participationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: spacing.md,
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
      },
      android: { elevation: 1 },
    }),
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  enrolledDate: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '700',
  },
  viewEventBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.brand.primary + '08',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.palette.slate.bg,
    borderRadius: radius.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
});

export default MemberDetailModal;
