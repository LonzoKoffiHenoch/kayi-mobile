/**
 * KAYI House KeyboardView Component
 * Intelligent keyboard avoidance with smooth animations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  KeyboardAvoidingViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface KeyboardViewProps {
  children: React.ReactNode;
  behavior?: KeyboardAvoidingViewProps['behavior'];
  offset?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollable?: boolean;
  automaticScroll?: boolean;
  showsVerticalScrollIndicator?: boolean;
  keyboardVerticalOffset?: number;
  animated?: boolean;
  resetScrollOnKeyboardHide?: boolean;
  scrollViewProps?: Partial<ScrollViewProps>;
}

const KeyboardView: React.FC<KeyboardViewProps> = React.memo(({
  children,
  behavior,
  offset = 0,
  style,
  contentContainerStyle,
  scrollable = true,
  automaticScroll = true,
  showsVerticalScrollIndicator = false,
  keyboardVerticalOffset,
  animated = true,
  resetScrollOnKeyboardHide = true,
  scrollViewProps,
}) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetY = useRef(new Animated.Value(0)).current;

  // Get platform-specific behavior
  const defaultBehavior = Platform.select({
    ios: 'padding' as const,
    android: 'height' as const,
  });

  const keyboardBehavior = behavior || defaultBehavior;
  
  // Calculate offset including safe area
  const calculatedOffset = keyboardVerticalOffset !== undefined 
    ? keyboardVerticalOffset 
    : offset + (Platform.OS === 'ios' ? insets.bottom : 0);

  // Keyboard event handlers for automatic scrolling
  useEffect(() => {
    if (!automaticScroll || !scrollable) return;

    const keyboardDidShowListener = Platform.select({
      ios: 'keyboardWillShow',
      android: 'keyboardDidShow',
      default: 'keyboardDidShow',
    });

    const keyboardDidHideListener = Platform.select({
      ios: 'keyboardWillHide',
      android: 'keyboardDidHide',
      default: 'keyboardDidHide',
    });

    // We can add keyboard event listeners here if needed
    // For now, we rely on the KeyboardAvoidingView behavior

    return () => {
      // Cleanup listeners if added
    };
  }, [automaticScroll, scrollable]);

  // Scroll to input when focused (for manual control)
  const scrollToInput = React.useCallback((inputRef: any, extraOffset = 0) => {
    if (!scrollViewRef.current || !inputRef?.current) return;

    inputRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
      const scrollY = y - SCREEN_HEIGHT * 0.3 + extraOffset; // Position input in top 30% of screen
      
      if (animated) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollY),
          animated: true,
        });
      } else {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollY),
          animated: false,
        });
      }
    });
  }, [animated]);

  // Reset scroll position
  const resetScroll = React.useCallback(() => {
    if (!scrollViewRef.current) return;

    if (animated) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    } else {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [animated]);

  const containerStyle: ViewStyle[] = [
    styles.container,
    style,
  ];

  const scrollContentStyle: ViewStyle[] = [
    styles.scrollContent,
    contentContainerStyle,
  ];

  if (scrollable) {
    return (
      <KeyboardAvoidingView
        style={containerStyle}
        behavior={keyboardBehavior}
        keyboardVerticalOffset={calculatedOffset}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={containerStyle}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={calculatedOffset}
    >
      <View style={scrollContentStyle}>
        {children}
      </View>
    </KeyboardAvoidingView>
  );
});

// Form-specific keyboard view with better input handling
export const FormKeyboardView: React.FC<KeyboardViewProps> = (props) => (
  <KeyboardView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    scrollable={true}
    automaticScroll={true}
    showsVerticalScrollIndicator={false}
    animated={true}
    resetScrollOnKeyboardHide={true}
    {...props}
  />
);

// Modal keyboard view (different behavior for modals)
export const ModalKeyboardView: React.FC<KeyboardViewProps> = (props) => (
  <KeyboardView
    behavior="padding"
    scrollable={false}
    automaticScroll={false}
    animated={true}
    {...props}
  />
);

// Chat/messaging keyboard view
export const ChatKeyboardView: React.FC<KeyboardViewProps> = (props) => (
  <KeyboardView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    scrollable={true}
    automaticScroll={true}
    showsVerticalScrollIndicator={false}
    animated={true}
    resetScrollOnKeyboardHide={false} // Keep scroll position in chat
    {...props}
  />
);

// Hook for keyboard state and utilities
export const useKeyboardView = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToInput = React.useCallback((inputRef: any, extraOffset = 0) => {
    if (!scrollViewRef.current || !inputRef?.current) return;

    setTimeout(() => {
      inputRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        const scrollY = y - SCREEN_HEIGHT * 0.3 + extraOffset;
        
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollY),
          animated: true,
        });
      });
    }, 100); // Small delay to ensure layout is complete
  }, []);

  const scrollToTop = React.useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const scrollToBottom = React.useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  return {
    scrollViewRef,
    scrollToInput,
    scrollToTop,
    scrollToBottom,
  };
};

// Context for sharing keyboard view state
interface KeyboardViewContextType {
  scrollToInput: (inputRef: any, extraOffset?: number) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  isKeyboardVisible: boolean;
}

const KeyboardViewContext = React.createContext<KeyboardViewContextType | null>(null);

export const useKeyboardViewContext = () => {
  const context = React.useContext(KeyboardViewContext);
  if (!context) {
    throw new Error('useKeyboardViewContext must be used within KeyboardViewProvider');
  }
  return context;
};

export const KeyboardViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { scrollViewRef, scrollToInput, scrollToTop, scrollToBottom } = useKeyboardView();
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);

  // Track keyboard visibility
  useEffect(() => {
    const keyboardWillShow = () => setIsKeyboardVisible(true);
    const keyboardWillHide = () => setIsKeyboardVisible(false);

    // Add keyboard listeners here if needed
    // For now, we'll use a simple state

    return () => {
      // Cleanup listeners
    };
  }, []);

  const contextValue: KeyboardViewContextType = {
    scrollToInput,
    scrollToTop,
    scrollToBottom,
    isKeyboardVisible,
  };

  return (
    <KeyboardViewContext.Provider value={contextValue}>
      {children}
    </KeyboardViewContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
});

KeyboardView.displayName = 'KeyboardView';

export default KeyboardView;