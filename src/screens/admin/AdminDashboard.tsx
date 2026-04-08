import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Shield, Activity, TrendingUp, LayoutGrid } from 'lucide-react-native';
import { colors, spacing, typography } from '../../theme';
import { getEvents, deleteEvent } from '../../services/eventService';
import { AppEvent } from '../../types';
import EventCard from '../../components/EventCard';
import CustomLoader from '../../components/CustomLoader';
import DeleteEventModal from '../../components/modals/DeleteEventModal';
import Toast from 'react-native-toast-message';

const getSafeTime = (timestamp: any) => {
  if (!timestamp) return 0;
  if (typeof timestamp.toMillis === 'function') return timestamp.toMillis();
  if (typeof timestamp.toDate === 'function')
    return timestamp.toDate().getTime();
  return new Date(timestamp).getTime();
};

const BentoStat = ({ label, value, icon: Icon, color, sublabel }: any) => (
  <View style={styles.bentoStat}>
    <View style={[styles.bentoIconBox, { backgroundColor: color + '15' }]}>
      <Icon size={20} color={color} />
    </View>
    <View style={styles.bentoContent}>
      <Text style={styles.bentoValue}>{value}</Text>
      <Text style={styles.bentoLabel}>{label}</Text>
      {sublabel && <Text style={styles.bentoSublabel}>{sublabel}</Text>}
    </View>
  </View>
);

const AdminDashboard = () => {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;

    const setupListener = () => {
      unsubscribe = getEvents(eventsList => {
        setEvents(eventsList);
        setLoading(false);
      });
    };

    setupListener();
    return () => unsubscribe && unsubscribe();
  }, []);

  const navigateToEdit = (eventId: string) => {
    navigation.navigate('EditEvent', { eventId });
  };

  const handleDeletePress = (event: AppEvent) => {
    setSelectedEvent(event);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;

    setIsDeleting(true);
    try {
      await deleteEvent(selectedEvent.id);

      Toast.show({
        type: 'success',
        text1: 'Deleted Successfully',
        text2: `"${selectedEvent.title}" has been removed.`,
      });

      setDeleteModalVisible(false);
      setSelectedEvent(null);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete event. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderEmptyList = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Events Found</Text>
        <Text style={styles.emptyText}>
          Create your first event to get started.
        </Text>
      </View>
    );
  };

  const { totalEnrollments, activeEvents } = React.useMemo(() => {
    const total = events.reduce((sum, ev) => sum + (ev.enrolledCount || 0), 0);
    const active = events.filter(ev => {
      const eventTime = getSafeTime(ev.date);
      const now = Date.now();
      return eventTime > now;
    }).length;

    return { totalEnrollments: total, activeEvents: active };
  }, [events]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Strategic Bento Overview */}
        <View style={styles.sectionHeader}>
          <LayoutGrid size={14} color={colors.brand.primary} />
          <Text style={styles.sectionTitle}>COMMAND CENTER</Text>
        </View>

        <View style={styles.bentoGrid}>
          {/* Main Module */}
          <View style={[styles.bentoModule, styles.bentoModuleMain]}>
            <BentoStat
              label="TOTAL EVENTS"
              value={events.length}
              icon={Shield}
              color={colors.brand.primary}
              sublabel="Ecosystem Capacity"
            />
          </View>

          {/* Side Modules */}
          <View style={styles.bentoModuleSide}>
            <View style={[styles.bentoModule, styles.bentoSubModule]}>
              <BentoStat
                label="ACTIVE PULSE"
                value={activeEvents}
                icon={Activity}
                color={colors.status.success}
              />
            </View>
            <View style={[styles.bentoModule, styles.bentoSubModule]}>
              <BentoStat
                label="TOTAL IMPACT"
                value={totalEnrollments}
                icon={TrendingUp}
                color={colors.brand.secondary}
              />
            </View>
          </View>
        </View>

        <View style={styles.inventoryHeader}>
          <View style={styles.inventoryTitleRow}>
            <Text style={styles.inventoryTitle}>Event Inventory</Text>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeText}>{events.length}</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <CustomLoader message="Syncing Inventory..." overlay={false} />
        ) : (
          <View style={styles.eventList}>
            {events.length === 0
              ? renderEmptyList()
              : events.map(item => (
                  <EventCard
                    key={item.id}
                    event={item}
                    onPress={() =>
                      navigation.navigate('AdminEventDetail', {
                        eventId: item.id,
                        eventTitle: item.title,
                      })
                    }
                    onEdit={() => navigateToEdit(item.id)}
                    onDelete={() => handleDeletePress(item)}
                    isAdminView
                  />
                ))}
          </View>
        )}
      </ScrollView>

      <DeleteEventModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        event={selectedEvent}
        loading={isDeleting}
      />
      {isDeleting && <CustomLoader overlay message="Purging Event..." />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: colors.brand.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    height: 180,
    marginBottom: spacing.xxl,
  },
  bentoModule: {
    backgroundColor: colors.layout.surface,
    borderRadius: 24,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bentoModuleMain: {
    flex: 1.2,
    justifyContent: 'center',
  },
  bentoModuleSide: {
    flex: 1,
    gap: spacing.md,
  },
  bentoSubModule: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  bentoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bentoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoContent: {
    flex: 1,
  },
  bentoValue: {
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
  },
  bentoLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bentoSublabel: {
    fontFamily: typography.fontFamily,
    fontSize: 8,
    fontWeight: '500',
    color: colors.brand.primary,
    marginTop: 2,
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  inventoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inventoryTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  badgeCount: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  filterBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  eventList: {
    gap: spacing.md,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    backgroundColor: colors.layout.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.tertiary,
  },
});

export default AdminDashboard;
