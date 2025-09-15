# KAYI House Shared Components

Un système de composants UI complet pour l'application mobile KAYI House, optimisé pour les appareils Android entry-level et le contexte ivoirien.

## 🎨 Design System

### Couleurs
- **Primary**: Orange énergique (#FF6B35) - Couleur principale KAYI
- **Secondary**: Vert professionnel (#2C5F41) - Couleur secondaire
- **Mobile Money**: Couleurs spécifiques aux opérateurs CI
  - Orange Money: #FF7900
  - MTN: #FFCE00
  - Moov: #00B4D8

### Typographie
- **Police**: Poppins avec fallbacks système
- **Échelle**: xs(12px) à 4xl(36px)
- **Support**: Caractères spéciaux français et accents

### Espacement
- **Base**: Grille 4px
- **Touch Targets**: Minimum 44px (accessibilité)
- **Échelle**: xs(4px) à 5xl(96px)

## 📦 Architecture

```
src/shared/
├── components/
│   ├── base/                # Composants atomiques
│   ├── forms/               # Composants formulaires spécialisés
│   ├── feedback/            # Feedback utilisateur
│   └── layout/              # Composants layout
├── hooks/                   # Custom hooks partagés
└── theme/                   # Système de design
```

## 🧩 Composants Base

### Button
Bouton avec haptic feedback et variants multiples.

```tsx
import { Button } from '@/shared';

<Button 
  title="Publier Annonce"
  variant="primary"
  size="large"
  icon="add"
  onPress={handlePublish}
  loading={isPublishing}
/>
```

**Variants**: primary, secondary, outline, text, danger  
**Sizes**: small, medium, large

### Input
Input avec label flottant animé et validation.

```tsx
import { Input } from '@/shared';

<Input
  label="Titre de l'annonce"
  value={title}
  onChangeText={setTitle}
  error={titleError}
  leftIcon="home"
/>
```

### Card
Card avec variantes et press animation.

```tsx
import { Card } from '@/shared';

<Card variant="elevated" onPress={handlePress}>
  <Text>Contenu de la carte</Text>
</Card>
```

### Modal
Modal avec gestion clavier et bouton retour Android.

```tsx
import { Modal } from '@/shared';

<Modal
  visible={showModal}
  onClose={handleClose}
  title="Détails Propriété"
  size="large"
>
  <PropertyDetails />
</Modal>
```

## 📝 Composants Formulaires

### PhoneInput
Input spécialisé pour numéros CI avec formatage automatique.

```tsx
import { PhoneInput } from '@/shared';

<PhoneInput
  value={phone}
  onChangeText={setPhone}
  error={phoneError}
  placeholder="01 23 45 67 89"
/>
```

**Fonctionnalités**:
- Préfixe +225 fixe
- Format automatique: "01 23 45 67 89"
- Validation temps réel CI
- Animation shake sur erreur

### PriceInput
Input pour montants FCFA avec séparateurs milliers.

```tsx
import { PriceInput } from '@/shared';

<PriceInput
  value={price}
  onChangeValue={setPrice}
  maxValue={10000000}
  currency="FCFA"
/>
```

**Fonctionnalités**:
- Formatage milliers automatique
- Suffixe "FCFA" fixe
- Validation range prix
- Prévisualisation formatée

### Select
Sélecteur avec modal picker et recherche.

```tsx
import { Select } from '@/shared';

<Select
  options={cityOptions}
  value={selectedCity}
  onSelect={setSelectedCity}
  searchable
  placeholder="Choisir une ville"
/>
```

### DatePicker
Sélecteur de date mobile-optimisé.

```tsx
import { DatePicker } from '@/shared';

<DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  mode="date"
  minimumDate={new Date()}
/>
```

## 💬 Composants Feedback

### Toast
Notifications auto-dismissibles avec queue.

```tsx
import { useToast } from '@/shared';

const { showSuccess, showError } = useToast();

showSuccess("Annonce publiée avec succès!");
showError("Erreur de connexion");
```

### EmptyState
États vides contextuels avec messages français.

```tsx
import { NoPropertiesEmptyState } from '@/shared';

<NoPropertiesEmptyState onAddProperty={handleAddProperty} />
```

**États prédéfinis**:
- NoPropertiesEmptyState
- NoFavoritesEmptyState  
- NoMessagesEmptyState
- OfflineEmptyState

### ErrorState
Gestion erreurs gracieuse avec retry.

```tsx
import { ErrorState } from '@/shared';

<ErrorState
  error={error}
  errorType="network"
  onRetry={handleRetry}
  retrying={isRetrying}
/>
```

### OfflineState
Indicateur de statut hors ligne.

```tsx
import { OfflineBanner } from '@/shared';

<OfflineBanner onRetry={handleRetry} />
```

## 📱 Composants Layout

### SafeContainer
Gestion safe area pour notches et barres.

```tsx
import { SafeContainer } from '@/shared';

<SafeContainer 
  backgroundColor={theme.colors.primary[500]}
  statusBarStyle="light-content"
  edges={['top', 'left', 'right']}
>
  <Content />
</SafeContainer>
```

### KeyboardView
Évitement clavier intelligent.

```tsx
import { FormKeyboardView } from '@/shared';

<FormKeyboardView behavior="padding" scrollable>
  <Form />
</FormKeyboardView>
```

### RefreshControl
Pull-to-refresh amélioré.

```tsx
import { RefreshableFlatList } from '@/shared';

<RefreshableFlatList
  data={properties}
  refreshing={isRefreshing}
  onRefresh={handleRefresh}
  renderItem={renderProperty}
/>
```

## 🎣 Hooks Personnalisés

### useKeyboard
Gestion état clavier avec animations.

```tsx
import { useKeyboard } from '@/shared';

const { 
  isVisible, 
  height, 
  dismiss,
  availableHeight 
} = useKeyboard({
  onShow: handleKeyboardShow,
  onHide: handleKeyboardHide
});
```

### useNetworkStatus
Monitoring connectivité réseau.

```tsx
import { useNetworkStatus } from '@/shared';

const { 
  isOnline, 
  connectionType,
  canMakeRequests,
  refresh 
} = useNetworkStatus({
  onConnected: handleConnected,
  onDisconnected: handleDisconnected
});
```

### usePermissions
Gestion permissions avec messages explicatifs.

```tsx
import { usePropertyListingPermissions } from '@/shared';

const { 
  hasAllRequired,
  requestAllRequired,
  getMissingPermissions 
} = usePropertyListingPermissions();
```

## 🧪 Tests

Tests complets pour tous les composants avec:
- Render tests (snapshots)
- Tests d'interaction (press, input)
- Tests d'accessibilité
- Tests de performance
- Tests spécialisés CI

```bash
npm test src/shared/__tests__/
```

## 🎯 Optimisations Performance

### Devices Entry-Level
- React.memo sur tous composants
- useMemo/useCallback appropriés
- Lazy loading animations
- Bundle size minimal

### Accessibilité
- Touch targets 44px minimum
- Screen reader support
- Contrast ratios WCAG AA
- Focus management

## 🌍 Internationalisation

### Préparation i18n
- Textes externalisés
- Support RTL préparé
- Formats dates/nombres locaux
- Formatage monnaie FCFA

## 📱 Support Offline

### Stratégies Cache
- États offline gracieux
- Indicateurs cache
- Sync pending states
- Recovery patterns

## 📋 Utilisation

### Installation
```bash
# Toutes les dépendances sont dans package.json
npm install
```

### Import
```tsx
// Import composants individuels
import { Button, PhoneInput, useNetworkStatus } from '@/shared';

// Import theme
import { theme, colors } from '@/shared';
```

### Setup Global
```tsx
// App.tsx
import { ToastProvider, KayiSafeAreaProvider } from '@/shared';

export default function App() {
  return (
    <KayiSafeAreaProvider>
      <ToastProvider>
        <YourApp />
      </ToastProvider>
    </KayiSafeAreaProvider>
  );
}
```

## 🔧 Configuration

### Theme Customization
```tsx
// Modification des couleurs
const customTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    primary: { ...theme.colors.primary, 500: '#FF6B35' }
  }
};
```

### Component Defaults
```tsx
// Override des défauts composants
const customButtonDefaults = {
  ...theme.components.Button,
  minHeight: 48
};
```

## 📚 Documentation

- **Storybook**: Catalogue interactif composants
- **Tests**: Couverture complète
- **TypeScript**: Types complets
- **Exemples**: Code samples intégrés

## 🐛 Debugging

### Mode Développement
- Logs erreurs détaillés
- Validation props TypeScript
- Performance warnings
- Memory leak detection

### Production
- Error boundaries
- Graceful degradation
- Performance monitoring
- User feedback collection

---

**Version**: 1.0.0  
**Compatibilité**: React Native 0.73+, Expo SDK 50+  
**Support**: Android 7.0+, iOS 13.0+