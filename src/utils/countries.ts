export const countryCodes = [
  { label: '+91', value: '+91' },
  { label: '+1', value: '+1' },
  { label: '+44', value: '+44' },
  { label: '+971', value: '+971' },
  { label: '+61', value: '+61' },
  { label: '+1', value: '+1-CA' },
  { label: '+49', value: '+49' },
  { label: '+33', value: '+33' },
  { label: '+65', value: '+65' },
  { label: '+81', value: '+81' },
];

export const defaultCountry = countryCodes[0];

export const splitPhoneNumber = (fullNumber: string) => {
  if (!fullNumber) return { countryCode: defaultCountry.value, mobile: '' };

  // Sort country codes by length descending to match longest prefix first (e.g., +1-CA before +1)
  const sortedCodes = [...countryCodes].sort((a, b) => b.value.length - a.value.length);

  for (const code of sortedCodes) {
    if (fullNumber.startsWith(code.value)) {
      return {
        countryCode: code.value,
        mobile: fullNumber.slice(code.value.length).trim(),
      };
    }
  }

  // Default to first code if no match (assuming it might be a number without code)
  return { countryCode: defaultCountry.value, mobile: fullNumber };
};
