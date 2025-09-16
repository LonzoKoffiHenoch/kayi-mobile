/**
 * KAYI House ForgotPassword Component
 * Composant de récupération de mot de passe avec SMS
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Animated,
  TextInput as RNTextInput,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card, LoadingSpinner } from '../../../shared';
import { useForgotPasswordMutation } from '../services/authApi';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import { theme } from '../../../shared/theme/theme';
import { router } from 'expo-router';

// ===== VALIDATION SCHEMA =====
const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Téléphone ou email requis')
    .refine((value) => {
      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        return true;
      }
      
      // Check if it's a valid CI phone number
      const phoneResult = authService.validatePhoneFormat(value);
      return phoneResult.isValid;
    }, 'Veuillez entrer un téléphone ou email valide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ===== TYPES =====
export interface ForgotPasswordProps {
  onSuccess?: (phone: string) => void;
  onError?: (error: string) => void;
  onNavigateToLogin?: () => void;
  autoFocus?: boolean;
}

// ===== COMPONENT =====
export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onSuccess,
  onError,
  onNavigateToLogin,
  autoFocus = true,
}) => {
  // Form setup
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: '',
    },
    mode: 'onChange',
  });

  const { control, handleSubmit, watch, formState, setValue, getValues } = form;
  const { errors, isValid } = formState;
  
  // State
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Animations
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  
  // Hooks
  const { clearError } = useAuth();
  const forgotPasswordMutation = useForgotPasswordMutation();
  
  // Computed values
  const isLoading = forgotPasswordMutation.isPending;
  const error = forgotPasswordMutation.error;
  const watchedValues = watch();

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
  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      clearError();
      
      const response = await forgotPasswordMutation.mutateAsync({
        identifier: data.identifier,
      });

      if (response.data.smsCodeSent) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        const phone = response.data.phone;
        
        Alert.alert(
          'Code envoyé',
          `Un code de réinitialisation a été envoyé au ${phone}`,
          [
            {
              text: 'Continuer',
              onPress: () => {
                onSuccess?.(phone);
                // Navigate to SMS verification
                router.push({
                  pathname: '/(auth)/sms-verification',
                  params: {
                    phone,
                    purpose: 'password_reset',
                  },
                });
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      triggerShakeAnimation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const errorMessage = authService.parseApiError(error);
      onError?.(errorMessage);
    }
  });

  const handleIdentifierChange = (value: string, onChange: (value: string) => void) => {
    // Format phone number if it looks like a phone number
    if (value.match(/^[\d+\s()-]+$/)) {
      const formatted = authService.formatPhoneInput(value);
      onChange(formatted);
    } else {
      onChange(value);
    }
  };

  const navigateToLogin = () => {
    onNavigateToLogin?.() || router.push('/(auth)/login');
  };

  const getInputType = () => {
    const value = watchedValues.identifier;
    if (!value) return 'phone-pad';
    
    // If it contains @ it's probably an email
    if (value.includes('@')) {
      return 'email-address';
    }
    
    // Otherwise treat as phone
    return 'phone-pad';
  };

  const getPlaceholder = () => {
    const value = watchedValues.identifier;
    if (!value) return '+225 XX XX XX XX ou email@exemple.com';
    
    if (value.includes('@')) {
      return 'votre.email@exemple.com';
    }
    
    return '+225 XX XX XX XX';
  };

  const getLeftIcon = () => {
    const value = watchedValues.identifier;
    if (!value) return 'at';
    
    if (value.includes('@')) {
      return 'mail';
    }
    
    return 'call';
  };

  // ===== RENDER =====
  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: shakeAnimation }] }
      ]}
    >
      <Card variant="elevated" style={styles.formCard}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="key"
              size={48}
              color={theme.colors.primary[500]}
            />
          </View>
          
          <Text style={styles.title}>Mot de passe oublié ?</Text>
          <Text style={styles.subtitle}>
            Entrez votre téléphone ou email pour recevoir un code de réinitialisation
          </Text>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.error[500]} />
            <Text style={styles.errorText}>
              {typeof error === 'string' ? error : 'Une erreur est survenue'}
            </Text>
          </View>
        )}

        {/* Identifier Input */}
        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Téléphone ou Email"
              placeholder={getPlaceholder()}
              value={value}
              onChangeText={(text) => handleIdentifierChange(text, onChange)}
              onBlur={onBlur}
              keyboardType={getInputType()}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={autoFocus}
              leftIcon={getLeftIcon()}
              error={errors.identifier?.message}
              onFocus={() => setFocusedField('identifier')}
              returnKeyType="done"
              onSubmitEditing={handleFormSubmit}
              maxLength={100}
            />
          )}
        />

        {/* Submit Button */}
        <Button
          title={isLoading ? 'Envoi en cours...' : 'Envoyer le code'}
          variant="primary"
          size="large"
          onPress={handleFormSubmit}
          disabled={!isValid || isLoading}
          loading={isLoading}
          style={styles.submitButton}
        />

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.infoText}>
              Le code expire dans 15 minutes
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.infoText}>
              Votre compte reste sécurisé
            </Text>
          </View>
        </View>

        {/* Back to Login */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Vous vous souvenez de votre mot de passe ?{' '}
          </Text>
          <Button
            title="Se connecter"
            variant="text"
            size="small"
            onPress={navigateToLogin}
            style={styles.loginButton}
          />
        </View>
      </Card>

      {/* Loading Overlay */}
      {isLoading && (
        <LoadingSpinner
          overlay
          text="Envoi du code..."
        />
      )}
    </Animated.View>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  
  formCard: {
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
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  
  subtitle: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.sm,
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
  
  submitButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  
  infoContainer: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  
  infoText: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  
  loginText: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
  },
  
  loginButton: {
    paddingHorizontal: theme.spacing.xs,
  },
});

export default ForgotPassword;