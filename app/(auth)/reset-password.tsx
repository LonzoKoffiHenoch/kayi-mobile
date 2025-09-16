import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../src/shared';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const phone = params.phone as string;
  const code = params.code as string;

  const handleNavigateBack = () => {
    router.back();
  };

  if (!phone || !code) {
    // Redirect to forgot password if missing params
    router.replace('/(auth)/forgot-password');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Réinitialiser le mot de passe</Text>
        <Text style={styles.subtitle}>
          Code vérifié pour {phone}
        </Text>
        <Text style={styles.message}>
          Cette fonctionnalité sera bientôt disponible. 
          Pour le moment, veuillez contacter le support.
        </Text>
        
        <Button
          title="Retour"
          variant="primary"
          size="large"
          onPress={handleNavigateBack}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    width: '100%',
  },
});