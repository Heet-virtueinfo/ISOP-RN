import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { FileText, PlayCircle, Link2, Download, Pencil, Trash2 } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme';
import { ResourceItem } from '../types';
import { downloadFile } from '../services/downloadService';

interface ResourceCardProps {
  resource: ResourceItem;
  onPress?: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ResourceCard = ({ resource, onPress, isAdmin, onEdit, onDelete }: ResourceCardProps) => {

  const getIconConfig = () => {
    switch (resource.type) {
      case 'pdf':
        return { Icon: FileText, color: colors.status.error, bg: 'rgba(239, 68, 68, 0.1)' };
      case 'video':
        return { Icon: PlayCircle, color: colors.brand.secondary, bg: 'rgba(245, 158, 11, 0.1)' };
      default:
        return { Icon: Link2, color: colors.brand.primary, bg: 'rgba(79, 70, 229, 0.1)' };
    }
  };

  const { Icon, color, bg } = getIconConfig();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (resource.url && !isAdmin) {
      // All resource types trigger download for users
      downloadFile(resource.url, resource.title);
    }
  };

  const handleDownload = () => {
    if (resource.url) {
      downloadFile(resource.url, resource.title);
    }
  };

  const formatCategory = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: bg }]}>
        <Icon size={24} color={color} />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.categoryText}>{formatCategory(resource.category)}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {resource.title}
        </Text>
        {resource.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {resource.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.actionContainer}>
        {isAdmin ? (
          <View style={styles.adminActions}>
            <TouchableOpacity
              onPress={onEdit}
              style={[styles.adminBtn, styles.editBtn]}
              activeOpacity={0.7}
            >
              <Pencil size={18} color={colors.brand.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              style={[styles.adminBtn, styles.deleteBtn]}
              activeOpacity={0.7}
            >
              <Trash2 size={18} color={colors.status.error} />
            </TouchableOpacity>
          </View>
        ) : (
          // User: show a clean download button only
          <TouchableOpacity
            onPress={handleDownload}
            style={styles.downloadBtn}
            activeOpacity={0.7}
          >
            <Download size={20} color={colors.brand.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.layout.divider,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contentContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  categoryText: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: spacing.sm,
  },
  downloadBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(79, 70, 229, 0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.15)',
  },
  adminActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  adminBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  editBtn: {
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    borderColor: 'rgba(79, 70, 229, 0.2)',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
});

export default ResourceCard;
