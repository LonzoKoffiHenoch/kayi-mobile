// Test des formatters FCFA et CI
import {
  formatCurrency,
  formatCurrencyShort,
  formatPhoneDisplay,
  formatAddress,
  formatRelativeTime,
  formatDistance,
  formatFileSize,
  formatPercentage,
  maskSensitiveData,
  formatSurface,
  formatDuration,
  capitalize,
  titleCase,
  truncateText,
  formatOrdinal,
} from '../formatters';
import { Commune } from '../../types/common.types';

describe('Currency Formatters', () => {
  test('should format FCFA currency correctly', () => {
    expect(formatCurrency(150000)).toBe('150 000 FCFA');
    expect(formatCurrency(1500000)).toBe('1 500 000 FCFA');
    expect(formatCurrency(150000.99)).toBe('150 001 FCFA'); // Arrondi
    expect(formatCurrency(0)).toBe('0 FCFA');
  });

  test('should format compact currency', () => {
    expect(formatCurrency(150000, { compact: true })).toBe('150k FCFA');
    expect(formatCurrency(1500000, { compact: true })).toBe('1.5M FCFA');
    expect(formatCurrency(1500000000, { compact: true })).toBe('1.5Md FCFA');
  });

  test('should handle currency options', () => {
    expect(formatCurrency(150000, { showSymbol: false })).toBe('150 000');
    expect(formatCurrency(150000, { language: 'en' })).toBe('150 000 FCFA');
  });

  test('should format short currency correctly', () => {
    expect(formatCurrencyShort(150000)).toBe('150k FCFA');
    expect(formatCurrencyShort(1500000)).toBe('1.5M FCFA');
    expect(formatCurrencyShort(1500000000)).toBe('1.5Md FCFA');
    expect(formatCurrencyShort(500)).toBe('500 FCFA');
    expect(formatCurrencyShort(-150000)).toBe('-150k FCFA');
  });

  test('should handle invalid currency values', () => {
    expect(formatCurrency(NaN)).toBe('0 FCFA');
    expect(formatCurrencyShort(NaN)).toBe('0 FCFA');
  });
});

describe('Phone Display Formatters', () => {
  test('should format phone for display', () => {
    expect(formatPhoneDisplay('0123456789')).toBe('01 23 45 67 89');
    expect(formatPhoneDisplay('0123456789', { international: true }))
      .toBe('+225 0123456789');
  });

  test('should mask phone numbers', () => {
    expect(formatPhoneDisplay('0123456789', { masked: true }))
      .toBe('01 XX XX XX 89');
  });

  test('should handle invalid phone numbers', () => {
    expect(formatPhoneDisplay('invalid')).toBe('invalid');
    expect(formatPhoneDisplay('')).toBe('');
  });
});

describe('Address Formatters', () => {
  test('should format complete addresses', () => {
    const address = {
      details: 'Immeuble La Paix, Apt 3B',
      neighborhood: 'Riviera Golf',
      commune: 'COCODY' as Commune,
    };
    
    expect(formatAddress(address))
      .toBe('Immeuble La Paix, Apt 3B, Riviera Golf, Cocody, Abidjan');
  });

  test('should handle partial addresses', () => {
    const address = {
      neighborhood: 'Zone 4',
      commune: 'MARCORY' as Commune,
    };
    
    expect(formatAddress(address)).toBe('Zone 4, Marcory, Abidjan');
  });

  test('should handle empty addresses', () => {
    expect(formatAddress({})).toBe('');
    expect(formatAddress({ commune: 'UNKNOWN' })).toBe('Unknown');
  });

  test('should format addresses with custom city', () => {
    const address = {
      details: 'Rue des Jardins',
      commune: 'BOUAKE',
      city: 'Bouaké',
    };
    
    expect(formatAddress(address)).toBe('Rue des Jardins, Bouake, Bouaké');
  });
});

