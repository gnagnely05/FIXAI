import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ArtisanCard } from '../../components/artisan/ArtisanCard';
import { api } from '../../services/api';
import type { Artisan } from '@fixai/shared';

interface ServiceCategory {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'PLOMBERIE', label: 'Plomberie', icon: 'water', color: '#3B82F6' },
  { id: 'ELECTRICITE', label: 'Électricité', icon: 'flash', color: '#F59E0B' },
  { id: 'MACONNERIE', label: 'Maçonnerie', icon: 'home', color: '#8B5CF6' },
  { id: 'MENUISERIE', label: 'Menuiserie', icon: 'construct', color: '#10B981' },
  { id: 'PEINTURE', label: 'Peinture', icon: 'color-palette', color: '#EC4899' },
  { id: 'DECORATION', label: 'Décoration', icon: 'star', color: '#FF6B00' },
];

export default function HomeScreen() {
  const [featuredArtisans, setFeaturedArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedArtisans();
  }, []);

  const loadFeaturedArtisans = async () => {
    try {
      const response = await api.get<{ artisans: Artisan[] }>('/artisans?isVerified=true&limit=5');
      setFeaturedArtisans(response.data.artisans);
    } catch {
      // Use empty state on error
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push({ pathname: '/(tabs)/search', params: { specialty: categoryId } });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Banner */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Trouvez l'artisan idéal</Text>
        <Text style={styles.heroSubtitle}>
          Des professionnels vérifiés en Côte d'Ivoire
        </Text>
        <TouchableOpacity style={styles.searchButton} onPress={() => router.push('/(tabs)/search')}>
          <Ionicons name="search" size={18} color="#FF6B00" />
          <Text style={styles.searchButtonText}>Rechercher un artisan...</Text>
        </TouchableOpacity>
      </View>

      {/* Main Service Tiles */}
      <View style={styles.serviceTiles}>
        <TouchableOpacity style={[styles.serviceTile, styles.tilePrimary]} onPress={() => router.push('/depannage/step1-description')}>
          <View style={styles.tileUrgentBadge}><Text style={styles.tileUrgentBadgeText}>URGENT</Text></View>
          <Ionicons name="flash" size={32} color="#fff" style={styles.tileIcon} />
          <Text style={styles.tileTitleLarge}>Dépannage</Text>
          <Text style={styles.tileSubtitle}>Intervention rapide</Text>
        </TouchableOpacity>
        <View style={styles.tileColumn}>
          <TouchableOpacity style={[styles.serviceTileSmall, styles.tileIndigo]} onPress={() => router.push('/decoration')}>
            <Ionicons name="sparkles" size={22} color="#fff" />
            <Text style={styles.tileTitleSmall}>Décoration IA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.serviceTileSmall, styles.tileGreen]} onPress={() => router.push('/renovation')}>
            <Ionicons name="construct" size={22} color="#fff" />
            <Text style={styles.tileTitleSmall}>Rénovation</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Feature Banner */}
      <TouchableOpacity style={styles.aiBanner}>
        <View style={styles.aiBannerContent}>
          <Ionicons name="sparkles" size={32} color="#FF6B00" />
          <View style={styles.aiBannerText}>
            <Text style={styles.aiBannerTitle}>FixAI Décoration</Text>
            <Text style={styles.aiBannerSubtitle}>
              Visualisez votre projet avec l'IA
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FF6B00" />
      </TouchableOpacity>

      {/* Service Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nos services</Text>
        <View style={styles.categoriesGrid}>
          {SERVICE_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category.id)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                <Ionicons name={category.icon} size={28} color={category.color} />
              </View>
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Artisans */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Artisans certifiés</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#FF6B00" style={styles.loader} />
        ) : (
          <FlatList
            data={featuredArtisans}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.artisanList}
            renderItem={({ item }) => (
              <ArtisanCard
                artisan={item}
                onPress={() => router.push({ pathname: '/artisan/[id]', params: { id: item.id } })}
                style={styles.artisanCard}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Aucun artisan disponible pour le moment</Text>
            }
          />
        )}
      </View>

      {/* How it works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comment ça marche ?</Text>
        {[
          { step: '1', title: 'Choisissez un service', desc: 'Plomberie, électricité, peinture...', icon: 'search' },
          { step: '2', title: 'Sélectionnez un artisan', desc: 'Profils vérifiés avec avis clients', icon: 'person' },
          { step: '3', title: 'Payez en sécurité', desc: 'Escrow Orange Money, MTN Money', icon: 'shield-checkmark' },
          { step: '4', title: 'Travail terminé', desc: 'Libérez le paiement après validation', icon: 'checkmark-circle' },
        ].map((item) => (
          <View key={item.step} style={styles.howItWorksItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{item.step}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  hero: {
    backgroundColor: '#FF6B00',
    padding: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  aiBanner: {
    margin: 16,
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  aiBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiBannerText: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  aiBannerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  seeAll: {
    color: '#FF6B00',
    fontWeight: '600',
    fontSize: 14,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  artisanList: {
    gap: 12,
  },
  artisanCard: {
    width: 240,
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  howItWorksItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  stepDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  serviceTiles: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 0 },
  serviceTile: { flex: 1.2, borderRadius: 20, padding: 16, minHeight: 150, justifyContent: 'flex-end', overflow: 'hidden' },
  tilePrimary: { backgroundColor: '#EF4444' },
  tileColumn: { flex: 1, gap: 10 },
  serviceTileSmall: { flex: 1, borderRadius: 16, padding: 14, justifyContent: 'center', alignItems: 'flex-start', gap: 6 },
  tileIndigo: { backgroundColor: '#6366F1' },
  tileGreen: { backgroundColor: '#10B981' },
  tileIcon: { marginBottom: 8 },
  tileUrgentBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tileUrgentBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  tileTitleLarge: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 2 },
  tileSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.85)" },
  tileTitleSmall: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
