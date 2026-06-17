import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { ArtisanCard } from '../../components/artisan/ArtisanCard';
import { api } from '../../services/api';
import type { Artisan } from '@fixai/shared';

const SPECIALTIES = [
  { id: '', label: 'Tous' },
  { id: 'PLOMBERIE', label: 'Plomberie' },
  { id: 'ELECTRICITE', label: 'Électricité' },
  { id: 'MACONNERIE', label: 'Maçonnerie' },
  { id: 'MENUISERIE', label: 'Menuiserie' },
  { id: 'PEINTURE', label: 'Peinture' },
  { id: 'DECORATION', label: 'Décoration' },
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ specialty?: string }>();
  const [query, setQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(params.specialty ?? '');
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    searchArtisans();
  }, [selectedSpecialty]);

  const searchArtisans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty) params.append('specialty', selectedSpecialty);
      if (query) params.append('city', query);
      const response = await api.get<{ artisans: Artisan[] }>(`/artisans?${params.toString()}`);
      setArtisans(response.data.artisans);
    } catch {
      setArtisans([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Input
          placeholder="Rechercher par ville..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchArtisans}
        />
      </View>

      <FlatList
        horizontal
        data={SPECIALTIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, selectedSpecialty === item.id && styles.filterChipActive]}
            onPress={() => setSelectedSpecialty(item.id)}
          >
            <Text style={[styles.filterChipText, selectedSpecialty === item.id && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color="#FF6B00" style={styles.loader} />
      ) : (
        <FlatList
          data={artisans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ArtisanCard
              artisan={item}
              onPress={() => router.push({ pathname: '/artisan/[id]', params: { id: item.id } })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun artisan trouvé</Text>
              <Text style={styles.emptySubtext}>Essayez d'autres critères de recherche</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  searchBar: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filters: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  filterChipText: { color: '#666', fontWeight: '500' },
  filterChipTextActive: { color: '#fff' },
  loader: { marginTop: 40 },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
});