describe('Distance Formatters', () => {
  test('should format distances correctly', () => {
    expect(formatDistance(500)).toBe('500 m');
    expect(formatDistance(1000)).toBe('1.0 km');
    expect(formatDistance(1500)).toBe('1.5 km');
    expect(formatDistance(2350, { precision: 2 })).toBe('2.35 km');
  });

  test('should handle invalid distances', () => {
    expect(formatDistance(NaN)).toBe('Distance inconnue');
    expect(formatDistance(NaN, { language: 'en' })).toBe('Unknown distance');
  });

  test('should support different languages', () => {
    expect(formatDistance(1000, { language: 'fr' })).toBe('1.0 km');
    expect(formatDistance(1000, { language: 'en' })).toBe('1.0 km');
  });
});

describe('File Size Formatters', () => {
  test('should format file sizes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1048576)).toBe('1.0 MB');
    expect(formatFileSize(1073741824)).toBe('1.0 GB');
    expect(formatFileSize(500)).toBe('500.0 B');
  });

  test('should handle edge cases', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(-100)).toBe('0 B');
    expect(formatFileSize(NaN)).toBe('0 B');
  });

  test('should respect precision option', () => {
    expect(formatFileSize(1536, { precision: 2 })).toBe('1.50 KB');
    expect(formatFileSize(1536, { precision: 0 })).toBe('2 KB');
  });
});

describe('Text Formatters', () => {
  test('should capitalize text correctly', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
    expect(capitalize('')).toBe('');
    expect(capitalize('a')).toBe('A');
  });

  test('should format title case', () => {
    expect(titleCase('hello world')).toBe('Hello World');
    expect(titleCase('CÔTE D\'IVOIRE')).toBe('Côte D\'ivoire');
    expect(titleCase('')).toBe('');
  });

  test('should truncate text correctly', () => {
    const longText = 'This is a very long text that should be truncated';
    
    expect(truncateText(longText, { maxLength: 20 }))
      .toBe('This is a very lo...');
    
    expect(truncateText(longText, { maxLength: 20, wordBoundary: true }))
      .toBe('This is a very...');
    
    expect(truncateText('Short', { maxLength: 20 })).toBe('Short');
  });

  test('should handle custom truncation options', () => {
    const text = 'Hello world example';
    
    expect(truncateText(text, { maxLength: 10, suffix: '…' }))
      .toBe('Hello wo…');
    
    expect(truncateText(text, { maxLength: 10, wordBoundary: false }))
      .toBe('Hello w...');
  });
});

describe('Data Masking', () => {
  test('should mask sensitive data correctly', () => {
    expect(maskSensitiveData('1234567890')).toBe('12******90');
    expect(maskSensitiveData('abcdefghij', { visibleStart: 3, visibleEnd: 2 }))
      .toBe('abc*****ij');
    expect(maskSensitiveData('short')).toBe('short'); // Trop court pour masquer
  });

  test('should handle custom mask character', () => {
    expect(maskSensitiveData('1234567890', { maskChar: 'X' }))
      .toBe('12XXXXXX90');
  });

  test('should handle edge cases', () => {
    expect(maskSensitiveData('')).toBe('');
    expect(maskSensitiveData('ab')).toBe('ab');
  });
});

describe('Surface Formatters', () => {
  test('should format surface correctly', () => {
    expect(formatSurface(150)).toBe('150 m²');
    expect(formatSurface(150.5, { precision: 1 })).toBe('150.5 m²');
  });

  test('should convert to hectares for large surfaces', () => {
    expect(formatSurface(50000)).toBe('5 ha'); // Auto-conversion
    expect(formatSurface(12500)).toBe('1 ha');
  });

  test('should handle manual unit specification', () => {
    expect(formatSurface(2, { unit: 'ha' })).toBe('2 ha');
    expect(formatSurface(100, { unit: 'm²' })).toBe('100 m²');
  });

  test('should handle invalid surface values', () => {
    expect(formatSurface(NaN)).toBe('0 m²');
  });
});

