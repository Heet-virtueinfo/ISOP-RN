import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { getActiveEvents } from '../../services/eventService';
import { AppEvent, EventType } from '../../types';
import EventCard from '../../components/EventCard';
import CustomLoader from '../../components/CustomLoader';
import UserHeader from '../../components/UserHeader';
import InputField from '../../components/InputField';
import { getUserEnrollments } from '../../services/enrollmentService';
import { useAuth } from '../../contexts/AuthContext';
import { isEventActive } from '../../utils/eventHelpers';

const EventListScreen = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [enrollmentIds, setEnrollmentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories: (EventType | 'all')[] = [
    'all',
    'conference',
    'webinar',
    'training',
    'meeting',
  ];

  useEffect(() => {
    if (!userProfile) return;
    let isMounted = true;

    const loadData = async () => {
      try {
        const [activeEvents, enrollments] = await Promise.all([
          getActiveEvents(),
          getUserEnrollments(userProfile.uid),
        ]);

        if (isMounted) {
          setEvents(activeEvents);
          setEnrollmentIds(enrollments.map(e => e.eventId));
          setLoading(false);
          setRefreshing(false);
        }
      } catch (error) {
        console.error('EventList Fetch Error', error);
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userProfile]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (!isEventActive(event)) return false;

      const matchesQuery =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || event.type === selectedType;
      return matchesQuery && matchesType;
    });
  }, [events, searchQuery, selectedType]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (!userProfile) {
      setRefreshing(false);
      return;
    }

    try {
      const activeEvents = await getActiveEvents();
      setEvents(activeEvents);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>
          {searchQuery ? 'No Matching Events' : 'No Upcoming Events'}
        </Text>
        <Text style={styles.emptyText}>
          {searchQuery
            ? "Try adjusting your search or filters to find what you're looking for."
            : 'Check back later for new opportunities.'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <UserHeader
        title="Upcoming Events"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {loading && !refreshing ? (
        <CustomLoader
          message="Discovering Events..."
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
                placeholder="Search by title or location..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                leftIcon={Search}
                containerStyle={styles.searchBar}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
              >
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterTab,
                      selectedType === cat && styles.filterTabActive,
                    ]}
                    onPress={() => setSelectedType(cat)}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        selectedType === cat && styles.filterTabTextActive,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              isEnrolled={enrollmentIds.includes(item.id)}
              onPress={() =>
                navigation.navigate('EventDetail', { eventId: item.id })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.brand.primary]}
            />
          }
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
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
  filterContainer: {
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.round,
    backgroundColor: colors.layout.surface,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  filterTabActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
  filterTabTextActive: {
    color: colors.text.inverse,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
    fontFamily: typography.fontFamily,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: typography.fontFamily,
  },
});

export default EventListScreen;
