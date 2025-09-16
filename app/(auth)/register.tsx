import React from 'react';
import { StyleSheet, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { RegisterForm } from '../../src/features/authentication/components/RegisterForm';

export default function RegisterScreen() {
  const handleRegisterSuccess = () => {
    // Navigate to SMS verification after successful registration
    console.log('Registration successful, user should be redirected to SMS verification by the hook');
  };

  const handleRegisterError = (error: string) => {
    console.error('Registration error:', error);
    // Error is already handled by the RegisterForm component
  };

  const handleNavigateToLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <RegisterForm
        onSuccess={handleRegisterSuccess}
        onError={handleRegisterError}
        onNavigateToLogin={handleNavigateToLogin}
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