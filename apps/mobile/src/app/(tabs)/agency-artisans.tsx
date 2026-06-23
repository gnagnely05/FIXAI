import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

interface Artisan {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  verificationStatus: string;
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
  phone?: string;
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: '#2E7D32',
  PENDING_VERIFICATION: '#F59E0B',
  SUSPENDED: '#EF4444',
  REGISTERED: '#9CA3AF',
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Actif',
  PENDING_VERIFICATION: 'En vérification',
  SUSPENDED: 'Suspendu',
  REGISTERED: 'Inscrit',
};

export default function AgencyArtisansScreen() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [filtered, setFiltered] = useState<Artisan[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/artisans/my-agency');
      const data: Artisan[] = res.data ?? [];
      setArtisans(data);
      setFiltered(data);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les artisans.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (q: string) => {
    setSearch(q);
    const lower = q.toLowerCase();
    setFiltered(artisans.filter(a =>
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(lower) ||
      (a.specialty ?? '').toLowerCase().includes(lower)
    ));
  };

  const handleContact = (artisan: Artisan) => {
    Alert.alert(
      `${artisan.firstName} ${artisan.lastName}`,
      artisan.phone ? `📞 ${artisan.phone}` : 'Aucun numéro disponible',
      [{ text: 'OK' }]
    );
  };

  const initials = (a: Artisan) => `${a.firstName[0] ?? ''}${a.lastName[0] ?? ''}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un artisan..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#1565C0" />}
      >
        {loading ? (
          <ActivityIndicator color="#1565C0" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👷</Text>
            <Text style={styles.emptyTitle}>Aucun artisan</Text>
            <Text style={styles.emptyText}>
              {search ? 'Aucun résultat pour cette recherche' : 'Aucun artisan affilié pour le moment'}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.countText}>{filtered.length} artisan{filtered.length > 1 ? 's' : ''}</Text>
            {filtered.map(artisan => (
              <View key={artisan.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={[styles.avatar, { backgroundColor: artisan.isAvailable ? '#E8F5E9' : '#F3F4F6' }]}>
                    <Text style={[styles.avatarText, { color: artisan.isAvailable ? '#2E7D32' : '#9CA3AF' }]}>
                      {initials(artisan)}
                    </Text>
                  </View>
                  {artisan.isAvailable && <View style={styles.availDot} />}
                </View>

                <View style={styles.cardCenter}>
                  <Text style={styles.name}>{artisan.firstName} {artisan.lastName}</Text>
                  <Text style={styles.specialty}>
                    {artisan.specialty?.replace(/_/g, ' ') ?? 'Artisan polyvalent'}
                  </Text>
                  {artisan.rating != null && artisan.rating > 0 && (
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.ratingText}>{artisan.rating.toFixed(1)}</Text>
                      {artisan.reviewCount != null && <Text style={styles.reviewCount}>({artisan.reviewCount} avis)</Text>}
                    </View>
                  )}
                </View>

                <View style={styles.cardRight}>
                  <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLOR[artisan.verificationStatus] ?? '#9CA3AF') + '20' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLOR[artisan.verificationStatus] ?? '#9CA3AF' }]}>
                      {STATUS_LABEL[artisan.verificationStatus] ?? artisan.verificationStatus}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.contactBtn} onPress={() => handleContact(artisan)}>
                    <Ionicons name="call-outline" size={16} color="#1565C0" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    margin: 12, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  content: { paddingHorizontal: 12, paddingBottom: 40 },
  countText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600', marginBottom: 10 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardLeft: { position: 'relative', marginRight: 12 },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800' },
  availDot: { position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#2E7D32', borderWidth: 1.5, borderColor: '#fff' },
  cardCenter: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#111827' },
  specialty: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#F59E0B' },
  reviewCount: { fontSize: 11, color: '#9CA3AF' },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  contactBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
});
