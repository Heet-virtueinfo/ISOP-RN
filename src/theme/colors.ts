export const colors = {
  // Brand Colors
  brand: {
    primary: '#1E3A8A', // Deep Blue - App headers, primary buttons, bottom navigation active state
    primaryLight: '#3B82F6', // Lighter Blue - Hover states, secondary buttons
    primaryDark: '#172554', // Very Dark Blue - Strong contrasts, splash screen background
    secondary: '#0EA5E9', // Cyan - Interactive links, Special Interest Group (SIG) badges
    accent: '#14B8A6', // Teal - Call to Action (CTA), notifications, dynamic highlights
  },

  // Backgrounds & Surfaces (Using Slate palette for cool, professional neutrals)
  layout: {
    background: '#F8FAFC', // Slate 50 - Main app background
    surface: '#FFFFFF', // Pure white - Cards (e.g., Event Calendar cards, News Hub)
    surfaceElevated: '#F1F5F9', // Slate 100 - Modals, bottom sheets, secondary containers
    divider: '#E2E8F0', // Slate 200 - List separators for the Global Member Directory
  },

  // Typography
  text: {
    primary: '#0F172A', // Slate 900 - Headers, main body text (WCAG AAA compliant on white)
    secondary: '#475569', // Slate 600 - Subtitles, metadata (e.g., speaker bios, dates)
    tertiary: '#94A3B8', // Slate 400 - Placeholder text, disabled inputs
    inverse: '#FFFFFF', // Text on primary/dark backgrounds
    brand: '#1E3A8A', // Used for clickable text or section headers
  },

  // UI Elements & Forms
  ui: {
    inputBackground: '#FFFFFF',
    inputBorder: '#CBD5E1', // Slate 300 - Default input border
    inputBorderLight: '#F1F5F9', // Slate 100 - Extra soft dash borders
    inputFocus: '#0EA5E9', // Cyan - Active input ring
    disabledSurface: '#F1F5F9', // Slate 100
    skeleton: '#E2E8F0', // Loading states for Knowledge Resources
    dividerLight: '#F1F5F9', // Ultra-soft divider
  },

  // Functional Icon Palette (Light tints for backgrounds + Deep accents)
  palette: {
    indigo: {
      bg: '#E0E7FF', // Indigo 100
      accent: '#4F46E5', // Indigo 600
    },
    amber: {
      bg: '#FEF3C7', // Amber 100
      accent: '#D97706', // Amber 600
    },
    emerald: {
      bg: '#DCFCE7', // Emerald 100
      accent: '#16A34A', // Emerald 600
    },
    purple: {
      bg: '#F3E8FF', // Purple 100
      accent: '#9333EA', // Purple 600
    },
    rose: {
      bg: '#FEE2E2', // Rose 100
      accent: '#EF4444', // Rose 600
    },
    slate: {
      bg: '#F8FAFC', // Slate 50
      accent: '#475569', // Slate 600
    },
  },

  // Status Colors (Semantic)
  status: {
    success: '#10B981', // Emerald - Successful event registration, membership renewal
    successBackground: '#D1FAE5',
    error: '#EF4444', // Red - Form validation errors, failed login
    errorBackground: '#FEE2E2',
    warning: '#F59E0B', // Amber - Expiration warnings, offline access alerts
    warningBackground: '#FEF3C7',
    info: '#3B82F6', // Blue - General announcements, new resource available
    infoBackground: '#DBEAFE',
  },

  // Overlays
  transparent: {
    overlayDark: 'rgba(15, 23, 42, 0.6)', // Slate 900 @ 60% - For modals and dialog backdrops
    overlayLight: 'rgba(255, 255, 255, 0.8)', // For loading spinners over content
  },
};
