import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Phone } from 'lucide-react-native';
import InputField from './InputField';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { countryCodes } from '../utils/countries';

interface PhoneInputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  wrapperStyle?: StyleProp<ViewStyle>;
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  label,
  error,
  countryCode,
  onCountryCodeChange,
  wrapperStyle,
  ...props
}) => {
  const [isDropdownFocused, setIsDropdownFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error && styles.errorLabel]}>{label}</Text>
      <View style={styles.inputRow}>
        <Dropdown
          style={[
            styles.dropdown,
            isDropdownFocused && { borderColor: colors.brand.secondary },
            error && { borderColor: colors.status.error },
          ]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={countryCodes}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Code"
          value={countryCode}
          onFocus={() => setIsDropdownFocused(true)}
          onBlur={() => setIsDropdownFocused(false)}
          onChange={item => {
            onCountryCodeChange(item.value);
            setIsDropdownFocused(false);
          }}
        />
        <View style={styles.phoneInputContainer}>
          <InputField
            label=""
            leftIcon={Phone}
            style={styles.noMargin}
            containerStyle={styles.noMargin}
            wrapperStyle={wrapperStyle}
            {...props}
            error={undefined}
          />
        </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dropdown: {
    width: 100,
    height: 56,
    backgroundColor: colors.ui.inputBackground,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.ui.inputBorder,
    // Matching InputField shadows
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  },
  phoneInputContainer: {
    flex: 1,
  },
  noMargin: {
    marginBottom: 0,
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
