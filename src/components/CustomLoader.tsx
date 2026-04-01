import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Modal,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Loader2 } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../theme';

interface CustomLoaderProps {
  size?: number;
  color?: string;
  message?: string;
  overlay?: boolean;
  style?: StyleProp<ViewStyle>;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({
  size = 32,
  color = colors.brand.primary,
  message,
  overlay = true,
  style,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRotation = () => {
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startRotation();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (overlay) {
    return (
      <Modal transparent={true} animationType="fade" visible={true}>
        <View style={[styles.overlay, style]}>
          <View style={styles.loaderWrapper}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Loader2 size={size} color={color} />
            </Animated.View>
            {message && <Text style={styles.messageText}>{message}</Text>}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Loader2 size={size} color={color} />
      </Animated.View>
      {message && <Text style={styles.messageText}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loaderWrapper: {
    padding: spacing.xl,
    backgroundColor: colors.layout.surface,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    // Premium shadow
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  messageText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default CustomLoader;
