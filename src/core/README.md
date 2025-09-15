# KAYI House Core Utilities

Utilitaires essentiels pour l'application mobile KAYI House, spécialement optimisés pour le marché immobilier ivoirien.

## 🏗 Architecture Core

```
src/core/
├── api/
│   ├── apiClient.ts        # Client Axios principal avec intercepteurs
│   └── endpoints.ts        # URLs endpoints organisées par modules
├── storage/
│   ├── secureStorage.ts    # Wrapper Expo SecureStore avec biométrie
│   └── localStorage.ts     # AsyncStorage + SQLite avec cache LRU
├── utils/
│   ├── validators.ts       # Validateurs spécifiques Côte d'Ivoire
│   └── formatters.ts       # Formatage FCFA, téléphones CI, adresses
├── types/
│   ├── api.types.ts        # Types API et réponses NestJS
│   └── storage.types.ts    # Types storage et cache
└── index.ts               # Barrel export + CoreServices
```

## ⚡ Fonctionnalités Principales

### 🌐 API Client (`apiClient.ts`)
- **Intercepteurs automatiques** : injection JWT + refresh token
- **Retry intelligent** : 3 tentatives avec délai progressif
- **Support upload** avec progress callback
- **Gestion offline** : detection réseau + queue requêtes
- **Logs développement** : debug complet avec sanitisation

```typescript
import { apiClient } from '@/core';

// GET avec retry automatique
const properties = await apiClient.get('/properties');

// Upload avec progress
await apiClient.upload('/properties/123/images', formData, {
  onUploadProgress: (progress) => console.log(`${progress.percentage}%`)
});
```

### 🔐 Secure Storage (`secureStorage.ts`)
- **Authentification biométrique** : Touch ID/Face ID/Fingerprint
- **Tokens JWT sécurisés** : stockage avec rotation automatique
- **Bulk operations** : performance optimisée
- **Migration données** : backward compatibility

```typescript
import { secureStorage } from '@/core';

// Stockage avec biométrie
await secureStorage.setItem('sensitive_data', 'value', {
  promptMessage: 'Authentifiez-vous pour sauvegarder'
});

// Gestion auth
await secureStorage.setAuthTokens({
  accessToken: 'jwt_token',
  refreshToken: 'refresh_token',
  userId: 'user_123',
  expiresAt: Date.now() + 3600000
});
```

### 📦 Local Storage (`localStorage.ts`)
- **Cache SQLite** : performances natives + requêtes complexes
- **LRU Eviction** : gestion automatique limites mémoire (50MB)
- **TTL granulaire** : expiration par type de données
- **Fallback AsyncStorage** : robustesse si SQLite indisponible

```typescript
import { localStorage } from '@/core';

// Cache propriété avec images offline
await localStorage.cacheProperty({
  id: 'prop_123',
  data: propertyData,
  images: ['base64_img1', 'base64_img2'],
  lastUpdated: Date.now(),
  viewCount: 5
});

// Historique recherche avec limite
const history = await localStorage.getSearchHistory(20);
```

### ✅ Validateurs CI (`validators.ts`)
- **Téléphones ivoiriens** : formats 0X XX XX XX XX, +225, détection opérateur
- **CNI Côte d'Ivoire** : format CIXXXXXXXXXX avec validation
- **Prix FCFA** : ranges marché + détection prix suspects
- **Coordonnées GPS CI** : boundaries géographiques précises
- **Formulaires Zod** : validation complète avec messages français

```typescript
import { validateCIPhone, formatCIPhone, getPhoneOperator } from '@/core';

// Validation téléphone
const isValid = validateCIPhone('0123456789'); // true
const operator = getPhoneOperator('0123456789'); // 'ORANGE'
const formatted = formatCIPhone('0123456789'); // '01 23 45 67 89'

// Validation prix avec détection suspect
const priceValidation = validateCIPrice(5000); // { isValid: true, isSuspicious: true }

// Formulaires complets
const result = validateRegistrationForm({
  firstName: 'Kouame',
  lastName: 'Yao', 
  phone: '0123456789',
  email: 'kouame@example.com',
  password: 'StrongP@ss123',
  confirmPassword: 'StrongP@ss123',
  acceptTerms: true
});
```

### 🎨 Formatters CI (`formatters.ts`)
- **Prix FCFA** : séparateurs français, version compacte (150k FCFA)
- **Téléphones** : affichage local/international + masquage partiel
- **Adresses Abidjan** : format "Détails, Quartier, Commune, Abidjan"
- **Distances** : mètres/kilomètres avec précision configurable
- **Temps relatif** : "Il y a 2h" en français/anglais

