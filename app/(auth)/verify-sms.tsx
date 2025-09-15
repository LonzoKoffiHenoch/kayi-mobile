import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function VerifySmsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Vérification SMS</Text>
      <Text style={styles.subtitle}>Saisissez le code reçu par SMS</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});