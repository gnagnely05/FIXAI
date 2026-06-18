import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface NearbyArtisan {
  id: string;
  specialty: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  yearsOfExperience: number;
  user?: { firstName: string; lastName: string; avatarUrl?: string };
}

export default function Step5Artisan() {
  const params = useLocalSearchParams<{ category: string; city: string }>();
  const [artisans, setArtisans] = useState<NearbyArtisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    // Mock data — replace with API call to /depannage/nearby-artisans
    setTimeout(() => {
      setArtisans([
        { id: '1', specialty: params.category, distanceKm: 1.2, rating: 4.8, reviewCount: 47, isAvailable: true, yearsOfExperience: 8, user: { firstName: 'Kouassi', lastName: 'Amon' } },
        { id: '2', specialty: params.category, distanceKm: 2.5, rating: 4.6, reviewCount: 32, isAvailable: true, yearsOfExperience: 5, user: { firstName: 'Yao', lastName: 'Koffi' } },
        { id: '3', specialty: params.category, distanceKm: 3.1, rating: 4.4, reviewCount: 18, isAvailable: true, yearsOfExperience: 3, user: { firstName: 'Adjoua', lastName: 'Kone' } },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleNext = () => {
    if (!selected) return;
    router.push({ pathname: '/depannage/step6-payment', params: { ...params, artisanId: selected } });
  };

  const renderArtisan = ({ item }: { item: NearbyArtisan }) => (
    <TouchableOpacity
      style={[styles.card, selected === item.id && styles.cardSelected]}
      onPress={() => setSelected(item.id)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.user?.firstName?.[0]}{item.user?.lastName?.[0]}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.user?.firstName} {item.user?.lastName}</Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
          <View style={styles.meta}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.rating}>{item.rating} ({item.reviewCount} avis)</Text>
            <Text style={styles.dot}>•</Text>
            <Ionicons name="location-outline" size={14} color="#9CA3AF" />
            <Text style={styles.distance}>{item.distanceKm.toFixed(1)} km</Text>
          </View>
        </View>
        {selected === item.id && <Ionicons name="checkmark-circle" size={24} color="#FF6B00" />}
      </View>
      <View style={styles.tags}>
        <View style={styles.tag}><Text style={styles.tagText}>{item.yearsOfExperience} ans d'expérience</Text></View>
        {item.isAvailable && <View style={[styles.tag, styles.tagGreen]}><Text style={[styles.tagText, styles.tagTextGreen]}>Disponible</Text></View>}
      </View>
    </TouchableOpacity>
  );

  if (loading) return <View style={styles.loader}><ActivityIndicator color="#FF6B00" size="large" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={artisans}
        keyExtractor={(item) => item.id}
        renderItem={renderArtisan}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.stepIndicator}><Text style={styles.stepText}>Étape 5 / 7</Text></View>
            <Text style={styles.title}>{artisans.length} artisan{artisans.length > 1 ? 's' : ''} disponible{artisans.length > 1 ? 's' : ''} près de vous</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Aucun artisan disponible dans votre zone</Text>}
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selected}
        >
          <Text style={styles.nextButtonText}>Choisir cet artisan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16 },
  header: { marginBottom: 16 },
  stepIndicator: { marginBottom: 4 },
  stepText: { color: '#FF6B00', fontWeight: '600', fontSize: 13 },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardSelected: { borderColor: '#FF6B00', backgroundColor: '#FFF7ED' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#111' },
  specialty: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 13, color: '#374151', fontWeight: '500' },
  dot: { color: '#D1D5DB' },
  distance: { fontSize: 13, color: '#6B7280' },
  tags: { flexDirection: 'row', gap: 8, marginTop: 12 },
  tag: { backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  tagGreen: { backgroundColor: '#DCFCE7' },
  tagTextGreen: { color: '#16A34A' },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontSize: 15 },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  nextButton: { backgroundColor: '#FF6B00', borderRadius: 14, padding: 16, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: '#FCA97E' },
  nextButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
