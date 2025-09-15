# KAYI House Mobile

Application mobile immobilière pour la Côte d'Ivoire avec intégration Mobile Money et solutions de paiement flexibles.

## 🏠 À propos

KAYI House est une application PropTech/FinTech spécialement conçue pour le marché immobilier ivoirien. Elle offre :

- **Recherche de propriétés** avec géolocalisation
- **Mobile Money intégré** (Orange Money, MTN Money, Moov Money)  
- **FLEX-RENT** : paiement de loyer en plusieurs fois
- **Support multilingue** : Français, Anglais, Baoulé, Dioula

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm
- Expo CLI : `npm install -g @expo/cli`
- Compte Expo (optionnel pour EAS)

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd KayiMobile

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start

# Sur simulateur iOS (macOS uniquement)
npm run ios

# Sur émulateur Android
npm run android

# Dans le navigateur web
npm run web
```

## 🛠 Stack technique

### Frontend
- **React Native** avec **Expo SDK 54**
- **Expo Router** pour la navigation
- **TypeScript** pour la sécurité des types
- **Zustand** pour la gestion d'état
- **TanStack Query** pour la gestion des données
- **React Hook Form** + **Zod** pour les formulaires

### Backend (à intégrer)
- API NestJS avec authentification JWT
- Base de données PostgreSQL
- Intégrations Mobile Money APIs

### Fonctionnalités Expo
- Géolocalisation avec `expo-location`
- Caméra/Photos avec `expo-camera` et `expo-image-picker`
- Stockage sécurisé avec `expo-secure-store`
- Deep linking avec custom scheme

## 📱 Architecture

### Structure des dossiers

```
KayiMobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Écrans d'authentification
│   ├── (tabs)/            # Navigation par onglets
│   ├── property/          # Gestion des propriétés
│   ├── mobile-money/      # Mobile Money
│   └── flex-rent/         # FLEX-RENT
├── src/
│   ├── config/           # Configuration et constantes
│   ├── providers/        # Context providers
│   ├── types/           # Types TypeScript
│   └── components/      # Composants réutilisables
└── assets/              # Images, fonts, etc.
```

### Providers et contextes

1. **AuthProvider** : Gestion utilisateur et tokens
2. **ThemeProvider** : Thème clair/sombre
3. **I18nProvider** : Internationalisation multilingue

## 🔧 Configuration

### Variables d'environnement

Copier `.env` et ajuster selon l'environnement :

```bash
# API Configuration  
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000/api

# Mobile Money APIs
EXPO_PUBLIC_ORANGE_MONEY_API_URL=https://api.orange.ci/oauth/v3
EXPO_PUBLIC_MTN_MONEY_API_URL=https://mtn.ci/mm/api/v2
EXPO_PUBLIC_MOOV_MONEY_API_URL=https://api.moov.ci/payment/v1

# Feature Flags
EXPO_PUBLIC_FLEX_RENT_ENABLED=true
EXPO_PUBLIC_BIOMETRIC_AUTH_ENABLED=true
EXPO_PUBLIC_OFFLINE_MODE_ENABLED=true
```

### EAS Build

```bash
# Build Android
npm run build:android

# Build iOS (nécessite compte Apple Developer)
npm run build:ios

# Publier sur les stores
npm run submit:android
npm run submit:ios
```

## 📄 Scripts disponibles

- `npm start` : Démarrer Expo en mode développement
- `npm run android` : Lancer sur émulateur Android
- `npm run ios` : Lancer sur simulateur iOS
- `npm run web` : Lancer dans le navigateur
- `npm run type-check` : Vérification TypeScript
- `npm run lint` : Linter ESLint
- `npm run clean` : Nettoyer le cache Expo

## 🌍 Internationalisation

L'app supporte 4 langues :

- **Français** (défaut)
- **Anglais**  
- **Baoulé** (langue locale CI)
- **Dioula** (langue locale CI)

Les traductions sont dans `src/providers/I18nProvider.tsx`.

## 📱 Mobile Money

Intégration avec les principaux opérateurs ivoiriens :

- **Orange Money** (*144#)
- **MTN Mobile Money** (*133#)
- **Moov Money** (*155#)

Chaque opérateur a son propre deep link et couleurs branded.

## 🏗 Développement

### Ajout d'une nouvelle feature

1. Créer la structure dans `app/` (Expo Router)
2. Ajouter les types dans `src/types/`
3. Créer les providers si nécessaire
4. Intégrer avec l'API backend

### Bonnes pratiques

- Utiliser TypeScript strict
- Suivre les conventions Expo/React Native
- Tester sur device Android physique (public cible)
- Optimiser pour connexions faibles
- Valider avec les contraintes CI (langues, Mobile Money)

## 🔒 Sécurité

- Tokens stockés avec `expo-secure-store`
- Variables sensibles dans `.env` (non committées)
- Validation côté client avec Zod
- Permissions Android/iOS appropriées

## 📞 Support

Pour les questions techniques ou fonctionnelles, consultez :

- Documentation Expo : https://docs.expo.dev/
- React Native : https://reactnative.dev/
- TanStack Query : https://tanstack.com/query/

---

**KAYI House** - Votre maison vous attend 🏠