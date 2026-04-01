import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System', // Uses native San Francisco on iOS
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  fontFamily,
  
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  } as const,
  
  sizes: {
    xs: 12, // Captions, tiny text, metadata
    sm: 14, // Secondary details, small buttons
    md: 16, // Standard body text, main input text
    lg: 18, // Subheadings, large buttons
    xl: 20, // Headings, card titles
    xxl: 24, // Screen Titles
    title: 32, // Large displays, empty states
  },
  
  lineHeights: {
    xs: 18,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    title: 40,
  }
};
