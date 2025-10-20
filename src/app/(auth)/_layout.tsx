import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../features/auth/hooks/useAuth';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to main app
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render auth screens if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Auth Stack Navigator */}
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="login" 
          options={{
            title: 'Connexion',
          }}
        />
        <Stack.Screen 
          name="register" 
          options={{
            title: 'Inscription',
          }}
        />
        <Stack.Screen 
          name="verify-sms" 
          options={{
            title: 'Vérification SMS',
            gestureEnabled: false, // Prevent going back during verification
          }}
        />
        <Stack.Screen 
          name="forgot-password" 
          options={{
            title: 'Mot de passe oublié',
          }}
        />
        <Stack.Screen 
          name="reset-password" 
          options={{
            title: 'Réinitialiser le mot de passe',
            gestureEnabled: false,
          }}
        />
      </Stack>
    </SafeAreaView>
  );
}