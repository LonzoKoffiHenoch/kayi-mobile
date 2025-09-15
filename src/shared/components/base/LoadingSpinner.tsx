/**
 * KAYI House LoadingSpinner Component
 * Performance-optimized spinner with customizable appearance
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../theme/theme';

export type SpinnerSize = 'small' | 'medium' | 'large';
export type SpinnerVariant = 'primary' | 'secondary' | 'light' | 'dark';

export interface LoadingSpinnerProps {
  size?: SpinnerSize | number;
  variant?: SpinnerVariant;
  color?: string;
  text?: string;
  overlay?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({
  size = 'medium',
  variant = 'primary',
  color,
  text,
  overlay = false,
  style,
  textStyle,
}) => {
  const spinnerColor = color || getVariantColor(variant);
  const spinnerSize = getSpinnerSize(size);

  const containerStyle: ViewStyle[] = [
    styles.container,
    overlay && styles.overlay,
    style,
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    { color: spinnerColor },
    textStyle,
  ];

  return (
    <View style={containerStyle}>
      <ActivityIndicator 
        size={spinnerSize} 
        color={spinnerColor}
        style={styles.spinner}
      />
      {text && (
        <Text style={textStyles}>
          {text}
        </Text>
      )}
    </View>
  );
});

// Get color based on variant
const getVariantColor = (variant: SpinnerVariant): string => {
  const colors = {
    primary: theme.colors.primary[500],
    secondary: theme.colors.secondary[500],
    light: theme.colors.gray[100],
    dark: theme.colors.gray[800],
  };

  return colors[variant];
};

// Get spinner size
const getSpinnerSize = (size: SpinnerSize | number): 'small' | 'large' | number => {
  if (typeof size === 'number') {
    return size;
  }

  const sizes = {
    small: 'small' as const,
    medium: 'large' as const, // React Native doesn't have medium, use large
    large: 'large' as const,
  };

  return sizes[size];
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay.light,
    zIndex: 999,
  },
  spinner: {
    marginBottom: theme.spacing.sm,
  },
  text: {
    ...theme.typography.textStyles.bodySmall,
    textAlign: 'center',
  },
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;