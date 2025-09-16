/**
 * KAYI House Modern Input Component
 * Modern design with floating labels using NativeWind (Tailwind CSS)
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  Animated,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ModernInputProps extends Omit<TextInputProps, 'style'> {
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

const ModernInput: React.FC<ModernInputProps> = React.memo(({
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
      duration: 200,
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

  // Get size classes
  const getSizeClasses = () => {
    const sizes = {
      small: {
        container: 'min-h-[36px] px-3 py-2',
        text: 'text-sm',
        icon: 16,
      },
      medium: {
        container: 'min-h-[44px] px-4 py-3',
        text: 'text-base',
        icon: 20,
      },
      large: {
        container: 'min-h-[52px] px-5 py-4',
        text: 'text-lg',
        icon: 24,
      },
    };
    return sizes[size];
  };

  // Get variant classes
  const getVariantClasses = () => {
    const variants = {
      default: hasError 
        ? 'border-b border-red-500'
        : isFocused 
        ? 'border-b-2 border-primary-500'
        : 'border-b border-gray-300',
      outline: hasError
        ? 'border border-red-500 rounded-xl bg-white'
        : isFocused
        ? 'border-2 border-primary-500 rounded-xl bg-white'
        : 'border border-gray-200 rounded-xl bg-white',
      filled: hasError
        ? 'border border-red-500 rounded-xl bg-gray-50'
        : isFocused
        ? 'border-2 border-primary-500 rounded-xl bg-gray-50'
        : 'border border-transparent rounded-xl bg-gray-50',
    };
    return variants[variant];
  };

  const sizeConfig = getSizeClasses();
  const variantClasses = getVariantClasses();

  // Container classes
  const containerClasses = [
    'flex-row items-center relative',
    variantClasses,
    sizeConfig.container,
    disabled ? 'opacity-60 bg-gray-100' : '',
  ].filter(Boolean).join(' ');

  // Text input classes
  const inputClasses = [
    'flex-1 m-0 p-0',
    sizeConfig.text,
    disabled ? 'text-gray-400' : 'text-gray-900',
    label ? (shouldFloatLabel ? 'pt-2' : '') : '',
  ].filter(Boolean).join(' ');

  // Label classes
  const labelClasses = [
    hasError ? 'text-red-500' : isFocused ? 'text-primary-500' : 'text-gray-500',
    'text-sm font-medium',
  ].filter(Boolean).join(' ');

  // Icon color
  const iconColor = hasError 
    ? '#EF4444'
    : isFocused 
    ? '#FF6B35'
    : '#9CA3AF';

  // Animated label styles
  const animatedLabelStyle = {
    position: 'absolute' as const,
    left: leftIcon ? sizeConfig.icon + 12 : 16,
    top: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [size === 'small' ? 10 : size === 'medium' ? 12 : 16, 4],
    }),
    fontSize: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [size === 'small' ? 14 : 16, 12],
    }),
    color: hasError 
      ? '#EF4444'
      : isFocused 
      ? '#FF6B35'
      : '#6B7280',
    backgroundColor: variant === 'outline' ? '#FFFFFF' : 'transparent',
    paddingHorizontal: variant === 'outline' ? 4 : 0,
    zIndex: 1,
  };

  return (
    <View className="mb-4" style={containerStyle}>
      <View className={containerClasses}>
        {/* Left Icon */}
        {leftIcon && (
          <View className="mr-3">
            <Ionicons
              name={leftIcon}
              size={sizeConfig.icon}
              color={iconColor}
            />
          </View>
        )}

        {/* Prefix */}
        {prefix && (
          <View className="mr-2">
            {prefix}
          </View>
        )}

        {/* Input Container */}
        <View className="flex-1 relative">
          {/* Floating Label */}
          {label && (
            <Pressable onPress={handleLabelPress} className="absolute z-10">
              <Animated.Text style={animatedLabelStyle}>
                {label}
              </Animated.Text>
            </Pressable>
          )}

          {/* Text Input */}
          <TextInput
            ref={inputRef}
            className={inputClasses}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            placeholderTextColor="#9CA3AF"
            selectionColor="#FF6B35"
            style={inputStyle}
            {...rest}
          />
        </View>

        {/* Suffix */}
        {suffix && (
          <View className="ml-2">
            {suffix}
          </View>
        )}

        {/* Right Icon */}
        {rightIcon && (
          <Pressable onPress={handleRightIconPress} className="ml-3 p-1">
            <Ionicons
              name={rightIcon}
              size={sizeConfig.icon}
              color={iconColor}
            />
          </Pressable>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text className="text-red-500 text-sm mt-2 ml-4" style={errorStyle}>
          {error}
        </Text>
      )}
    </View>
  );
});

ModernInput.displayName = 'ModernInput';

export default ModernInput;