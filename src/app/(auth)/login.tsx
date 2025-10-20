import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../../features/auth/validation/authSchemas';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { PhoneInput } from '../../shared/components/forms/PhoneInput';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoggingIn, loginError, clearError } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  const watchedPhone = watch('identifier');

  const onSubmit = async (data: LoginFormData) => {
      console.log('Login data:', data);
    try {
      clearError();
      await login({
          identifier: data.identifier,
        password: data.password,
        // rememberMe: data.rememberMe,
      });
      
      // Navigation will be handled by the auth layout
      // The user will be redirected to the main app automatically
      
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Erreur de connexion. Vérifiez vos informations.';
      
      Alert.alert('Erreur de connexion', errorMessage);
    }
  };

  const handleForgotPassword = () => {
    if (watchedPhone) {
      router.push(`/forgot-password?phone=${encodeURIComponent(watchedPhone)}`);
    } else {
      router.push('/forgot-password');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="items-center mb-8 mt-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Connexion
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              Connectez-vous à votre compte KAYI House
            </Text>
          </View>



          {/* Login Form */}
          <View className="space-y-4">
            {/* Phone Input */}
            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  value={value}
                  onChangeText={onChange}
                  error={errors.identifier?.message}
                  showOperator={true}
                  autoFormat={true}
                />
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Mot de passe"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Entrez votre mot de passe"
                  secureTextEntry={true}
                  error={errors.password?.message}
                  autoCapitalize="none"
                  autoCorrect={false}
                  required
                />
              )}
            />

            {/* Remember Me Checkbox */}
            <Controller
              control={control}
              name="rememberMe"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  className="flex-row items-center py-2"
                  onPress={() => onChange(!value)}
                >
                  <View className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
                    value ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                  }`}>
                    {value && (
                      <Text className="text-white text-xs font-bold">✓</Text>
                    )}
                  </View>
                  <Text className="text-gray-700">Se souvenir de moi</Text>
                </TouchableOpacity>
              )}
            />

            {/* Error Message */}
            {loginError && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                <Text className="text-red-700 text-sm">{loginError}</Text>
              </View>
            )}

            {/* Login Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isLoggingIn}
              disabled={!isValid || isLoggingIn}
              className="mt-6"
              fullWidth
            >
              {isLoggingIn ? 'Connexion...' : 'Se connecter'}
            </Button>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              className="py-3"
              disabled={isLoggingIn}
            >
              <Text className="text-orange-600 text-center font-medium">
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-500">ou</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Register Link */}
          <View className="items-center">
            <Text className="text-gray-600 mb-2">
              Vous n'avez pas de compte ?
            </Text>
            <Link href="/register" asChild>
              <TouchableOpacity disabled={isLoggingIn}>
                <Text className="text-orange-600 font-semibold text-lg">
                  S'inscrire
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Terms and Privacy */}
          <View className="mt-8 pt-4 border-t border-gray-200">
            <Text className="text-xs text-gray-500 text-center leading-4">
              En vous connectant, vous acceptez nos{' '}
              <Text className="text-orange-600">Conditions d'utilisation</Text>
              {' '}et notre{' '}
              <Text className="text-orange-600">Politique de confidentialité</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}