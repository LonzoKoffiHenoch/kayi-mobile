import React from 'react';
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/features/auth';

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Afficher un écran de chargement pendant la vérification de l'auth
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <View className="items-center">
          <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
            <Text className="text-2xl">🏠</Text>
          </View>
          <Text className="text-orange-600 font-bold text-xl mb-2">KAYI House</Text>
          <Text className="text-lg text-gray-600">Chargement...</Text>
        </View>
      </View>
    );
  }

  // Rediriger vers welcome/login si pas authentifié
  if (!isAuthenticated) {
    return <Redirect href="/welcome" />;
  }

  // Page d'accueil pour utilisateurs connectés
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo/Brand */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl">🏠</Text>
          </View>
          <Text className="text-orange-600 font-bold text-2xl mb-2">
            KAYI House
          </Text>
          <Text className="text-gray-600 text-center">
            Bienvenue dans votre application immobilière
          </Text>
        </View>

        {/* Welcome Message */}
        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Bonjour {user?.firstName} !
          </Text>
          <Text className="text-lg text-gray-600 text-center">
            Prêt à découvrir votre prochain logement ?
          </Text>
        </View>

        {/* User Role Badge */}
        <View className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 mb-8">
          <Text className="text-orange-700 font-medium">
            {user?.role === 'tenant' && '🏡 Locataire'}
            {user?.role === 'landlord' && '🏠 Propriétaire'}
            {user?.role === 'agent' && '👔 Agent immobilier'}
            {user?.role === 'admin' && '⚙️ Administrateur'}
          </Text>
        </View>

        {/* Phone Verification Status */}
        <View className="items-center">
          {user?.isPhoneVerified ? (
            <View className="flex-row items-center bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <Text className="text-green-600 font-medium">
                ✓ Numéro vérifié
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <Text className="text-yellow-600 font-medium">
                ⚠️ Numéro non vérifié
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions - Placeholder for future features */}
        <View className="mt-12 w-full max-w-sm">
          <Text className="text-center text-gray-500 text-sm">
            Fonctionnalités à venir :
          </Text>
          <View className="mt-4 space-y-2">
            <View className="bg-gray-100 rounded-lg p-3">
              <Text className="text-gray-700 text-center">🔍 Rechercher des biens</Text>
            </View>
            <View className="bg-gray-100 rounded-lg p-3">
              <Text className="text-gray-700 text-center">❤️ Mes favoris</Text>
            </View>
            <View className="bg-gray-100 rounded-lg p-3">
              <Text className="text-gray-700 text-center">📝 Mes annonces</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}