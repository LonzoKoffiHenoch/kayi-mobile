/**
 * KAYI House Design System - Typography
 * Poppins font family with system fallbacks
 * Optimized for mobile readability and local language support
 */

import { Platform } from 'react-native';

// Font Family Configuration
export const fontFamily = {
  regular: Platform.select({
    ios: 'Poppins-Regular',
    android: 'Poppins-Regular',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'Poppins-Medium',
    android: 'Poppins-Medium',
    default: 'System',
  }),
  semiBold: Platform.select({
    ios: 'Poppins-SemiBold',
    android: 'Poppins-SemiBold',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'Poppins-Bold',
    android: 'Poppins-Bold',
    default: 'System',
  }),
} as const;

// Font Weights
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

// Font Sizes - Responsive scale optimized for mobile
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

// Line Heights - Optimized for mobile readability
export const lineHeight = {
  xs: 16,    // 1.33 ratio
  sm: 20,    // 1.43 ratio
  base: 24,  // 1.5 ratio
  lg: 28,    // 1.56 ratio
  xl: 28,    // 1.4 ratio
  '2xl': 32, // 1.33 ratio
  '3xl': 36, // 1.2 ratio
  '4xl': 40, // 1.11 ratio
} as const;

// Letter Spacing - Subtle adjustments for readability
export const letterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

// Typography Scale - Semantic text styles
export const textStyles = {
  // Display texts
  display: {
    fontSize: fontSize['4xl'],
    lineHeight: lineHeight['4xl'],
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },

  // Headings
  h1: {
    fontSize: fontSize['3xl'],
    lineHeight: lineHeight['3xl'],
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },

  // Body texts
  bodyLarge: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },

  // UI elements
  button: {
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
  },
  buttonSmall: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
  },
  buttonLarge: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
  },

  // Labels and captions
  label: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  overline: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase' as const,
  },

  // Input text
  input: {
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
  inputError: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
  },
} as const;

// Typography helpers
export const getTextStyle = (variant: keyof typeof textStyles) => {
  return textStyles[variant];
};

// Font loading configuration (for Expo)
export const fontConfig = {
  'Poppins-Regular': require('../../../assets/fonts/Poppins-Regular.ttf'),
  'Poppins-Medium': require('../../../assets/fonts/Poppins-Medium.ttf'),
  'Poppins-SemiBold': require('../../../assets/fonts/Poppins-SemiBold.ttf'),
  'Poppins-Bold': require('../../../assets/fonts/Poppins-Bold.ttf'),
};

// Text transform utilities
export const textTransform = {
  none: 'none' as const,
  capitalize: 'capitalize' as const,
  uppercase: 'uppercase' as const,
  lowercase: 'lowercase' as const,
};

// Text alignment utilities
export const textAlign = {
  left: 'left' as const,
  center: 'center' as const,
  right: 'right' as const,
  justify: 'justify' as const,
};

export type TextStyleVariant = keyof typeof textStyles;
export type FontFamily = keyof typeof fontFamily;
export type FontSize = keyof typeof fontSize;