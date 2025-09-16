import { View, Text, TouchableOpacity, StyleSheet, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push('/(auth)/register');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo et titre */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="home" size={60} color="#FF6B35" />
          </View>
          <Text style={styles.title}>KAYI House</Text>
          <Text style={styles.subtitle}>
            Trouvez votre logement idéal en Côte d'Ivoire avec des solutions de paiement flexibles
          </Text>
        </View>

        {/* Fonctionnalités */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="search" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>Recherchez des propriétés</Text>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="card" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>Mobile Money & FLEX-RENT</Text>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="location" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>Géolocalisation précise</Text>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Commencer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
            <Text style={styles.secondaryButtonText}>J'ai déjà un compte</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  features: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF5F2',
    borderRadius: 12,
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 16,
    fontWeight: '500',
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '500',
  },
});