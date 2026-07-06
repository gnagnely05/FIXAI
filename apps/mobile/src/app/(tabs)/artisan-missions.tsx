import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

interface Mission {
  id: string;
  description: string;
  status: string;
  scheduledAt: string;
  escrowAmount: number;
  diagnosticFeeXof?: number;
  address?: string;
  imageUrls?: string;
  client?: { firstName: string; lastName: string; phone?: string };
}

function parseImages(raw?: string): string[] {
  if (!raw) return [];
  try { const a = JSON.parse(raw); return Array.isArray(a) ? a : []; } catch { return []; }
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#F59E0B',
  CONFIRMED: '#3B82F6',
  IN_PROGRESS: '#8B5CF6',
  COMPLETED: '#2E7D32',
  CANCELLED: '#EF4444',
  DISPUTED: '#F97316',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  DISPUTED: 'Litige',
};

const FILTERS = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'PENDING', label: 'En attente' },
  { key: 'CONFIRMED', label: 'Confirmées' },
  { key: 'IN_PROGRESS', label: 'En cours' },
  { key: 'COMPLETED', label: 'Terminées' },
];

export default function ArtisanMissionsScreen() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filtered, setFiltered] = useState<Mission[]>([]);
  const [diagnostics, setDiagnostics] = useState<Mission[]>([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [res, diag] = await Promise.all([
        api.get('/orders/my'),
        api.get('/orders/diagnostics/available').catch(() => ({ data: [] })),
      ]);
      const data: Mission[] = res.data ?? [];
      setMissions(data);
      setDiagnostics(diag.data ?? []);
      applyFilter(data, activeFilter);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les missions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await api.patch(`/orders/${id}/accept-diagnostic`, {});
      load();
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Impossible d\'accepter ce diagnostic.');
    }
  };

  const applyFilter = (data: Mission[], key: string) => {
    setFiltered(key === 'ALL' ? data : data.filter(m => m.status === key));
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (key: string) => {
    setActiveFilter(key);
    applyFilter(missions, key);
  };

  const handleAction = async (id: string, action: 'confirm' | 'start' | 'complete') => {
    const map = { confirm: 'CONFIRMED', start: 'IN_PROGRESS', complete: 'COMPLETED' };
    try {
      await api.patch(`/orders/${id}/status`, { status: map[action] });
      load();
    } catch {
      Alert.alert('Erreur', 'Action impossible.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Filter bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
            onPress={() => handleFilter(f.key)}
          >
            <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2E7D32" />}
      >
        {/* Diagnostics disponibles à accepter */}
        {activeFilter === 'ALL' && diagnostics.length > 0 && (
          <View style={styles.diagSection}>
            <Text style={styles.diagSectionTitle}>🔧 Diagnostics à réaliser</Text>
            {diagnostics.map(d => (
              <View key={d.id} style={[styles.card, styles.diagCard]}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.desc} numberOfLines={2}>{d.description}</Text>
                    {d.address && <Text style={styles.address}><Ionicons name="location-outline" size={12} color="#9CA3AF" /> {d.address}</Text>}
                  </View>
                  <View style={[styles.badge, { backgroundColor: '#B4530920' }]}>
                    <Text style={[styles.badgeText, { color: '#B45309' }]}>Diagnostic</Text>
                  </View>
                </View>
                {parseImages(d.imageUrls).length > 0 && (
                  <View style={styles.photoRow}>
                    {parseImages(d.imageUrls).map((uri, i) => (
                      <Image key={i} source={{ uri }} style={styles.photoThumb} />
                    ))}
                  </View>
                )}
                <View style={styles.cardBottom}>
                  <Text style={styles.amount}>{Number(d.diagnosticFeeXof ?? d.escrowAmount).toLocaleString('fr-FR')} <Text style={styles.amountUnit}>FCFA</Text></Text>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#B45309' }]} onPress={() => handleAccept(d.id)}>
                    <Text style={styles.actionBtnText}>Accepter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {loading ? (
          <ActivityIndicator color="#2E7D32" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Aucune mission</Text>
            <Text style={styles.emptyText}>Aucune mission dans cette catégorie</Text>
          </View>
        ) : (
          filtered.map(m => (
            <View key={m.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.desc} numberOfLines={2}>{m.description}</Text>
                  {m.address && <Text style={styles.address}><Ionicons name="location-outline" size={12} color="#9CA3AF" /> {m.address}</Text>}
                </View>
                <View style={[styles.badge, { backgroundColor: (STATUS_COLOR[m.status] ?? '#9CA3AF') + '20' }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLOR[m.status] ?? '#9CA3AF' }]}>
                    {STATUS_LABEL[m.status] ?? m.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>
                  👤 {m.client ? `${m.client.firstName} ${m.client.lastName}` : 'Client inconnu'}
                </Text>
                <Text style={styles.metaText}>
                  📅 {new Date(m.scheduledAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.amount}>{Number(m.escrowAmount).toLocaleString('fr-FR')} <Text style={styles.amountUnit}>FCFA</Text></Text>
                <View style={styles.actions}>
                  {m.status === 'PENDING' && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]} onPress={() => handleAction(m.id, 'confirm')}>
                      <Text style={styles.actionBtnText}>Confirmer</Text>
                    </TouchableOpacity>
                  )}
                  {m.status === 'CONFIRMED' && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#8B5CF6' }]} onPress={() => handleAction(m.id, 'start')}>
                      <Text style={styles.actionBtnText}>Démarrer</Text>
                    </TouchableOpacity>
                  )}
                  {m.status === 'IN_PROGRESS' && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2E7D32' }]} onPress={() => handleAction(m.id, 'complete')}>
                      <Text style={styles.actionBtnText}>Terminer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', maxHeight: 52 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent' },
  filterChipActive: { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' },
  filterText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  filterTextActive: { color: '#2E7D32' },
  content: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyText: { fontSize: 13, color: '#9CA3AF' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  desc: { fontSize: 14, fontWeight: '700', color: '#111827', lineHeight: 20 },
  address: { fontSize: 12, color: '#9CA3AF', marginTop: 3 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metaText: { fontSize: 12, color: '#6B7280' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
  amount: { fontSize: 17, fontWeight: '900', color: '#111827' },
  amountUnit: { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  diagSection: { marginBottom: 16 },
  diagSectionTitle: { fontSize: 14, fontWeight: '800', color: '#B45309', marginBottom: 10 },
  diagCard: { borderColor: '#FED7AA', backgroundColor: '#FFFBF5' },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  photoThumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#EEE' },
});
