import React from 'react';
import { StyleSheet, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ForgotPassword } from '../../src/features/authentication';

export default function ForgotPasswordScreen() {
  const handleForgotPasswordSuccess = (phone: string) => {
    console.log('Forgot password SMS sent to:', phone);
    // Navigation to SMS verification is handled by the component
  };

  const handleForgotPasswordError = (error: string) => {
    console.error('Forgot password error:', error);
    // Error is already handled by the ForgotPassword component
  };

  const handleNavigateToLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ForgotPassword
        onSuccess={handleForgotPasswordSuccess}
        onError={handleForgotPasswordError}
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