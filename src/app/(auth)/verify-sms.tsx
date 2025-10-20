import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { smsVerificationSchema, SmsVerificationFormData } from '../../features/auth/validation/authSchemas';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Button } from '../../shared/components/ui/Button';
import { cn } from '../../utils/cn';

const CODE_LENGTH = 6;

export default function VerifySmsScreen() {
  const router = useRouter();
  const { phone, type = 'registration' } = useLocalSearchParams<{
    phone?: string;
    type?: 'registration' | 'login' | 'password_reset';
  }>();

  const { 
    verifySms, 
    resendSms, 
    isVerifying, 
    isResendingSms, 
    verificationError, 
    clearError 
  } = useAuth();

  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Refs for OTP inputs
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const {
    control,
    handleSubmit,
    formState: { isValid },
    setValue,
    watch,
  } = useForm<SmsVerificationFormData>({
    resolver: zodResolver(smsVerificationSchema),
    mode: 'onChange',
    defaultValues: {
      phone: phone || '',
      code: '',
      type: type as 'registration' | 'login' | 'password_reset',
    },
  });

  const watchedCode = watch('code');

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.length === CODE_LENGTH) {
      setValue('code', code, { shouldValidate: true });
      // Auto-submit after a short delay
      const timer = setTimeout(() => {
        handleSubmit(onSubmit)();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [code, setValue, handleSubmit]);

  const onSubmit = async (data: SmsVerificationFormData) => {
    if (!phone) {
      Alert.alert('Erreur', 'Numéro de téléphone manquant');
      return;
    }

    try {
      clearError();
      
      const result = await verifySms({
        phone: data.phone,
        code: data.code,
        type: data.type,
      });

      // Show success message
      Alert.alert(
        'Vérification réussie',
        type === 'registration' ? 
          'Votre compte a été vérifié avec succès !' :
          'Votre numéro a été vérifié avec succès !',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigation will be handled automatically by auth state change
              // The user will be redirected to the main app
            },
          },
        ]
      );

    } catch (error: any) {
      console.error('SMS verification failed:', error);
      
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Code de vérification incorrect. Veuillez réessayer.';
      
      Alert.alert('Erreur de vérification', errorMessage);
      
      // Clear the code on error
      setCode('');
      setValue('code', '');
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendSms = async () => {
    if (!canResend || !phone) return;

    try {
      await resendSms({
        phone,
        type: type as 'registration' | 'login' | 'password_reset',
      });

      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      
      Alert.alert(
        'Code renvoyé',
        'Un nouveau code de vérification a été envoyé à votre numéro.'
      );

    } catch (error: any) {
      console.error('Resend SMS failed:', error);
      
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Impossible de renvoyer le code. Veuillez réessayer.';
      
      Alert.alert('Erreur', errorMessage);
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    // Only allow digits
    const cleanValue = value.replace(/[^0-9]/g, '');
    
    if (cleanValue.length <= 1) {
      const newCode = code.split('');
      newCode[index] = cleanValue;
      const updatedCode = newCode.join('').slice(0, CODE_LENGTH);
      setCode(updatedCode);

      // Auto-focus next input
      if (cleanValue && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      // Focus previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleGoBack = () => {
    Alert.alert(
      'Annuler la vérification',
      'Êtes-vous sûr de vouloir annuler ? Vous devrez recommencer le processus.',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui', 
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    if (phoneNumber.startsWith('+225')) {
      return phoneNumber.replace('+225', '+225 ').replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    return phoneNumber;
  };

  const getTitle = () => {
    switch (type) {
      case 'registration':
        return 'Vérification d\'inscription';
      case 'login':
        return 'Vérification de connexion';
      case 'password_reset':
        return 'Réinitialisation du mot de passe';
      default:
        return 'Vérification SMS';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'registration':
        return 'Entrez le code de vérification envoyé à votre numéro pour activer votre compte.';
      case 'login':
        return 'Entrez le code de vérification envoyé à votre numéro pour vous connecter.';
      case 'password_reset':
        return 'Entrez le code de vérification pour réinitialiser votre mot de passe.';
      default:
        return 'Entrez le code de vérification envoyé à votre numéro.';
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
            {getTitle()}
          </Text>
          <Text className="text-lg text-gray-600 text-center mb-4">
            {getDescription()}
          </Text>
          {phone && (
            <Text className="text-base text-orange-600 font-medium">
              {formatPhoneNumber(phone)}
            </Text>
          )}
        </View>

        {/* SMS Icon */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
            <Text className="text-2xl">📱</Text>
          </View>
        </View>

        {/* OTP Input */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-gray-700 mb-4 text-center">
            Code de vérification
          </Text>
          <View className="flex-row justify-between px-4">
            {Array.from({ length: CODE_LENGTH }, (_, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className={cn(
                  'w-12 h-14 border-2 rounded-lg text-center text-xl font-bold',
                  code[index] ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-white',
                  verificationError && 'border-red-500'
                )}
                value={code[index] || ''}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isVerifying}
              />
            ))}
          </View>
        </View>

        {/* Error Message */}
        {verificationError && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <Text className="text-red-700 text-sm text-center">{verificationError}</Text>
          </View>
        )}

        {/* Verify Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          loading={isVerifying}
          disabled={code.length !== CODE_LENGTH || isVerifying}
          className="mb-6"
          fullWidth
        >
          {isVerifying ? 'Vérification...' : 'Vérifier le code'}
        </Button>

        {/* Resend Code */}
        <View className="items-center mb-8">
          <Text className="text-gray-600 mb-2">
            Vous n'avez pas reçu le code ?
          </Text>
          {canResend ? (
            <TouchableOpacity
              onPress={handleResendSms}
              disabled={isResendingSms}
              className="py-2"
            >
              <Text className="text-orange-600 font-semibold">
                {isResendingSms ? 'Envoi...' : 'Renvoyer le code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-gray-500">
              Renvoyer dans {countdown}s
            </Text>
          )}
        </View>

        {/* Back Button */}
        <View className="items-center">
          <TouchableOpacity
            onPress={handleGoBack}
            disabled={isVerifying}
            className="py-2"
          >
            <Text className="text-gray-600 font-medium">
              Modifier le numéro
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View className="mt-8 pt-4 border-t border-gray-200">
          <Text className="text-xs text-gray-500 text-center leading-4">
            Le code de vérification est valable pendant 10 minutes.
            Si vous ne le recevez pas, vérifiez que votre numéro est correct.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}