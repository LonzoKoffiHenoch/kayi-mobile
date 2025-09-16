import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.welcomeText}>Trouvez votre logement idéal</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666666" />
          <Text style={styles.searchPlaceholder}>Rechercher un logement...</Text>
          <Ionicons name="options-outline" size={20} color="#666666" />
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#E8F4FD' }]}>
                <Ionicons name="home" size={24} color="#1976D2" />
              </View>
              <Text style={styles.quickActionText}>Louer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="add-circle" size={24} color="#F57C00" />
              </View>
              <Text style={styles.quickActionText}>Publier</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E8' }]}>
                <Ionicons name="card" size={24} color="#388E3C" />
              </View>
              <Text style={styles.quickActionText}>FLEX-RENT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="location" size={24} color="#C2185B" />
              </View>
              <Text style={styles.quickActionText}>Proximité</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Properties */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Propriétés récentes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.propertyCard}>
            <View style={styles.propertyImage} />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle}>Appartement 2 pièces - Cocody</Text>
              <Text style={styles.propertyLocation}>Riviera Golf, Abidjan</Text>
              <Text style={styles.propertyPrice}>150 000 FCFA/mois</Text>
              <View style={styles.propertyTags}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>FLEX-RENT</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Mobile Money</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Featured */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À la une</Text>
          <View style={styles.featuredCard}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>FLEX-RENT disponible !</Text>
              <Text style={styles.featuredSubtitle}>
                Payez votre loyer en plusieurs fois avec notre solution innovante
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666666',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#666666',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  propertyImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
  },
  propertyInfo: {
    gap: 4,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666666',
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: 4,
  },
  propertyTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FF6B35',
  },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F2',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});