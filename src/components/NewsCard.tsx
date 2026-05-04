import React from 'react';
import { getImageSource } from '../utils/imageHelpers';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { 
  BellRing, 
  Newspaper, 
  ExternalLink, 
  ArrowUpRight,
  Clock,
  Pencil,
  Trash2,
  MoreVertical
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
  onPress?: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const NewsCard = ({ article, onPress, isAdmin, onEdit, onDelete }: NewsCardProps) => {
  const isAlert = article.type === 'alert';
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePress = () => {
    if (article.linkUrl && !isAdmin) {
      Linking.openURL(article.linkUrl).catch(err => 
        console.error("Couldn't load page", err)
      );
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrapper}>
        {article.imageUrl ? (
          <Image source={getImageSource(article.imageUrl)} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            {isAlert ? (
              <BellRing size={40} color={colors.status.error + '40'} />
            ) : (
              <Newspaper size={40} color={colors.brand.primary + '40'} />
            )}
          </View>
        )}
        
        {/* Date Overlay */}
        <View style={styles.dateOverlay}>
          <Clock size={10} color="white" />
          <Text style={styles.dateTextOverlay}>{formatDate(article.createdAt)}</Text>
        </View>

        {/* Type Badge */}
        <View style={[styles.typeBadge, isAlert ? styles.alertBadge : styles.newsBadge]}>
          <Text style={[styles.typeText, isAlert ? styles.alertText : styles.newsText]}>
            {isAlert ? 'INTEL ALERT' : 'EDITORIAL'}
          </Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        
        <Text style={styles.contentSnippet} numberOfLines={2}>
          {article.content}
        </Text>

        <View style={styles.footer}>
          {!isAdmin ? (
            <View style={styles.userFooter}>
              <Text style={styles.readMore}>Analyze Full Report</Text>
              <ArrowUpRight size={14} color={colors.brand.primary} />
            </View>
          ) : (
            <View style={styles.adminFooter}>
              <View style={styles.authorSection}>
                <View style={styles.dot} />
                <Text style={styles.authorText}>Official Broadcast</Text>
              </View>
              <View style={styles.adminActions}>
                <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
                  <Pencil size={14} color={colors.brand.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
                  <Trash2 size={14} color={colors.status.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.layout.surface,
    borderRadius: 24,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
      },
      android: { elevation: 4 },
    }),
  },
  imageWrapper: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.palette.slate.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // Slightly more transparent
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateTextOverlay: {
    color: 'white',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
    letterSpacing: 0.5,
  },
  typeBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  newsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: colors.brand.primary + '10',
  },
  alertBadge: {
    backgroundColor: colors.status.error,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  newsText: {
    color: colors.brand.primary,
  },
  alertText: {
    color: 'white',
  },
  contentContainer: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  contentSnippet: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    opacity: 0.7, // More subtle
    marginBottom: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.layout.divider,
    paddingTop: 16,
    borderStyle: 'dashed',
  },
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readMore: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.brand.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  adminFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.primary,
  },
  authorText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.error + '05',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.status.error + '10',
  },
});


export default NewsCard;
