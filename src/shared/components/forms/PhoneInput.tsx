/**
 * KAYI House PhoneInput Component
 * Specialized for Côte d'Ivoire phone numbers with +225 prefix
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import Input, { InputProps } from '../base/Input';
import { theme } from '../../theme/theme';

export interface PhoneInputProps extends Omit<InputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  value: string;
  onChangeText: (phoneNumber: string) => void;
  error?: string;
  autoFormat?: boolean;
  countryCode?: string;
  placeholder?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

const PhoneInput: React.FC<PhoneInputProps> = React.memo(({
  value,
  onChangeText,
  error,
  autoFormat = true,
  countryCode = '+225',
  placeholder = '01 23 45 67 89',
  style,
  inputStyle,
  ...rest
}) => {
  const [shakeAnimation] = useState(new Animated.Value(0));

  // Format CI phone number: "01 23 45 67 89"
  const formatPhoneNumber = (number: string): string => {
    // Remove all non-digits
    const digits = number.replace(/\D/g, '');
    
    // Limit to 10 digits (CI phone format)
    const limitedDigits = digits.slice(0, 10);
    
    if (!autoFormat) {
      return limitedDigits;
    }

    // Format with spaces: XX XX XX XX XX
    const formatted = limitedDigits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    
    return formatted;
  };

  // Validate CI phone number
  const validatePhoneNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/\D/g, '');
    
    // CI phone numbers are 10 digits starting with specific prefixes
    const ciPattern = /^(01|02|03|05|07|08|09)\d{8}$/;
    return ciPattern.test(cleanNumber);
  };

  const handleTextChange = (text: string) => {
    const formattedNumber = formatPhoneNumber(text);
    onChangeText(formattedNumber);
  };

  // Shake animation for errors
  React.useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, shakeAnimation]);

  const isValid = value.length === 0 || validatePhoneNumber(value);
  const displayError = error || (!isValid && value.length > 0 ? 'Numéro de téléphone invalide' : '');

  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        {
          transform: [{ translateX: shakeAnimation }]
        }
      ]}
    >
      <Input
        {...rest}
        value={value}
        onChangeText={handleTextChange}
        keyboardType="phone-pad"
        placeholder={placeholder}
        error={displayError}
        maxLength={14} // "01 23 45 67 89" = 14 characters with spaces
        prefix={
          <View style={styles.prefixContainer}>
            <Text style={styles.countryCode}>{countryCode}</Text>
            <View style={styles.separator} />
          </View>
        }
        leftIcon="call"
        style={inputStyle}
        autoComplete="tel"
        textContentType="telephoneNumber"
        returnKeyType="done"
      />
      
      {/* Helper text */}
      {!error && value.length === 0 && (
        <Text style={styles.helperText}>
          Format: {placeholder}
        </Text>
      )}
      
      {/* Validation indicator */}
      {value.length > 0 && !error && (
        <View style={styles.validationContainer}>
          {isValid ? (
            <Text style={styles.validText}>✓ Numéro valide</Text>
          ) : (
            <Text style={styles.invalidText}>Format incorrect</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
});

// Utility functions for external validation
export const validateCIPhoneNumber = (phoneNumber: string): boolean => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const ciPattern = /^(01|02|03|05|07|08|09)\d{8}$/;
  return ciPattern.test(cleanNumber);
};

export const formatCIPhoneNumber = (phoneNumber: string): string => {
  const digits = phoneNumber.replace(/\D/g, '');
  const limitedDigits = digits.slice(0, 10);
  return limitedDigits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
};

export const getCleanPhoneNumber = (formattedPhone: string): string => {
  return formattedPhone.replace(/\D/g, '');
};

export const getFullPhoneNumber = (phoneNumber: string, countryCode: string = '+225'): string => {
  const cleanNumber = getCleanPhoneNumber(phoneNumber);
  return `${countryCode}${cleanNumber}`;
};

const styles = StyleSheet.create({
  container: {
    // Container for the entire phone input component
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: theme.spacing.sm,
  },
  countryCode: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.border.primary,
    marginLeft: theme.spacing.sm,
  },
  helperText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  validationContainer: {
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  validText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.success[500],
  },
  invalidText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.warning[500],
  },
});

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;