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
  Share,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  Info,
  CheckCircle2,
  Clock,
  User,
  Share2,
  Heart,
  CalendarPlus,
  MessageSquare,
  Star as StarIcon,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { listenToEvent } from '../../services/eventService';
import {
  enrollInEvent,
  unenrollFromEvent,
  checkEnrollment,
} from '../../services/enrollmentService';
import { AppEvent, Enrollment, Feedback } from '../../types';
import { getEventImage } from '../../utils/eventHelpers';
import {
  submitFeedback,
  checkUserFeedback,
} from '../../services/feedbackService';
import CustomLoader from '../../components/CustomLoader';
import Button from '../../components/Button';
import Toast from 'react-native-toast-message';
import EnrollConfirmModal from '../../components/modals/EnrollConfirmModal';
import UnenrollConfirmModal from '../../components/modals/UnenrollConfirmModal';
import SpeakerBioModal from '../../components/modals/SpeakerBioModal';
import LeaveFeedbackModal from '../../components/modals/LeaveFeedbackModal';
import StarRating from '../../components/StarRating';
import { Speaker } from '../../types';

const EventDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const { eventId } = route.params;
  const insets = useSafeAreaInsets();

  const [event, setEvent] = useState<AppEvent | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [userFeedback, setUserFeedback] = useState<Feedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

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
        if (enrollmentData) {
          const feedbackData = await checkUserFeedback(
            eventId,
            userProfile.uid,
          );
          setUserFeedback(feedbackData);
        }
      }
    };
    loadEnrollmentStatus();

    return () => unsubscribeEvent();
  }, [eventId, userProfile]);

  const handleEnrollmentPress = () => {
    if (!event || !userProfile) return;

    // Block enrollment/unenrollment for past events
    if (isPastEvent) {
      Toast.show({
        type: 'info',
        text1: 'Event Has Ended',
        text2: 'This event is already completed.',
      });
      return;
    }

    if (
      !enrollment &&
      event.maxCapacity &&
      event.enrolledCount >= event.maxCapacity
    ) {
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
      setUserFeedback(null);
      Toast.show({ type: 'success', text1: 'Unenrolled Successfully' });
      setShowUnenrollModal(false);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Unenrollment Failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (!event || !userProfile) return;
    setFeedbackLoading(true);
    const result = await submitFeedback(event.id, userProfile, rating, comment);
    if (result.success && result.newFeedback) {
      setUserFeedback(result.newFeedback);
      Toast.show({ type: 'success', text1: 'Feedback submitted!' });
      setShowFeedbackModal(false);
    } else {
      Toast.show({ type: 'error', text1: 'Submission failed' });
    }
    setFeedbackLoading(false);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date =
      typeof timestamp.toDate === 'function'
        ? timestamp.toDate()
        : new Date(timestamp);

    const dateStr = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return `${dateStr} • ${timeStr}`;
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      const dateStr = formatDate(event.date);
      const message = `Join me for ${event.title}!\n\n📅 Date: ${dateStr}\n📍 Location: ${event.location}\n\nCheck it out here: https://isop-app.com/events/${event.id}`;
      await Share.share({
        message,
        title: event.title,
      });
    } catch (error) {
      console.error('Sharing failed', error);
    }
  };

  const openInMaps = () => {
    if (!event) return;
    const url = Platform.select({
      ios: `maps://app?q=${encodeURIComponent(event.location)}`,
      android: `geo:0,0?q=${encodeURIComponent(event.location)}`,
    });
    if (url) Linking.openURL(url);
  };

  const saveToCalendar = () => {
    if (!event) return;
    // Basic Google Calendar link generation
    const start = event.date.toDate
      ? event.date.toDate()
      : new Date(event.date);
    const end = event.endDate?.toDate
      ? event.endDate.toDate()
      : new Date(start.getTime() + 3600000);

    const isoStart = start.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const isoEnd = end.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title,
    )}&dates=${isoStart}/${isoEnd}&details=${encodeURIComponent(
      event.description,
    )}&location=${encodeURIComponent(event.location)}`;

    Linking.openURL(googleUrl);
  };

  const handleSpeakerPress = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setShowSpeakerModal(true);
  };

  const calculateDuration = (start: any, end?: any) => {
    if (!start || !end) return null;
    try {
      const startTime = start.toDate ? start.toDate() : new Date(start);
      const endTime = end.toDate ? end.toDate() : new Date(end);
      const diffMs = endTime.getTime() - startTime.getTime();
      const diffMins = Math.round(diffMs / 60000);

      if (diffMins < 60) return `${diffMins}m`;
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } catch {
      return null;
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date =
      typeof timestamp.toDate === 'function'
        ? timestamp.toDate()
        : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
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

  // Check if event date is in the past → automatically completed
  const isPastEvent = (() => {
    try {
      const eventDate =
        event.date && typeof event.date.toDate === 'function'
          ? event.date.toDate()
          : new Date(event.date);
      return eventDate.getTime() < Date.now();
    } catch {
      return false;
    }
  })();

  return (
    <View style={styles.container}>
      {/* Floating Header Buttons */}
      <TouchableOpacity
        style={[
          styles.headerBtn,
          styles.backBtn,
          { top: Platform.OS === 'ios' ? Math.max(insets.top, 20) : 20 },
        ]}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <View
        style={[
          styles.headerActions,
          { top: Platform.OS === 'ios' ? Math.max(insets.top, 20) : 20 },
        ]}
      >
        {/* <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => setIsLiked(!isLiked)}
        >
          <Heart
            size={20}
            color={isLiked ? colors.status.error : colors.text.primary}
            fill={isLiked ? colors.status.error : 'transparent'}
          />
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
          <Share2 size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

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

          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{event.type.toUpperCase()}</Text>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.infoArea}>
          <Text style={styles.title}>{event.title}</Text>

          {event.averageRating !== undefined &&
            event.ratingCount !== undefined &&
            event.ratingCount > 0 && (
              <View style={styles.ratingBadge}>
                <StarIcon size={16} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.ratingBadgeText}>
                  {event.averageRating.toFixed(1)} ({event.ratingCount}{' '}
                  {event.ratingCount === 1 ? 'Review' : 'Reviews'})
                </Text>
              </View>
            )}

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <View
                style={[
                  styles.metaIcon,
                  { backgroundColor: 'rgba(79, 70, 229, 0.1)' },
                ]}
              >
                <Calendar size={18} color={colors.palette.indigo.accent} />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Date & Time</Text>
                <Text style={styles.metaValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.metaItem}
              onPress={openInMaps}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.metaIcon,
                  { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                ]}
              >
                <MapPin size={18} color={colors.status.success} />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Location</Text>
                <Text style={[styles.metaValue, styles.linkText]}>
                  {event.location}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Actions row */}
          {!isPastEvent && (
            <View style={styles.quickActions}>
              {enrollment && (
                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={saveToCalendar}
                >
                  <CalendarPlus size={16} color={colors.brand.primary} />
                  <Text style={styles.quickActionText}>Save to Calendar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={handleShare}
              >
                <Share2 size={16} color={colors.brand.primary} />
                <Text style={styles.quickActionText}>Invite Colleagues</Text>
              </TouchableOpacity>
            </View>
          )}

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

          {/* Speakers Section */}
          {event.speakers && event.speakers.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <User size={16} color={colors.brand.primary} />
                <Text style={styles.sectionTitle}>GUEST SPEAKERS</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.speakersScroll}
              >
                {event.speakers.map(speaker => (
                  <TouchableOpacity
                    key={speaker.id}
                    style={styles.speakerCard}
                    onPress={() => handleSpeakerPress(speaker)}
                    activeOpacity={0.7}
                  >
                    {speaker.image ? (
                      <Image
                        source={{ uri: speaker.image }}
                        style={styles.speakerImage}
                      />
                    ) : (
                      <View
                        style={[styles.speakerImage, styles.speakerPlaceholder]}
                      >
                        <User size={30} color={colors.text.tertiary} />
                      </View>
                    )}
                    <View style={styles.speakerInfo}>
                      <Text style={styles.speakerName} numberOfLines={1}>
                        {speaker.name}
                      </Text>
                      <Text style={styles.speakerRole} numberOfLines={1}>
                        {speaker.role}
                      </Text>
                      <View style={styles.seeBioBadge}>
                        <Text style={styles.seeBioText}>Bio</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Agenda Section */}
          {event.agenda && event.agenda.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Clock size={16} color={colors.brand.primary} />
                <Text style={styles.sectionTitle}>EVENT AGENDA</Text>
              </View>
              <View style={styles.agendaContainer}>
                {event.agenda
                  .sort((a, b) => {
                    const timeA =
                      a.startTime?.toDate?.() || new Date(a.startTime);
                    const timeB =
                      b.startTime?.toDate?.() || new Date(b.startTime);
                    return timeA.getTime() - timeB.getTime();
                  })
                  .map((item, index) => {
                    const duration = calculateDuration(
                      item.startTime,
                      item.endTime,
                    );
                    return (
                      <View key={item.id} style={styles.agendaItem}>
                        <View style={styles.agendaTimeColumn}>
                          <Text style={styles.agendaTime}>
                            {formatTime(item.startTime)}
                          </Text>
                        </View>

                        <View style={styles.timelineColumn}>
                          <View style={styles.agendaDot} />
                          {index !== (event.agenda?.length || 0) - 1 && (
                            <View style={styles.agendaLine} />
                          )}
                        </View>

                        <View style={styles.agendaContent}>
                          <View style={styles.agendaTitleRow}>
                            <Text style={styles.agendaTitle}>{item.title}</Text>
                            {duration && (
                              <View style={styles.durationBadge}>
                                <Text style={styles.durationText}>
                                  {duration}
                                </Text>
                              </View>
                            )}
                          </View>
                          {item.description && (
                            <Text style={styles.agendaDesc}>
                              {item.description}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            {isPastEvent ? (
              // Past event — show completed banner, hide enroll button
              <View>
                <View style={styles.completedBanner}>
                  <CheckCircle2 size={20} color={colors.text.tertiary} />
                  <View style={styles.completedBannerText}>
                    <Text style={styles.completedBannerTitle}>
                      This Event Has Ended
                    </Text>
                    <Text style={styles.completedBannerSub}>
                      {enrollment
                        ? 'You participated in this event.'
                        : 'This event is no longer accepting enrollments.'}
                    </Text>
                  </View>
                </View>

                {enrollment && !userFeedback && (
                  <Button
                    title="Rate & Review this Event"
                    onPress={() => setShowFeedbackModal(true)}
                    style={{ marginTop: 16 }}
                    variant="outline"
                  />
                )}
                {enrollment && userFeedback && (
                  <View style={styles.myFeedbackBox}>
                    <Text style={styles.myFeedbackTitle}>Your Review</Text>
                    <StarRating rating={userFeedback.rating} size={14} />
                    {userFeedback.comment ? (
                      <Text style={styles.myFeedbackComment}>
                        {userFeedback.comment}
                      </Text>
                    ) : null}
                  </View>
                )}

                {event.ratingCount !== undefined && event.ratingCount > 0 && (
                  <TouchableOpacity
                    style={styles.viewReviewsBtn}
                    onPress={() =>
                      navigation.navigate('FeedbackList', {
                        eventId,
                        eventTitle: event.title,
                      })
                    }
                  >
                    <MessageSquare size={18} color={colors.brand.primary} />
                    <Text style={styles.viewReviewsText}>
                      View All Reviews ({event.ratingCount})
                    </Text>
                  </TouchableOpacity>
                )}

                {enrollment && (
                  <TouchableOpacity
                    style={[styles.participantsBtn, { marginTop: 12 }]}
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
            ) : (
              <>
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
              </>
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

      <SpeakerBioModal
        visible={showSpeakerModal}
        onClose={() => setShowSpeakerModal(false)}
        speaker={selectedSpeaker}
      />

      <LeaveFeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
        eventName={event.title}
        loading={feedbackLoading}
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
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
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
    zIndex: 10,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
  },
  headerActions: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
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
  metaGrid: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: colors.layout.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  metaIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  metaContent: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: colors.text.tertiary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 20,
  },
  linkText: {
    color: colors.brand.primary,
    textDecorationLine: 'underline',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.layout.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    fontFamily: typography.fontFamily,
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
    backgroundColor: colors.layout.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  actions: {
    gap: spacing.md,
  },
  enrollBtn: {
    height: 56,
    borderRadius: radius.lg,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.lg,
    backgroundColor: colors.palette.slate.bg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  completedBannerText: {
    flex: 1,
  },
  completedBannerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: 2,
  },
  completedBannerSub: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.tertiary,
    lineHeight: 18,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: 6,
  },
  ratingBadgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  myFeedbackBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    marginTop: 16,
  },
  myFeedbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    marginBottom: 6,
  },
  myFeedbackComment: {
    fontSize: 13,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily,
    marginTop: 8,
  },
  viewReviewsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderRadius: radius.md,
  },
  viewReviewsText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
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
  speakersScroll: {
    paddingRight: spacing.xl,
    gap: spacing.md,
  },
  speakerCard: {
    width: 120,
    alignItems: 'center',
    backgroundColor: colors.layout.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  speakerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: spacing.sm,
    backgroundColor: colors.palette.slate.bg,
  },
  speakerPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  speakerName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  speakerRole: {
    fontSize: 10,
    color: colors.text.tertiary,
    fontWeight: '600',
    textAlign: 'center',
  },
  speakerInfo: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  seeBioBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    borderRadius: 6,
  },
  seeBioText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.brand.primary,
    textTransform: 'uppercase',
  },
  agendaContainer: {
    marginTop: spacing.xs,
    backgroundColor: '#F8FAFC', // Slightly different background to separate from infoArea
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  agendaItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  agendaTimeColumn: {
    width: 65,
    paddingTop: 4,
  },
  agendaTime: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.brand.primary,
    textAlign: 'right',
  },
  timelineColumn: {
    width: 30,
    alignItems: 'center',
  },
  agendaDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brand.primary,
    zIndex: 2,
    marginTop: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  agendaLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.layout.divider,
    marginVertical: 4,
  },
  agendaContent: {
    flex: 1,
    paddingLeft: spacing.xs,
    paddingBottom: spacing.lg,
  },
  agendaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  agendaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  durationBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  agendaDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    fontFamily: typography.fontFamily,
  },
});

export default EventDetailScreen;
