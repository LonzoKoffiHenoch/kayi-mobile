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
import { registerSchema, RegisterFormData } from '../../features/auth/validation/authSchemas';
import { UserRole } from '../../features/auth/types/auth.types';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { PhoneInput } from '../../shared/components/forms/PhoneInput';

// Role options for selection
const ROLE_OPTIONS = [
  {
    value: UserRole.TENANT,
    label: 'Locataire',
    description: 'Je cherche un logement à louer',
    icon: '🏡',
  },
  {
    value: UserRole.LANDLORD,
    label: 'Propriétaire',
    description: 'Je mets des biens en location',
    icon: '🏠',
  },
  {
    value: UserRole.AGENT,
    label: 'Agent immobilier',
    description: 'Je représente des propriétés',
    icon: '👔',
  },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isRegistering, registerError, clearError } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: UserRole.TENANT,
      email: '',
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const watchedRole = watch('role');
  const watchedTerms = watch('acceptTerms');
  const watchedPrivacy = watch('acceptPrivacy');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      
      const result = await register({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
        email: data.email || undefined,
        acceptTerms: data.acceptTerms,
        acceptPrivacy: data.acceptPrivacy,
      });

      // Show success message
      Alert.alert(
        'Inscription réussie',
        'Un code de vérification a été envoyé à votre numéro de téléphone.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Redirect to SMS verification with phone number
              router.push(`/verify-sms?phone=${encodeURIComponent(data.phone)}&type=registration`);
            },
          },
        ]
      );

    } catch (error: any) {
      console.error('Registration failed:', error);
      
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Erreur d\'inscription. Veuillez réessayer.';
      
      Alert.alert('Erreur d\'inscription', errorMessage);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
  };

  const RoleSelector = () => (
    <View className="mb-6">
      <Text className="text-sm font-medium text-gray-700 mb-3">
        Je suis un(e) <Text className="text-red-500">*</Text>
      </Text>
      <View className="space-y-3">
        {ROLE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleRoleSelect(option.value)}
            className={`p-4 rounded-lg border-2 ${
              watchedRole === option.value
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">{option.icon}</Text>
              <View className="flex-1">
                <Text className={`font-semibold ${
                  watchedRole === option.value ? 'text-orange-700' : 'text-gray-900'
                }`}>
                  {option.label}
                </Text>
                <Text className={`text-sm ${
                  watchedRole === option.value ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  {option.description}
                </Text>
              </View>
              {watchedRole === option.value && (
                <Text className="text-orange-500 text-lg">✓</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {errors.role && (
        <Text className="text-red-600 text-sm mt-1">{errors.role.message}</Text>
      )}
    </View>
  );

  const CheckboxField = ({ 
    label, 
    value, 
    onPress, 
    error 
  }: { 
    label: string; 
    value: boolean; 
    onPress: () => void; 
    error?: string; 
  }) => (
    <View className="mb-4">
      <TouchableOpacity
        className="flex-row items-start py-2"
        onPress={onPress}
      >
        <View className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center mt-0.5 ${
          value ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
        }`}>
          {value && (
            <Text className="text-white text-xs font-bold">✓</Text>
          )}
        </View>
        <Text className="text-gray-700 flex-1 leading-5">{label}</Text>
      </TouchableOpacity>
      {error && (
        <Text className="text-red-600 text-sm mt-1 ml-8">{error}</Text>
      )}
    </View>
  );

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
          <View className="items-center mb-8 mt-4">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Inscription
            </Text>
            <Text className="text-lg text-gray-600 text-center">
              Créez votre compte KAYI House
            </Text>
          </View>

          {/* Registration Form */}
          <View className="space-y-4">
            {/* Role Selection */}
            <RoleSelector />

            {/* Name Fields */}
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Prénom"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Votre prénom"
                      error={errors.firstName?.message}
                      autoCapitalize="words"
                      autoCorrect={false}
                      required
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Nom"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Votre nom"
                      error={errors.lastName?.message}
                      autoCapitalize="words"
                      autoCorrect={false}
                      required
                    />
                  )}
                />
              </View>
            </View>

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

            {/* Email Input (Optional) */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email (optionnel)"
                  value={value}
                  onChangeText={onChange}
                  placeholder="votre@email.com"
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              )}
            />

            {/* Password Fields */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Mot de passe"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Créez un mot de passe sécurisé"
                  secureTextEntry={true}
                  error={errors.password?.message}
                  autoCapitalize="none"
                  autoCorrect={false}
                  required
                  helperText="Au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial"
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirmer le mot de passe"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Confirmez votre mot de passe"
                  secureTextEntry={true}
                  error={errors.confirmPassword?.message}
                  autoCapitalize="none"
                  autoCorrect={false}
                  required
                />
              )}
            />

            {/* Terms and Privacy Checkboxes */}
            <View className="mt-6">
              <Controller
                control={control}
                name="acceptTerms"
                render={({ field: { onChange, value } }) => (
                  <CheckboxField
                    label="J'accepte les Conditions d'utilisation de KAYI House"
                    value={value}
                    onPress={() => onChange(!value)}
                    error={errors.acceptTerms?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="acceptPrivacy"
                render={({ field: { onChange, value } }) => (
                  <CheckboxField
                    label="J'accepte la Politique de confidentialité de KAYI House"
                    value={value}
                    onPress={() => onChange(!value)}
                    error={errors.acceptPrivacy?.message}
                  />
                )}
              />
            </View>

            {/* Error Message */}
            {registerError && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                <Text className="text-red-700 text-sm">{registerError}</Text>
              </View>
            )}

            {/* Register Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isRegistering}
              disabled={!isValid || isRegistering}
              className="mt-6"
              fullWidth
            >
              {isRegistering ? 'Inscription...' : 'S\'inscrire'}
            </Button>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-500">ou</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Login Link */}
          <View className="items-center mb-8">
            <Text className="text-gray-600 mb-2">
              Vous avez déjà un compte ?
            </Text>
            <Link href="/login" asChild>
              <TouchableOpacity disabled={isRegistering}>
                <Text className="text-orange-600 font-semibold text-lg">
                  Se connecter
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}