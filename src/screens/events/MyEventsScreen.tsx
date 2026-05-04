import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  BookMarked,
  Calendar,
  Search,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { getUserEnrollments } from '../../services/enrollmentService';
import { AppEvent, EventType } from '../../types';
import { getEventById } from '../../services/eventService';
import EventCard from '../../components/EventCard';
import CustomLoader from '../../components/CustomLoader';
import UserHeader from '../../components/UserHeader';
import InputField from '../../components/InputField';
import { isEventActive } from '../../utils/eventHelpers';

const MyEventsScreen = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const [enrolledEvents, setEnrolledEvents] = useState<AppEvent[]>([]);
  type StatusFilter = 'all' | 'upcoming' | 'completed';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<
    'type' | 'status' | null
  >(null);

  const categories: (EventType | 'all')[] = [
    'all',
    'conference',
    'webinar',
    'training',
    'meeting',
  ];
  const statuses: StatusFilter[] = ['all', 'upcoming', 'completed'];

  useFocusEffect(
    useCallback(() => {
      if (!userProfile) return;
      let isMounted = true;

      const fetchMyEvents = async () => {
        try {
          const enrollments = await getUserEnrollments(userProfile.uid);

          // Use the nested event data if available, otherwise fetch it
          const eventPromises = enrollments.map(e =>
            e.event ? Promise.resolve(e.event) : getEventById(e.eventId),
          );
          const eventsData = await Promise.all(eventPromises);

          if (isMounted) {
            setEnrolledEvents(
              eventsData.filter((e): e is AppEvent => e !== null),
            );
          }
        } catch (error) {
          console.error('Error loading enrolled events:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      fetchMyEvents();

      return () => {
        isMounted = false;
      };
    }, [userProfile]),
  );

  const filteredEvents = useMemo(() => {
    let result = enrolledEvents.filter(event => {
      const isUpcoming = isEventActive(event);
      if (selectedStatus === 'upcoming' && !isUpcoming) return false;
      if (selectedStatus === 'completed' && isUpcoming) return false;

      const matchesQuery =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || event.type === selectedType;
      return matchesQuery && matchesType;
    });

    // Sort: Upcoming events top, past events at bottom
    result.sort((a, b) => {
      const aScore = isEventActive(a) ? 0 : 1;
      const bScore = isEventActive(b) ? 0 : 1;
      return aScore - bScore;
    });

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrolledEvents, searchQuery, selectedType, selectedStatus]);

  const onRefresh = async () => {
    if (!userProfile) return;
    setRefreshing(true);

    try {
      const enrollments = await getUserEnrollments(userProfile.uid);
      const eventPromises = enrollments.map(e =>
        e.event ? Promise.resolve(e.event) : getEventById(e.eventId),
      );
      const eventsData = await Promise.all(eventPromises);
      setEnrolledEvents(eventsData.filter((e): e is AppEvent => e !== null));
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <BookMarked size={40} color={colors.text.tertiary} />
        </View>
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'No Matching Enrollments' : 'No Enrollments Yet'}
        </Text>
        <Text style={styles.emptyText}>
          {searchQuery
            ? 'Try adjusting your search or filters to find your events.'
            : 'Discover interesting events and join the ISoP conversation.'}
        </Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Calendar size={18} color="white" />
          <Text style={styles.browseBtnText}>Browse Events</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <UserHeader title="My Enrollments" />

      {loading ? (
        <CustomLoader
          message="Retrieving Your Schedule..."
          overlay={false}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <View style={styles.headerToolbar}>
              <InputField
                placeholder="Search your enrollments..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                leftIcon={Search}
                containerStyle={styles.searchBar}
              />
              <View style={styles.dropdownRow}>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => setActiveDropdown('type')}
                >
                  <Text style={styles.dropdownTriggerText} numberOfLines={1}>
                    Type:{' '}
                    {selectedType.charAt(0).toUpperCase() +
                      selectedType.slice(1)}
                  </Text>
                  <ChevronDown size={14} color={colors.text.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => setActiveDropdown('status')}
                >
                  <Text style={styles.dropdownTriggerText} numberOfLines={1}>
                    Status:{' '}
                    {selectedStatus.charAt(0).toUpperCase() +
                      selectedStatus.slice(1)}
                  </Text>
                  <ChevronDown size={14} color={colors.text.tertiary} />
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() =>
                navigation.navigate('EventDetail', { eventId: item.id })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.brand.primary]}
            />
          }
        />
      )}

      {/* Type Filter Dropdown Modal */}
      {activeDropdown === 'type' && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBg}
            activeOpacity={1}
            onPress={() => setActiveDropdown(null)}
          />
          <View style={styles.dropdownCard}>
            <Text style={styles.dropdownTitle}>Select Event Type</Text>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.dropdownOption,
                  selectedType === cat && styles.dropdownOptionActive,
                ]}
                onPress={() => {
                  setSelectedType(cat);
                  setActiveDropdown(null);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedType === cat && styles.dropdownOptionTextActive,
                  ]}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
                {selectedType === cat && (
                  <Check size={18} color={colors.brand.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Status Filter Dropdown Modal */}
      {activeDropdown === 'status' && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBg}
            activeOpacity={1}
            onPress={() => setActiveDropdown(null)}
          />
          <View style={styles.dropdownCard}>
            <Text style={styles.dropdownTitle}>Select Event Status</Text>
            {statuses.map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.dropdownOption,
                  selectedStatus === status && styles.dropdownOptionActive,
                ]}
                onPress={() => {
                  setSelectedStatus(status);
                  setActiveDropdown(null);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    selectedStatus === status &&
                      styles.dropdownOptionTextActive,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
                {selectedStatus === status && (
                  <Check size={18} color={colors.brand.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerToolbar: {
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  searchBar: {
    marginBottom: 0,
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dropdownTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.layout.surface,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  dropdownTriggerText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    flex: 1,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dropdownCard: {
    backgroundColor: colors.layout.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  dropdownTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  dropdownOptionActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  dropdownOptionText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  dropdownOptionTextActive: {
    color: colors.brand.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.layout.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontFamily: typography.fontFamily,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: spacing.xxl,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.lg,
    elevation: 4,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  browseBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default MyEventsScreen;
