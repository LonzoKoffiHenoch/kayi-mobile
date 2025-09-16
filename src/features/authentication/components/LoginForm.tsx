/**
 * KAYI House LoginForm Component
 * Formulaire de connexion avec validation CI et biométrie
 */

import React, {useRef, useState} from 'react';
import {Alert, Animated, StyleSheet, Text, TextInput as RNTextInput, View,} from 'react-native';
import {Controller} from 'react-hook-form';
import * as Haptics from 'expo-haptics';
import {Ionicons} from '@expo/vector-icons';
import {Button, Input, LoadingSpinner} from '../../../shared';
import {useLogin} from '../hooks/useLogin';
import {theme} from '../../../shared/theme/theme';

// ===== TYPES =====
export interface LoginFormProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
    onNavigateToRegister?: () => void;
    onNavigateToForgotPassword?: () => void;
    autoFocus?: boolean;
    showBiometric?: boolean;
    showRememberMe?: boolean;
}

// ===== COMPONENT =====
export const LoginForm: React.FC<LoginFormProps> = ({
                                                        onSuccess,
                                                        onError,
                                                        onNavigateToRegister,
                                                        onNavigateToForgotPassword,
                                                        autoFocus = true,
                                                        showBiometric = true,
                                                        showRememberMe = true,
                                                    }) => {
    // Hooks
    const {
        form,
        isValid,
        handleSubmit,
        isLoading,
        error,
        clearError,
        formatPhoneInput,
        isBiometricAvailable,
        biometricType,
        handleBiometricAuth,
        navigateToRegister,
        navigateToForgotPassword,
    } = useLogin({
        onSuccess,
        onError,
        enableBiometric: showBiometric,
    });

    const {control, formState, watch, setValue} = form;
    const {errors} = formState;

    // State
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Refs
    const passwordInputRef = useRef<RNTextInput>(null);
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    // Watch form values
    const watchedValues = watch();

    // ===== ANIMATION =====
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
    const handleFormSubmit = async () => {
        try {
            clearError();
            await handleSubmit();
        } catch (error) {
            triggerShakeAnimation();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleBiometricLogin = async () => {
        try {
            const result = await handleBiometricAuth();
            if (result.success) {
                onSuccess?.();
            } else if (result.error) {
                Alert.alert('Erreur', result.error);
            }
        } catch (error) {
            console.error('Biometric login error:', error);
        }
    };

    const handlePhoneInputChange = (value: string, onChange: (value: string) => void) => {
        const formatted = formatPhoneInput(value);
        onChange(formatted);
    };

    const handlePhoneSubmit = () => {
        passwordInputRef.current?.focus();
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleRememberMeToggle = () => {
        const currentValue = watchedValues.rememberMe;
        setValue('rememberMe', !currentValue);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // ===== RENDER =====
    return (
        <Animated.View className={"bg-red-300"}>
            <View className={"px-10"}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Connexion</Text>
                    <Text style={styles.subtitle}>
                        Connectez-vous à votre compte KAYI House
                    </Text>
                </View>

                {/* Error Display */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color={theme.colors.error[500]}/>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Biometric Login */}
                {showBiometric && isBiometricAvailable && (
                    <View style={styles.biometricContainer}>
                        <Button
                            title={`Connexion avec ${biometricType}`}
                            variant="outline"
                            size="large"
                            icon="finger-print"
                            onPress={handleBiometricLogin}
                            style={styles.biometricButton}
                        />

                        <View style={styles.divider}>
                            <View style={styles.dividerLine}/>
                            <Text style={styles.dividerText}>ou</Text>
                            <View style={styles.dividerLine}/>
                        </View>
                    </View>
                )}

                {/* Phone/Email Input */}
                <Controller
                    control={control}
                    name="identifier"
                    render={({field: {onChange, onBlur, value}}) => (
                        <Input
                            label="Téléphone ou Email"
                            placeholder="+225 XX XX XX XX"
                            value={value}
                            onChangeText={(text) => handlePhoneInputChange(text, onChange)}
                            onBlur={onBlur}
                            onSubmitEditing={handlePhoneSubmit}
                            keyboardType={value.includes('@') ? 'email-address' : 'phone-pad'}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoFocus={autoFocus}
                            leftIcon="call"
                            error={errors.identifier?.message}
                            onFocus={() => setFocusedField('identifier')}
                            returnKeyType="next"
                            maxLength={50}
                        />
                    )}
                />

                {/* Password Input */}
                <Controller
                    control={control}
                    name="password"
                    render={({field: {onChange, onBlur, value}}) => (
                        <Input
                            label="Mot de passe"
                            placeholder="Votre mot de passe"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            onSubmitEditing={handleFormSubmit}
                            secureTextEntry={!showPassword}
                            leftIcon="lock-closed"
                            rightIcon={showPassword ? 'eye-off' : 'eye'}
                            onRightIconPress={togglePasswordVisibility}
                            error={errors.password?.message}
                            onFocus={() => setFocusedField('password')}
                            returnKeyType="done"
                            maxLength={128}
                        />
                    )}
                />

                {/* Remember Me & Forgot Password */}
                <View style={styles.optionsRow}>
                    {showRememberMe && (
                        <Button
                            title="Se souvenir de moi"
                            variant="text"
                            size="small"
                            icon={watchedValues.rememberMe ? 'checkbox' : 'square-outline'}
                            onPress={handleRememberMeToggle}
                            style={styles.rememberMeButton}
                        />
                    )}

                    <Button
                        title="Mot de passe oublié ?"
                        variant="text"
                        size="small"
                        onPress={onNavigateToForgotPassword || navigateToForgotPassword}
                        style={styles.forgotPasswordButton}
                    />
                </View>

                {/* Submit Button */}
                <Button
                    title={isLoading ? 'Connexion...' : 'Se connecter'}
                    variant="primary"
                    size="large"
                    onPress={handleFormSubmit}
                    disabled={!isValid || isLoading}
                    loading={isLoading}
                    style={styles.submitButton}
                />

                {/* Register Link */}
                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>
                        Pas encore de compte ?{' '}
                    </Text>
                    <Button
                        title="S'inscrire"
                        variant="text"
                        size="small"
                        onPress={onNavigateToRegister || navigateToRegister}
                        style={styles.registerButton}
                    />
                </View>
            </View>

            {/* Loading Overlay */}
            {isLoading && (
                <LoadingSpinner
                    overlay
                    text="Connexion en cours..."
                />
            )}
        </Animated.View>
    );
};

// ===== STYLES =====
const styles = StyleSheet.create({


    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
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

    biometricContainer: {
        marginBottom: theme.spacing.lg,
    },

    biometricButton: {
        marginBottom: theme.spacing.md,
    },

    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.md,
    },

    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border.primary,
    },

    dividerText: {
        ...theme.typography.textStyles.caption,
        color: theme.colors.text.tertiary,
        marginHorizontal: theme.spacing.md,
    },

    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: theme.spacing.lg,
    },

    rememberMeButton: {
        paddingHorizontal: 0,
    },

    forgotPasswordButton: {
        paddingHorizontal: 0,
    },

    submitButton: {
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },

    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    registerText: {
        ...theme.typography.textStyles.body,
        color: theme.colors.text.secondary,
    },

    registerButton: {
        paddingHorizontal: theme.spacing.xs,
    },
});

export default LoginForm;