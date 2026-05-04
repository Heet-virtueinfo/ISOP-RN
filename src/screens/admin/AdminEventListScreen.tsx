import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Search, Calendar, Clock, RotateCcw } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme';
import {
  adminGetEvents,
  adminDeleteEvent,
} from '../../services/admin/adminEventService';
import { AppEvent } from '../../types';
import EventCard from '../../components/EventCard';
import CustomLoader from '../../components/CustomLoader';
import DeleteEventModal from '../../components/modals/DeleteEventModal';
import Toast from 'react-native-toast-message';

const AdminEventListScreen = () => {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'new' | 'old'>('all');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEvents = async () => {
    try {
      const data = await adminGetEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      Toast.show({
        type: 'error',
        text1: 'Fetch Failed',
        text2: 'Could not synchronize event inventory.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const getSafeTime = (timestamp: any) => {
    if (!timestamp) return 0;
    if (typeof timestamp.toMillis === 'function') return timestamp.toMillis();
    if (typeof timestamp.toDate === 'function')
      return timestamp.toDate().getTime();
    return new Date(timestamp).getTime();
  };

  const filteredEvents = useMemo(() => {
    let result = [...events];
    const now = new Date().getTime();

    if (searchQuery) {
      result = result.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterType === 'new') {
      result = result.filter(event => getSafeTime(event.date) >= now);
      result.sort((a, b) => getSafeTime(a.date) - getSafeTime(b.date));
    } else if (filterType === 'old') {
      result = result.filter(event => getSafeTime(event.date) < now);
      result.sort((a, b) => getSafeTime(b.date) - getSafeTime(a.date));
    } else {
      result.sort(
        (a, b) => getSafeTime(b.createdAt) - getSafeTime(a.createdAt),
      );
    }

    return result;
  }, [events, searchQuery, filterType]);

  const handleDeletePress = (event: AppEvent) => {
    setSelectedEvent(event);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    setIsDeleting(true);
    try {
      await adminDeleteEvent(selectedEvent.id);
      Toast.show({
        type: 'success',
        text1: 'Deleted',
        text2: 'Event has been successfully removed.',
      });
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
      setDeleteModalVisible(false);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: error.message || 'Could not remove event.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const navigateToEdit = (eventId: string) => {
    navigation.navigate('EditEvent', { eventId });
  };

  const renderFilterButton = (
    label: string,
    type: typeof filterType,
    icon: any,
  ) => {
    const isActive = filterType === type;
    const Icon = icon;
    return (
      <TouchableOpacity
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => setFilterType(type)}
      >
        <Icon size={14} color={isActive ? 'white' : colors.text.secondary} />
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return <CustomLoader message="Loading Events..." overlay={false} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events by title..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={styles.filterRow}>
          {renderFilterButton('All', 'all', RotateCcw)}
          {renderFilterButton('New Events', 'new', Calendar)}
          {renderFilterButton('Old Events', 'old', Clock)}
        </View>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <EventCard
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
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events found</Text>
          </View>
        }
      />

      <DeleteEventModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        event={selectedEvent}
        loading={isDeleting}
      />
      {isDeleting && <CustomLoader overlay message="Deleting Event..." />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.layout.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.layout.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
    gap: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.layout.background,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  filterText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.text.tertiary,
  },
});

export default AdminEventListScreen;
