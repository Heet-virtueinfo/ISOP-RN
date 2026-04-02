import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Calendar,
  BookMarked,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveEvents } from '../../services/eventService';
import { getUserEnrollments } from '../../services/enrollmentService';
import { AppEvent } from '../../types';
import EventCard from '../../components/EventCard';
import CustomLoader from '../../components/CustomLoader';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<AppEvent[]>([]);
  const [enrollmentsCount, setEnrollmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    // Fetch active events and take top 3
    const unsubscribeEvents = getActiveEvents(events => {
      setUpcomingEvents(events.slice(0, 3));
      setLoading(false);
    });

    // Fetch enrollment count
    const unsubscribeEnrollments = getUserEnrollments(
      userProfile.uid,
      enrollments => {
        setEnrollmentsCount(enrollments.length);
      },
    );

    return () => {
      unsubscribeEvents();
      unsubscribeEnrollments();
    };
  }, [userProfile]);

  const navigateToEvents = () => navigation.navigate('EventList');
  const navigateToMyEvents = () => navigation.navigate('MyEventsTab');

  if (loading) {
    return (
      <CustomLoader
        message="Initializing Experience..."
        overlay={false}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Personalized Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>
                Hello, {userProfile?.displayName?.split(' ')[0] || 'Member'}{' '}
              </Text>
              <Text style={styles.waveEmoji}>👋</Text>
            </View>
            <Text style={styles.subtitle}>
              Welcome back to the ISoP community.
            </Text>
          </View>
          <View style={styles.profileInitials}>
            <Text style={styles.initialsText}>
              {userProfile?.displayName?.[0] || 'U'}
            </Text>
          </View>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[
              styles.statBox,
              { backgroundColor: 'rgba(79, 70, 229, 0.05)' },
            ]}
            onPress={navigateToMyEvents}
          >
            <BookMarked size={20} color={colors.brand.primary} />
            <View>
              <Text style={styles.statValue}>{enrollmentsCount}</Text>
              <Text style={styles.statLabel}>Events Joined</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statBox,
              { backgroundColor: 'rgba(16, 185, 129, 0.05)' },
            ]}
            onPress={navigateToEvents}
          >
            <Calendar size={20} color="#10B981" />
            <View>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {upcomingEvents.length}
              </Text>
              <Text style={styles.statLabel}>Active Events</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Upcoming Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Sparkles size={16} color={colors.brand.primary} />
            <Text style={styles.sectionTitle}>UPCOMING EVENTS</Text>
          </View>
          <TouchableOpacity onPress={navigateToEvents}>
            <View style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={14} color={colors.brand.primary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.eventGrid}>
          {upcomingEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No upcoming events scheduled.
              </Text>
            </View>
          ) : (
            upcomingEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() =>
                  navigation.navigate('EventDetail', { eventId: event.id })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
  },
  waveEmoji: {
    fontSize: 22,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  profileInitials: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.layout.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  initialsText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brand.primary,
    letterSpacing: 1.5,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  eventGrid: {
    gap: spacing.md,
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
    backgroundColor: colors.layout.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
});

export default HomeScreen;
