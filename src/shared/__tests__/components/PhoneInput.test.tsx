/**
 * PhoneInput Component Tests
 * Tests for KAYI House PhoneInput component with CI phone number validation
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PhoneInput, { 
  validateCIPhoneNumber, 
  formatCIPhoneNumber, 
  getCleanPhoneNumber,
  getFullPhoneNumber 
} from '../../components/forms/PhoneInput';

describe('PhoneInput Component', () => {
  describe('Rendering', () => {
    test('renders correctly with default props', () => {
      const onChangeText = jest.fn();
      const { getByText } = render(
        <PhoneInput value="" onChangeText={onChangeText} />
      );
      
      expect(getByText('+225')).toBeTruthy();
    });

    test('renders with custom country code', () => {
      const onChangeText = jest.fn();
      const { getByText } = render(
        <PhoneInput value="" onChangeText={onChangeText} countryCode="+33" />
      );
      
      expect(getByText('+33')).toBeTruthy();
    });

    test('shows placeholder correctly', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <PhoneInput value="" onChangeText={onChangeText} placeholder="01 23 45 67 89" />
      );
      
      expect(getByPlaceholderText('01 23 45 67 89')).toBeTruthy();
    });
  });

  describe('Phone Number Formatting', () => {
    test('formats phone number automatically', () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
        <PhoneInput value="0123456789" onChangeText={onChangeText} />
      );
      
      expect(getByDisplayValue('01 23 45 67 89')).toBeTruthy();
    });

    test('handles partial input formatting', () => {
      const onChangeText = jest.fn();
      const { rerender, getByDisplayValue } = render(
        <PhoneInput value="012" onChangeText={onChangeText} />
      );
      
      expect(getByDisplayValue('01 2')).toBeTruthy();
      
      rerender(<PhoneInput value="01234" onChangeText={onChangeText} />);
      expect(getByDisplayValue('01 23 4')).toBeTruthy();
    });

    test('limits input to 10 digits', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <PhoneInput value="" onChangeText={onChangeText} testID="phone-input" />
      );
      
      const input = getByTestId('phone-input');
      fireEvent.changeText(input, '01234567890123456789');
      
      expect(onChangeText).toHaveBeenCalledWith('01 23 45 67 89');
    });
  });

  describe('Validation', () => {
    test('shows validation for valid CI phone numbers', () => {
      const onChangeText = jest.fn();
      const { getByText } = render(
        <PhoneInput value="0123456789" onChangeText={onChangeText} />
      );
      
      expect(getByText('✓ Numéro valide')).toBeTruthy();
    });

    test('shows error for invalid phone numbers', () => {
      const onChangeText = jest.fn();
      const { getByText } = render(
        <PhoneInput value="1234567890" onChangeText={onChangeText} />
      );
      
      expect(getByText('Format incorrect')).toBeTruthy();
    });

    test('shows custom error message', () => {
      const onChangeText = jest.fn();
      const { getByText } = render(
        <PhoneInput 
          value="0123456789" 
          onChangeText={onChangeText} 
          error="Custom error message" 
        />
      );
      
      expect(getByText('Custom error message')).toBeTruthy();
    });

    test('prioritizes custom error over validation error', () => {
      const onChangeText = jest.fn();
      const { getByText, queryByText } = render(
        <PhoneInput 
          value="1234567890" 
          onChangeText={onChangeText} 
          error="Custom error" 
        />
      );
      
      expect(getByText('Custom error')).toBeTruthy();
      expect(queryByText('Format incorrect')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    test('calls onChangeText with formatted value', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <PhoneInput value="" onChangeText={onChangeText} testID="phone-input" />
      );
      
      const input = getByTestId('phone-input');
      fireEvent.changeText(input, '0123456789');
      
      expect(onChangeText).toHaveBeenCalledWith('01 23 45 67 89');
    });

    test('handles backspace correctly', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <PhoneInput value="01 23 45" onChangeText={onChangeText} testID="phone-input" />
      );
      
      const input = getByTestId('phone-input');
      fireEvent.changeText(input, '01 23 4');
      
      expect(onChangeText).toHaveBeenCalledWith('01 23 4');
    });
  });

  describe('Accessibility', () => {
    test('has correct keyboard type', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <PhoneInput value="" onChangeText={onChangeText} testID="phone-input" />
      );
      
      const input = getByTestId('phone-input');
      expect(input.props.keyboardType).toBe('phone-pad');
    });

    test('has correct text content type', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <PhoneInput value="" onChangeText={onChangeText} testID="phone-input" />
      );
      
      const input = getByTestId('phone-input');
      expect(input.props.textContentType).toBe('telephoneNumber');
    });

    test('has correct max length', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <PhoneInput value="" onChangeText={onChangeText} testID="phone-input" />
      );
      
      const input = getByTestId('phone-input');
      expect(input.props.maxLength).toBe(14); // "01 23 45 67 89" = 14 characters
    });
  });

  describe('Animation', () => {
    test('triggers shake animation on error', () => {
      const onChangeText = jest.fn();
      const { rerender } = render(
        <PhoneInput value="0123456789" onChangeText={onChangeText} />
      );
      
      // Should not throw and should handle animation
      rerender(
        <PhoneInput value="0123456789" onChangeText={onChangeText} error="Test error" />
      );
    });
  });
});

describe('PhoneInput Utility Functions', () => {
  describe('validateCIPhoneNumber', () => {
    test('validates correct CI phone numbers', () => {
      const validNumbers = [
        '0123456789',
        '0223456789',
        '0323456789',
        '0523456789',
        '0723456789',
        '0823456789',
        '0923456789',
      ];

      validNumbers.forEach(number => {
        expect(validateCIPhoneNumber(number)).toBe(true);
      });
    });

    test('validates formatted CI phone numbers', () => {
      expect(validateCIPhoneNumber('01 23 45 67 89')).toBe(true);
      expect(validateCIPhoneNumber('02-23-45-67-89')).toBe(true);
    });

    test('rejects invalid CI phone numbers', () => {
      const invalidNumbers = [
        '1123456789', // Wrong prefix
        '0423456789', // Invalid prefix (04)
        '0623456789', // Invalid prefix (06)
        '012345678',  // Too short
        '01234567890', // Too long
        '0123456abc', // Contains letters
        '',           // Empty
      ];

      invalidNumbers.forEach(number => {
        expect(validateCIPhoneNumber(number)).toBe(false);
      });
    });
  });

  describe('formatCIPhoneNumber', () => {
    test('formats phone numbers correctly', () => {
      expect(formatCIPhoneNumber('0123456789')).toBe('01 23 45 67 89');
      expect(formatCIPhoneNumber('0987654321')).toBe('09 87 65 43 21');
    });

    test('handles partial numbers', () => {
      expect(formatCIPhoneNumber('012')).toBe('01 2');
      expect(formatCIPhoneNumber('01234')).toBe('01 23 4');
    });

    test('handles already formatted numbers', () => {
      expect(formatCIPhoneNumber('01 23 45 67 89')).toBe('01 23 45 67 89');
    });

    test('limits to 10 digits', () => {
      expect(formatCIPhoneNumber('012345678901234')).toBe('01 23 45 67 89');
    });
  });

  describe('getCleanPhoneNumber', () => {
    test('removes formatting from phone numbers', () => {
      expect(getCleanPhoneNumber('01 23 45 67 89')).toBe('0123456789');
      expect(getCleanPhoneNumber('01-23-45-67-89')).toBe('0123456789');
      expect(getCleanPhoneNumber('01.23.45.67.89')).toBe('0123456789');
    });

    test('handles already clean numbers', () => {
      expect(getCleanPhoneNumber('0123456789')).toBe('0123456789');
    });
  });

  describe('getFullPhoneNumber', () => {
    test('adds country code to phone number', () => {
      expect(getFullPhoneNumber('01 23 45 67 89')).toBe('+2250123456789');
      expect(getFullPhoneNumber('0123456789')).toBe('+2250123456789');
    });

    test('uses custom country code', () => {
      expect(getFullPhoneNumber('0123456789', '+33')).toBe('+330123456789');
    });

    test('handles formatted input', () => {
      expect(getFullPhoneNumber('01 23 45 67 89', '+225')).toBe('+2250123456789');
    });
  });
});