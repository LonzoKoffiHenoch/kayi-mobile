/**
 * KAYI House Toast Component
 * Auto-dismissible notifications with queue management
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  position?: ToastPosition;
  duration?: number;
  onDismiss?: () => void;
  actionText?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showIcon?: boolean;
  swipeToDismiss?: boolean;
}

const Toast: React.FC<ToastProps> = React.memo(({
  visible,
  message,
  type = 'info',
  position = 'top',
  duration = 4000,
  onDismiss,
  actionText,
  onActionPress,
  style,
  textStyle,
  showIcon = true,
  swipeToDismiss = true,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(position === 'top' ? -200 : 200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<NodeJS.Timeout>();

  // Auto dismiss functionality
  useEffect(() => {
    if (visible && duration > 0) {
      dismissTimer.current = setTimeout(() => {
        onDismiss?.();
      }, duration);
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, [visible, duration, onDismiss]);

  // Animation effects
  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: theme.animation.normal,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: theme.animation.normal,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: position === 'top' ? -200 : 200,
          duration: theme.animation.fast,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: theme.animation.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity, position]);

  const handleDismiss = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
    }
    onDismiss?.();
  };

  const handleActionPress = () => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
    }
    onActionPress?.();
    onDismiss?.();
  };

  if (!visible) return null;

  const typeConfig = getTypeConfig(type);
  const positionStyles = getPositionStyles(position, insets);

  const containerStyle: ViewStyle[] = [
    styles.container,
    positionStyles,
    typeConfig.container,
    {
      transform: [{ translateY }],
      opacity,
    },
    style,
  ];

  const messageStyle: TextStyle[] = [
    styles.message,
    typeConfig.text,
    textStyle,
  ];

  return (
    <Animated.View style={containerStyle}>
      <TouchableOpacity
        style={styles.content}
        onPress={swipeToDismiss ? handleDismiss : undefined}
        activeOpacity={swipeToDismiss ? 0.8 : 1}
      >
        {/* Icon */}
        {showIcon && (
          <Ionicons
            name={typeConfig.icon}
            size={20}
            color={typeConfig.iconColor}
            style={styles.icon}
          />
        )}

        {/* Message */}
        <Text style={messageStyle} numberOfLines={3}>
          {message}
        </Text>

        {/* Action Button */}
        {actionText && onActionPress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleActionPress}
          >
            <Text style={[styles.actionText, { color: typeConfig.actionColor }]}>
              {actionText}
            </Text>
          </TouchableOpacity>
        )}

        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="close"
            size={16}
            color={typeConfig.iconColor}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Toast type configurations
const getTypeConfig = (type: ToastType) => {
  const configs = {
    success: {
      container: {
        backgroundColor: theme.colors.success[500],
      },
      text: {
        color: theme.colors.text.inverse,
      },
      icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
      iconColor: theme.colors.text.inverse,
      actionColor: theme.colors.text.inverse,
    },
    error: {
      container: {
        backgroundColor: theme.colors.error[500],
      },
      text: {
        color: theme.colors.text.inverse,
      },
      icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
      iconColor: theme.colors.text.inverse,
      actionColor: theme.colors.text.inverse,
    },
    warning: {
      container: {
        backgroundColor: theme.colors.warning[500],
      },
      text: {
        color: theme.colors.text.inverse,
      },
      icon: 'warning' as keyof typeof Ionicons.glyphMap,
      iconColor: theme.colors.text.inverse,
      actionColor: theme.colors.text.inverse,
    },
    info: {
      container: {
        backgroundColor: theme.colors.info[500],
      },
      text: {
        color: theme.colors.text.inverse,
      },
      icon: 'information-circle' as keyof typeof Ionicons.glyphMap,
      iconColor: theme.colors.text.inverse,
      actionColor: theme.colors.text.inverse,
    },
  };

  return configs[type];
};

// Position styles
const getPositionStyles = (position: ToastPosition, insets: any): ViewStyle => {
  const baseStyle = {
    position: 'absolute' as const,
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: theme.zIndex.toast,
  };

  if (position === 'top') {
    return {
      ...baseStyle,
      top: insets.top + theme.spacing.sm,
    };
  }

  return {
    ...baseStyle,
    bottom: insets.bottom + theme.spacing.sm,
  };
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    ...theme.elevation.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  message: {
    ...theme.typography.textStyles.body,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  actionText: {
    ...theme.typography.textStyles.label,
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
});

// Toast Queue Manager Hook
export const useToastQueue = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    actionText?: string;
    onActionPress?: () => void;
  }>>([]);

  const showToast = React.useCallback((toast: {
    message: string;
    type?: ToastType;
    duration?: number;
    actionText?: string;
    onActionPress?: () => void;
  }) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id, type: toast.type || 'info' }]);
  }, []);

  const hideToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
  };
};

// Global Toast Context
interface ToastContextType {
  showToast: (toast: {
    message: string;
    type?: ToastType;
    duration?: number;
    actionText?: string;
    onActionPress?: () => void;
  }) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

export const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, showToast, hideToast } = useToastQueue();

  const showSuccess = React.useCallback((message: string, duration?: number) => {
    showToast({ message, type: 'success', duration });
  }, [showToast]);

  const showError = React.useCallback((message: string, duration?: number) => {
    showToast({ message, type: 'error', duration });
  }, [showToast]);

  const showWarning = React.useCallback((message: string, duration?: number) => {
    showToast({ message, type: 'warning', duration });
  }, [showToast]);

  const showInfo = React.useCallback((message: string, duration?: number) => {
    showToast({ message, type: 'info', duration });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          visible={true}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          actionText={toast.actionText}
          onActionPress={toast.onActionPress}
          onDismiss={() => hideToast(toast.id)}
          position="top"
          style={{
            transform: [{ translateY: index * 60 }], // Stack toasts
          }}
        />
      ))}
    </ToastContext.Provider>
  );
};

Toast.displayName = 'Toast';

export default Toast;