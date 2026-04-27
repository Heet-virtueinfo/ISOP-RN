import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Shield,
  Activity,
  TrendingUp,
  LayoutGrid,
  ChevronRight,
  Users,
  BookOpen,
  Megaphone,
  PlusCircle,
  FilePlus,
  UserPlus,
  FileText,
} from 'lucide-react-native';
import { colors, spacing, typography } from '../../theme';
import {
  adminGetEvents,
  adminDeleteEvent,
} from '../../services/admin/adminEventService';
import { adminGetUsers } from '../../services/admin/adminUserService';
import { adminGetResources } from '../../services/admin/adminResourceService';
import { adminGetNews } from '../../services/admin/adminNewsService';
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

  // Ecosystem Stats
  const [memberCount, setMemberCount] = useState(0);
  const [resourceCount, setResourceCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;

      const loadDashboardData = async () => {
        try {
          // 1. Events
          const eventsList = await adminGetEvents();
          if (mounted) {
            setEvents(eventsList);
            setLoading(false);
          }
          // 2. Members count
          const users = await adminGetUsers();
          if (mounted) setMemberCount(users.length);

          // 3. Resources count
          const resources = await adminGetResources();
          if (mounted) setResourceCount(resources.length);

          // 4. News count
          const news = await adminGetNews();
          if (mounted) setNewsCount(news.length);
        } catch (error: any) {
          console.error('[Dashboard] loadDashboardData failed:', error?.message);
          if (mounted) setLoading(false);
        }
      };

      loadDashboardData();
      return () => {
        mounted = false;
      };
    }, [])
  );

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
      await adminDeleteEvent(selectedEvent.id);

      // Optimistically remove from list
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));

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

        {/* Action Command Bar */}
        <View style={styles.sectionHeader}>
          <Activity size={14} color={colors.brand.primary} />
          <Text style={styles.sectionTitle}>EXECUTIVE ACTIONS</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionRow}
        >
          <TouchableOpacity
            style={[
              styles.actionBubble,
              { borderColor: colors.brand.primary + '30' },
            ]}
            onPress={() => navigation.navigate('AddEventTab')}
          >
            <View
              style={[
                styles.actionIconBox,
                { backgroundColor: colors.brand.primary + '10' },
              ]}
            >
              <PlusCircle size={20} color={colors.brand.primary} />
            </View>
            <Text style={styles.actionText}>New Event</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBubble, { borderColor: '#8B5CF630' }]}
            onPress={() => navigation.navigate('AdminLibrary')}
          >
            <View
              style={[styles.actionIconBox, { backgroundColor: '#8B5CF610' }]}
            >
              <FilePlus size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.actionText}>Add Resource</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBubble,
              { borderColor: colors.status.warning + '30' },
            ]}
            onPress={() => navigation.navigate('NewsTab')}
          >
            <View
              style={[
                styles.actionIconBox,
                { backgroundColor: colors.status.warning + '10' },
              ]}
            >
              <Megaphone size={20} color={colors.status.warning} />
            </View>
            <Text style={styles.actionText}>Post News</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBubble,
              { borderColor: colors.brand.secondary + '30' },
            ]}
            onPress={() => navigation.navigate('MembersTab')}
          >
            <View
              style={[
                styles.actionIconBox,
                { backgroundColor: colors.brand.secondary + '10' },
              ]}
            >
              <UserPlus size={20} color={colors.brand.secondary} />
            </View>
            <Text style={styles.actionText}>Members</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Global Landscape Stats */}
        <View style={styles.sectionHeader}>
          <TrendingUp size={14} color={colors.brand.primary} />
          <Text style={styles.sectionTitle}>GLOBAL METRICS</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: colors.brand.primary + '10' },
              ]}
            >
              <Users size={16} color={colors.brand.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>{memberCount}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View
              style={[styles.statIconBox, { backgroundColor: '#8B5CF610' }]}
            >
              <BookOpen size={16} color="#8B5CF6" />
            </View>
            <View>
              <Text style={styles.statValue}>{resourceCount}</Text>
              <Text style={styles.statLabel}>Assets</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconBox,
                { backgroundColor: colors.status.warning + '10' },
              ]}
            >
              <FileText size={16} color={colors.status.warning} />
            </View>
            <View>
              <Text style={styles.statValue}>{newsCount}</Text>
              <Text style={styles.statLabel}>Articles</Text>
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
  actionRow: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  actionBubble: {
    width: 110,
    backgroundColor: colors.layout.surface,
    borderRadius: 24,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.layout.surface,
    paddingVertical: spacing.md,
    // paddingHorizontal: spacing.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.layout.background,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  statLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: '600',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
});

export default AdminDashboard;