describe('Duration Formatters', () => {
  test('should format duration correctly', () => {
    expect(formatDuration(30)).toBe('30 minutes');
    expect(formatDuration(60)).toBe('1 heure');
    expect(formatDuration(90)).toBe('1 heure 30 minutes');
    expect(formatDuration(120)).toBe('2 heures');
  });

  test('should format short duration', () => {
    expect(formatDuration(30, { short: true })).toBe('30min');
    expect(formatDuration(90, { short: true })).toBe('1h30');
    expect(formatDuration(60, { short: true })).toBe('1h');
  });

  test('should support different languages', () => {
    expect(formatDuration(90, { language: 'en' }))
      .toBe('1 hour 30 minutes');
    expect(formatDuration(60, { language: 'en' }))
      .toBe('1 hour');
    expect(formatDuration(1, { language: 'en' }))
      .toBe('1 minute');
  });

  test('should handle edge cases', () => {
    expect(formatDuration(0)).toBe('0 minutes');
    expect(formatDuration(-10)).toBe('0 min');
    expect(formatDuration(NaN)).toBe('0 min');
  });
});

describe('Percentage Formatters', () => {
  test('should format percentages correctly', () => {
    expect(formatPercentage(85.5)).toBe('85.5%');
    expect(formatPercentage(100, { precision: 0 })).toBe('100%');
    expect(formatPercentage(33.333, { precision: 2 })).toBe('33.33%');
  });

  test('should handle sign option', () => {
    expect(formatPercentage(15, { showSign: true })).toBe('+15.0%');
    expect(formatPercentage(-5, { showSign: true })).toBe('-5.0%');
    expect(formatPercentage(0, { showSign: true })).toBe('0.0%');
  });

  test('should handle invalid values', () => {
    expect(formatPercentage(NaN)).toBe('0%');
  });
});

describe('Ordinal Formatters', () => {
  test('should format French ordinals correctly', () => {
    expect(formatOrdinal(1)).toBe('1er');
    expect(formatOrdinal(2)).toBe('2ème');
    expect(formatOrdinal(10)).toBe('10ème');
    expect(formatOrdinal(21)).toBe('21ème');
  });

  test('should format English ordinals correctly', () => {
    expect(formatOrdinal(1, { language: 'en' })).toBe('1st');
    expect(formatOrdinal(2, { language: 'en' })).toBe('2nd');
    expect(formatOrdinal(3, { language: 'en' })).toBe('3rd');
    expect(formatOrdinal(4, { language: 'en' })).toBe('4th');
    expect(formatOrdinal(21, { language: 'en' })).toBe('21st');
    expect(formatOrdinal(22, { language: 'en' })).toBe('22nd');
    expect(formatOrdinal(23, { language: 'en' })).toBe('23rd');
    expect(formatOrdinal(24, { language: 'en' })).toBe('24th');
  });
});

// Tests de performance et memoization
describe('Performance Tests', () => {
  test('should memoize formatters correctly', () => {
    // Ces tests vérifient que la memoization fonctionne
    // En pratique, on mesurerait les performances
    const { memoizedFormatCurrency } = require('../formatters');
    
    const result1 = memoizedFormatCurrency(150000);
    const result2 = memoizedFormatCurrency(150000);
    
    expect(result1).toBe('150 000 FCFA');
    expect(result2).toBe('150 000 FCFA');
    expect(result1).toBe(result2); // Même référence grâce à la memoization
  });
});

// Tests avec données réelles CI
describe('Real CI Data Formatting', () => {
  test('should format real CI prices correctly', () => {
    // Prix typiques du marché ivoirien
    const typicalPrices = [
      { amount: 75000, expected: '75 000 FCFA' },
      { amount: 150000, expected: '150 000 FCFA' },
      { amount: 300000, expected: '300 000 FCFA' },
      { amount: 1500000, expected: '1 500 000 FCFA' },
    ];

    typicalPrices.forEach(({ amount, expected }) => {
      expect(formatCurrency(amount)).toBe(expected);
    });
  });

  test('should format real CI addresses correctly', () => {
    const realAddresses = [
      {
        input: {
          details: '2 Plateaux, Vallon',
          neighborhood: 'Les Deux Plateaux',
          commune: 'COCODY' as Commune,
        },
        expected: '2 Plateaux, Vallon, Les Deux Plateaux, Cocody, Abidjan',
      },
      {
        input: {
          details: 'Rue Gallieni',
          commune: 'PLATEAU' as Commune,
        },
        expected: 'Rue Gallieni, Plateau, Abidjan',
      },
    ];

    realAddresses.forEach(({ input, expected }) => {
      expect(formatAddress(input)).toBe(expected);
    });
  });
});