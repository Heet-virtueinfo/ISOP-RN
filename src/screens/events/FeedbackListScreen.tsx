import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft, MessageSquare, User } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../../theme';
import { getEventFeedback } from '../../services/feedbackService';
import { Feedback } from '../../types';
import StarRating from '../../components/StarRating';
import CustomLoader from '../../components/CustomLoader';
import UserHeader from '../../components/UserHeader';

const FeedbackListScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { eventId, eventTitle } = route.params;

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getEventFeedback(eventId, data => {
      setFeedbacks(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [eventId]);

  const renderFeedback = ({ item }: { item: Feedback }) => {
    const dateStr = item.createdAt?.toDate
      ? item.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : new Date(item.createdAt).toLocaleDateString();

    return (
      <View style={styles.feedbackCard}>
        <View style={styles.header}>
          {item.userImage ? (
            <Image source={{ uri: item.userImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <User size={20} color={colors.brand.primary} />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          <StarRating rating={item.rating} size={14} />
        </View>
        {item.comment ? (
          <Text style={styles.comment}>{item.comment}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <UserHeader title="Event Reviews" showBack={true} onBackPress={() => navigation.goBack()} />

      {loading ? (
        <CustomLoader message="Loading reviews..." overlay={false} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={item => item.id}
          renderItem={renderFeedback}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <MessageSquare size={40} color={colors.text.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>No Reviews Yet</Text>
              <Text style={styles.emptyText}>Be the first to share your thoughts!</Text>
            </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.layout.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.layout.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.layout.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  feedbackCard: {
    backgroundColor: colors.layout.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
  },
  date: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  comment: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    fontFamily: typography.fontFamily,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    marginTop: 60,
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
  },
});

export default FeedbackListScreen;
