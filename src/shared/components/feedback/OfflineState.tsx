/**
 * KAYI House OfflineState Component
 * Network connectivity feedback with graceful offline experience
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

export interface OfflineStateProps {
  visible?: boolean;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  showRetryButton?: boolean;
  showDismissButton?: boolean;
  retryText?: string;
  dismissText?: string;
  position?: 'top' | 'bottom' | 'center';
  persistent?: boolean;
}

const OfflineState: React.FC<OfflineStateProps> = React.memo(({
  visible = true,
  title = 'Connexion interrompue',
  description = 'Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.',
  onRetry,
  onDismiss,
  style,
  titleStyle,
  descriptionStyle,
  showRetryButton = true,
  showDismissButton = false,
  retryText = 'Réessayer',
  dismissText = 'Fermer',
  position = 'top',
  persistent = false,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: theme.animation.normal,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: theme.animation.normal,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: theme.animation.fast,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: position === 'top' ? -100 : 100,
          duration: theme.animation.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, position]);

  const handleRetry = React.useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  const handleDismiss = React.useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  if (!visible) return null;

  const containerStyle = [
    styles.container,
    position === 'center' && styles.centerContainer,
    position === 'top' && styles.topContainer,
    position === 'bottom' && styles.bottomContainer,
    {
      opacity: fadeAnim,
      transform: position !== 'center' ? [{ translateY: slideAnim }] : [],
    },
    style,
  ];

  return (
    <Animated.View style={containerStyle}>
      <View style={styles.content}>
        {/* Icon */}
        <Ionicons
          name="cloud-offline"
          size={position === 'center' ? 80 : 24}
          color={theme.colors.warning[500]}
          style={position === 'center' ? styles.centerIcon : styles.inlineIcon}
        />

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={[
            position === 'center' ? styles.centerTitle : styles.inlineTitle,
            titleStyle
          ]}>
            {title}
          </Text>
          
          <Text style={[
            position === 'center' ? styles.centerDescription : styles.inlineDescription,
            descriptionStyle
          ]}>
            {description}
          </Text>
        </View>

        {/* Actions */}
        {(showRetryButton || showDismissButton) && (
          <View style={position === 'center' ? styles.centerActions : styles.inlineActions}>
            {showRetryButton && onRetry && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  position === 'center' ? styles.centerActionButton : styles.inlineActionButton
                ]}
                onPress={handleRetry}
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color={theme.colors.text.inverse}
                  style={styles.actionIcon}
                />
                <Text style={styles.actionText}>
                  {retryText}
                </Text>
              </TouchableOpacity>
            )}

            {showDismissButton && onDismiss && !persistent && (
              <TouchableOpacity
                style={[
                  styles.dismissButton,
                  position === 'center' && styles.centerDismissButton
                ]}
                onPress={handleDismiss}
              >
                <Text style={styles.dismissText}>
                  {dismissText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
});

// Network status hook for automatic offline detection
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      setConnectionType(state.type);
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? false);
      setConnectionType(state.type);
    });

    return unsubscribe;
  }, []);

  return {
    isConnected,
    connectionType,
    isOffline: !isConnected,
  };
};

// Automatic offline banner component
export const OfflineBanner: React.FC<Omit<OfflineStateProps, 'visible'>> = (props) => {
  const { isOffline } = useNetworkStatus();
  
  return (
    <OfflineState
      visible={isOffline}
      position="top"
      persistent
      {...props}
    />
  );
};

// Full screen offline state
export const OfflineScreen: React.FC<OfflineStateProps> = (props) => (
  <OfflineState
    position="center"
    title="Mode hors ligne"
    description="Vous n'êtes pas connecté à internet. Connectez-vous pour accéder à toutes les fonctionnalités de KAYI House."
    showRetryButton={true}
    showDismissButton={false}
    persistent={true}
    {...props}
  />
);

// Offline indicator for status bars
export const OfflineIndicator: React.FC<{
  style?: ViewStyle;
  textStyle?: TextStyle;
}> = ({ style, textStyle }) => {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <View style={[styles.indicator, style]}>
      <Ionicons
        name="cloud-offline"
        size={16}
        color={theme.colors.text.inverse}
        style={styles.indicatorIcon}
      />
      <Text style={[styles.indicatorText, textStyle]}>
        Hors ligne
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container styles
  container: {
    backgroundColor: theme.colors.warning[500],
    borderRadius: theme.borderRadius.md,
    ...theme.elevation.md,
  },
  topContainer: {
    position: 'absolute',
    top: 50, // Below status bar
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: theme.zIndex.banner,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: theme.zIndex.banner,
  },
  centerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface.primary,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: theme.zIndex.overlay,
  },

  // Content styles
  content: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Icon styles
  centerIcon: {
    marginBottom: theme.spacing.lg,
  },
  inlineIcon: {
    marginRight: theme.spacing.sm,
  },

  // Text styles
  textContainer: {
    flex: 1,
  },
  centerTitle: {
    ...theme.typography.textStyles.h2,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  inlineTitle: {
    ...theme.typography.textStyles.label,
    color: theme.colors.text.inverse,
    marginBottom: 2,
  },
  centerDescription: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  inlineDescription: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },

  // Action styles
  centerActions: {
    width: '100%',
    alignItems: 'center',
  },
  inlineActions: {
    marginLeft: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  centerActionButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  inlineActionButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  actionIcon: {
    marginRight: theme.spacing.xs,
  },
  actionText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.medium,
  },
  dismissButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  centerDismissButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  dismissText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },

  // Indicator styles
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning[500],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  indicatorIcon: {
    marginRight: theme.spacing.xs,
  },
  indicatorText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

OfflineState.displayName = 'OfflineState';

export default OfflineState;