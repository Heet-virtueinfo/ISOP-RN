import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Calendar, Users, Edit2, Trash2 } from 'lucide-react-native';
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
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isAdminView?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onEdit,
  onDelete,
  isAdminView = false,
}) => {
  const isActive = isEventActive(event);
  const isFull = isEventFull(event);
  const imageSource = getEventImage(event);
  const typeLabel = getEventTypeLabel(event.type);
  const typeColor = getEventTypeColor(event.type, colors);

  return (
    <TouchableOpacity
      style={[styles.container, !isActive && styles.inactiveContainer]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
          <Text style={styles.typeText}>{typeLabel}</Text>
        </View>
        {!isActive && (
          <View style={styles.statusOverlay}>
            <Text style={styles.statusText}>Ended</Text>
          </View>
        )}
        {isActive && isFull && (
          <View style={[styles.statusOverlay, styles.fullOverlay]}>
            <Text style={styles.statusText}>Full</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.metaRow}>
          <Calendar size={16} color={colors.text.secondary} />
          <Text style={styles.metaText}>{formatEventDate(event.date)}</Text>
        </View>

        <View style={styles.metaRow}>
          <MapPin size={16} color={colors.text.secondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <Users size={16} color={colors.brand.primary} />
            <Text style={styles.enrollText}>
              {event.enrolledCount} {event.maxCapacity ? `/ ${event.maxCapacity}` : ''} Enrolled
            </Text>
          </View>

          {isAdminView && onEdit && onDelete && (
            <View style={styles.adminActions}>
              <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
                <Edit2 size={18} color={colors.brand.secondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
                <Trash2 size={18} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.layout.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inactiveContainer: {
    opacity: 0.6,
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  typeText: {
    color: colors.text.inverse,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)', // light red tint over image
  },
  statusText: {
    color: colors.text.inverse,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metaText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.layout.divider,
  },
  enrollText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.brand.primary,
    marginLeft: spacing.xs,
  },
  adminActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default EventCard;
