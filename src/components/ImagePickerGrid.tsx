import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { Camera, X } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme';

interface ImagePickerGridProps {
  images: string[];
  onChange: (images: string[]) => void;
  error?: string;
  maxImages?: number;
}

const ImagePickerGrid: React.FC<ImagePickerGridProps> = ({
  images,
  onChange,
  error,
  maxImages = 5,
}) => {
  const handlePick = () => {
    ImagePicker.openPicker({
      multiple: true,
      mediaType: 'photo',
      maxFiles: maxImages - images.length,
      compressImageMaxWidth: 1024,
      compressImageMaxHeight: 1024,
      compressImageQuality: 0.8,
    })
      .then(selectedImages => {
        const newPaths = selectedImages.map(img => img.path);
        onChange([...images, ...newPaths].slice(0, maxImages));
      })
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          console.error(err);
        }
      });
  };

  const handleRemove = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, error && styles.labelError]}>
          Event Images
        </Text>
        <Text style={styles.countText}>
          {images.length}/{maxImages}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {images.length < maxImages && (
          <TouchableOpacity
            style={[styles.addButton, error && styles.addBtnError]}
            onPress={handlePick}
            activeOpacity={0.7}
          >
            <Camera
              size={28}
              color={error ? colors.status.error : colors.brand.primary}
            />
            <Text style={[styles.addText, error && styles.addTextError]}>
              Add
            </Text>
          </TouchableOpacity>
        )}

        {images.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(index)}
              activeOpacity={0.8}
            >
              <X size={14} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.helpText}>
          Pick up to {maxImages} images (first image is the cover).
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.secondary,
  },
  labelError: {
    color: colors.status.error,
  },
  countText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  grid: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.layout.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.ui.inputBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  addBtnError: {
    borderColor: colors.status.error,
  },
  addText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.brand.primary,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xxs,
  },
  addTextError: {
    color: colors.status.error,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    marginRight: spacing.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  helpText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});

export default ImagePickerGrid;
