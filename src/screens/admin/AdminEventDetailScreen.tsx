import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  Star as StarIcon,
  Edit2,
  Trash2,
  ChevronRight,
  Target,
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { listenToEvent, deleteEvent } from '../../services/eventService';
import { AppEvent, Speaker } from '../../types';
import { getEventImage, formatEventDate } from '../../utils/eventHelpers';
import CustomLoader from '../../components/CustomLoader';
import DeleteEventModal from '../../components/modals/DeleteEventModal';
import SpeakerBioModal from '../../components/modals/SpeakerBioModal';
import Toast from 'react-native-toast-message';

const AdminEventDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { eventId } = route.params;

  const [event, setEvent] = useState<AppEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const unsubscribe = listenToEvent(eventId, data => {
      setEvent(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  const handleEdit = () => {
    if (!event) return;
    navigation.navigate('EditEvent', { eventId: event.id });
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!event) return;
    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
      setDeleteModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Event Removed',
        text2: `"${event.title}" has been successfully deleted.`,
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to complete event deletion.',
      });
    } finally {
      setIsDeleting(false);
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

  if (loading)
    return (
      <CustomLoader
        message="Restoring Command Center..."
        overlay={false}
        style={{ flex: 1 }}
      />
    );
  if (!event)
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Event Intel Missing.</Text>
      </View>
    );

  const enrollmentProgress = event.maxCapacity
    ? event.enrolledCount / event.maxCapacity
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.layout.surface}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner */}
        <View style={styles.heroSection}>
          <Image source={getEventImage(event)} style={styles.heroImage} />
          <View style={styles.heroBadgeBox}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {event.type.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.contentWrap}>
          {/* Section 1: Strategic Pulse (Bento Cards) */}
          <View style={styles.bentoContainer}>
            <View style={styles.bentoCard}>
              <View style={styles.bentoHeader}>
                <Users size={16} color={colors.brand.primary} />
                <Text style={styles.bentoLabel}>ENROLLMENT</Text>
              </View>
              <Text style={styles.bentoValue}>
                {event.enrolledCount}{' '}
                <Text style={styles.bentoSubValue}>
                  / {event.maxCapacity || '∞'}
                </Text>
              </Text>
              <View style={styles.progressBox}>
                <View
                  style={[
                    styles.progressLine,
                    { width: `${Math.min(enrollmentProgress * 100, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.bentoFootnote}>
                {Math.round(enrollmentProgress * 100)}% Utilization
              </Text>
            </View>

            <View style={styles.bentoCard}>
              <View style={styles.bentoHeader}>
                <StarIcon
                  size={16}
                  color={colors.status.warning}
                  fill={colors.status.warning}
                />
                <Text style={styles.bentoLabel}>PULSE RATING</Text>
              </View>
              <Text style={styles.bentoValue}>
                {event.averageRating?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.bentoSubValue}>
                {event.ratingCount || 0} reviews
              </Text>
              <TouchableOpacity
                style={styles.bentoAction}
                onPress={() =>
                  navigation.navigate('FeedbackList', {
                    eventId: event.id,
                    eventTitle: event.title,
                  })
                }
              >
                <Text style={styles.bentoActionText}>View Feedback</Text>
                <ChevronRight size={14} color={colors.brand.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Metadata Nodes */}
          <View style={styles.metaNodes}>
            <View style={styles.metaNode}>
              <View
                style={[
                  styles.metaIconWrap,
                  { backgroundColor: colors.palette.indigo.bg },
                ]}
              >
                <Calendar size={18} color={colors.palette.indigo.accent} />
              </View>
              <View>
                <Text style={styles.metaNodeLabel}>EVENT DATE</Text>
                <Text style={styles.metaNodeValue}>
                  {formatEventDate(event.date)}
                </Text>
              </View>
            </View>

            <View style={styles.metaNode}>
              <View
                style={[
                  styles.metaIconWrap,
                  { backgroundColor: colors.palette.emerald.bg },
                ]}
              >
                <MapPin size={18} color={colors.palette.emerald.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.metaNodeLabel}>LOCATION</Text>
                <TouchableOpacity onPress={openInMaps} activeOpacity={0.6}>
                  <Text style={[styles.metaNodeValue, styles.linkText]}>
                    {event.location}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Section 2: Specifications */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Target size={18} color={colors.brand.primary} />
              <Text style={styles.sectionTitle}>TACTICAL SPECIFICATIONS</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specText}>{event.description}</Text>
            </View>
          </View>

          {/* Section 3: Professional Roster (Speakers) */}
          {event.speakers && event.speakers.length > 0 && (
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeader}>
                <User size={18} color={colors.brand.primary} />
                <Text style={styles.sectionTitle}>PROFESSIONAL ROSTER</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.speakerScroll}
              >
                {event.speakers.map(speaker => (
                  <TouchableOpacity
                    key={speaker.id}
                    style={styles.speakerCard}
                    onPress={() => {
                      setSelectedSpeaker(speaker);
                      setShowSpeakerModal(true);
                    }}
                  >
                    <View style={styles.speakerImageWrap}>
                      {speaker.image ? (
                        <Image
                          source={{ uri: speaker.image }}
                          style={styles.speakerImage}
                        />
                      ) : (
                        <View style={styles.speakerPlaceholder}>
                          <User size={24} color={colors.text.tertiary} />
                        </View>
                      )}
                      <View style={styles.speakerAccentRing} />
                    </View>
                    <Text style={styles.speakerName} numberOfLines={1}>
                      {speaker.name}
                    </Text>
                    <Text style={styles.speakerRole} numberOfLines={1}>
                      {speaker.role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Section 4: Operational Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <View style={[styles.sectionWrap, { marginBottom: spacing.md }]}>
              <View style={styles.sectionHeader}>
                <Clock size={18} color={colors.brand.primary} />
                <Text style={styles.sectionTitle}>OPERATIONAL AGENDA</Text>
              </View>
              <View style={styles.agendaTimeline}>
                {event.agenda
                  .sort((a, b) => {
                    const tA = a.startTime?.toDate?.() || new Date(a.startTime);
                    const tB = b.startTime?.toDate?.() || new Date(b.startTime);
                    return tA.getTime() - tB.getTime();
                  })
                  .map((item, index) => (
                    <View key={item.id} style={styles.agendaItemRow}>
                      {/* Timeline Spine Col */}
                      <View style={styles.timelineCol}>
                        <View style={styles.timelineNode}>
                          <View style={styles.timelineNodeInner} />
                        </View>
                        {index !== (event.agenda?.length || 0) - 1 && (
                          <View style={styles.timelineSegment} />
                        )}
                      </View>

                      {/* Content Card */}
                      <View
                        style={[
                          styles.agendaCard,
                          index === (event.agenda?.length || 0) - 1 && {
                            marginBottom: 0,
                          },
                        ]}
                      >
                        <View style={styles.agendaCardHeader}>
                          <Text style={styles.agendaTimeText}>
                            {new Date(
                              item.startTime?.toDate?.() || item.startTime,
                            ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                          <View style={styles.agendaPoint} />
                        </View>
                        <View style={styles.agendaCardBody}>
                          <Text style={styles.agendaItemTitle}>
                            {item.title}
                          </Text>
                          {item.description && (
                            <Text
                              style={styles.agendaItemDesc}
                              numberOfLines={2}
                            >
                              {item.description}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* Section 5: Tactical Command Actions */}
          <View style={[styles.actionSection, { marginTop: spacing.xs }]}>
            <TouchableOpacity
              style={[styles.mainAction, styles.optimizeBtn]}
              onPress={handleEdit}
            >
              <Edit2 size={18} color="white" />
              <Text style={styles.actionLabel}>OPTIMIZE EVENT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.purgeBtn} onPress={handleDelete}>
              <Trash2 size={20} color={colors.status.error} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <DeleteEventModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={confirmDelete}
        event={event}
        loading={isDeleting}
      />
      <SpeakerBioModal
        visible={showSpeakerModal}
        onClose={() => setShowSpeakerModal(false)}
        speaker={selectedSpeaker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  heroSection: {
    height: 220,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadgeBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  heroBadge: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  heroBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  contentWrap: {
    padding: spacing.lg,
    paddingBottom: spacing.xs,
    marginTop: -20,
    backgroundColor: colors.layout.background,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
  },
  bentoContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: colors.layout.surface,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  bentoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  bentoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.tertiary,
    letterSpacing: 1,
  },
  bentoValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text.primary,
  },
  bentoSubValue: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  progressBox: {
    height: 4,
    backgroundColor: colors.layout.background,
    borderRadius: 2,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressLine: {
    flex: 1,
    backgroundColor: colors.brand.primary,
  },
  bentoFootnote: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.brand.primary,
    marginTop: 6,
  },
  bentoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  bentoActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  metaNodes: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  metaNode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.layout.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: { elevation: 2 },
    }),
  },
  metaIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaNodeLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  metaNodeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  linkText: {
    color: colors.brand.primary,
    textDecorationLine: 'underline',
  },
  sectionWrap: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: 1.5,
  },
  specBox: {
    backgroundColor: colors.layout.surface,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  specText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily,
  },
  speakerScroll: {
    paddingRight: spacing.xl,
    gap: spacing.xl,
  },
  speakerCard: {
    width: 140,
    alignItems: 'center',
  },
  speakerImageWrap: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  speakerImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  speakerPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.layout.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  speakerAccentRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.brand.accent + '30',
    transform: [{ scale: 1.1 }],
  },
  speakerName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
  },
  speakerRole: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: 4,
  },
  agendaTimeline: {
    paddingLeft: spacing.xs,
  },
  agendaItemRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineCol: {
    width: 20,
    alignItems: 'center',
  },
  timelineNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.palette.indigo.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.palette.indigo.accent + '30',
    zIndex: 2,
  },
  timelineNodeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.primary,
  },
  timelineSegment: {
    width: 2,
    flex: 1,
    backgroundColor: colors.layout.divider,
    marginVertical: -2,
    zIndex: 1,
  },
  agendaCard: {
    flex: 1,
    backgroundColor: colors.layout.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  agendaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.palette.slate.bg,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  agendaTimeText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.brand.primary,
    letterSpacing: 0.5,
  },
  agendaPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.accent,
  },
  agendaCardBody: {
    padding: spacing.md,
  },
  agendaItemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  agendaItemDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  actionSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.layout.divider,
  },
  mainAction: {
    flex: 1,
    height: 52,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  optimizeBtn: {
    backgroundColor: colors.brand.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: { elevation: 8 },
    }),
  },
  actionLabel: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  purgeBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.status.error + '10',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.status.error + '30',
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.text.secondary,
  },
});

export default AdminEventDetailScreen;
