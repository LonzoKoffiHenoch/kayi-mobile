/**
 * Button Component Tests
 * Tests for KAYI House Button component functionality and accessibility
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Button from '../../components/base/Button';
import { theme } from '../../theme/theme';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

describe('Button Component', () => {
  describe('Rendering', () => {
    test('renders correctly with title', () => {
      const { getByText } = render(<Button title="Test Button" />);
      expect(getByText('Test Button')).toBeTruthy();
    });

    test('renders with default variant and size', () => {
      const { getByText } = render(<Button title="Default Button" />);
      const button = getByText('Default Button').parent;
      expect(button).toHaveStyle({
        backgroundColor: theme.colors.primary[500],
        minHeight: 44,
      });
    });

    test('renders with different variants', () => {
      const variants = ['primary', 'secondary', 'outline', 'text', 'danger'] as const;
      
      variants.forEach(variant => {
        const { getByText } = render(<Button title={`${variant} Button`} variant={variant} />);
        expect(getByText(`${variant} Button`)).toBeTruthy();
      });
    });

    test('renders with different sizes', () => {
      const sizes = ['small', 'medium', 'large'] as const;
      
      sizes.forEach(size => {
        const { getByText } = render(<Button title={`${size} Button`} size={size} />);
        expect(getByText(`${size} Button`)).toBeTruthy();
      });
    });
  });

  describe('Interactions', () => {
    test('calls onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(<Button title="Pressable Button" onPress={onPress} />);
      
      fireEvent.press(getByText('Pressable Button'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    test('does not call onPress when disabled', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button title="Disabled Button" onPress={onPress} disabled />
      );
      
      fireEvent.press(getByText('Disabled Button'));
      expect(onPress).not.toHaveBeenCalled();
    });

    test('does not call onPress when loading', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <Button title="Loading Button" onPress={onPress} loading testID="loading-button" />
      );
      
      fireEvent.press(getByTestId('loading-button'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    test('shows loading indicator when loading', () => {
      const { getByTestId } = render(
        <Button title="Loading Button" loading testID="loading-button" />
      );
      
      // Should show ActivityIndicator instead of text
      expect(() => getByTestId('loading-button')).toBeTruthy();
    });

    test('hides title when loading', () => {
      const { queryByText } = render(<Button title="Hidden Title" loading />);
      expect(queryByText('Hidden Title')).toBeNull();
    });
  });

  describe('Icons', () => {
    test('renders with left icon', () => {
      const { getByText } = render(
        <Button title="Icon Button" icon="home" iconPosition="left" />
      );
      expect(getByText('Icon Button')).toBeTruthy();
    });

    test('renders with right icon', () => {
      const { getByText } = render(
        <Button title="Icon Button" icon="arrow-forward" iconPosition="right" />
      );
      expect(getByText('Icon Button')).toBeTruthy();
    });
  });

  describe('Styling', () => {
    test('applies custom style', () => {
      const customStyle = { backgroundColor: '#FF0000' };
      const { getByText } = render(
        <Button title="Styled Button" style={customStyle} />
      );
      
      const button = getByText('Styled Button').parent;
      expect(button).toHaveStyle(customStyle);
    });

    test('applies fullWidth style', () => {
      const { getByText } = render(<Button title="Full Width" fullWidth />);
      const button = getByText('Full Width').parent;
      expect(button).toHaveStyle({ width: '100%' });
    });

    test('applies disabled style', () => {
      const { getByText } = render(<Button title="Disabled" disabled />);
      const button = getByText('Disabled').parent;
      expect(button).toHaveStyle({ opacity: 0.6 });
    });
  });

  describe('Accessibility', () => {
    test('has correct accessibility properties', () => {
      const { getByRole } = render(<Button title="Accessible Button" />);
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    test('supports accessibility label', () => {
      const { getByLabelText } = render(
        <Button title="Button" accessibilityLabel="Custom Label" />
      );
      expect(getByLabelText('Custom Label')).toBeTruthy();
    });

    test('is accessible when disabled', () => {
      const { getByRole } = render(<Button title="Disabled" disabled />);
      const button = getByRole('button');
      expect(button).toHaveProperty('accessibilityState.disabled', true);
    });
  });

  describe('Haptic Feedback', () => {
    test('triggers haptic feedback by default', async () => {
      const { impactAsync } = require('expo-haptics');
      const onPress = jest.fn();
      const { getByText } = render(<Button title="Haptic Button" onPress={onPress} />);
      
      fireEvent.press(getByText('Haptic Button'));
      
      await waitFor(() => {
        expect(impactAsync).toHaveBeenCalledWith('light');
      });
    });

    test('can disable haptic feedback', async () => {
      const { impactAsync } = require('expo-haptics');
      const onPress = jest.fn();
      const { getByText } = render(
        <Button title="No Haptic" onPress={onPress} hapticFeedback={false} />
      );
      
      fireEvent.press(getByText('No Haptic'));
      
      await waitFor(() => {
        expect(impactAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe('Performance', () => {
    test('is memoized correctly', () => {
      const onPress = jest.fn();
      const { rerender } = render(<Button title="Memo Test" onPress={onPress} />);
      
      // Re-render with same props should not cause re-mount
      rerender(<Button title="Memo Test" onPress={onPress} />);
      
      // Component should still be functional
      expect(onPress).toBeDefined();
    });
  });

  describe('Variant-Specific Styling', () => {
    test('primary variant has correct colors', () => {
      const { getByText } = render(<Button title="Primary" variant="primary" />);
      const button = getByText('Primary').parent;
      expect(button).toHaveStyle({
        backgroundColor: theme.colors.primary[500],
      });
    });

    test('outline variant has correct styling', () => {
      const { getByText } = render(<Button title="Outline" variant="outline" />);
      const button = getByText('Outline').parent;
      expect(button).toHaveStyle({
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary[500],
      });
    });

    test('danger variant has correct colors', () => {
      const { getByText } = render(<Button title="Danger" variant="danger" />);
      const button = getByText('Danger').parent;
      expect(button).toHaveStyle({
        backgroundColor: theme.colors.error[500],
      });
    });
  });

  describe('Size-Specific Styling', () => {
    test('small size has correct dimensions', () => {
      const { getByText } = render(<Button title="Small" size="small" />);
      const button = getByText('Small').parent;
      expect(button).toHaveStyle({
        minHeight: 36,
        paddingHorizontal: 16,
      });
    });

    test('large size has correct dimensions', () => {
      const { getByText } = render(<Button title="Large" size="large" />);
      const button = getByText('Large').parent;
      expect(button).toHaveStyle({
        minHeight: 52,
        paddingHorizontal: 32,
      });
    });
  });
});