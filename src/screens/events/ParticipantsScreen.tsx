import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft, Users } from 'lucide-react-native';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { listenToEvent } from '../../services/eventService';
import { getEventParticipants } from '../../services/enrollmentService';
import { Enrollment } from '../../types';
import ParticipantCard from '../../components/ParticipantCard';
import CustomLoader from '../../components/CustomLoader';
import UserHeader from '../../components/UserHeader';

const ParticipantsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const { eventId, eventTitle: initialTitle } = route.params;

  const [participants, setParticipants] = useState<Enrollment[]>([]);
  const [eventTitle, setEventTitle] = useState(initialTitle || 'Event');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const unsubscribeParticipants = getEventParticipants(eventId, data => {
      setParticipants(data);
      setLoading(false);
    });

    const unsubscribeEvent = listenToEvent(eventId, eventData => {
      if (eventData) setEventTitle(eventData.title);
    });

    return () => {
      unsubscribeParticipants();
      unsubscribeEvent();
    };
  }, [eventId]);

  const handleChatPress = (
    chatId: string,
    otherUserName: string,
    otherUserImage: string | null,
  ) => {
    navigation.navigate('ChatsTab', {
      screen: 'Chat',
      params: { chatId, otherUserName, otherUserImage },
    });
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Users size={48} color={colors.text.tertiary} />
        <Text style={styles.emptyTitle}>No Other Participants</Text>
        <Text style={styles.emptyText}>
          You're the first one here! More people will join soon.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <UserHeader title="Participants" participantsCount={participants.length} showBack={true} onBackPress={() => navigation.goBack()} showActions={false} />

      {loading ? (
        <CustomLoader
          message="Checking the Guest List..."
          overlay={false}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={participants}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ParticipantCard
              participant={item}
              currentUser={userProfile!}
              eventTitle={eventTitle}
              onChatPress={handleChatPress}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.layout.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
  badge: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});

export default ParticipantsScreen;
