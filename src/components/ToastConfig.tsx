import React from 'react';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.status.success,
        height: 60,
        borderLeftWidth: 6,
        backgroundColor: colors.layout.surface,
        borderRadius: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: spacing.md }}
      text1Style={{
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        fontFamily: typography.fontFamily,
        color: colors.text.primary,
      }}
      text2Style={{
        fontSize: typography.sizes.xs,
        fontFamily: typography.fontFamily,
        color: colors.text.secondary,
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: colors.status.error,
        height: 60,
        borderLeftWidth: 6,
        backgroundColor: colors.layout.surface,
        borderRadius: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: spacing.md }}
      text1Style={{
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        fontFamily: typography.fontFamily,
        color: colors.text.primary,
      }}
      text2Style={{
        fontSize: typography.sizes.xs,
        fontFamily: typography.fontFamily,
        color: colors.text.secondary,
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.status.info,
        height: 60,
        borderLeftWidth: 6,
        backgroundColor: colors.layout.surface,
        borderRadius: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: spacing.md }}
      text1Style={{
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        fontFamily: typography.fontFamily,
        color: colors.text.primary,
      }}
      text2Style={{
        fontSize: typography.sizes.xs,
        fontFamily: typography.fontFamily,
        color: colors.text.secondary,
      }}
    />
  ),
  warning: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.status.warning,
        height: 60,
        borderLeftWidth: 6,
        backgroundColor: colors.layout.surface,
        borderRadius: 12,
      }}
      contentContainerStyle={{ paddingHorizontal: spacing.md }}
      text1Style={{
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
        fontFamily: typography.fontFamily,
        color: colors.text.primary,
      }}
      text2Style={{
        fontSize: typography.sizes.xs,
        fontFamily: typography.fontFamily,
        color: colors.text.secondary,
      }}
    />
  ),
};
