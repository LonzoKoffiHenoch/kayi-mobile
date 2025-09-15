/**
 * KAYI House Modal Component
 * Portal-rendered with keyboard awareness and Android back button handling
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  BackHandler,
  ViewStyle,
  TextStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  closable?: boolean;
  closeOnOverlayPress?: boolean;
  animationType?: 'slide' | 'fade';
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  showCloseButton?: boolean;
  keyboardAvoidingView?: boolean;
}

const Modal: React.FC<ModalProps> = React.memo(({
  visible,
  onClose,
  title,
  children,
  closable = true,
  closeOnOverlayPress = true,
  animationType = 'slide',
  size = 'medium',
  style,
  contentStyle,
  headerStyle,
  titleStyle,
  showCloseButton = true,
  keyboardAvoidingView = true,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  // Handle Android back button
  useEffect(() => {
    const handleBackPress = () => {
      if (visible && closable) {
        onClose();
        return true; // Prevent default back behavior
      }
      return false;
    };

    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
    }
  }, [visible, closable, onClose]);

  // Animation effects
  useEffect(() => {
    if (visible) {
      // Show animations
      if (animationType === 'slide') {
        Animated.spring(slideAnimation, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
      
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: theme.animation.normal,
        useNativeDriver: true,
      }).start();
    } else {
      // Hide animations
      if (animationType === 'slide') {
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: theme.animation.fast,
          useNativeDriver: true,
        }).start();
      }
      
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: theme.animation.fast,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animationType, slideAnimation, fadeAnimation]);

  const handleOverlayPress = () => {
    if (closeOnOverlayPress && closable) {
      onClose();
    }
  };

  const handleContentPress = (event: any) => {
    // Prevent event bubbling to overlay
    event.stopPropagation();
  };

  const sizeStyles = getSizeStyles(size, insets);

  const modalContentStyle = [
    styles.modalContent,
    sizeStyles,
    {
      transform: animationType === 'slide' ? [
        {
          translateY: slideAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [SCREEN_HEIGHT, 0],
          }),
        },
      ] : [],
    },
    style,
  ];

  const overlayStyle = [
    styles.overlay,
    {
      opacity: fadeAnimation,
    },
  ];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none" // We handle animations manually
      statusBarTranslucent
      onRequestClose={closable ? onClose : undefined}
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
      
      <Animated.View style={overlayStyle}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleOverlayPress}
        >
          <Animated.View style={modalContentStyle}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleContentPress}
              style={styles.contentWrapper}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <View style={[styles.header, headerStyle]}>
                  {title && (
                    <Text style={[styles.title, titleStyle]} numberOfLines={1}>
                      {title}
                    </Text>
                  )}
                  
                  {showCloseButton && closable && (
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={onClose}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={theme.colors.text.secondary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Content */}
              <View style={[styles.content, contentStyle]}>
                {children}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </RNModal>
  );
});

// Size configurations
const getSizeStyles = (size: ModalProps['size'], insets: any): ViewStyle => {
  const baseStyle = {
    marginTop: insets.top,
    marginBottom: insets.bottom,
  };

  const sizes = {
    small: {
      ...baseStyle,
      maxHeight: SCREEN_HEIGHT * 0.4,
      margin: theme.spacing['2xl'],
    },
    medium: {
      ...baseStyle,
      maxHeight: SCREEN_HEIGHT * 0.6,
      margin: theme.spacing.lg,
    },
    large: {
      ...baseStyle,
      maxHeight: SCREEN_HEIGHT * 0.8,
      margin: theme.spacing.md,
    },
    fullscreen: {
      margin: 0,
      flex: 1,
    },
  };

  return sizes[size!];
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay.medium,
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end', // Slide up from bottom
  },
  modalContent: {
    backgroundColor: theme.colors.surface.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    ...theme.elevation.xl,
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  title: {
    ...theme.typography.textStyles.h3,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  closeButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
});

Modal.displayName = 'Modal';

export default Modal;