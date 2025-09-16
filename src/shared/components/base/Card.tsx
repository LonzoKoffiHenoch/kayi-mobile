/**
 * KAYI House Card Component
 * Optimized for lists with press animations and performance
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../../theme/theme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';

export interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disabled?: boolean;
  borderRadius?: number;
  padding?: number;
}

const Card: React.FC<CardProps> = React.memo(({
  children,
  variant = 'default',
  onPress,
  style,
  contentStyle,
  disabled = false,
  borderRadius,
  padding,
  ...rest
}) => {
  const variantStyles = getVariantStyles(variant);
  const isPressable = Boolean(onPress && !disabled);

  const cardStyle = [
    styles.base,
    variantStyles,
    borderRadius !== undefined && { borderRadius },
    padding !== undefined && { padding },
    disabled && styles.disabled,
    style,
  ].filter(Boolean);

  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  if (isPressable) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.95}
        {...rest}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {content}
    </View>
  );
});

// Variant styles
const getVariantStyles = (variant: CardVariant): ViewStyle => {
  const variants = {
    default: {
      backgroundColor: theme.colors.surface.primary,
      ...theme.elevation.sm,
    },
    elevated: {
      backgroundColor: theme.colors.surface.primary,
      ...theme.elevation.lg,
    },
    outlined: {
      backgroundColor: theme.colors.surface.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      ...theme.elevation.none,
    },
    filled: {
      backgroundColor: theme.colors.background.secondary,
      ...theme.elevation.none,
    },
  };

  return variants[variant];
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    margin: theme.spacing.xs,
    overflow: 'hidden',
  },
  content: {
    // Content wrapper for additional styling if needed
  },
  disabled: {
    opacity: 0.6,
  },
});

Card.displayName = 'Card';

export default Card;