/**
 * KAYI House PriceInput Component
 * Specialized for FCFA currency formatting with thousands separators
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Input, { InputProps } from '../base/Input';
import { theme } from '../../theme/theme';

export interface PriceInputProps extends Omit<InputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  value: number | string;
  onChangeValue: (value: number) => void;
  error?: string;
  placeholder?: string;
  maxValue?: number;
  minValue?: number;
  currency?: string;
  showCurrency?: boolean;
  allowDecimals?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

const PriceInput: React.FC<PriceInputProps> = React.memo(({
  value,
  onChangeValue,
  error,
  placeholder = '0',
  maxValue,
  minValue = 0,
  currency = 'FCFA',
  showCurrency = true,
  allowDecimals = false,
  style,
  inputStyle,
  ...rest
}) => {
  const [displayValue, setDisplayValue] = useState(() => {
    return formatPrice(Number(value) || 0, false);
  });

  // Format price with thousands separators
  const formatPrice = (amount: number, includeCurrency: boolean = true): string => {
    if (isNaN(amount) || amount === 0) {
      return '';
    }

    // Format with thousands separators
    const formatter = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: allowDecimals ? 0 : 0,
      maximumFractionDigits: allowDecimals ? 2 : 0,
    });

    const formattedNumber = formatter.format(amount);
    
    if (includeCurrency && showCurrency) {
      return `${formattedNumber} ${currency}`;
    }
    
    return formattedNumber;
  };

  // Parse formatted string back to number
  const parsePrice = (formattedPrice: string): number => {
    // Remove currency symbol and spaces
    const cleanValue = formattedPrice
      .replace(new RegExp(currency, 'g'), '')
      .replace(/\s/g, '')
      .replace(/\u00A0/g, '') // Remove non-breaking spaces from Intl.NumberFormat
      .replace(/[^\d,.-]/g, '');

    // Handle French number format (comma as decimal separator)
    const normalizedValue = cleanValue.replace(/\./g, '').replace(',', '.');
    
    const parsed = parseFloat(normalizedValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Validate price range
  const validatePrice = (price: number): string | undefined => {
    if (minValue !== undefined && price < minValue) {
      return `Le montant minimum est ${formatPrice(minValue)}`;
    }
    
    if (maxValue !== undefined && price > maxValue) {
      return `Le montant maximum est ${formatPrice(maxValue)}`;
    }
    
    return undefined;
  };

  const handleTextChange = (text: string) => {
    // Allow only digits, spaces, and decimal separators
    const cleanText = text.replace(/[^\d\s.,]/g, '');
    
    if (cleanText === '') {
      setDisplayValue('');
      onChangeValue(0);
      return;
    }

    const numericValue = parsePrice(cleanText);
    
    // Format display value without currency during typing
    const formattedDisplay = formatPrice(numericValue, false);
    setDisplayValue(formattedDisplay);
    
    onChangeValue(numericValue);
  };

  const handleBlur = () => {
    const numericValue = parsePrice(displayValue);
    
    if (numericValue === 0) {
      setDisplayValue('');
    } else {
      // Format with proper thousands separators but without currency
      setDisplayValue(formatPrice(numericValue, false));
    }
  };

  const numericValue = parsePrice(displayValue);
  const rangeError = validatePrice(numericValue);
  const displayError = error || rangeError;

  return (
    <View style={[styles.container, style]}>
      <Input
        {...rest}
        value={displayValue}
        onChangeText={handleTextChange}
        onBlur={handleBlur}
        keyboardType={allowDecimals ? 'decimal-pad' : 'number-pad'}
        placeholder={placeholder}
        error={displayError}
        suffix={
          showCurrency ? (
            <View style={styles.suffixContainer}>
              <View style={styles.separator} />
              <Text style={styles.currency}>{currency}</Text>
            </View>
          ) : undefined
        }
        leftIcon="cash"
        style={inputStyle}
        returnKeyType="done"
      />
      
      {/* Helper text */}
      {!displayError && numericValue === 0 && (
        <Text style={styles.helperText}>
          Saisissez un montant en {currency}
        </Text>
      )}
      
      {/* Range indicators */}
      {!displayError && (minValue !== undefined || maxValue !== undefined) && (
        <View style={styles.rangeContainer}>
          <Text style={styles.rangeText}>
            {minValue !== undefined && maxValue !== undefined
              ? `Entre ${formatPrice(minValue)} et ${formatPrice(maxValue)}`
              : minValue !== undefined
              ? `Minimum: ${formatPrice(minValue)}`
              : `Maximum: ${formatPrice(maxValue!)}`
            }
          </Text>
        </View>
      )}
      
      {/* Formatted preview */}
      {numericValue > 0 && !displayError && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>
            Montant: {formatPrice(numericValue)}
          </Text>
        </View>
      )}
    </View>
  );
});

// Utility functions for external use
export const formatFCFA = (amount: number, showCurrency: boolean = true): string => {
  if (isNaN(amount) || amount === 0) {
    return showCurrency ? '0 FCFA' : '0';
  }

  const formatter = new Intl.NumberFormat('fr-FR');
  const formattedNumber = formatter.format(amount);
  
  return showCurrency ? `${formattedNumber} FCFA` : formattedNumber;
};

export const parseFCFA = (formattedPrice: string): number => {
  const cleanValue = formattedPrice
    .replace(/FCFA/g, '')
    .replace(/\s/g, '')
    .replace(/\u00A0/g, '')
    .replace(/[^\d,.-]/g, '');

  const normalizedValue = cleanValue.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(normalizedValue);
  
  return isNaN(parsed) ? 0 : parsed;
};

export const validatePriceRange = (
  price: number, 
  min?: number, 
  max?: number
): { isValid: boolean; error?: string } => {
  if (min !== undefined && price < min) {
    return {
      isValid: false,
      error: `Le montant minimum est ${formatFCFA(min)}`,
    };
  }
  
  if (max !== undefined && price > max) {
    return {
      isValid: false,
      error: `Le montant maximum est ${formatFCFA(max)}`,
    };
  }
  
  return { isValid: true };
};

const styles = StyleSheet.create({
  container: {
    // Container for the entire price input component
  },
  suffixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing.sm,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.border.primary,
    marginRight: theme.spacing.sm,
  },
  currency: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  helperText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  rangeContainer: {
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  rangeText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.tertiary,
  },
  previewContainer: {
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  previewText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
});

PriceInput.displayName = 'PriceInput';

export default PriceInput;