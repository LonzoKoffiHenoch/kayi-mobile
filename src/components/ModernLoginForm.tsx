/**
 * KAYI House Modern Login Form
 * Modern design showcase using NativeWind components
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ModernButton } from '../shared/components/base/ModernButton';
import { ModernInput } from '../shared/components/base/ModernInput';

export const ModernLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log('Login attempt with:', { email, password });
    }, 2000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec gradient visuel */}
        <View className="bg-primary-500 pt-16 pb-8 px-6 rounded-b-3xl">
          <Text className="text-3xl font-bold text-white text-center mb-2">
            Bienvenue !
          </Text>
          <Text className="text-primary-100 text-center text-lg">
            Connectez-vous à votre compte KAYI House
          </Text>
        </View>

        {/* Formulaire moderne */}
        <View className="flex-1 px-6 pt-8">
          {/* Card avec ombre moderne */}
          <View className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Connexion
            </Text>

            {/* Email Input */}
            <ModernInput
              label="Adresse email"
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail"
              variant="outline"
              size="large"
            />

            {/* Password Input */}
            <ModernInput
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="Votre mot de passe"
              secureTextEntry={!showPassword}
              leftIcon="lock-closed"
              rightIcon={showPassword ? "eye-off" : "eye"}
              onRightIconPress={togglePasswordVisibility}
              variant="outline"
              size="large"
            />

            {/* Options Row */}
            <View className="flex-row justify-between items-center mb-6">
              <ModernButton
                title="Se souvenir de moi"
                variant="text"
                size="small"
                icon="checkbox"
              />
              
              <ModernButton
                title="Mot de passe oublié ?"
                variant="text"
                size="small"
              />
            </View>

            {/* Login Button */}
            <ModernButton
              title="Se connecter"
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
              onPress={handleLogin}
              disabled={!email || !password}
            />
          </View>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">ou</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Buttons */}
          <View className="space-y-3 mb-6">
            <ModernButton
              title="Continuer avec Google"
              variant="outline"
              size="large"
              fullWidth
              icon="logo-google"
            />
            
            <ModernButton
              title="Continuer avec Apple"
              variant="outline"
              size="large"
              fullWidth
              icon="logo-apple"
            />
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center items-center pb-8">
            <Text className="text-gray-600 mr-2">
              Pas encore de compte ?
            </Text>
            <ModernButton
              title="S'inscrire"
              variant="text"
              size="medium"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};