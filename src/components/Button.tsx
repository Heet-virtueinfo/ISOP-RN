import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import CustomLoader from './CustomLoader';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const containerStyles = [
    styles.container,
    isPrimary && styles.primaryContainer,
    isSecondary && styles.secondaryContainer,
    isOutline && styles.outlineContainer,
    isGhost && styles.ghostContainer,
    disabled && styles.disabledContainer,
    style,
  ];

  const labelStyles = [
    styles.label,
    isPrimary && styles.primaryLabel,
    isSecondary && styles.secondaryLabel,
    isOutline && styles.outlineLabel,
    isGhost && styles.ghostLabel,
    disabled && styles.disabledLabel,
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={containerStyles}
    >
      {loading ? (
        <CustomLoader
          size={24}
          overlay={false}
          color={isPrimary ? colors.text.inverse : colors.brand.primary}
        />
      ) : (
        <Text style={labelStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  primaryContainer: {
    backgroundColor: colors.brand.primary,
    // Premium shadow
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryContainer: {
    backgroundColor: colors.brand.secondary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.brand.primary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
    height: 'auto',
    paddingVertical: spacing.xs,
  },
  disabledContainer: {
    backgroundColor: colors.ui.disabledSurface,
    borderColor: colors.ui.disabledSurface,
    shadowOpacity: 0,
    elevation: 0,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  primaryLabel: {
    color: colors.text.inverse,
  },
  secondaryLabel: {
    color: colors.text.inverse,
  },
  outlineLabel: {
    color: colors.brand.primary,
  },
  ghostLabel: {
    color: colors.brand.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
  disabledLabel: {
    color: colors.text.tertiary,
  },
});

export default Button;
