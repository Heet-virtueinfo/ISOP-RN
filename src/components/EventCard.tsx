import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { MapPin, Calendar, Users, Edit2, Trash2, Star } from 'lucide-react-native';
import { AppEvent } from '../types';
import { colors, spacing, typography, radius } from '../theme';
import {
  formatEventDate,
  getEventImage,
  getEventTypeLabel,
  getEventTypeColor,
  isEventActive,
  isEventFull,
} from '../utils/eventHelpers';

interface EventCardProps {
  event: AppEvent;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isAdminView?: boolean;
  isEnrolled?: boolean;
}

const getEventStatus = (eventDate: any) => {
  const now = new Date();
  
  let event: Date;
  if (eventDate && typeof eventDate.toDate === 'function') {
    event = eventDate.toDate();
  } else {
    event = new Date(eventDate);
  }
  
  const diffHours = (event.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0)
    return {
      label: 'COMPLETED',
      color: colors.text.tertiary,
      bg: colors.palette.slate.bg,
    };
  if (diffHours < 24)
    return {
      label: 'ONGOING',
      color: colors.status.success,
      bg: 'rgba(34, 197, 94, 0.1)',
    };
  return {
    label: 'UPCOMING',
    color: colors.brand.primary,
    bg: 'rgba(79, 70, 229, 0.1)',
  };
};

const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onEdit,
  onDelete,
  isAdminView = false,
  isEnrolled = false,
}) => {
  const isActive = isEventActive(event);
  const isFull = isEventFull(event);
  const imageSource = getEventImage(event);
  const typeLabel = getEventTypeLabel(event.type);
  const typeColor = getEventTypeColor(event.type, colors);
  const status = getEventStatus(event.date);

  const enrollmentProgress = event.maxCapacity
    ? event.enrolledCount / event.maxCapacity
    : 0;

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[styles.container, !isActive && styles.inactiveContainer]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageHeader}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />

        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
          <Text style={styles.typeText}>{typeLabel}</Text>
        </View>
        {isEnrolled && (
          <View style={styles.enrolledBadge}>
            <Text style={styles.enrolledText}>ENROLLED</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusChipText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Calendar size={12} color={colors.text.tertiary} />
            <Text style={styles.metaText}>{formatEventDate(event.date)}</Text>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={12} color={colors.text.tertiary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
          {event.averageRating !== undefined && event.ratingCount !== undefined && event.ratingCount > 0 && (
            <View style={styles.metaItem}>
              <Star size={12} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.metaText}>
                {event.averageRating.toFixed(1)} ({event.ratingCount})
              </Text>
            </View>
          )}
        </View>

        {/* Enrollment Strategy Bar */}
        <View style={styles.enrollmentSection}>
          <View style={styles.enrollmentLabels}>
            <View style={styles.usersIconRow}>
              <Users size={14} color={colors.brand.primary} />
              <Text style={styles.enrollCountText}>
                {event.enrolledCount}{' '}
                <Text style={styles.enrollTotalText}>
                  / {event.maxCapacity || '∞'}
                </Text>
              </Text>
            </View>
            <Text style={styles.percentText}>
              {Math.round(enrollmentProgress * 100)}% Full
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${enrollmentProgress * 100}%` },
                enrollmentProgress >= 1 && {
                  backgroundColor: colors.status.error,
                },
              ]}
            />
          </View>
        </View>

        {isAdminView && (onEdit || onDelete) && (
          <View style={styles.adminDock}>
            <View style={styles.dockDivider} />
            <View style={styles.dockActions}>
              <TouchableOpacity
                onPress={onEdit}
                style={styles.dockBtn}
                activeOpacity={0.7}
              >
                <Edit2 size={16} color={colors.brand.primary} />
                <Text style={styles.dockBtnText}>Edit Details</Text>
              </TouchableOpacity>

              <View style={styles.dockActionDivider} />

              <TouchableOpacity
                onPress={onDelete}
                style={styles.dockBtn}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.layout.surface,
    borderRadius: 24,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(241, 245, 249, 1)',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 18,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inactiveContainer: {
    opacity: 0.8,
  },
  imageHeader: {
    height: 120,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusChipText: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: colors.text.inverse,
    fontFamily: typography.fontFamily,
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  enrolledBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  enrolledText: {
    color: 'white',
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  content: {
    padding: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  metaGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.text.tertiary,
    marginLeft: 6,
    fontWeight: '500',
  },
  enrollmentSection: {
    marginBottom: 8,
  },
  enrollmentLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  usersIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enrollCountText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brand.primary,
    marginLeft: 8,
  },
  enrollTotalText: {
    color: colors.text.tertiary,
    fontSize: 11,
    fontWeight: '500',
  },
  percentText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.palette.slate.bg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 3,
  },
  adminDock: {
    marginTop: 16,
  },
  dockDivider: {
    height: 1,
    backgroundColor: colors.layout.divider,
    marginBottom: 12,
  },
  dockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dockBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
    marginLeft: 8,
  },
  dockActionDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.layout.divider,
  },
});

export default EventCard;
