import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { getEvents } from '../../services/eventService';
import { AppEvent } from '../../types';
import EventCard from '../../components/EventCard';
import CustomLoader from '../../components/CustomLoader';

const AdminDashboard = () => {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getEvents((eventsList) => {
      setEvents(eventsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const navigateToEdit = (eventId: string) => {
    navigation.navigate('EditEvent', { eventId });
  };

  const renderEmptyList = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Events Found</Text>
        <Text style={styles.emptyText}>Create your first event to get started.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{events.length}</Text>
          <Text style={styles.statLabel}>Total Events</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {events.reduce((sum, ev) => sum + (ev.enrolledCount || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Total Enrollments</Text>
        </View>
      </View>

      {loading ? (
        <CustomLoader message="Loading Events..." overlay={false} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard 
              event={item} 
              onPress={() => navigateToEdit(item.id)}
              onEdit={() => navigateToEdit(item.id)}
              onDelete={() => navigateToEdit(item.id)} // Delete handled inside Edit screen
              isAdminView
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.layout.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ui.inputBorder,
  },
  statValue: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  statLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
});

export default AdminDashboard;
