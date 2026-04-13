import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TextInputProps,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Phone } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { countryCodes } from '../utils/countries';

interface PhoneInputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  label,
  error,
  countryCode,
  onCountryCodeChange,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

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

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && (
        <Text style={[styles.label, error && styles.errorLabel]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
          },
        ]}
      >
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={countryCodes}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Code"
          value={countryCode}
          onChange={item => {
            onCountryCodeChange(item.value);
          }}
          containerStyle={styles.dropdownListContainer}
          itemTextStyle={styles.dropdownItemText}
        />
        
        <View style={styles.verticalDivider} />
        
        <View style={styles.iconContainer}>
          <Phone size={20} color={isFocused ? colors.brand.secondary : colors.text.tertiary} />
        </View>

        <TextInput
          style={styles.input}
          placeholderTextColor={colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="phone-pad"
          {...props}
        />
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
    paddingHorizontal: spacing.xs,
    // Shadow for iOS
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
  },
  dropdown: {
    width: 70,
    height: '100%',
    paddingHorizontal: spacing.xs,
  },
  placeholderStyle: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    fontFamily: typography.fontFamily,
  },
  selectedTextStyle: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontFamily: typography.fontFamily,
    fontWeight: '600',
  },
  dropdownListContainer: {
    borderRadius: 12,
    marginTop: 4,
  },
  dropdownItemText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
  },
  verticalDivider: {
    width: 1,
    height: '50%',
    backgroundColor: colors.ui.inputBorder,
    marginHorizontal: spacing.xs,
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
    paddingVertical: Platform.OS === 'ios' ? 0 : 4,
  },
  errorText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.status.error,
    marginTop: spacing.xxs,
    marginLeft: spacing.xxs,
  },
});

export default PhoneInputField;
