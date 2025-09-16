/**
 * KAYI House SafeContainer Component
 * Safe area handling for notches, status bars, and home indicators
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';

export interface SafeContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  edges?: Edge[];
  style?: ViewStyle;
  disableStatusBar?: boolean;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  statusBarBackgroundColor?: string;
  translucent?: boolean;
}

const SafeContainer: React.FC<SafeContainerProps> = React.memo(({
  children,
  backgroundColor = theme.colors.background.primary,
  edges = ['top', 'left', 'right', 'bottom'],
  style,
  disableStatusBar = false,
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor,
  translucent = false,
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    { backgroundColor },
    style,
  ].filter(Boolean);

  // Custom safe area implementation if needed
  const customSafeAreaStyle: ViewStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[containerStyle, customSafeAreaStyle]}>
      {/* Status Bar Configuration */}
      {!disableStatusBar && (
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={statusBarBackgroundColor || backgroundColor}
          translucent={translucent}
        />
      )}
      
      {children}
    </View>
  );
});

// Alternative implementation using SafeAreaView
export const SafeAreaContainer: React.FC<SafeContainerProps> = React.memo(({
  children,
  backgroundColor = theme.colors.background.primary,
  edges = ['top', 'left', 'right', 'bottom'],
  style,
  disableStatusBar = false,
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor,
  translucent = false,
}) => {
  const containerStyle = [
    styles.container,
    { backgroundColor },
    style,
  ].filter(Boolean);

  return (
    <SafeAreaView style={containerStyle} edges={edges as Edge[]}>
      {/* Status Bar Configuration */}
      {!disableStatusBar && (
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={statusBarBackgroundColor || backgroundColor}
          translucent={translucent}
        />
      )}
      
      {children}
    </SafeAreaView>
  );
});

// Screen-specific safe containers
export const ScreenContainer: React.FC<SafeContainerProps> = (props) => (
  <SafeContainer
    backgroundColor={theme.colors.background.primary}
    statusBarStyle="dark-content"
    {...props}
  />
);

export const ModalContainer: React.FC<SafeContainerProps> = (props) => (
  <SafeContainer
    backgroundColor={theme.colors.surface.primary}
    edges={['top', 'left', 'right']} // Usually no bottom padding for modals
    {...props}
  />
);

export const HeaderContainer: React.FC<SafeContainerProps> = (props) => (
  <SafeContainer
    backgroundColor={theme.colors.primary[500]}
    statusBarStyle="light-content"
    edges={['top', 'left', 'right']}
    {...props}
  />
);

// Hook for manual safe area handling
export const useSafeArea = (edges?: Edge[]) => {
  const insets = useSafeAreaInsets();
  const selectedEdges = edges || ['top', 'left', 'right', 'bottom'];

  return {
    paddingTop: selectedEdges.includes('top') ? insets.top : 0,
    paddingBottom: selectedEdges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: selectedEdges.includes('left') ? insets.left : 0,
    paddingRight: selectedEdges.includes('right') ? insets.right : 0,
    insets,
  };
};

// Safe area dimensions hook
export const useSafeAreaDimensions = () => {
  const insets = useSafeAreaInsets();
  
  return {
    topInset: insets.top,
    bottomInset: insets.bottom,
    leftInset: insets.left,
    rightInset: insets.right,
    hasNotch: insets.top > 20, // Typical status bar height is 20px
    hasHomeIndicator: insets.bottom > 0,
  };
};

// Platform-specific safe area utilities
export const getStatusBarHeight = (): number => {
  if (Platform.OS === 'ios') {
    // iOS status bar is handled by safe area
    return 0;
  }
  
  // Android status bar height
  return StatusBar.currentHeight || 24;
};

export const getNavigationBarHeight = (): number => {
  const insets = useSafeAreaInsets();
  return insets.bottom;
};

// Safe area provider wrapper
export const KayiSafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SafeAreaProvider>
      {children}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

SafeContainer.displayName = 'SafeContainer';
SafeAreaContainer.displayName = 'SafeAreaContainer';

export default SafeContainer;