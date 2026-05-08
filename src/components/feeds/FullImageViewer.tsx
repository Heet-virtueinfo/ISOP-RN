import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { FeedMedia } from '../../services/feedService';
import { colors, typography } from '../../theme';

interface FullImageViewerProps {
  visible: boolean;
  images: FeedMedia[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

const FullImageViewer = ({
  visible,
  images,
  index,
  onClose,
  onIndexChange,
}: FullImageViewerProps) => {
  if (!visible || images.length === 0) return null;

  const currentImage = images[index];

  const handleNext = () => {
    if (index < images.length - 1) {
      onIndexChange(index + 1);
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      onIndexChange(index - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.viewerContainer}>
        <TouchableOpacity
          style={styles.viewerCloseBtn}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <X size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.viewerContent}>
          {images.length > 1 && index > 0 && (
            <TouchableOpacity
              style={styles.viewerNavBtnLeft}
              onPress={handlePrev}
              activeOpacity={0.7}
            >
              <ChevronLeft size={30} color="white" />
            </TouchableOpacity>
          )}

          <Image
            source={{ uri: currentImage.url }}
            style={styles.viewerImage}
            resizeMode="contain"
          />

          {images.length > 1 && index < images.length - 1 && (
            <TouchableOpacity
              style={styles.viewerNavBtnRight}
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <ChevronRight size={30} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {images.length > 1 && (
          <View style={styles.viewerPagination}>
            <Text style={styles.viewerPaginationText}>
              {index + 1} / {images.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  viewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  viewerNavBtnLeft: {
    position: 'absolute',
    left: 10,
    zIndex: 20,
    backgroundColor: colors.brand.primary,
    borderRadius: 25,
    padding: 5,
  },
  viewerNavBtnRight: {
    position: 'absolute',
    right: 10,
    zIndex: 20,
    backgroundColor: colors.brand.primary,
    borderRadius: 25,
    padding: 5,
  },
  viewerPagination: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewerPaginationText: {
    fontFamily: typography.fontFamily,
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default FullImageViewer;
