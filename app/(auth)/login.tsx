import React from 'react';
import { View, StyleSheet, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LoginForm } from '../../src/features/authentication/components/LoginForm';

export default function LoginScreen() {
  const handleLoginSuccess = () => {
    // Navigate to main app after successful login
    router.replace('/(tabs)/home');
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
    // Error is already handled by the LoginForm component
  };

  const handleNavigateToRegister = () => {
    router.push('/(auth)/register');
  };

  const handleNavigateToForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoginForm
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
        onNavigateToRegister={handleNavigateToRegister}
        onNavigateToForgotPassword={handleNavigateToForgotPassword}
        autoFocus={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});