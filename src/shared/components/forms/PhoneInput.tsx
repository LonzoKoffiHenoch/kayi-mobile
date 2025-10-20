import React, { forwardRef, useEffect, useState } from 'react';
import { Text, TextInput, View, TextInputProps } from 'react-native';
import { Input, InputProps } from '../ui/Input';
import { validatePhoneInput, getPhoneOperator } from '../../../features/auth/validation/authSchemas';
import { MOBILE_MONEY_OPERATORS } from '../../../core/config/constants';
import { cn } from '../../../utils/cn';

interface PhoneInputProps extends Omit<InputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  onValidationChange?: (isValid: boolean, operator?: string) => void;
  showOperator?: boolean;
  autoFormat?: boolean;
}

export const PhoneInput = forwardRef<TextInput, PhoneInputProps>(({
  value,
  onChangeText,
  onValidationChange,
  showOperator = true,
  autoFormat = true,
  error,
  helperText,
  className,
  ...props
}, ref) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [operator, setOperator] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  // Format phone number for display
  const formatPhoneNumber = (phone: string): string => {
    if (!autoFormat) return phone;
    
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Handle +225 prefix
    if (cleaned.startsWith('+225')) {
      const number = cleaned.substring(4);
      if (number.length <= 10) {
        // Format as: +225 XX XX XX XX XX
        const formatted = number.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
        return `+225 ${formatted}`.trim();
      }
    }
    
    // Handle local number (without +225)
    if (cleaned.length <= 10 && !cleaned.startsWith('+')) {
      // Format as: XX XX XX XX XX
      const formatted = cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
      return formatted.trim();
    }
    
    return cleaned;
  };

  // Validate and update state
  useEffect(() => {
    const validation = validatePhoneInput(value);
    setIsValid(validation.isValid);
    
    const phoneOperator = getPhoneOperator(value);
    setOperator(phoneOperator);
    
    // Format display value
    const formatted = formatPhoneNumber(value);
    setDisplayValue(formatted);
    
    // Notify parent about validation changes
    onValidationChange?.(validation.isValid, phoneOperator || undefined);
  }, [value, onValidationChange, autoFormat]);

  // Handle text input changes
  const handleChangeText = (text: string) => {
    // Remove formatting for internal value
    const cleaned = text.replace(/[^\d+]/g, '');
    
    // Ensure +225 prefix for internal value
    let internalValue = cleaned;
    if (cleaned.length > 0 && !cleaned.startsWith('+225')) {
      if (cleaned.startsWith('+')) {
        internalValue = cleaned;
      } else {
        internalValue = `+225${cleaned}`;
      }
    }
    
    // Limit to reasonable length
    if (internalValue.length <= 14) { // +225 + 10 digits
      onChangeText(internalValue);
    }
  };

  // Get operator color
  const getOperatorColor = (operatorName: string): string => {
    const operatorData = Object.values(MOBILE_MONEY_OPERATORS).find(
      op => op.name === operatorName
    );
    return operatorData?.color || '#6B7280'; // gray-500 as fallback
  };

  // Operator indicator component
  const OperatorIndicator = () => {
    if (!showOperator || !operator) return null;

    return (
      <View 
        className="px-2 py-1 rounded-md mr-2"
        style={{ backgroundColor: getOperatorColor(operator) + '20' }} // 20% opacity
      >
        <Text 
          className="text-xs font-medium"
          style={{ color: getOperatorColor(operator) }}
        >
          {operator}
        </Text>
      </View>
    );
  };

  // Country prefix indicator
  const CountryPrefix = () => (
    <View className="flex-row items-center mr-2">
      <Text className="text-base font-medium text-gray-700">🇨🇮</Text>
      <Text className="text-base font-medium text-gray-600 ml-1">+225</Text>
    </View>
  );

  // Validation status indicator
  const ValidationIndicator = () => {
    if (!value) return null;
    
    return (
      <View className="ml-2">
        <Text className={cn(
          'text-lg',
          isValid ? 'text-green-500' : 'text-red-500'
        )}>
          {isValid ? '✓' : '✗'}
        </Text>
      </View>
    );
  };

  // Custom helper text that includes operator info
  const getHelperText = (): string => {
    if (error) return '';
    
    if (helperText) return helperText;
    
    if (operator) {
      return `Numéro ${operator} détecté`;
    }
    
    return 'Entrez votre numéro de téléphone ivoirien';
  };

  return (
    <Input
      ref={ref}
      label="Numéro de téléphone"
      value={displayValue}
      onChangeText={handleChangeText}
      placeholder="07 12 34 56 78"
      keyboardType="phone-pad"
      autoCapitalize="none"
      autoCorrect={false}
      maxLength={18} // Formatted: +225 XX XX XX XX XX
      error={error}
      helperText={getHelperText()}
      leftIcon={
        <View className="flex-row items-center">
          <CountryPrefix />
          <OperatorIndicator />
        </View>
      }
      rightIcon={<ValidationIndicator />}
      required
      className={cn(
        // Custom styling for phone input
        'font-mono', // Use monospace font for better number display
        className
      )}
      {...props}
    />
  );
});

PhoneInput.displayName = 'PhoneInput';

export type { PhoneInputProps };