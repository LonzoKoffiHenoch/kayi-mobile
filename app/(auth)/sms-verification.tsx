import React from 'react';
import { StyleSheet, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { SmsVerification } from '../../src/features/authentication';

export default function SmsVerificationScreen() {
  const params = useLocalSearchParams();
  const phone = params.phone as string;
  const purpose = (params.purpose as 'registration' | 'login' | 'password_reset') || 'registration';

  const handleVerificationSuccess = () => {
    console.log('SMS verification successful');
    // Navigation is handled by the component based on purpose
  };

  const handleVerificationError = (error: string) => {
    console.error('SMS verification error:', error);
    // Error is already handled by the SmsVerification component
  };

  const handleNavigateBack = () => {
    router.back();
  };

  if (!phone) {
    // Redirect to login if no phone number provided
    router.replace('/(auth)/login');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <SmsVerification
        phone={phone}
        purpose={purpose}
        onSuccess={handleVerificationSuccess}
        onError={handleVerificationError}
        onNavigateBack={handleNavigateBack}
        autoNavigate={true}
        enablePaste={true}
        enableAutoSubmit={true}
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