/**
 * KAYI House Design System - Colors
 * Optimized for entry-level Android devices and Ivorian context
 */

export const colors = {
  // KAYI Brand Colors
  primary: {
    50: '#FFF4ED',
    100: '#FFE6D5',
    200: '#FFCCAA',
    300: '#FFA574',
    400: '#FF7A3C',
    500: '#FF6B35', // Main primary - Orange énergique
    600: '#E5522A',
    700: '#C04020',
    800: '#9F3419',
    900: '#7A2B16',
  },

  secondary: {
    50: '#F0F5F2',
    100: '#DCE8E0',
    200: '#B9D1C2',
    300: '#8CB69E',
    400: '#5E947A',
    500: '#2C5F41', // Main secondary - Vert professionnel
    600: '#255037',
    700: '#1F412E',
    800: '#1A3425',
    900: '#15281D',
  },

  // Mobile Money Operators (Côte d'Ivoire)
  mobileMoney: {
    orange: '#FF7900', // Orange Money
    mtn: '#FFCE00',    // MTN Mobile Money
    moov: '#00B4D8',   // Moov Money
  },

  // System Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Grays
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // UI Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  surface: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    elevated: '#FFFFFF',
  },

  overlay: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },

  // Text Colors
  text: {
    primary: '#111827',     // gray-900
    secondary: '#374151',   // gray-700
    tertiary: '#6B7280',    // gray-500
    disabled: '#9CA3AF',    // gray-400
    inverse: '#FFFFFF',
    link: '#3B82F6',        // info-500
  },

  // Border Colors
  border: {
    primary: '#E5E7EB',     // gray-200
    secondary: '#D1D5DB',   // gray-300
    focus: '#FF6B35',       // primary-500
    error: '#DC2626',       // error-600
  },

  // Dark Mode Support (for future implementation)
  dark: {
    background: {
      primary: '#111827',
      secondary: '#1F2937',
      tertiary: '#374151',
    },
    surface: {
      primary: '#1F2937',
      secondary: '#374151',
      elevated: '#4B5563',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#E5E7EB',
      tertiary: '#9CA3AF',
      disabled: '#6B7280',
    },
  },
} as const;

// Helper function to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`);
  }
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// Color semantic mapping for components
export const semanticColors = {
  // Button variants
  buttonPrimary: colors.primary[500],
  buttonSecondary: colors.secondary[500],
  buttonDanger: colors.error[500],
  
  // Input states
  inputBorder: colors.border.primary,
  inputFocus: colors.border.focus,
  inputError: colors.border.error,
  
  // Background variants
  screenBackground: colors.background.primary,
  cardBackground: colors.surface.primary,
  modalOverlay: colors.overlay.medium,
  
  // Text variants
  headingText: colors.text.primary,
  bodyText: colors.text.secondary,
  captionText: colors.text.tertiary,
} as const;

export type ColorValue = string;
export type ColorKey = keyof typeof colors;