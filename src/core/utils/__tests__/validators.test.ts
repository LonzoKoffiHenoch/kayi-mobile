// Test des validateurs spécifiques Côte d'Ivoire
import {
  validateCIPhone,
  formatCIPhone,
  validateCICNI,
  validateCIPrice,
  validateCICoordinates,
  validateCommune,
  getPhoneOperator,
  isValidCIPhonePrefix,
  validateRegistrationForm,
  validateLoginForm,
  validateSecureInput,
  sanitizeInput,
} from '../validators';

describe('CI Phone Validators', () => {
  test('should validate correct CI phone numbers', () => {
    const validPhones = [
      '0123456789',          // Format local
      '+22501 23 45 67 89',  // Format international avec espaces
      '225 02 34 56 78 90',  // Format sans +
      '03 45 67 89 01',      // Format avec espaces
      '22504-56-78-90-12',   // Format avec tirets
    ];

    validPhones.forEach(phone => {
      expect(validateCIPhone(phone)).toBe(true);
    });
  });

  test('should reject invalid CI phone numbers', () => {
    const invalidPhones = [
      '123456789',           // Trop court
      '01234567890',         // Trop long
      '+33123456789',        // Préfixe français
      '0123456abc',          // Contient des lettres
      '0023456789',          // Préfixe invalide CI
      '',                    // Vide
      '+22500123456789',     // Mauvais format international
    ];

    invalidPhones.forEach(phone => {
      expect(validateCIPhone(phone)).toBe(false);
    });
  });

  test('should format CI phone numbers correctly', () => {
    expect(formatCIPhone('0123456789', false)).toBe('01 23 45 67 89');
    expect(formatCIPhone('0123456789', true)).toBe('+225 0123456789');
    expect(formatCIPhone('+22501 23 45 67 89', false)).toBe('01 23 45 67 89');
    expect(formatCIPhone('invalid')).toBe('invalid');
  });

  test('should detect correct operator from phone', () => {
    expect(getPhoneOperator('0123456789')).toBe('ORANGE');  // 01 prefix
    expect(getPhoneOperator('0234567890')).toBe('ORANGE');  // 02 prefix
    expect(getPhoneOperator('0345678901')).toBe('ORANGE');  // 03 prefix
    expect(getPhoneOperator('0456789012')).toBe('MTN');     // 04 prefix
    expect(getPhoneOperator('0567890123')).toBe('MTN');     // 05 prefix
    expect(getPhoneOperator('0678901234')).toBe('MTN');     // 06 prefix
    expect(getPhoneOperator('0789012345')).toBe('MOOV');    // 07 prefix
    expect(getPhoneOperator('0890123456')).toBe('MOOV');    // 08 prefix
    expect(getPhoneOperator('0901234567')).toBe('MOOV');    // 09 prefix
    expect(getPhoneOperator('invalid')).toBe('UNKNOWN');
  });
});

describe('CI CNI Validator', () => {
  test('should validate correct CI CNI numbers', () => {
    const validCNIs = [
      'CI1234567890',
      'ci1234567890',        // Case insensitive
      'CI 12 34 56 78 90',   // Avec espaces
      'CI-12-34-56-78-90',   // Avec tirets
    ];

    validCNIs.forEach(cni => {
      expect(validateCICNI(cni)).toBe(true);
    });
  });

  test('should reject invalid CI CNI numbers', () => {
    const invalidCNIs = [
      'CI123456789',         // Trop court
      'CI12345678901',       // Trop long
      'AB1234567890',        // Mauvais préfixe
      'CI123456789A',        // Contient des lettres à la fin
      '',                    // Vide
      'CI',                  // Préfixe seulement
    ];

    invalidCNIs.forEach(cni => {
      expect(validateCICNI(cni)).toBe(false);
    });
  });
});

describe('CI Price Validator', () => {
  test('should validate reasonable prices', () => {
    const validPrices = [50000, 150000, 500000, 1000000, 10000000];

    validPrices.forEach(price => {
      const result = validateCIPrice(price);
      expect(result.isValid).toBe(true);
    });
  });

  test('should detect suspicious prices', () => {
    const suspiciousPrices = [
      { price: 5000, expected: true },   // Très bas
      { price: 80000000, expected: true }, // Très élevé
    ];

    suspiciousPrices.forEach(({ price, expected }) => {
      const result = validateCIPrice(price);
      expect(result.isValid).toBe(true);
      expect(result.isSuspicious).toBe(expected);
    });
  });

  test('should reject invalid prices', () => {
    const invalidPrices = [-1000, 150000000, NaN];

    invalidPrices.forEach(price => {
      const result = validateCIPrice(price);
      expect(result.isValid).toBe(false);
    });
  });

  test('should reject suspicious prices in strict mode', () => {
    const result = validateCIPrice(5000, { strict: true });
    expect(result.isValid).toBe(false);
    expect(result.isSuspicious).toBe(true);
  });
});

