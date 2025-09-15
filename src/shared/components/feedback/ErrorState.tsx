/**
 * KAYI House ErrorState Component
 * Graceful error handling with retry functionality and French messaging
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
import LoadingSpinner from '../base/LoadingSpinner';
import { theme } from '../../theme/theme';

export type ErrorType = 'network' | 'server' | 'validation' | 'permission' | 'timeout' | 'generic';

export interface ErrorStateProps {
  error?: Error | string;
  errorType?: ErrorType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  showIcon?: boolean;
  iconColor?: string;
  iconSize?: number;
  retryText?: string;
  hideRetry?: boolean;
  supportContact?: boolean;
  onContactSupport?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = React.memo(({
  error,
  errorType = 'generic',
  title,
  description,
  onRetry,
  retrying = false,
  style,
  titleStyle,
  descriptionStyle,
  showIcon = true,
  iconColor,
  iconSize,
  retryText,
  hideRetry = false,
  supportContact = false,
  onContactSupport,
}) => {
  const config = getErrorConfig(errorType, error);
  
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalRetryText = retryText || config.retryText;
  const finalIconColor = iconColor || config.iconColor;
  const finalIconSize = iconSize || config.iconSize;

  const handleRetry = React.useCallback(() => {
    if (!retrying && onRetry) {
      onRetry();
    }
  }, [retrying, onRetry]);

  const handleContactSupport = React.useCallback(() => {
    if (onContactSupport) {
      onContactSupport();
    }
  }, [onContactSupport]);

  // Log error in development
  React.useEffect(() => {
    if (__DEV__ && error) {
      console.error('ErrorState:', error);
    }
  }, [error]);

  return (
    <View style={[styles.container, style]}>
      {/* Error Icon */}
      {showIcon && (
        <View style={styles.iconContainer}>
          <Ionicons
            name={config.icon}
            size={finalIconSize}
            color={finalIconColor}
          />
        </View>
      )}

      {/* Title */}
      <Text style={[styles.title, titleStyle]}>
        {finalTitle}
      </Text>

      {/* Description */}
      <Text style={[styles.description, descriptionStyle]}>
        {finalDescription}
      </Text>

      {/* Error Details (Development Only) */}
      {__DEV__ && error && typeof error !== 'string' && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Détails de l'erreur (Dev):</Text>
          <Text style={styles.debugText}>
            {error.message || error.toString()}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {/* Retry Button */}
        {!hideRetry && onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, retrying && styles.retryButtonDisabled]}
            onPress={handleRetry}
            disabled={retrying}
          >
            {retrying ? (
              <LoadingSpinner
                size="small"
                variant="light"
                text="Chargement..."
              />
            ) : (
              <>
                <Ionicons
                  name="refresh"
                  size={20}
                  color={theme.colors.text.inverse}
                  style={styles.retryIcon}
                />
                <Text style={styles.retryText}>
                  {finalRetryText}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Support Contact */}
        {supportContact && onContactSupport && (
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={theme.colors.text.secondary}
              style={styles.supportIcon}
            />
            <Text style={styles.supportText}>
              Contacter le support
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

// Error type configurations with French messaging
const getErrorConfig = (errorType: ErrorType, error?: Error | string) => {
  const configs = {
    network: {
      title: 'Problème de connexion',
      description: 'Vérifiez votre connexion internet et réessayez. Assurez-vous que vos données mobiles ou Wi-Fi sont activés.',
      icon: 'wifi-off' as keyof typeof Ionicons.glyphMap,
      iconColor: theme.colors.warning[500],
      iconSize: 80,
      retryText: 'Réessayer',
    },
    server: {
      title: 'Problème du serveur',
      description: 'Nos serveurs rencontrent des difficultés temporaires. Nous travaillons à résoudre le problème.',
      icon: 'server' as keyof typeof Ionicons.glyphMap,
      iconColor: theme.colors.error[500],
      iconSize: 80,
      retryText: 'Réessayer',
    },
    validation: {
      title: 'Données incorrectes',
      description: 'Certaines informations sont manquantes ou incorrectes. Vérifiez vos données et réessayez.',
      icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
      iconColor: theme.colors.warning[500],
      iconSize: 80,
      retryText: 'Corriger',
    },
    permission: {
      title: 'Autorisation requise',
      description: 'Cette action nécessite des autorisations spéciales. Vérifiez les paramètres de votre appareil.',
      icon: 'lock-closed' as keyof typeof Ionicons.glyphMap,
      iconColor: theme.colors.info[500],
      iconSize: 80,
      retryText: 'Autoriser',
    },
    timeout: {
      title: 'Délai d\'attente dépassé',
      description: 'L\'opération prend plus de temps que prévu. Vérifiez votre connexion et réessayez.',
      icon: 'time' as keyof typeof Ionicons.glyphMap,
      iconColor: theme.colors.warning[500],
      iconSize: 80,
      retryText: 'Réessayer',
    },
    generic: {
      title: 'Une erreur s\'est produite',
      description: 'Nous rencontrons un problème technique. Réessayez ou contactez le support si le problème persiste.',
      icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
      iconColor: theme.colors.error[500],
      iconSize: 80,
      retryText: 'Réessayer',
    },
  };

  return configs[errorType];
};

// Predefined error states for common scenarios
export const NetworkErrorState: React.FC<Omit<ErrorStateProps, 'errorType'>> = (props) => (
  <ErrorState errorType="network" {...props} />
);

export const ServerErrorState: React.FC<Omit<ErrorStateProps, 'errorType'>> = (props) => (
  <ErrorState errorType="server" {...props} />
);

export const ValidationErrorState: React.FC<Omit<ErrorStateProps, 'errorType'>> = (props) => (
  <ErrorState errorType="validation" {...props} />
);

export const PermissionErrorState: React.FC<Omit<ErrorStateProps, 'errorType'>> = (props) => (
  <ErrorState errorType="permission" {...props} />
);

export const TimeoutErrorState: React.FC<Omit<ErrorStateProps, 'errorType'>> = (props) => (
  <ErrorState errorType="timeout" {...props} />
);

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; retry: () => void }> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.retry} />;
      }

      return (
        <ErrorState
          error={this.state.error}
          errorType="generic"
          onRetry={this.retry}
          supportContact
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing['2xl'],
  },
  iconContainer: {
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
  debugContainer: {
    backgroundColor: theme.colors.gray[100],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  debugTitle: {
    ...theme.typography.textStyles.label,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  debugText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
    fontFamily: 'monospace',
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    minHeight: 44, // Accessibility touch target
  },
  retryButtonDisabled: {
    backgroundColor: theme.colors.gray[400],
  },
  retryIcon: {
    marginRight: theme.spacing.sm,
  },
  retryText: {
    ...theme.typography.textStyles.button,
    color: theme.colors.text.inverse,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  supportIcon: {
    marginRight: theme.spacing.xs,
  },
  supportText: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
  },
});

ErrorState.displayName = 'ErrorState';

export default ErrorState;