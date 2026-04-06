import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookMarked, Calendar, Search } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { getUserEnrollments } from '../../services/enrollmentService';
import { Enrollment, AppEvent, EventType } from '../../types';
import { getEventById } from '../../services/eventService';
import EventCard from '../../components/EventCard';
import CustomLoader from '../../components/CustomLoader';
import UserHeader from '../../components/UserHeader';
import InputField from '../../components/InputField';

const MyEventsScreen = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const [enrolledEvents, setEnrolledEvents] = useState<AppEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories: (EventType | 'all')[] = ['all', 'conference', 'webinar', 'training', 'meeting'];

  useEffect(() => {
    if (!userProfile) return;

    const unsubscribe = getUserEnrollments(
      userProfile.uid,
      async enrollments => {
        try {
          // Fetch full event details for each enrollment
          const eventPromises = enrollments.map(e => getEventById(e.eventId));
          const eventsData = await Promise.all(eventPromises);
          setEnrolledEvents(
            eventsData.filter((e): e is AppEvent => e !== null),
          );
        } catch (error) {
          console.error('Error loading enrolled events:', error);
        } finally {
          setLoading(false);
        }
      },
    );

    return () => unsubscribe();
  }, [userProfile]);

  const filteredEvents = useMemo(() => {
    return enrolledEvents.filter(event => {
      const matchesQuery =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || event.type === selectedType;
      return matchesQuery && matchesType;
    });
  }, [enrolledEvents, searchQuery, selectedType]);

  const onRefresh = () => {
    if (!userProfile) return;
    setRefreshing(true);
    // getUserEnrollments will re-trigger via the listener, but we can force it if needed
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
            ? "Try adjusting your search or filters to find your events."
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
