import React, { forwardRef, useState } from 'react';
import { 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { cn } from '../../../utils/cn';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Size variants
const sizeVariants = {
  sm: {
    container: 'py-2 px-3',
    text: 'text-sm',
    label: 'text-sm',
  },
  md: {
    container: 'py-3 px-4',
    text: 'text-base',
    label: 'text-sm',
  },
  lg: {
    container: 'py-4 px-4',
    text: 'text-lg',
    label: 'text-base',
  },
};

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  leftIcon,
  rightIcon,
  required = false,
  disabled = false,
  size = 'md',
  secureTextEntry,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const hasError = !!error;
  const isPasswordField = secureTextEntry !== undefined;

  // Container classes
  const containerClasses = cn(
    // Base container styles
    'flex-row items-center border-2 rounded-lg bg-white',
    
    // Size variants
    sizeVariants[size].container,
    
    // State styles
    isFocused && !hasError && 'border-orange-500',
    isFocused && hasError && 'border-red-500',
    !isFocused && !hasError && 'border-gray-200',
    !isFocused && hasError && 'border-red-400',
    
    // Disabled styles
    disabled && 'bg-gray-100 border-gray-200',
    
    // Custom container classes
    containerClassName
  );

  // Input classes
  const inputClasses = cn(
    // Base input styles
    'flex-1 text-gray-900',
    
    // Size text variant
    sizeVariants[size].text,
    
    // Disabled styles
    disabled && 'text-gray-500',
    
    // Custom input classes
    className
  );

  // Label classes
  const labelClasses = cn(
    // Base label styles
    'font-medium text-gray-700 mb-2',
    
    // Size label variant
    sizeVariants[size].label,
    
    // Error state
    hasError && 'text-red-600',
    
    // Custom label classes
    labelClassName
  );

  // Error text classes
  const errorClasses = cn(
    'text-sm text-red-600 mt-1',
    errorClassName
  );

  // Helper text classes
  const helperClasses = cn(
    'text-sm text-gray-500 mt-1',
    helperClassName
  );

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine if we should show the password toggle
  const shouldShowPasswordToggle = isPasswordField && rightIcon === undefined;

  return (
    <View className="w-full">
      {/* Label */}
      {label && (
        <Text className={labelClasses}>
          {label}
          {required && (
            <Text className="text-red-500 ml-1">*</Text>
          )}
        </Text>
      )}

      {/* Input Container */}
      <View className={containerClasses}>
        {/* Left Icon */}
        {leftIcon && (
          <View className="mr-3">
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          ref={ref}
          className={inputClasses}
          placeholderTextColor="#9CA3AF" // gray-400
          secureTextEntry={isPasswordField ? !showPassword : undefined}
          editable={!disabled}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {shouldShowPasswordToggle ? (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            className="ml-3 p-1"
            disabled={disabled}
          >
            <Text className="text-gray-500 text-sm">
              {showPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View className="ml-3">
            {rightIcon}
          </View>
        ) : null}
      </View>

      {/* Error Message */}
      {hasError && (
        <Text className={errorClasses}>
          {error}
        </Text>
      )}

      {/* Helper Text */}
      {helperText && !hasError && (
        <Text className={helperClasses}>
          {helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

export type { InputProps };