import React from 'react';
import { View, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { CheckCircle2, LucideIcon } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme';

interface BentoFormTileProps {
  children: React.ReactNode;
  icon: LucideIcon;
  title: string;
  isValid?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const BentoFormTile: React.FC<BentoFormTileProps> = ({
  children,
  icon: Icon,
  title,
  isValid = false,
  style,
  fullWidth = true,
}) => {
  return (
    <View style={[styles.container, !fullWidth && styles.halfWidth, style]}>
      {/* Floating Header Badge */}
      <View style={[styles.badge, isValid && styles.badgeValid]}>
        <Icon 
          size={14} 
          color={isValid ? colors.text.inverse : colors.brand.primary} 
        />
        <Text style={[styles.badgeText, isValid && styles.badgeTextValid]}>
          {title}
        </Text>
        {isValid && (
          <CheckCircle2 
            size={12} 
            color={colors.text.inverse} 
            style={styles.checkIcon} 
          />
        )}
      </View>
      
      {/* Content Container */}
      <View style={styles.childContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.layout.surface,
    borderRadius: 24,
    padding: spacing.lg,
    paddingTop: 32,
    marginBottom: spacing.xl,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: colors.brand.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  halfWidth: {
    flex: 1,
    marginBottom: 0,
  },
  badge: {
    position: 'absolute',
    top: -12,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.layout.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.palette.indigo.bg,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  badgeValid: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  badgeText: {
    fontFamily: typography.fontFamily,
    fontSize: 9,
    fontWeight: '800',
    color: colors.text.secondary,
    marginLeft: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgeTextValid: {
    color: colors.text.inverse,
  },
  checkIcon: {
    marginLeft: 4,
  },
  childContainer: {
    width: '100%',
  },
});

export default BentoFormTile;
