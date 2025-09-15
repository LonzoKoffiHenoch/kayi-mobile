import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '../src/config/constants';

export default function RootScreen() {
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Simuler un délai de splash screen
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vérifier si l'utilisateur a déjà complété l'onboarding
      const onboardingCompleted = await SecureStore.getItemAsync(STORAGE_KEYS.ONBOARDING_COMPLETED);
      
      if (!onboardingCompleted) {
        router.replace('/(auth)/welcome');
        return;
      }

      // Vérifier si l'utilisateur est connecté
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (accessToken) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // En cas d'erreur, rediriger vers l'écran de bienvenue
      router.replace('/(auth)/welcome');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KAYI House</Text>
      <Text style={styles.subtitle}>Votre maison vous attend</Text>
      <ActivityIndicator size="large" color="#FF6B35" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 40,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
});