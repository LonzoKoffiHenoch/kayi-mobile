/**
 * KAYI House Modern Button Component
 * Modern design with NativeWind (Tailwind CSS) for professional look
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Button variant types
export type ModernButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ModernButtonSize = 'small' | 'medium' | 'large';

export interface ModernButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ModernButtonVariant;
  size?: ModernButtonSize;
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

const ModernButton: React.FC<ModernButtonProps> = React.memo(({
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

  // Get variant-specific styles using NativeWind classes
  const getVariantClasses = () => {
    const variants = {
      primary: disabled 
        ? 'bg-gray-300' 
        : 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700',
      secondary: disabled 
        ? 'bg-gray-200' 
        : 'bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700',
      outline: disabled
        ? 'bg-transparent border border-gray-300'
        : 'bg-transparent border border-primary-500 hover:bg-primary-50 active:bg-primary-100',
      text: 'bg-transparent hover:bg-gray-100 active:bg-gray-200',
      danger: disabled 
        ? 'bg-gray-300' 
        : 'bg-red-500 hover:bg-red-600 active:bg-red-700',
    };
    return variants[variant];
  };

  const getTextClasses = () => {
    const textVariants = {
      primary: disabled ? 'text-gray-500' : 'text-white',
      secondary: disabled ? 'text-gray-500' : 'text-white',
      outline: disabled ? 'text-gray-400' : 'text-primary-500',
      text: disabled ? 'text-gray-400' : 'text-primary-500',
      danger: disabled ? 'text-gray-500' : 'text-white',
    };
    return textVariants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      small: 'px-4 py-2 min-h-[36px]',
      medium: 'px-6 py-3 min-h-[44px]',
      large: 'px-8 py-4 min-h-[52px]',
    };
    return sizes[size];
  };

  const getTextSizeClasses = () => {
    const textSizes = {
      small: 'text-sm font-medium',
      medium: 'text-base font-semibold',
      large: 'text-lg font-semibold',
    };
    return textSizes[size];
  };

  const getIconSize = () => {
    const iconSizes = {
      small: 16,
      medium: 20,
      large: 24,
    };
    return iconSizes[size];
  };

  // Combine all classes
  const containerClasses = [
    // Base styles
    'flex-row items-center justify-center rounded-xl',
    // Shadow and elevation for modern look
    disabled ? '' : 'shadow-sm',
    // Variant styles
    getVariantClasses(),
    // Size styles
    getSizeClasses(),
    // Full width
    fullWidth ? 'w-full' : '',
    // Disabled opacity
    disabled ? 'opacity-60' : '',
  ].filter(Boolean).join(' ');

  const textClasses = [
    'text-center',
    getTextClasses(),
    getTextSizeClasses(),
  ].filter(Boolean).join(' ');

  const iconColor = variant === 'primary' || variant === 'secondary' || variant === 'danger' 
    ? disabled ? '#9CA3AF' : '#FFFFFF'
    : disabled ? '#9CA3AF' : '#FF6B35';

  const renderIcon = () => {
    if (!icon) return null;
    
    const iconMarginClass = iconPosition === 'right' ? 'ml-2' : 'mr-2';
    
    return (
      <View className={iconMarginClass}>
        <Ionicons
          name={icon}
          size={getIconSize()}
          color={iconColor}
        />
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={iconColor}
        />
      );
    }

    return (
      <View className="flex-row items-center justify-center">
        {iconPosition === 'left' && renderIcon()}
        <Text className={textClasses} numberOfLines={1}>
          {title}
        </Text>
        {iconPosition === 'right' && renderIcon()}
      </View>
    );
  };

  return (
    <TouchableOpacity
      className={containerClasses}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={style}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
});

ModernButton.displayName = 'ModernButton';

export default ModernButton;