describe('CI Coordinates Validator', () => {
  test('should validate coordinates within CI bounds', () => {
    const validCoordinates = [
      [5.3, -4.0],  // Abidjan
      [7.5, -5.0],  // Centre du pays
      [9.0, -6.0],  // Nord du pays
    ];

    validCoordinates.forEach(([lat, lng]) => {
      expect(validateCICoordinates(lat, lng)).toBe(true);
    });
  });

  test('should reject coordinates outside CI bounds', () => {
    const invalidCoordinates = [
      [48.8566, 2.3522],    // Paris, France
      [-33.8688, 151.2093], // Sydney, Australia
      [0, 0],               // Ocean
      [15, -4],             // Trop au nord
      [5, 0],               // Trop à l'est
    ];

    invalidCoordinates.forEach(([lat, lng]) => {
      expect(validateCICoordinates(lat, lng)).toBe(false);
    });
  });
});

describe('Commune Validator', () => {
  test('should validate popular CI communes', () => {
    const validCommunes = ['COCODY', 'PLATEAU', 'MARCORY', 'YOPOUGON'];

    validCommunes.forEach(commune => {
      expect(validateCommune(commune)).toBe(true);
      expect(validateCommune(commune.toLowerCase())).toBe(true); // Case insensitive
    });
  });

  test('should reject invalid communes', () => {
    const invalidCommunes = ['PARIS', 'LONDON', 'UNKNOWN', '', 'INVALID'];

    invalidCommunes.forEach(commune => {
      expect(validateCommune(commune)).toBe(false);
    });
  });
});

describe('Form Validators', () => {
  test('should validate correct registration form', () => {
    const validForm = {
      firstName: 'Kouame',
      lastName: 'Yao',
      phone: '0123456789',
      email: 'kouame.yao@example.com',
      password: 'StrongP@ss123',
      confirmPassword: 'StrongP@ss123',
      acceptTerms: true,
    };

    const result = validateRegistrationForm(validForm);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject registration form with mismatched passwords', () => {
    const invalidForm = {
      firstName: 'Kouame',
      lastName: 'Yao',
      phone: '0123456789',
      password: 'StrongP@ss123',
      confirmPassword: 'DifferentPassword',
      acceptTerms: true,
    };

    const result = validateRegistrationForm(invalidForm);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'confirmPassword')).toBe(true);
  });

  test('should validate correct login form', () => {
    const validForm = {
      phone: '0123456789',
      password: 'password123',
    };

    const result = validateLoginForm(validForm);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject login form with invalid phone', () => {
    const invalidForm = {
      phone: 'invalid-phone',
      password: 'password123',
    };

    const result = validateLoginForm(invalidForm);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'phone')).toBe(true);
  });
});

describe('Security Validators', () => {
  test('should detect dangerous input patterns', () => {
    const dangerousInputs = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img onerror="alert(1)" src="">',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox("xss")',
    ];

    dangerousInputs.forEach(input => {
      expect(validateSecureInput(input)).toBe(false);
    });
  });

  test('should allow safe input', () => {
    const safeInputs = [
      'Normal text',
      'Email: user@example.com',
      'Phone: 0123456789',
      'Price: 150000 FCFA',
    ];

    safeInputs.forEach(input => {
      expect(validateSecureInput(input)).toBe(true);
    });
  });

  test('should sanitize input correctly', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('alert(1)');
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
    expect(sanitizeInput('<img onerror="hack" src="">')).toBe('img src=""');
    expect(sanitizeInput('Normal text')).toBe('Normal text');
  });
});

// Tests de performance pour débounced validators
describe('Debounced Validators', () => {
  test('should debounce phone validation', (done) => {
    const mockCallback = jest.fn();
    
    // Simuler plusieurs appels rapides
    const { createDebouncedValidator } = require('../validators');
    const testDebouncedValidator = createDebouncedValidator(validateCIPhone, 100);
    
    testDebouncedValidator('0123456789', mockCallback);
    testDebouncedValidator('0123456789', mockCallback);
    testDebouncedValidator('0123456789', mockCallback);
    
    // Seulement le dernier appel devrait être exécuté
    setTimeout(() => {
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(true);
      done();
    }, 150);
  });
});

// Tests avec données réelles ivoiriennes
describe('Real CI Data Tests', () => {
  test('should handle real Abidjan coordinates', () => {
    // Coordonnées réelles d'Abidjan
    const abidjanCoords = [
      [5.3600, -4.0083],    // Centre-ville
      [5.2849, -3.9915],    // Cocody
      [5.3447, -4.0254],    // Plateau
      [5.2966, -4.0781],    // Marcory
    ];

    abidjanCoords.forEach(([lat, lng]) => {
      expect(validateCICoordinates(lat, lng)).toBe(true);
    });
  });

  test('should handle real CI phone formats', () => {
    const realFormats = [
      '01 02 03 04 05',
      '07-08-09-10-11',
      '+225 04 56 78 90',
      '225 08 90 12 34',
      '0987654321',
    ];

    realFormats.forEach(phone => {
      if (isValidCIPhonePrefix(phone.replace(/[\s\-\(\)\.]/g, '').slice(-10))) {
        expect(validateCIPhone(phone)).toBe(true);
      }
    });
  });
});