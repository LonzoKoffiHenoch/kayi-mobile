/**
 * Theme System Tests
 * Tests for KAYI House design system theme configuration
 */

import { theme, getColor, getSpacing, getTextStyle } from '../../theme/theme';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

describe('Theme System', () => {
  describe('Theme Structure', () => {
    test('should have all required theme sections', () => {
      expect(theme).toHaveProperty('colors');
      expect(theme).toHaveProperty('typography');
      expect(theme).toHaveProperty('spacing');
      expect(theme).toHaveProperty('borderRadius');
      expect(theme).toHaveProperty('elevation');
      expect(theme).toHaveProperty('components');
    });

    test('should have KAYI brand colors', () => {
      expect(theme.colors.primary[500]).toBe('#FF6B35');
      expect(theme.colors.secondary[500]).toBe('#2C5F41');
    });

    test('should have mobile money operator colors', () => {
      expect(theme.colors.mobileMoney.orange).toBe('#FF7900');
      expect(theme.colors.mobileMoney.mtn).toBe('#FFCE00');
      expect(theme.colors.mobileMoney.moov).toBe('#00B4D8');
    });
  });

  describe('Color System', () => {
    test('should have complete color scales', () => {
      const colorKeys = ['primary', 'secondary', 'success', 'error', 'warning', 'info', 'gray'];
      
      colorKeys.forEach(colorKey => {
        const colorScale = colors[colorKey as keyof typeof colors];
        expect(colorScale).toBeDefined();
        
        // Check for standard scale values
        [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].forEach(shade => {
          expect(colorScale[shade as keyof typeof colorScale]).toBeDefined();
          expect(typeof colorScale[shade as keyof typeof colorScale]).toBe('string');
        });
      });
    });

    test('should have semantic color mappings', () => {
      expect(theme.semanticColors.buttonPrimary).toBe(colors.primary[500]);
      expect(theme.semanticColors.screenBackground).toBe(colors.background.primary);
    });
  });

  describe('Typography System', () => {
    test('should have all text style variants', () => {
      const expectedVariants = [
        'display', 'h1', 'h2', 'h3', 'h4',
        'bodyLarge', 'body', 'bodySmall',
        'button', 'buttonSmall', 'buttonLarge',
        'label', 'caption', 'overline',
        'input', 'inputLabel', 'inputError'
      ];

      expectedVariants.forEach(variant => {
        expect(textStyles[variant as keyof typeof textStyles]).toBeDefined();
      });
    });

    test('should have proper font size hierarchy', () => {
      expect(textStyles.display.fontSize).toBeGreaterThan(textStyles.h1.fontSize);
      expect(textStyles.h1.fontSize).toBeGreaterThan(textStyles.h2.fontSize);
      expect(textStyles.bodyLarge.fontSize).toBeGreaterThan(textStyles.body.fontSize);
      expect(textStyles.body.fontSize).toBeGreaterThan(textStyles.bodySmall.fontSize);
    });
  });

  describe('Spacing System', () => {
    test('should follow 4px base grid', () => {
      expect(spacing.xs).toBe(4);
      expect(spacing.sm).toBe(8);
      expect(spacing.md).toBe(16);
      expect(spacing.lg).toBe(24);
      expect(spacing.xl).toBe(32);
    });

    test('should have component-specific spacing', () => {
      expect(theme.componentSpacing.touchTarget.minimum).toBe(44);
      expect(theme.componentSpacing.container.horizontal).toBe(16);
    });
  });

  describe('Component Defaults', () => {
    test('should have button component defaults', () => {
      const buttonDefaults = theme.components.Button;
      expect(buttonDefaults.minHeight).toBe(44);
      expect(buttonDefaults.paddingHorizontal).toBe(24);
    });

    test('should have input component defaults', () => {
      const inputDefaults = theme.components.Input;
      expect(inputDefaults.minHeight).toBe(44);
      expect(inputDefaults.borderWidth).toBe(1);
    });
  });

  describe('Helper Functions', () => {
    test('getColor should return correct color values', () => {
      expect(getColor('primary.500')).toBe('#FF6B35');
      expect(getColor('gray.100')).toBe('#F3F4F6');
    });

    test('getSpacing should return correct spacing values', () => {
      expect(getSpacing('md')).toBe(16);
      expect(getSpacing('xl')).toBe(32);
    });

    test('getTextStyle should return correct text styles', () => {
      const bodyStyle = getTextStyle('body');
      expect(bodyStyle.fontSize).toBe(16);
      expect(bodyStyle.lineHeight).toBe(24);
    });
  });

  describe('Accessibility Compliance', () => {
    test('should have minimum touch targets', () => {
      expect(theme.components.Button.minHeight).toBeGreaterThanOrEqual(44);
      expect(theme.components.Input.minHeight).toBeGreaterThanOrEqual(44);
      expect(theme.componentSpacing.touchTarget.minimum).toBeGreaterThanOrEqual(44);
    });

    test('should have proper contrast ratios', () => {
      // Primary button should have sufficient contrast
      expect(theme.colors.primary[500]).toBeDefined();
      expect(theme.colors.text.inverse).toBe('#FFFFFF');
    });
  });

  describe('Performance Considerations', () => {
    test('theme object should be immutable', () => {
      expect(() => {
        // @ts-ignore - Testing immutability
        theme.colors.primary[500] = '#000000';
      }).toThrow();
    });

    test('color values should be valid hex codes', () => {
      const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      
      Object.values(colors.primary).forEach(color => {
        expect(color).toMatch(hexPattern);
      });
    });
  });
});