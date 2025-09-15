/**
 * KAYI House Design System - Spacing
 * 4px base grid system with touch-friendly targets
 * Optimized for mobile interactions and accessibility
 */

// Base spacing unit (4px)
const SPACING_UNIT = 4;

// Spacing scale based on 4px grid
export const spacing = {
  xs: SPACING_UNIT,      // 4px
  sm: SPACING_UNIT * 2,  // 8px
  md: SPACING_UNIT * 4,  // 16px
  lg: SPACING_UNIT * 6,  // 24px
  xl: SPACING_UNIT * 8,  // 32px
  '2xl': SPACING_UNIT * 12, // 48px
  '3xl': SPACING_UNIT * 16, // 64px
  '4xl': SPACING_UNIT * 20, // 80px
  '5xl': SPACING_UNIT * 24, // 96px
} as const;

// Component-specific spacing
export const componentSpacing = {
  // Touch targets - minimum 44px for accessibility
  touchTarget: {
    minimum: 44,
    comfortable: 48,
    large: 56,
  },

  // Container padding
  container: {
    horizontal: spacing.md,  // 16px
    vertical: spacing.lg,    // 24px
  },

  // Card spacing
  card: {
    padding: spacing.md,     // 16px
    margin: spacing.sm,      // 8px
    gap: spacing.sm,         // 8px
  },

  // Button spacing
  button: {
    paddingHorizontal: spacing.lg, // 24px
    paddingVertical: spacing.sm,   // 8px
    gap: spacing.sm,               // 8px
  },

  // Input spacing
  input: {
    paddingHorizontal: spacing.md, // 16px
    paddingVertical: spacing.sm,   // 8px
    marginBottom: spacing.md,      // 16px
  },

  // List spacing
  list: {
    itemGap: spacing.sm,           // 8px
    sectionGap: spacing.lg,        // 24px
  },

  // Modal spacing
  modal: {
    margin: spacing.lg,            // 24px
    padding: spacing.md,           // 16px
  },

  // Screen spacing
  screen: {
    paddingHorizontal: spacing.md, // 16px
    paddingVertical: spacing.lg,   // 24px
  },
} as const;

// Border radius scale
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// Component-specific border radius
export const componentBorderRadius = {
  button: borderRadius.md,     // 8px
  card: borderRadius.lg,       // 12px
  input: borderRadius.md,      // 8px
  modal: borderRadius.xl,      // 16px
  badge: borderRadius.full,    // Fully rounded
  avatar: borderRadius.full,   // Fully rounded
} as const;

// Shadow/elevation system
export const elevation = {
  none: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// Layout helpers
export const layout = {
  // Flex utilities
  flex: {
    center: {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    row: {
      flexDirection: 'row' as const,
    },
    column: {
      flexDirection: 'column' as const,
    },
    spaceBetween: {
      justifyContent: 'space-between' as const,
    },
    spaceAround: {
      justifyContent: 'space-around' as const,
    },
    spaceEvenly: {
      justifyContent: 'space-evenly' as const,
    },
  },

  // Position utilities
  absolute: {
    position: 'absolute' as const,
  },
  relative: {
    position: 'relative' as const,
  },

  // Size utilities
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
  fullSize: {
    width: '100%',
    height: '100%',
  },
} as const;

// Grid system
export const grid = {
  // Common grid gaps
  gap: {
    xs: spacing.xs,   // 4px
    sm: spacing.sm,   // 8px
    md: spacing.md,   // 16px
    lg: spacing.lg,   // 24px
    xl: spacing.xl,   // 32px
  },

  // Column system (percentage based)
  columns: {
    '1/2': '50%',
    '1/3': '33.333%',
    '2/3': '66.667%',
    '1/4': '25%',
    '3/4': '75%',
    '1/5': '20%',
    '2/5': '40%',
    '3/5': '60%',
    '4/5': '80%',
  },
} as const;

// Spacing helpers
export const getSpacing = (size: keyof typeof spacing): number => {
  return spacing[size];
};

export const getComponentSpacing = (component: keyof typeof componentSpacing) => {
  return componentSpacing[component];
};

export const getBorderRadius = (size: keyof typeof borderRadius): number => {
  return borderRadius[size];
};

export const getElevation = (level: keyof typeof elevation) => {
  return elevation[level];
};

// Utility function to create spacing object
export const createSpacing = (
  top?: number,
  right?: number,
  bottom?: number,
  left?: number
) => {
  if (top !== undefined && right === undefined && bottom === undefined && left === undefined) {
    // Single value - all sides
    return {
      paddingTop: top,
      paddingRight: top,
      paddingBottom: top,
      paddingLeft: top,
    };
  }
  
  if (top !== undefined && right !== undefined && bottom === undefined && left === undefined) {
    // Two values - vertical and horizontal
    return {
      paddingTop: top,
      paddingRight: right,
      paddingBottom: top,
      paddingLeft: right,
    };
  }

  // Individual values
  return {
    ...(top !== undefined && { paddingTop: top }),
    ...(right !== undefined && { paddingRight: right }),
    ...(bottom !== undefined && { paddingBottom: bottom }),
    ...(left !== undefined && { paddingLeft: left }),
  };
};

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ElevationKey = keyof typeof elevation;