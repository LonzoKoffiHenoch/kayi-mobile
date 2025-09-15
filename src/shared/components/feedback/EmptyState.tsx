/**
 * KAYI House EmptyState Component
 * Contextual empty states with French messaging for CI context
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

export type EmptyStateVariant = 'noData' | 'noResults' | 'noConnection' | 'error' | 'custom';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  illustration?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  showIllustration?: boolean;
  illustrationColor?: string;
  illustrationSize?: number;
}

const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  variant = 'noData',
  title,
  description,
  illustration,
  actionText,
  onActionPress,
  style,
  titleStyle,
  descriptionStyle,
  showIllustration = true,
  illustrationColor,
  illustrationSize,
}) => {
  const config = getVariantConfig(variant);
  
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalIllustration = illustration || config.illustration;
  const finalActionText = actionText || config.actionText;
  const finalActionPress = onActionPress || config.onActionPress;
  const finalIllustrationColor = illustrationColor || config.illustrationColor;
  const finalIllustrationSize = illustrationSize || config.illustrationSize;

  return (
    <View style={[styles.container, style]}>
      {/* Illustration */}
      {showIllustration && finalIllustration && (
        <View style={styles.illustrationContainer}>
          <Ionicons
            name={finalIllustration}
            size={finalIllustrationSize}
            color={finalIllustrationColor}
          />
        </View>
      )}

      {/* Title */}
      {finalTitle && (
        <Text style={[styles.title, titleStyle]}>
          {finalTitle}
        </Text>
      )}

      {/* Description */}
      {finalDescription && (
        <Text style={[styles.description, descriptionStyle]}>
          {finalDescription}
        </Text>
      )}

      {/* Action Button */}
      {finalActionText && finalActionPress && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={finalActionPress}
        >
          <Text style={styles.actionText}>
            {finalActionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// Variant configurations with French messaging for CI context
const getVariantConfig = (variant: EmptyStateVariant) => {
  const configs = {
    noData: {
      title: 'Aucune donnée disponible',
      description: 'Il n\'y a pas encore de contenu à afficher ici. Revenez plus tard ou ajoutez du contenu.',
      illustration: 'document-outline' as keyof typeof Ionicons.glyphMap,
      illustrationColor: theme.colors.gray[400],
      illustrationSize: 80,
      actionText: 'Actualiser',
      onActionPress: undefined,
    },
    noResults: {
      title: 'Aucun résultat trouvé',
      description: 'Votre recherche n\'a donné aucun résultat. Essayez avec d\'autres mots-clés.',
      illustration: 'search' as keyof typeof Ionicons.glyphMap,
      illustrationColor: theme.colors.gray[400],
      illustrationSize: 80,
      actionText: 'Nouvelle recherche',
      onActionPress: undefined,
    },
    noConnection: {
      title: 'Connexion interrompue',
      description: 'Vérifiez votre connexion internet et réessayez. Données mobiles ou Wi-Fi requis.',
      illustration: 'wifi-off' as keyof typeof Ionicons.glyphMap,
      illustrationColor: theme.colors.warning[500],
      illustrationSize: 80,
      actionText: 'Réessayer',
      onActionPress: undefined,
    },
    error: {
      title: 'Une erreur s\'est produite',
      description: 'Nous rencontrons des difficultés techniques. Veuillez réessayer dans quelques instants.',
      illustration: 'alert-circle' as keyof typeof Ionicons.glyphMap,
      illustrationColor: theme.colors.error[500],
      illustrationSize: 80,
      actionText: 'Réessayer',
      onActionPress: undefined,
    },
    custom: {
      title: '',
      description: '',
      illustration: 'information-circle' as keyof typeof Ionicons.glyphMap,
      illustrationColor: theme.colors.gray[400],
      illustrationSize: 80,
      actionText: undefined,
      onActionPress: undefined,
    },
  };

  return configs[variant];
};

// Predefined empty states for common scenarios
export const NoDataEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState variant="noData" {...props} />
);

export const NoResultsEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState variant="noResults" {...props} />
);

export const NoConnectionEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState variant="noConnection" {...props} />
);

export const ErrorEmptyState: React.FC<Omit<EmptyStateProps, 'variant'>> = (props) => (
  <EmptyState variant="error" {...props} />
);

// Context-specific empty states for KAYI House app
export const NoPropertiesEmptyState: React.FC<{ onAddProperty?: () => void }> = ({ 
  onAddProperty 
}) => (
  <EmptyState
    variant="custom"
    title="Aucune propriété enregistrée"
    description="Commencez à publier vos biens immobiliers pour les rendre visibles aux locataires."
    illustration="home-outline"
    actionText="Ajouter une propriété"
    onActionPress={onAddProperty}
    illustrationColor={theme.colors.primary[500]}
  />
);

export const NoFavoritesEmptyState: React.FC<{ onBrowse?: () => void }> = ({ 
  onBrowse 
}) => (
  <EmptyState
    variant="custom"
    title="Aucun favori enregistré"
    description="Parcourez les annonces et ajoutez vos propriétés préférées à cette liste."
    illustration="heart-outline"
    actionText="Parcourir les annonces"
    onActionPress={onBrowse}
    illustrationColor={theme.colors.error[500]}
  />
);

export const NoMessagesEmptyState: React.FC<{}> = () => (
  <EmptyState
    variant="custom"
    title="Aucun message"
    description="Vos conversations avec les propriétaires et locataires apparaîtront ici."
    illustration="chatbubble-outline"
    illustrationColor={theme.colors.info[500]}
  />
);

export const NoNotificationsEmptyState: React.FC<{}> = () => (
  <EmptyState
    variant="custom"
    title="Aucune notification"
    description="Vous recevrez ici les notifications importantes concernant vos propriétés et demandes."
    illustration="notifications-outline"
    illustrationColor={theme.colors.secondary[500]}
  />
);

export const OfflineEmptyState: React.FC<{ onRetry?: () => void }> = ({ 
  onRetry 
}) => (
  <EmptyState
    variant="custom"
    title="Mode hors ligne"
    description="Certaines fonctionnalités sont limitées sans connexion internet. Connectez-vous pour accéder à tout le contenu."
    illustration="cloud-offline-outline"
    actionText="Réessayer la connexion"
    onActionPress={onRetry}
    illustrationColor={theme.colors.warning[500]}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing['2xl'],
  },
  illustrationContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.textStyles.h3,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    minHeight: 44, // Accessibility touch target
  },
  actionText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.text.inverse,
  },
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;