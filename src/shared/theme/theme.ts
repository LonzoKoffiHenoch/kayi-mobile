/**
 * KAYI House Design System - Main Theme
 * Central theme configuration combining all design tokens
 */

import { colors, semanticColors } from './colors';
import { textStyles, fontFamily, fontSize, lineHeight, letterSpacing } from './typography';
import { spacing, borderRadius, elevation, componentSpacing, layout } from './spacing';

// Main theme object
export const theme = {
  // Color system
  colors,
  semanticColors,

  // Typography system
  typography: {
    textStyles,
    fontFamily,
    fontSize,
    lineHeight,
    letterSpacing,
  },

  // Spacing system
  spacing,
  borderRadius,
  elevation,
  componentSpacing,
  layout,

  // Component defaults
  components: {
    Button: {
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      minHeight: 44, // Accessibility touch target
    },
    
    Input: {
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 44, // Accessibility touch target
      borderWidth: 1,
    },
    
    Card: {
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      backgroundColor: colors.surface.primary,
      ...elevation.sm,
    },
    
    Modal: {
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      margin: spacing.lg,
      backgroundColor: colors.surface.primary,
      ...elevation.xl,
    },
    
    Toast: {
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.md,
      ...elevation.lg,
    },
  },

  // Animation timings
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
    
    // Easing curves
    easing: {
      ease: [0.25, 0.1, 0.25, 1],
      easeIn: [0.42, 0, 1, 1],
      easeOut: [0, 0, 0.58, 1],
      easeInOut: [0.42, 0, 0.58, 1],
    },
  },

  // Breakpoints for responsive design
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// Dark theme (for future implementation)
export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: theme.colors.dark.background,
    surface: theme.colors.dark.surface,
    text: theme.colors.dark.text,
  },
} as const;

// Theme utilities
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) break;
  }
  
  return value || '#000000';
};

export const getSpacing = (key: keyof typeof spacing) => {
  return spacing[key];
};

export const getTextStyle = (variant: keyof typeof textStyles) => {
  return textStyles[variant];
};

export const getBorderRadius = (key: keyof typeof borderRadius) => {
  return borderRadius[key];
};

export const getElevation = (level: keyof typeof elevation) => {
  return elevation[level];
};

// Theme context type
export interface ThemeContextType {
  theme: typeof theme;
  isDark: boolean;
  toggleTheme: () => void;
}

// Theme variant types
export type Theme = typeof theme;
export type ColorKey = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ElevationKey = keyof typeof elevation;
export type TextStyleKey = keyof typeof textStyles;

export default theme;