```typescript
import { formatCurrency, formatPhoneDisplay, formatAddress } from '@/core';

// Formatage prix
formatCurrency(150000); // "150 000 FCFA"
formatCurrency(1500000, { compact: true }); // "1.5M FCFA"

// Téléphone avec masquage
formatPhoneDisplay('0123456789', { masked: true }); // "01 XX XX XX 89"

// Adresse complète Abidjan
formatAddress({
  details: 'Immeuble Harmony',
  neighborhood: 'Riviera Golf', 
  commune: 'COCODY'
}); // "Immeuble Harmony, Riviera Golf, Cocody, Abidjan"
```

## 🛠 CoreServices Helper

Classe utilitaire combinant tous les services :

```typescript
import { CoreServices } from '@/core';

// Status et santé
const isOnline = await CoreServices.isOnline();
const isHealthy = await CoreServices.healthCheck();

// Authentification
const isAuth = await CoreServices.isUserAuthenticated();
const userId = await CoreServices.getUserId();

// Statistiques cache
const stats = await CoreServices.getCacheStats();
console.log(`${stats.database.properties} propriétés en cache`);

// Nettoyage complet
await CoreServices.clearAllData();
```

## 🇨🇮 Spécificités Côte d'Ivoire

### Opérateurs Mobile Money Intégrés
- **Orange Money** : préfixes 01, 02, 03 + couleur #FF7900
- **MTN Mobile Money** : préfixes 04, 05, 06 + couleur #FFCE00  
- **Moov Money** : préfixes 07, 08, 09 + couleur #00B4D8

### Communes d'Abidjan
Support natif : COCODY, PLATEAU, MARCORY, YOPOUGON, etc.

### Prix Marché Ivoirien
- **Ranges typiques** : 50k à 50M FCFA
- **Détection suspects** : < 10k ou > 50M FCFA
- **Formatage local** : séparateurs d'espaces (style français)

### Coordonnées GPS CI
- **Boundaries** : Lat 4.9°-10.7°N, Lon -8.6°--2.5°W
- **Validation précise** : limites géographiques nationales

## 🚀 Performance & Optimisation

### Memoization
```typescript
import { memoizedFormatCurrency, memoizedFormatDistance } from '@/core';

// Formatters memoized pour performances
const price = memoizedFormatCurrency(150000); // Cache résultat
```

### Debouncing
```typescript
import { createDebouncedValidator, debouncedPhoneValidator } from '@/core';

// Validation temps réel avec délai
debouncedPhoneValidator('0123456789', (isValid) => {
  console.log('Phone valid:', isValid);
});
```

### Cache Intelligent
- **LRU automatique** : éviction par usage pour rester sous 50MB
- **TTL granulaire** : propriétés 24h, recherches 1h, favoris permanent
- **Compression** : objets JSON > 10KB compressés automatiquement

## 🧪 Tests Complets

### Tests Unitaires
- **Validators** : 50+ cas avec données CI réelles
- **Formatters** : edge cases + performance 1000 formatages < 1s
- **API Client** : mocks + retry + network failures

### Tests d'Intégration  
- **Flows complets** : registration, search, mobile money
- **Error handling** : données corrompues + network failures
- **Performance** : 1000 validations concurrentes < 100ms

### Tests Réels CI
- **Coordonnées Abidjan** : 5.3600,-4.0083 (centre-ville)
- **Formats téléphones** : 01 02 03 04 05, +225, espaces, tirets
- **Prix marché** : 75k, 150k, 300k, 1.5M FCFA typiques

## 📱 Contraintes Devices Entry-Level

### Memory Management
- **50MB limite** cache total avec éviction automatique
- **Lazy loading** modules non-critiques
- **Weak references** dans memoization

### Network Optimization
- **Retry intelligent** : 3x avec backoff exponentiel
- **Request queuing** : offline sync automatique
- **Compression** : données cache > 10KB

### Battery Optimization
- **Debouncing** : validation 300ms délai par défaut
- **Cache hits** : éviter re-calculs inutiles
- **Background tasks** : SQLite en WAL mode (iOS)

## 🔒 Sécurité

### Protection Données
- **Sanitisation** : XSS protection dans tous inputs
- **Masquage logs** : tokens/pins jamais loggés
- **Biométrie** : Touch ID/Face ID pour données sensibles

### Validation Robuste
- **Server + Client** : double validation requise
- **Rate limiting** : debouncing empêche spam validation
- **Input sanitization** : nettoyage automatique caractères dangereux

---

**KAYI House Core** - Fondations solides pour l'immobilier ivoirien 🏠