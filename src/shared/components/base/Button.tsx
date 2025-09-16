/**
 * KAYI House Button Component
 * Optimized for entry-level Android devices with haptic feedback
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../../theme/theme';

// Button variant types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
}

const Button: React.FC<ButtonProps> = React.memo(({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onPress,
  style,
  textStyle,
  hapticFeedback = true,
  ...rest
}) => {
  const handlePress = React.useCallback(() => {
    if (disabled || loading) return;
    
    // Haptic feedback for better UX on mobile
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress?.();
  }, [disabled, loading, hapticFeedback, onPress]);

  // Get variant-specific styles
  const variantStyles = getVariantStyles(variant, disabled);
  const sizeStyles = getSizeStyles(size);
  
  const buttonStyle = [
    styles.base,
    variantStyles.container,
    sizeStyles.container,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ].filter(Boolean);

  const textStyles = [
    styles.text,
    variantStyles.text,
    sizeStyles.text,
    disabled && styles.disabledText,
    textStyle,
  ].filter(Boolean);

  const iconSize = getIconSize(size);
  const iconColor = variantStyles.text.color;

  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <Ionicons
        name={icon}
        size={iconSize}
        color={iconColor}
        style={iconPosition === 'right' ? styles.iconRight : styles.iconLeft}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={iconColor}
          style={styles.loadingIndicator}
        />
      );
    }

    return (
      <View style={styles.content}>
        {iconPosition === 'left' && renderIcon()}
        <Text style={textStyles} numberOfLines={1}>
          {title}
        </Text>
        {iconPosition === 'right' && renderIcon()}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
});

// Variant styles
const getVariantStyles = (variant: ButtonVariant, disabled: boolean) => {
  const variants = {
    primary: {
      container: {
        backgroundColor: disabled ? theme.colors.gray[300] : theme.colors.primary[500],
        borderWidth: 0,
      },
      text: {
        color: theme.colors.text.inverse,
      },
    },
    secondary: {
      container: {
        backgroundColor: disabled ? theme.colors.gray[100] : theme.colors.secondary[500],
        borderWidth: 0,
      },
      text: {
        color: theme.colors.text.inverse,
      },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? theme.colors.gray[300] : theme.colors.primary[500],
      },
      text: {
        color: disabled ? theme.colors.gray[400] : theme.colors.primary[500],
      },
    },
    text: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      text: {
        color: disabled ? theme.colors.gray[400] : theme.colors.primary[500],
      },
    },
    danger: {
      container: {
        backgroundColor: disabled ? theme.colors.gray[300] : theme.colors.error[500],
        borderWidth: 0,
      },
      text: {
        color: theme.colors.text.inverse,
      },
    },
  };

  return variants[variant];
};

// Size styles
const getSizeStyles = (size: ButtonSize) => {
  const sizes = {
    small: {
      container: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        minHeight: 36,
      },
      text: {
        ...theme.typography.textStyles.buttonSmall,
      },
    },
    medium: {
      container: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        minHeight: 44, // Accessibility touch target
      },
      text: {
        ...theme.typography.textStyles.button,
      },
    },
    large: {
      container: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        minHeight: 52,
      },
      text: {
        ...theme.typography.textStyles.buttonLarge,
      },
    },
  };

  return sizes[size];
};

// Icon size based on button size
const getIconSize = (size: ButtonSize): number => {
  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };
  
  return iconSizes[size];
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...theme.elevation.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
    ...theme.elevation.none,
  },
  disabledText: {
    color: theme.colors.gray[400],
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
  loadingIndicator: {
    // ActivityIndicator has its own size, no additional styling needed
  },
});

Button.displayName = 'Button';

export default Button;