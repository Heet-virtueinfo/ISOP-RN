import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  FileText,
  PlayCircle,
  Link2,
  Download,
  Pencil,
  Trash2,
  ChevronRight,
  FileCode,
  Globe,
  Shield
} from 'lucide-react-native';
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
        return {
          Icon: FileText,
          color: colors.status.error,
          bg: colors.status.error + '10',
          label: 'SECURE PDF'
        };
      case 'video':
        return {
          Icon: PlayCircle,
          color: colors.brand.secondary,
          bg: colors.brand.secondary + '10',
          label: 'VIDEO BRIEF'
        };
      case 'link':
        return {
          Icon: Globe,
          color: colors.palette.indigo.accent,
          bg: colors.palette.indigo.bg,
          label: 'EXTERNAL INTEL'
        };
      default:
        return {
          Icon: Link2,
          color: colors.brand.primary,
          bg: colors.palette.slate.bg,
          label: 'RESOURCE NODE'
        };
    }
  };

  const { Icon, color, bg, label } = getIconConfig();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (resource.url && !isAdmin) {
      downloadFile(resource.url, resource.title);
    }
  };

  const formatCategory = (cat: string) => {
    return cat?.toUpperCase() || 'GENERAL';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.contentRow}>
        <View style={[styles.iconBox, { backgroundColor: bg }]}>
          <Icon size={22} color={color} />
        </View>

        <View style={styles.mainContent}>
          <View style={styles.topMeta}>
            <View style={[styles.typeBadge, { backgroundColor: bg }]}>
              <Text style={[styles.typeBadgeText, { color }]}>{label}</Text>
            </View>
            <View style={styles.dot} />
            <Text style={styles.categoryTag}>{formatCategory(resource.category)}</Text>
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {resource.title}
          </Text>

          <Text style={styles.description} numberOfLines={2}>
            {resource.description || 'Strategic intelligence asset with no detailed specifications.'}
          </Text>
        </View>

        {!isAdmin && (
          <View style={styles.actionCol}>
            <View style={styles.downloadBox}>
              <Download size={16} color={colors.brand.primary} />
            </View>
          </View>
        )}
      </View>

      {isAdmin && (
        <View style={styles.adminFooter}>
          <View style={styles.authorSection}>
            <Shield size={10} color={colors.brand.primary} />
            <Text style={styles.authorText}>Verified Asset</Text>
          </View>

          <View style={styles.adminActions}>
            <TouchableOpacity
              onPress={onEdit}
              style={styles.actionBtn}
              activeOpacity={0.7}
            >
              <Pencil size={12} color={colors.brand.primary} />
              <Text style={styles.actionBtnText}>Configure</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDelete}
              style={[styles.actionBtn, styles.deleteBtn]}
              activeOpacity={0.7}
            >
              <Trash2 size={12} color={colors.status.error} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mainContent: {
    flex: 1,
  },
  topMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: typography.fontFamily,
  },
  categoryTag: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: typography.fontFamily,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.layout.divider,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  description: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
    opacity: 0.7,
  },
  actionCol: {
    paddingLeft: spacing.sm,
    justifyContent: 'center',
    height: 48,
  },
  downloadBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.brand.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brand.primary + '20',
  },
  adminFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.layout.divider,
    borderStyle: 'dashed',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: typography.fontFamily,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.layout.divider,
  },
  deleteBtn: {
    backgroundColor: colors.status.error + '05',
    borderColor: colors.status.error + '10',
    paddingHorizontal: 10,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
  },
});

export default ResourceCard;
