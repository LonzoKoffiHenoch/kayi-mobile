/**
 * KAYI House RegisterForm Component
 * Formulaire d'inscription multi-étapes avec validation progressive
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { Controller } from 'react-hook-form';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card, LoadingSpinner } from '../../../shared';
import { useRegister } from '../hooks/useRegister';
import { theme } from '../../../shared/theme/theme';
import { UserTypeSelector } from './UserTypeSelector';
import { LanguageSelector } from './LanguageSelector';
import { SupportedLanguage, UserRole, Commune } from '../../../core/types/common.types';

// ===== TYPES =====
export interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onNavigateToLogin?: () => void;
  autoFocus?: boolean;
}

// ===== COMPONENT =====
export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onError,
  onNavigateToLogin,
  autoFocus = true,
}) => {
  const {
    form,
    currentStep,
    isStepValid,
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
    isLoading,
    error,
    clearError,
    formatPhoneInput,
    navigateToLogin,
    saveDraft,
    loadDraft,
    clearDraft,
    isLastStep,
    getStepTitle,
    getStepSubtitle,
  } = useRegister({
    onSuccess,
    onError,
  });

  const { control, formState, watch, setValue } = form;
  const { errors } = formState;
  
  // State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Animation
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;
  
  // Watch form values
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

  const animateStepTransition = (direction: 'forward' | 'backward') => {
    const toValue = direction === 'forward' ? -50 : 50;
    
    Animated.sequence([
      Animated.timing(slideAnimation, {
        toValue,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // ===== HANDLERS =====
  const handleNext = async () => {
    try {
      clearError();
      handleNextStep();
      animateStepTransition('forward');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      triggerShakeAnimation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePrevious = () => {
    handlePreviousStep();
    animateStepTransition('backward');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFormSubmit = async () => {
    try {
      clearError();
      await handleSubmit();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      triggerShakeAnimation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  const handlePhoneInputChange = (value: string, onChange: (value: string) => void) => {
    const formatted = formatPhoneInput(value);
    onChange(formatted);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUserTypeSelect = (role: UserRole) => {
    setValue('role', role);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLanguageSelect = (language: SupportedLanguage) => {
    setValue('preferredLanguage', language);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTermsToggle = () => {
    const currentValue = watchedValues.termsAccepted;
    setValue('termsAccepted', !currentValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ===== STEP CONTENT =====
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      {/* First Name */}
      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Prénom"
            placeholder="Votre prénom"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus={autoFocus && currentStep === 1}
            leftIcon="person"
            error={errors.firstName?.message}
            onFocus={() => setFocusedField('firstName')}
            returnKeyType="next"
            maxLength={50}
          />
        )}
      />

      {/* Last Name */}
      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Nom de famille"
            placeholder="Votre nom de famille"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="words"
            autoCorrect={false}
            leftIcon="person-outline"
            error={errors.lastName?.message}
            onFocus={() => setFocusedField('lastName')}
            returnKeyType="next"
            maxLength={50}
          />
        )}
      />

      {/* Phone */}
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Téléphone"
            placeholder="+225 XX XX XX XX"
            value={value}
            onChangeText={(text) => handlePhoneInputChange(text, onChange)}
            onBlur={onBlur}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="call"
            error={errors.phone?.message}
            onFocus={() => setFocusedField('phone')}
            returnKeyType="next"
            maxLength={50}
          />
        )}
      />

      {/* Email (Optional) */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email (optionnel)"
            placeholder="votre.email@exemple.com"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="mail"
            error={errors.email?.message}
            onFocus={() => setFocusedField('email')}
            returnKeyType="done"
            maxLength={100}
          />
        )}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      {/* User Type Selection */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Type de compte</Text>
        <Controller
          control={control}
          name="role"
          render={({ field: { value } }) => (
            <UserTypeSelector
              selectedType={value}
              onSelect={handleUserTypeSelect}
              error={errors.role?.message}
            />
          )}
        />
      </View>

      {/* Language Selection */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Langue préférée</Text>
        <Controller
          control={control}
          name="preferredLanguage"
          render={({ field: { value } }) => (
            <LanguageSelector
              selectedLanguage={value}
              onSelect={handleLanguageSelect}
              error={errors.preferredLanguage?.message}
            />
          )}
        />
      </View>

      {/* Commune (Optional for now) */}
      <Controller
        control={control}
        name="commune"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Commune (optionnel)"
            placeholder="Votre commune de résidence"
            value={value || ''}
            onChangeText={(text) => onChange(text as Commune)}
            onBlur={onBlur}
            autoCapitalize="words"
            autoCorrect={false}
            leftIcon="location"
            error={errors.commune?.message}
            onFocus={() => setFocusedField('commune')}
            returnKeyType="done"
            maxLength={100}
          />
        )}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      {/* Password */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Mot de passe"
            placeholder="Minimum 8 caractères"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={!showPassword}
            leftIcon="lock-closed"
            rightIcon={showPassword ? 'eye-off' : 'eye'}
            onRightIconPress={togglePasswordVisibility}
            error={errors.password?.message}
            onFocus={() => setFocusedField('password')}
            returnKeyType="next"
            maxLength={128}
          />
        )}
      />

      {/* Confirm Password */}
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Confirmer le mot de passe"
            placeholder="Retapez votre mot de passe"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={!showConfirmPassword}
            leftIcon="lock-closed"
            rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
            onRightIconPress={toggleConfirmPasswordVisibility}
            error={errors.confirmPassword?.message}
            onFocus={() => setFocusedField('confirmPassword')}
            returnKeyType="done"
            maxLength={128}
          />
        )}
      />

      {/* Terms Acceptance */}
      <View style={styles.termsContainer}>
        <Controller
          control={control}
          name="termsAccepted"
          render={({ field: { value } }) => (
            <Button
              title="J'accepte les conditions d'utilisation"
              variant="text"
              size="small"
              icon={value ? 'checkbox' : 'square-outline'}
              onPress={handleTermsToggle}
              style={styles.termsButton}
            />
          )}
        />
        {errors.termsAccepted && (
          <Text style={styles.termsError}>{errors.termsAccepted.message}</Text>
        )}
      </View>
    </View>
  );

  // ===== PROGRESS INDICATOR =====
  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.progressItem}>
          <View
            style={[
              styles.progressCircle,
              step <= currentStep && styles.progressCircleActive,
              step < currentStep && styles.progressCircleCompleted,
            ]}
          >
            {step < currentStep ? (
              <Ionicons name="checkmark" size={16} color={theme.colors.white} />
            ) : (
              <Text
                style={[
                  styles.progressNumber,
                  step <= currentStep && styles.progressNumberActive,
                ]}
              >
                {step}
              </Text>
            )}
          </View>
          {step < 3 && (
            <View
              style={[
                styles.progressLine,
                step < currentStep && styles.progressLineCompleted,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  // ===== RENDER =====
  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: shakeAnimation }] }
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.formCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Inscription</Text>
            <Text style={styles.subtitle}>
              Créez votre compte KAYI House
            </Text>
          </View>

          {/* Progress Indicator */}
          {renderProgressIndicator()}

          {/* Step Header */}
          <View style={styles.stepHeader}>
            <Text style={styles.stepTitle}>{getStepTitle(currentStep)}</Text>
            <Text style={styles.stepSubtitle}>{getStepSubtitle(currentStep)}</Text>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.error[500]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Step Content */}
          <Animated.View
            style={[
              styles.contentContainer,
              { transform: [{ translateX: slideAnimation }] }
            ]}
          >
            {renderStepContent()}
          </Animated.View>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {currentStep > 1 && (
              <Button
                title="Précédent"
                variant="outline"
                size="large"
                onPress={handlePrevious}
                style={styles.previousButton}
                icon="chevron-back"
              />
            )}

            <Button
              title={isLoading && isLastStep
                ? 'Inscription...'
                : isLastStep
                ? "S'inscrire"
                : 'Suivant'
              }
              variant="primary"
              size="large"
              onPress={isLastStep ? handleFormSubmit : handleNext}
              disabled={!isStepValid || isLoading}
              loading={isLoading && isLastStep}
              style={[
                styles.nextButton,
                currentStep === 1 && styles.nextButtonFullWidth
              ].filter(Boolean)}
            />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Déjà un compte ?{' '}
            </Text>
            <Button
              title="Se connecter"
              variant="text"
              size="small"
              onPress={onNavigateToLogin || navigateToLogin}
              style={styles.loginButton}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && isLastStep && (
        <LoadingSpinner
          overlay
          text="Création de votre compte..."
        />
      )}
    </Animated.View>
  );
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  
  formCard: {
    padding: theme.spacing.xl,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  title: {
    ...theme.typography.textStyles.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  
  subtitle: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[200],
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  progressCircleActive: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.white,
  },
  
  progressCircleCompleted: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  
  progressNumber: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.gray[500],
    fontWeight: '600',
  },
  
  progressNumberActive: {
    color: theme.colors.primary[500],
  },
  
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: theme.colors.gray[200],
    marginHorizontal: theme.spacing.xs,
  },
  
  progressLineCompleted: {
    backgroundColor: theme.colors.primary[500],
  },
  
  stepHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  stepTitle: {
    ...theme.typography.textStyles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  
  stepSubtitle: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
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
  
  contentContainer: {
    marginBottom: theme.spacing.lg,
  },
  
  stepContent: {
    gap: theme.spacing.md,
  },
  
  sectionContainer: {
    marginBottom: theme.spacing.lg,
  },
  
  sectionLabel: {
    ...theme.typography.textStyles.subtitle,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  
  termsContainer: {
    marginTop: theme.spacing.lg,
  },
  
  termsButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  },
  
  termsError: {
    ...theme.typography.textStyles.caption,
    color: theme.colors.error[500],
    marginTop: theme.spacing.xs,
  },
  
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  
  previousButton: {
    flex: 1,
  },
  
  nextButton: {
    flex: 1,
  },
  
  nextButtonFullWidth: {
    flex: 1,
  },
  
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loginText: {
    ...theme.typography.textStyles.body,
    color: theme.colors.text.secondary,
  },
  
  loginButton: {
    paddingHorizontal: theme.spacing.xs,
  },
});

export default RegisterForm;