import React from 'react';
import { 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { cn } from '../../../utils/cn';

// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';

// Button sizes
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Tailwind classes for variants
const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-orange-500 active:bg-orange-600',
  secondary: 'bg-gray-100 active:bg-gray-200',
  outline: 'border-2 border-orange-500 bg-transparent active:bg-orange-50',
  destructive: 'bg-red-500 active:bg-red-600',
  ghost: 'bg-transparent active:bg-gray-100',
};

// Tailwind classes for text variants
const textVariants: Record<ButtonVariant, string> = {
  primary: 'text-white font-semibold',
  secondary: 'text-gray-900 font-semibold',
  outline: 'text-orange-500 font-semibold',
  destructive: 'text-white font-semibold',
  ghost: 'text-gray-700 font-medium',
};

// Tailwind classes for sizes
const sizeVariants: Record<ButtonSize, { button: string; text: string }> = {
  sm: {
    button: 'px-3 py-2 rounded-md',
    text: 'text-sm',
  },
  md: {
    button: 'px-4 py-3 rounded-lg',
    text: 'text-base',
  },
  lg: {
    button: 'px-6 py-4 rounded-xl',
    text: 'text-lg',
  },
};

// Disabled state classes
const disabledVariants: Record<ButtonVariant, string> = {
  primary: 'bg-gray-300',
  secondary: 'bg-gray-200',
  outline: 'border-gray-300 bg-transparent',
  destructive: 'bg-gray-300',
  ghost: 'bg-transparent',
};

const disabledTextVariants: Record<ButtonVariant, string> = {
  primary: 'text-gray-500',
  secondary: 'text-gray-500',
  outline: 'text-gray-400',
  destructive: 'text-gray-500',
  ghost: 'text-gray-400',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  textClassName = '',
  fullWidth = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const isDisabled = disabled || loading;

  // Get the appropriate classes based on state
  const buttonClasses = cn(
    // Base classes
    'items-center justify-center flex-row',
    
    // Size classes
    sizeVariants[size].button,
    
    // Full width
    fullWidth && 'w-full',
    
    // Variant classes (normal or disabled)
    isDisabled ? disabledVariants[variant] : buttonVariants[variant],
    
    // Custom classes
    className
  );

  const textClasses = cn(
    // Base text classes
    'text-center',
    
    // Size text classes
    sizeVariants[size].text,
    
    // Variant text classes (normal or disabled)
    isDisabled ? disabledTextVariants[variant] : textVariants[variant],
    
    // Custom text classes
    textClassName
  );

  // Loading indicator color based on variant
  const getLoadingColor = (): string => {
    if (isDisabled) return '#9CA3AF'; // gray-400
    
    switch (variant) {
      case 'primary':
      case 'destructive':
        return '#FFFFFF';
      case 'secondary':
        return '#374151'; // gray-700
      case 'outline':
        return '#EA580C'; // orange-600
      case 'ghost':
        return '#374151'; // gray-700
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      className={buttonClasses}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {/* Left Icon */}
      {leftIcon && !loading && (
        <React.Fragment>
          {leftIcon}
          {children && <Text className="w-2" />}
        </React.Fragment>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <React.Fragment>
          <ActivityIndicator 
            size="small" 
            color={getLoadingColor()} 
            className="mr-2"
          />
        </React.Fragment>
      )}
      
      {/* Button Text */}
      {typeof children === 'string' ? (
        <Text className={textClasses}>
          {children}
        </Text>
      ) : (
        children
      )}
      
      {/* Right Icon */}
      {rightIcon && !loading && (
        <React.Fragment>
          {children && <Text className="w-2" />}
          {rightIcon}
        </React.Fragment>
      )}
    </TouchableOpacity>
  );
};

// Export variants for external use
export { buttonVariants, textVariants, sizeVariants };
export type { ButtonProps, ButtonVariant, ButtonSize };