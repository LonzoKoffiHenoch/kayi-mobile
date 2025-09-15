/**
 * KAYI House useKeyboard Hook
 * Keyboard state management with smooth animations and performance optimization
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Keyboard,
  KeyboardEvent,
  Platform,
  Dimensions,
  EmitterSubscription,
} from 'react-native';

export interface KeyboardState {
  isVisible: boolean;
  height: number;
  duration: number;
  easing: string;
}

export interface UseKeyboardOptions {
  onShow?: (event: KeyboardEvent) => void;
  onHide?: (event: KeyboardEvent) => void;
  onWillShow?: (event: KeyboardEvent) => void;
  onWillHide?: (event: KeyboardEvent) => void;
  throttleDelay?: number;
}

export interface UseKeyboardReturn extends KeyboardState {
  dismiss: () => void;
  isAnimating: boolean;
  keyboardDidShow: boolean;
  keyboardWillShow: boolean;
  screenHeight: number;
  availableHeight: number;
}

const useKeyboard = (options: UseKeyboardOptions = {}): UseKeyboardReturn => {
  const {
    onShow,
    onHide,
    onWillShow,
    onWillHide,
    throttleDelay = 0,
  } = options;

  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    height: 0,
    duration: 0,
    easing: 'easeInEaseOut',
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [keyboardDidShow, setKeyboardDidShow] = useState(false);
  const [keyboardWillShow, setKeyboardWillShow] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const availableHeight = screenHeight - keyboardState.height;

  const animationTimeoutRef = useRef<NodeJS.Timeout>();
  const throttleTimeoutRef = useRef<NodeJS.Timeout>();

  // Throttled state update
  const updateKeyboardState = useCallback((newState: Partial<KeyboardState>) => {
    if (throttleDelay > 0) {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      
      throttleTimeoutRef.current = setTimeout(() => {
        setKeyboardState(prev => ({ ...prev, ...newState }));
      }, throttleDelay);
    } else {
      setKeyboardState(prev => ({ ...prev, ...newState }));
    }
  }, [throttleDelay]);

  // Handle animation state
  const handleAnimationStart = useCallback((duration: number) => {
    setIsAnimating(true);
    
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, []);

  // Keyboard event handlers
  const handleKeyboardWillShow = useCallback((event: KeyboardEvent) => {
    const { height, duration, easing } = event.endCoordinates;
    
    setKeyboardWillShow(true);
    handleAnimationStart(duration);
    
    updateKeyboardState({
      isVisible: true,
      height,
      duration,
      easing: easing || 'easeInEaseOut',
    });

    onWillShow?.(event);
  }, [updateKeyboardState, handleAnimationStart, onWillShow]);

  const handleKeyboardDidShow = useCallback((event: KeyboardEvent) => {
    const { height, duration, easing } = event.endCoordinates;
    
    setKeyboardDidShow(true);
    setKeyboardWillShow(false);
    
    updateKeyboardState({
      isVisible: true,
      height,
      duration,
      easing: easing || 'easeInEaseOut',
    });

    onShow?.(event);
  }, [updateKeyboardState, onShow]);

  const handleKeyboardWillHide = useCallback((event: KeyboardEvent) => {
    const { duration, easing } = event.endCoordinates;
    
    setKeyboardWillShow(false);
    handleAnimationStart(duration);
    
    updateKeyboardState({
      isVisible: false,
      height: 0,
      duration,
      easing: easing || 'easeInEaseOut',
    });

    onWillHide?.(event);
  }, [updateKeyboardState, handleAnimationStart, onWillHide]);

  const handleKeyboardDidHide = useCallback((event: KeyboardEvent) => {
    setKeyboardDidShow(false);
    setKeyboardWillShow(false);
    
    updateKeyboardState({
      isVisible: false,
      height: 0,
      duration: event.endCoordinates.duration,
      easing: event.endCoordinates.easing || 'easeInEaseOut',
    });

    onHide?.(event);
  }, [updateKeyboardState, onHide]);

  // Dismiss keyboard
  const dismiss = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  // Set up keyboard event listeners
  useEffect(() => {
    const subscriptions: EmitterSubscription[] = [];

    if (Platform.OS === 'ios') {
      // iOS has will/did events
      subscriptions.push(
        Keyboard.addListener('keyboardWillShow', handleKeyboardWillShow),
        Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow),
        Keyboard.addListener('keyboardWillHide', handleKeyboardWillHide),
        Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide)
      );
    } else {
      // Android only has did events
      subscriptions.push(
        Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow),
        Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide)
      );
    }

    return () => {
      subscriptions.forEach(subscription => subscription.remove());
      
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [
    handleKeyboardWillShow,
    handleKeyboardDidShow,
    handleKeyboardWillHide,
    handleKeyboardDidHide,
  ]);

  return {
    ...keyboardState,
    dismiss,
    isAnimating,
    keyboardDidShow,
    keyboardWillShow,
    screenHeight,
    availableHeight,
  };
};

// Hook for keyboard-aware spacing
export const useKeyboardSpacing = (baseSpacing: number = 0) => {
  const { height, isVisible } = useKeyboard();
  
  return {
    spacing: isVisible ? height + baseSpacing : baseSpacing,
    keyboardHeight: height,
    isKeyboardVisible: isVisible,
  };
};

// Hook for keyboard-aware animations
export const useKeyboardAnimation = () => {
  const keyboard = useKeyboard();
  
  const getAnimationConfig = useCallback(() => ({
    duration: keyboard.duration || 250,
    easing: keyboard.easing || 'easeInEaseOut',
    useNativeDriver: false, // Height changes can't use native driver
  }), [keyboard.duration, keyboard.easing]);

  return {
    ...keyboard,
    animationConfig: getAnimationConfig(),
  };
};

// Hook for managing keyboard in forms
export const useFormKeyboard = (options: {
  adjustScrollView?: boolean;
  resetOnHide?: boolean;
  extraHeight?: number;
} = {}) => {
  const {
    adjustScrollView = true,
    resetOnHide = false,
    extraHeight = 0,
  } = options;

  const keyboard = useKeyboard({
    onHide: resetOnHide ? () => {
      // Could reset form scroll position here
    } : undefined,
  });

  const adjustedHeight = keyboard.height + extraHeight;
  const shouldAdjust = adjustScrollView && keyboard.isVisible;

  return {
    ...keyboard,
    adjustedHeight,
    shouldAdjust,
    formStyle: shouldAdjust ? {
      paddingBottom: adjustedHeight,
    } : undefined,
  };
};

export default useKeyboard;