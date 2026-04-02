import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookMarked, Calendar } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { getUserEnrollments } from '../../services/enrollmentService';
import { Enrollment, AppEvent } from '../../types';
import { getEventById } from '../../services/eventService';
import EventCard from '../../components/EventCard';
import CustomLoader from '../../components/CustomLoader';
import AdminHeader from '../../components/AdminHeader';

const MyEventsScreen = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const [enrolledEvents, setEnrolledEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    const unsubscribe = getUserEnrollments(userProfile.uid, async (enrollments) => {
      try {
        // Fetch full event details for each enrollment
        const eventPromises = enrollments.map(e => getEventById(e.eventId));
        const eventsData = await Promise.all(eventPromises);
        setEnrolledEvents(eventsData.filter((e): e is AppEvent => e !== null));
      } catch (error) {
        console.error('Error loading enrolled events:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [userProfile]);

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <BookMarked size={40} color={colors.text.tertiary} />
        </View>
        <Text style={styles.emptyTitle}>No Enrollments Yet</Text>
        <Text style={styles.emptyText}>Discover interesting events and join the ISoP conversation.</Text>
        <TouchableOpacity 
          style={styles.browseBtn}
          onPress={() => navigation.navigate('EventsTab')}
        >
          <Calendar size={18} color="white" />
          <Text style={styles.browseBtnText}>Browse Events</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AdminHeader 
        title="My Enrollments" 
      />

      {loading ? (
        <CustomLoader message="Retrieving Your Schedule..." overlay={false} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={enrolledEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard 
              event={item} 
              onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
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
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    marginTop: 80,
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
