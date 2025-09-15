/**
 * KAYI House Input Component
 * Floating label with smooth animations and validation states
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  Animated,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  disabled?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  variant?: 'default' | 'outline' | 'filled';
  size?: 'small' | 'medium' | 'large';
}

const Input: React.FC<InputProps> = React.memo(({
  label,
  error,
  disabled = false,
  prefix,
  suffix,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  variant = 'outline',
  size = 'medium',
  value,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  const hasValue = Boolean(value);
  const hasError = Boolean(error);
  const shouldFloatLabel = isFocused || hasValue;

  // Animate label
  React.useEffect(() => {
    Animated.timing(labelAnimation, {
      toValue: shouldFloatLabel ? 1 : 0,
      duration: theme.animation.fast,
      useNativeDriver: false,
    }).start();
  }, [shouldFloatLabel, labelAnimation]);

  const handleFocus = React.useCallback((e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = React.useCallback((e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  const handleLabelPress = React.useCallback(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleRightIconPress = React.useCallback(() => {
    if (!disabled && onRightIconPress) {
      onRightIconPress();
    }
  }, [disabled, onRightIconPress]);

  // Get styles based on state and variant
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);
  const stateStyles = getStateStyles(isFocused, hasError, disabled);

  const containerStyles: ViewStyle[] = [
    styles.container,
    variantStyles.container,
    sizeStyles.container,
    stateStyles.container,
    containerStyle,
  ];

  const textInputStyles: TextStyle[] = [
    styles.input,
    variantStyles.input,
    sizeStyles.input,
    stateStyles.input,
    inputStyle,
  ];

  const animatedLabelStyle = {
    ...styles.label,
    ...variantStyles.label,
    ...sizeStyles.label,
    ...stateStyles.label,
    transform: [
      {
        translateY: labelAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -24],
        }),
      },
      {
        scale: labelAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.85],
        }),
      },
    ],
    ...labelStyle,
  };

  const iconColor = hasError 
    ? theme.colors.error[500]
    : isFocused 
    ? theme.colors.primary[500]
    : theme.colors.gray[400];

  return (
    <View style={styles.wrapper}>
      <View style={containerStyles}>
        {/* Left Icon */}
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={sizeStyles.iconSize}
            color={iconColor}
            style={styles.leftIcon}
          />
        )}

        {/* Prefix */}
        {prefix && (
          <View style={styles.prefix}>
            {prefix}
          </View>
        )}

        {/* Input Container */}
        <View style={styles.inputContainer}>
          {/* Floating Label */}
          {label && (
            <Pressable onPress={handleLabelPress} style={styles.labelContainer}>
              <Animated.Text style={animatedLabelStyle}>
                {label}
              </Animated.Text>
            </Pressable>
          )}

          {/* Text Input */}
          <TextInput
            ref={inputRef}
            style={textInputStyles}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            placeholderTextColor={theme.colors.gray[400]}
            selectionColor={theme.colors.primary[500]}
            {...rest}
          />
        </View>

        {/* Suffix */}
        {suffix && (
          <View style={styles.suffix}>
            {suffix}
          </View>
        )}

        {/* Right Icon */}
        {rightIcon && (
          <Pressable onPress={handleRightIconPress} style={styles.rightIconContainer}>
            <Ionicons
              name={rightIcon}
              size={sizeStyles.iconSize}
              color={iconColor}
            />
          </Pressable>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
});

// Variant styles
const getVariantStyles = (variant: 'default' | 'outline' | 'filled') => {
  const variants = {
    default: {
      container: {
        borderBottomWidth: 1,
        borderRadius: 0,
        backgroundColor: 'transparent',
      },
      input: {},
      label: {},
    },
    outline: {
      container: {
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface.primary,
      },
      input: {},
      label: {},
    },
    filled: {
      container: {
        borderWidth: 0,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.gray[50],
      },
      input: {},
      label: {},
    },
  };

  return variants[variant];
};

// Size styles
const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  const sizes = {
    small: {
      container: {
        minHeight: 36,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
      },
      input: {
        ...theme.typography.textStyles.bodySmall,
        paddingTop: 8, // Space for floating label
      },
      label: {
        ...theme.typography.textStyles.caption,
      },
      iconSize: 16,
    },
    medium: {
      container: {
        minHeight: 44, // Accessibility touch target
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
      },
      input: {
        ...theme.typography.textStyles.input,
        paddingTop: 12, // Space for floating label
      },
      label: {
        ...theme.typography.textStyles.inputLabel,
      },
      iconSize: 20,
    },
    large: {
      container: {
        minHeight: 52,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
      },
      input: {
        ...theme.typography.textStyles.bodyLarge,
        paddingTop: 16, // Space for floating label
      },
      label: {
        ...theme.typography.textStyles.label,
      },
      iconSize: 24,
    },
  };

  return sizes[size];
};

// State styles
const getStateStyles = (isFocused: boolean, hasError: boolean, disabled: boolean) => {
  let borderColor = theme.colors.border.primary;
  let labelColor = theme.colors.text.tertiary;

  if (disabled) {
    borderColor = theme.colors.gray[200];
    labelColor = theme.colors.gray[400];
  } else if (hasError) {
    borderColor = theme.colors.error[500];
    labelColor = theme.colors.error[500];
  } else if (isFocused) {
    borderColor = theme.colors.primary[500];
    labelColor = theme.colors.primary[500];
  }

  return {
    container: {
      borderColor,
      ...(disabled && { opacity: 0.6 }),
    },
    input: {
      color: disabled ? theme.colors.gray[400] : theme.colors.text.primary,
    },
    label: {
      color: labelColor,
    },
  };
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  labelContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIconContainer: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  prefix: {
    marginRight: theme.spacing.xs,
  },
  suffix: {
    marginLeft: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.textStyles.inputError,
    color: theme.colors.error[500],
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});

Input.displayName = 'Input';

export default Input;