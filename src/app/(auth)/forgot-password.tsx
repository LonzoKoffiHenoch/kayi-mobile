import React from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../../features/auth/validation/authSchemas';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Button } from '../../shared/components/ui/Button';
import { PhoneInput } from '../../shared/components/forms/PhoneInput';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const { forgotPassword, isForgettingPassword, error, clearError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      phone: phone || '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      clearError();
      
      const result = await forgotPassword({
        phone: data.phone,
      });

      Alert.alert(
        'Code envoyé',
        'Un code de réinitialisation a été envoyé à votre numéro de téléphone.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push(`/verify-sms?phone=${encodeURIComponent(data.phone)}&type=password_reset`);
            },
          },
        ]
      );

    } catch (error: any) {
      console.error('Forgot password failed:', error);
      
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Impossible d\'envoyer le code. Veuillez réessayer.';
      
      Alert.alert('Erreur', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-8 mt-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Mot de passe oublié
          </Text>
          <Text className="text-lg text-gray-600 text-center">
            Entrez votre numéro de téléphone pour recevoir un code de réinitialisation
          </Text>
        </View>

        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
            <Text className="text-2xl">🔐</Text>
          </View>
        </View>

        {/* Form */}
        <View className="space-y-4">
          {/* Phone Input */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <PhoneInput
                value={value}
                onChangeText={onChange}
                error={errors.phone?.message}
                showOperator={true}
                autoFormat={true}
              />
            )}
          />

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}

          {/* Submit Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isForgettingPassword}
            disabled={!isValid || isForgettingPassword}
            className="mt-6"
            fullWidth
          >
            {isForgettingPassword ? 'Envoi...' : 'Envoyer le code'}
          </Button>
        </View>

        {/* Back to Login */}
        <View className="items-center mt-8">
          <Text className="text-gray-600 mb-2">
            Vous vous souvenez de votre mot de passe ?
          </Text>
          <Link href="/login" asChild>
            <TouchableOpacity disabled={isForgettingPassword}>
              <Text className="text-orange-600 font-semibold text-lg">
                Se connecter
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Help Text */}
        <View className="mt-8 pt-4 border-t border-gray-200">
          <Text className="text-xs text-gray-500 text-center leading-4">
            Si vous ne recevez pas le code, vérifiez que votre numéro est correct
            ou contactez notre support.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}