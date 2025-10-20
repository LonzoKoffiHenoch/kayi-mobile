import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Button } from '@/shared/components';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView 
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 px-6 py-8">
        {/* Header with Logo */}
        <View className="items-center mt-16 mb-12">
          <View className="w-32 h-32 bg-orange-100 rounded-full items-center justify-center mb-6">
            <Text className="text-5xl">🏠</Text>
          </View>
          <Text className="text-orange-600 font-bold text-3xl mb-2">
            KAYI House
          </Text>
          <Text className="text-gray-600 text-lg text-center max-w-sm">
            Votre plateforme immobilière en Côte d'Ivoire
          </Text>
        </View>

        {/* Features */}
        <View className="mb-12">
          <Text className="text-xl font-bold text-gray-900 mb-6 text-center">
            Découvrez, Louez, Investissez
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row items-center p-4 bg-gray-50 rounded-lg">
              <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mr-4">
                <Text className="text-xl">🔍</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Recherche Facile</Text>
                <Text className="text-gray-600 text-sm">
                  Trouvez votre logement idéal en quelques clics
                </Text>
              </View>
            </View>

            <View className="flex-row items-center p-4 bg-gray-50 rounded-lg">
              <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mr-4">
                <Text className="text-xl">📱</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Mobile Money</Text>
                <Text className="text-gray-600 text-sm">
                  Paiements sécurisés avec Orange, MTN, Moov, Wave
                </Text>
              </View>
            </View>

            <View className="flex-row items-center p-4 bg-gray-50 rounded-lg">
              <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mr-4">
                <Text className="text-xl">🛡️</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Sécurisé</Text>
                <Text className="text-gray-600 text-sm">
                  Vérification par SMS, paiements protégés
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4 mb-8 flex gap-4">
          <Button
            onPress={() => router.push('/register')}
            variant="primary"
            size="lg"
            fullWidth
          >
            Créer un compte
          </Button>

          <Button
            onPress={() => router.push('/login')}
            variant="outline"
            size="lg"
            fullWidth
          >
            Se connecter
          </Button>
        </View>

        {/* User Types */}
        <View className="border-t border-gray-200 pt-8">
          <Text className="text-center text-gray-600 mb-4 font-medium">
            Que vous soyez :
          </Text>
          
          <View className="flex-row justify-around">
            <View className="items-center flex-1">
              <Text className="text-2xl mb-2">🏡</Text>
              <Text className="text-sm font-medium text-gray-700">Locataire</Text>
              <Text className="text-xs text-gray-500 text-center">
                Trouvez votre logement
              </Text>
            </View>
            
            <View className="items-center flex-1">
              <Text className="text-2xl mb-2">🏠</Text>
              <Text className="text-sm font-medium text-gray-700">Propriétaire</Text>
              <Text className="text-xs text-gray-500 text-center">
                Louez vos biens
              </Text>
            </View>
            
            <View className="items-center flex-1">
              <Text className="text-2xl mb-2">👔</Text>
              <Text className="text-sm font-medium text-gray-700">Agent</Text>
              <Text className="text-xs text-gray-500 text-center">
                Gérez vos clients
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-8 items-center">
          <Text className="text-xs text-gray-500 text-center leading-4">
            En continuant, vous acceptez nos{' '}
            <Text className="text-orange-600">Conditions d'utilisation</Text>
            {' '}et notre{' '}
            <Text className="text-orange-600">Politique de confidentialité</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}