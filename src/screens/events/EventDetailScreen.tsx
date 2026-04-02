import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  Info,
  CheckCircle2,
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { listenToEvent } from '../../services/eventService';
import {
  enrollInEvent,
  unenrollFromEvent,
  checkEnrollment,
} from '../../services/enrollmentService';
import { AppEvent, Enrollment } from '../../types';
import { getEventImage } from '../../utils/eventHelpers';
import CustomLoader from '../../components/CustomLoader';
import Button from '../../components/Button';
import Toast from 'react-native-toast-message';
import EnrollConfirmModal from '../../components/modals/EnrollConfirmModal';
import UnenrollConfirmModal from '../../components/modals/UnenrollConfirmModal';

const EventDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const { eventId } = route.params;

  const [event, setEvent] = useState<AppEvent | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    // 1. Listen to event changes in real-time (title, description, enrolledCount)
    const unsubscribeEvent = listenToEvent(eventId, data => {
      setEvent(data);
      setLoading(false);
    });

    // 2. Check enrollment status one-time (or when userProfile changes)
    const loadEnrollmentStatus = async () => {
      if (userProfile) {
        const enrollmentData = await checkEnrollment(eventId, userProfile.uid);
        setEnrollment(enrollmentData);
      }
    };
    loadEnrollmentStatus();

    return () => unsubscribeEvent();
  }, [eventId, userProfile]);

  const handleEnrollmentPress = () => {
    if (!event || !userProfile) return;

    if (!enrollment && event.maxCapacity && event.enrolledCount >= event.maxCapacity) {
      Toast.show({
        type: 'error',
        text1: 'Event is Full',
        text2: 'Sorry, no more spots available.',
      });
      return;
    }
    
    if (enrollment) {
      setShowUnenrollModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const confirmEnroll = async () => {
    if (!event || !userProfile) return;
    setActionLoading(true);
    try {
      const result = await enrollInEvent(event, userProfile);
      if (result.success && result.enrollment) {
        setEnrollment(result.enrollment);
        Toast.show({ type: 'success', text1: 'Enrolled Successfully!' });
      }
      setShowConfirmModal(false);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Enrollment Failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmUnenroll = async () => {
    if (!event || !userProfile || !enrollment) return;
    setActionLoading(true);
    try {
      await unenrollFromEvent(enrollment.id, event.id);
      setEnrollment(null);
      Toast.show({ type: 'success', text1: 'Unenrolled Successfully' });
      setShowUnenrollModal(false);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unenrollment Failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date =
      typeof timestamp.toDate === 'function'
        ? timestamp.toDate()
        : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading)
    return (
      <CustomLoader
        message="Gathering Event Intel..."
        overlay={false}
        style={{ flex: 1 }}
      />
    );
  if (!event)
    return (
      <View style={styles.center}>
        <Text>Event not found.</Text>
      </View>
    );

  const isFull = event.maxCapacity && event.enrolledCount >= event.maxCapacity;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Area */}
        <View style={styles.bannerContainer}>
          <Image
            source={getEventImage(event)}
            style={styles.banner}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{event.type.toUpperCase()}</Text>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.infoArea}>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <View
                style={[
                  styles.metaIcon,
                  { backgroundColor: 'rgba(79, 70, 229, 0.1)' },
                ]}
              >
                <Calendar size={16} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={styles.metaLabel}>Date & Time</Text>
                <Text style={styles.metaValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.metaItem}>
              <View
                style={[
                  styles.metaIcon,
                  { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                ]}
              >
                <MapPin size={16} color="#10B981" />
              </View>
              <View>
                <Text style={styles.metaLabel}>Location</Text>
                <Text style={styles.metaValue}>{event.location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.enrollmentStatus}>
            <View style={styles.participantStats}>
              <Users size={16} color={colors.text.tertiary} />
              <Text style={styles.statsText}>
                <Text style={styles.enrolledCount}>{event.enrolledCount}</Text>
                {event.maxCapacity ? ` / ${event.maxCapacity}` : ''} Enrolled
                Participants
              </Text>
            </View>
            {enrollment && (
              <View style={styles.statusBadge}>
                <CheckCircle2 size={12} color="#059669" />
                <Text style={styles.statusBadgeText}>You're Enrolled</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Info size={16} color={colors.brand.primary} />
              <Text style={styles.sectionTitle}>ABOUT THIS EVENT</Text>
            </View>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              title={
                enrollment
                  ? 'Unenroll From Event'
                  : isFull
                  ? 'Sold Out'
                  : 'Enroll Now'
              }
              onPress={handleEnrollmentPress}
              loading={actionLoading}
              variant={enrollment ? 'outline' : 'primary'}
              disabled={!enrollment && !!isFull}
              style={styles.enrollBtn}
            />

            {enrollment && (
              <TouchableOpacity
                style={styles.participantsBtn}
                onPress={() =>
                  navigation.navigate('Participants', {
                    eventId,
                    eventTitle: event.title,
                  })
                }
              >
                <Text style={styles.participantsBtnText}>
                  View Other Participants
                </Text>
                <Users size={18} color={colors.brand.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {event && (
        <EnrollConfirmModal
          visible={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmEnroll}
          eventName={event.title}
          loading={actionLoading}
        />
      )}

      {event && (
        <UnenrollConfirmModal
          visible={showUnenrollModal}
          onClose={() => setShowUnenrollModal(false)}
          onConfirm={confirmUnenroll}
          eventName={event.title}
          loading={actionLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    height: 280,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  typeBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  infoArea: {
    padding: spacing.xl,
    marginTop: -20,
    backgroundColor: colors.layout.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    marginBottom: spacing.xl,
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: colors.text.tertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  enrollmentStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.layout.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  participantStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  enrolledCount: {
    fontWeight: '700',
    color: colors.brand.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brand.primary,
    letterSpacing: 1.5,
  },
  description: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 24,
    fontFamily: typography.fontFamily,
  },
  actions: {
    gap: spacing.md,
  },
  enrollBtn: {
    height: 56,
    borderRadius: radius.lg,
  },
  participantsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  participantsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand.primary,
  },
});

export default EventDetailScreen;
