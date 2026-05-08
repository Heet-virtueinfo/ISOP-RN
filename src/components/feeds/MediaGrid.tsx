import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FeedMedia } from '../../services/feedService';
import { radius, spacing } from '../../theme';
import { colors } from '../../theme';

interface MediaGridProps {
  media: FeedMedia[];
  onPressImage: (index: number, images: FeedMedia[]) => void;
}

const MediaGrid = ({ media, onPressImage }: MediaGridProps) => {
  if (!media || media.length === 0) return null;

  const images = media.filter(m => m.type === 'image');
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <View style={styles.mediaGrid}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onPressImage(0, images)}
        >
          <Image
            source={{ uri: images[0].url }}
            style={styles.imageFullWidth}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    );
  }

  if (images.length === 2) {
    return (
      <View style={[styles.mediaGrid, styles.mediaRow]}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.imageHalf}
          onPress={() => onPressImage(0, images)}
        >
          <Image
            source={{ uri: images[0].url }}
            style={styles.imageFullSize}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.imageHalf}
          onPress={() => onPressImage(1, images)}
        >
          <Image
            source={{ uri: images[1].url }}
            style={styles.imageFullSize}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    );
  }

  if (images.length === 3) {
    const topRow = images.slice(0, 2);
    const bottomRow = images.slice(2);
    return (
      <View style={styles.mediaGrid}>
        <View style={styles.mediaRow}>
          {topRow.map((img, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.9}
              style={styles.imageHalf}
              onPress={() => onPressImage(i, images)}
            >
              <Image
                source={{ uri: img.url }}
                style={styles.imageFullSize}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.mediaRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.imageFullWidth}
            onPress={() => onPressImage(2, images)}
          >
            <Image
              source={{ uri: bottomRow[0].url }}
              style={styles.imageFullWidth}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 4 or more
  const topRow = images.slice(0, 2);
  const bottomRow = images.slice(2, 4);
  const extra = images.length - 4;
  return (
    <View style={styles.mediaGrid}>
      <View style={styles.mediaRow}>
        {topRow.map((img, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.9}
            style={styles.imageHalf}
            onPress={() => onPressImage(i, images)}
          >
            <Image
              source={{ uri: img.url }}
              style={styles.imageFullSize}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.mediaRow}>
        {bottomRow.map((img, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.9}
            style={styles.imageHalf}
            onPress={() => onPressImage(i + 2, images)}
          >
            <Image
              source={{ uri: img.url }}
              style={styles.imageFullSize}
              resizeMode="cover"
            />
            {i === 1 && extra > 0 && (
              <View style={styles.mediaOverlay}>
                <Text style={styles.mediaOverlayText}>+{extra}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mediaGrid: {
    width: '100%',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    gap: 8,
  },
  mediaRow: { flexDirection: 'row', width: '100%', gap: 8 },
  imageHalf: {
    flex: 1,
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.layout.surfaceElevated,
    overflow: 'hidden',
    position: 'relative',
  },
  imageFullWidth: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    backgroundColor: colors.layout.surfaceElevated,
    overflow: 'hidden',
    position: 'relative',
  },
  imageFullSize: { width: '100%', height: '100%' },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaOverlayText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
  },
});

export default MediaGrid;
