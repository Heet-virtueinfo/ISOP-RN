import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { BellRing, Newspaper, ExternalLink } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
  onPress?: () => void;
}

const NewsCard = ({ article, onPress }: NewsCardProps) => {
  const isAlert = article.type === 'alert';
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handlePress = () => {
    if (article.linkUrl) {
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
      activeOpacity={0.8}
    >
      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.image} />
      ) : null}

      <View style={styles.contentContainer}>
        {/* Header Row: Badge & Date */}
        <View style={styles.headerRow}>
          <View style={[styles.badge, isAlert ? styles.alertBadge : styles.newsBadge]}>
            {isAlert ? (
              <BellRing size={12} color={colors.status.error} />
            ) : (
              <Newspaper size={12} color={colors.brand.primary} />
            )}
            <Text style={[styles.badgeText, isAlert ? styles.alertText : styles.newsText]}>
              {isAlert ? 'URGENT ALERT' : 'NEWS'}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(article.createdAt)}</Text>
        </View>

        {/* Title & Content */}
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.contentSnippet} numberOfLines={3}>
          {article.content}
        </Text>

        {/* Action Row */}
        {article.linkUrl && (
          <View style={styles.actionRow}>
            <Text style={styles.readMoreText}>Read Full Article</Text>
            <ExternalLink size={14} color={colors.brand.primary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.layout.surface,
    borderRadius: radius.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.layout.divider,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.palette.slate.bg,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  alertBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  newsBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: typography.fontFamily,
    letterSpacing: 0.5,
  },
  alertText: {
    color: colors.status.error,
  },
  newsText: {
    color: colors.brand.primary,
  },
  dateText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    marginBottom: 8,
    lineHeight: 22,
  },
  contentSnippet: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primary,
    fontFamily: typography.fontFamily,
  },
});

export default NewsCard;
