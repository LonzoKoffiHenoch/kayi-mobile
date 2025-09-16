/**
 * KAYI House SmsVerification Component
 * Vérification SMS avec code à 6 chiffres et fonctionnalités avancées
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Animated,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, LoadingSpinner } from '../../../shared';
import { useSmsVerification } from '../hooks/useSmsVerification';
import { theme } from '../../../shared/theme/theme';

// ===== TYPES =====
export interface SmsVerificationProps {
  phone: string;
  purpose: 'registration' | 'login' | 'password_reset';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onNavigateBack?: () => void;
  autoNavigate?: boolean;
  enablePaste?: boolean;
  enableAutoSubmit?: boolean;
}

// ===== COMPONENT =====
export const SmsVerification: React.FC<SmsVerificationProps> = ({
  phone,
  purpose,
  onSuccess,
  onError,
  onNavigateBack,
  autoNavigate = true,
  enablePaste = true,
  enableAutoSubmit = true,
}) => {
  const {
    code,
    setCode,
    clearCode,
    isCodeValid,
    isCodeComplete,
    handleSubmit,
    handleAutoSubmit,
    isSubmitting,
    canResend,
    resendCountdown,
    handleResend,
    isResending,
    error,
    clearError,
    hasError,
    attempts,
    maxAttempts,
    attemptsRemaining,
    isLocked,
    handlePaste,
    canPaste,
    shouldShake,
    clearShake,
    isExpired,
    expiresAt,
    timeRemaining,
    navigateBack,
    formatPhoneDisplay,
    getSuccessMessage,
  } = useSmsVerification({
    phone,
    purpose,
    onSuccess,
    onError,
    autoNavigate,
    enablePaste,
    enableAutoSubmit,
  });

  // Refs for code input
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  
  // State
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  
  // Initialize input refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Handle shake animation
  useEffect(() => {
    if (shouldShake) {
      triggerShakeAnimation();
      clearShake();
    }
  }, [shouldShake, clearShake]);

  // Auto-focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // ===== ANIMATIONS =====
  const triggerShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ===== HANDLERS =====
  const handleCodeChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      // Handle paste operation
      const digits = digit.split('').slice(0, 6);
      const newCode = Array(6).fill('');
      
      digits.forEach((d, i) => {
        if (i < 6) {
          newCode[i] = d;
        }
      });
      
      setCode(newCode.join(''));
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
      
      return;
    }
    
    // Single digit input
    const codeArray = code.split('');
    codeArray[index] = digit;
    const newCode = codeArray.join('');
    
    setCode(newCode);
    
    // Move to next input if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      const codeArray = code.split('');
      
      if (codeArray[index]) {
        // Clear current digit
        codeArray[index] = '';
        setCode(codeArray.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        codeArray[index - 1] = '';
        setCode(codeArray.join(''));
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    }
  };

  const handleInputFocus = (index: number) => {
    setFocusedIndex(index);
    clearError();
  };

  const handleFormSubmit = async () => {
    if (!isCodeValid || isSubmitting || isLocked) return;
    
    try {
      await handleSubmit();
    } catch (error) {
      console.error('SMS verification submit error:', error);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || isResending) return;
    
    try {
      await handleResend();
      clearCode();
      inputRefs.current[0]?.focus();
      setFocusedIndex(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('SMS resend error:', error);
    }
  };

  const handlePasteCode = async () => {
    if (!canPaste) return;
    
    try {
      await handlePaste();
      // Focus will be set by handleCodeChange
    } catch (error) {
      console.error('Paste error:', error);
    }
  };

  // ===== FORMAT HELPERS =====
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPurposeTitle = () => {
    switch (purpose) {
      case 'registration':
        return 'Vérification du compte';
      case 'login':
        return 'Vérification de connexion';
      case 'password_reset':
        return 'Réinitialisation du mot de passe';
      default:
        return 'Vérification SMS';
    }
  };

  const getPurposeSubtitle = () => {
    switch (purpose) {
      case 'registration':
        return `Code envoyé au ${formatPhoneDisplay}`;
      case 'login':
        return `Code de sécurité envoyé au ${formatPhoneDisplay}`;
      case 'password_reset':
        return `Code de réinitialisation envoyé au ${formatPhoneDisplay}`;
      default:
        return `Code envoyé au ${formatPhoneDisplay}`;
    }
  };

  // ===== RENDER CODE INPUTS =====
  const renderCodeInputs = () => {
    return (
      <View style={styles.codeContainer}>
        {Array.from({ length: 6 }, (_, index) => {
          const digit = code[index] || '';
          const isFocused = focusedIndex === index;
          const hasInputError = error && code.length === 6;
          
          return (
            <TextInput
              key={index}
              ref={(ref) => { 
                if (ref) {
                  inputRefs.current[index] = ref;
                }
              }}
              style={[
                styles.codeInput,
                isFocused && styles.codeInputFocused,
                hasInputError && styles.codeInputError,
                digit && styles.codeInputFilled,
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              onFocus={() => handleInputFocus(index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
              editable={!isLocked && !isSubmitting}
            />
          );
        })}
      </View>
    );
  };

  // ===== RENDER =====
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateX: shakeAnimation }] }
        ]}
      >
        <Card variant="elevated" style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="chatbubble-ellipses"
                size={48}
                color={theme.colors.primary[500]}
              />
            </View>
            
            <Text style={styles.title}>{getPurposeTitle()}</Text>
            <Text style={styles.subtitle}>{getPurposeSubtitle()}</Text>
          </View>

          {/* Code Inputs */}
          {renderCodeInputs()}

          {/* Error Display */}
          {hasError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.error[500]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Status Information */}
          <View style={styles.statusContainer}>
            {isExpired ? (
              <Text style={styles.expiredText}>
                ⏰ Code expiré
              </Text>
            ) : (
              <Text style={styles.timerText}>
                ⏱️ Expire dans {formatTime(Math.floor(timeRemaining / 1000))}
              </Text>
            )}
            
            {attemptsRemaining > 0 && attemptsRemaining < maxAttempts && (
              <Text style={styles.attemptsText}>
                {attemptsRemaining} tentative{attemptsRemaining > 1 ? 's' : ''} restante{attemptsRemaining > 1 ? 's' : ''}
              </Text>
            )}
            
            {isLocked && (
              <Text style={styles.lockedText}>
                ⚠️ Trop de tentatives. Veuillez demander un nouveau code.
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Paste Button */}
            {canPaste && enablePaste && (
              <Button
                title="Coller"
                variant="outline"
                size="medium"
                icon="clipboard"
                onPress={handlePasteCode}
                style={styles.pasteButton}
              />
            )}

            {/* Submit Button */}
            <Button
              title={isSubmitting ? 'Vérification...' : 'Vérifier'}
              variant="primary"
              size="large"
              onPress={handleFormSubmit}
              disabled={!isCodeComplete || isSubmitting || isLocked}
              loading={isSubmitting}
              style={styles.submitButton}
            />
          </View>

          {/* Resend Section */}
          <View style={styles.resendContainer}>
            {canResend ? (
              <Button
                title={isResending ? 'Envoi...' : 'Renvoyer le code'}
                variant="text"
                size="medium"
                onPress={handleResendCode}
                disabled={isResending}
                loading={isResending}
              />
            ) : (
              <Text style={styles.resendText}>
                Renvoyer dans {resendCountdown}s
              </Text>
            )}
          </View>

          {/* Back Button */}
          <Button
            title="Retour"
            variant="text"
            size="medium"
            icon="chevron-back"
            onPress={onNavigateBack || navigateBack}
            style={styles.backButton}
          />
        </Card>

        {/* Loading Overlay */}
        {isSubmitting && (
          <LoadingSpinner
            overlay
            text="Vérification en cours..."
          />
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  
  card: {
    padding: theme.spacing.xl,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  title: {
    ...theme.typography.textStyles.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  subtitle: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  
  codeInputFocused: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  
  codeInputFilled: {
    borderColor: theme.colors.primary[300],
    backgroundColor: theme.colors.primary[50],
  },
  
  codeInputError: {
    borderColor: theme.colors.error[500],
    backgroundColor: theme.colors.error[50],
  },
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error[50],
    borderColor: theme.colors.error[200],
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  
  errorText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.error[700],
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  
  statusContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  
  timerText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
  },
  
  expiredText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.error[600],
    fontWeight: '500',
  },
  
  attemptsText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.warning[600],
  },
  
  lockedText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.error[600],
    fontWeight: '500',
    textAlign: 'center',
  },
  
  actionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  
  pasteButton: {
    flex: 1,
  },
  
  submitButton: {
    flex: 3,
  },
  
  resendContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  resendText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
  },
  
  backButton: {
    alignSelf: 'center',
  },
});

export default SmsVerification;