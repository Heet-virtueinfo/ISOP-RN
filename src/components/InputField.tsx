import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: LucideIcon;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  leftIcon: LeftIcon,
  isPassword,
  secureTextEntry,
  onFocus,
  onBlur,
  style,
  containerStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderColor = error
    ? colors.status.error
    : isFocused
    ? colors.brand.secondary
    : colors.ui.inputBorder;

  const iconColor = isFocused ? colors.brand.secondary : colors.text.tertiary;

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && (
        <Text style={[styles.label, error && styles.errorLabel]}>{label}</Text>
      )}
      <View style={[styles.inputWrapper, { borderColor }]}>
        {LeftIcon && (
          <View style={styles.iconContainer}>
            <LeftIcon size={20} color={iconColor} />
          </View>
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconContainer}
          >
            {showPassword ? (
              <EyeOff size={20} color={iconColor} />
            ) : (
              <Eye size={20} color={iconColor} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  errorLabel: {
    color: colors.status.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ui.inputBackground,
    borderWidth: 1.5,
    borderRadius: 12,
    height: 56,
    paddingHorizontal: spacing.sm,
    // Shadow for iOS
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
  },
  iconContainer: {
    paddingHorizontal: spacing.xs,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.status.error,
    marginTop: spacing.xxs,
    marginLeft: spacing.xxs,
  },
});

export default InputField;
