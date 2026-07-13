import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl, Alert, TextInput, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';

interface Actor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  verificationStatus: string;
  city?: string;
  agencyName?: string;
  shopName?: string;
  createdAt: string;
}

const ROLES = [
  { id: 'ALL', label: 'Tous', icon: '👥' },
  { id: 'ARTISAN', label: 'Artisans', icon: '🔧' },
  { id: 'AGENCE_HOTE', label: 'Agences', icon: '🏢' },
  { id: 'BOUTIQUE', label: 'Boutiques', icon: '🛍️' },
  { id: 'QUINCAILLERIE', label: 'Quincailleries', icon: '🔩' },
  { id: 'ENTREPRISE_BTP', label: 'BTP', icon: '🏗️' },
];

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: '#2E7D32',
  AGENCY_ACTIVE: '#2E7D32',
  SHOP_REGISTERED: '#E65100',
  HARDWARE_REGISTERED: '#4E342E',
  CATALOG_ACTIVE: '#1565C0',
  REGISTERED: '#9CA3AF',
  DOCS_SUBMITTED: '#F59E0B',
  PENDING_VERIFICATION: '#3B82F6',
  IDENTITY_VERIFIED: '#8B5CF6',
  SUSPENDED: '#B71C1C',
  REJECTED: '#EF4444',
};

export default function ActorsScreen() {
  const router = useRouter();
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (search.trim()) params.q = search.trim();
      const res = await api.get('/admin/actors', { params });
      setActors(res.data ?? []);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les acteurs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [roleFilter, search]);

  useEffect(() => { load(); }, [load]);

  const confirmAction = (message: string): boolean => {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? window.confirm(message) : true;
    }
    return true; // sur natif on gère via Alert ci-dessous
  };

  const handleSuspend = async (actor: Actor) => {
    const msg = `Suspendre le compte de ${actor.firstName} ${actor.lastName} ?`;
    const run = async () => {
      try { await api.patch(`/admin/actors/${actor.id}/suspend`); load(); }
      catch (e: any) { Alert.alert('Erreur', e?.response?.data?.message ?? 'Action impossible.'); }
    };
    if (Platform.OS === 'web') { if (confirmAction(msg)) await run(); return; }
    Alert.alert('Suspendre', msg, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Suspendre', style: 'destructive', onPress: run },
    ]);
  };

  const handleActivate = async (actor: Actor) => {
    try {
      await api.patch(`/admin/actors/${actor.id}/activate`);
      load();
    } catch (e: any) { Alert.alert('Erreur', e?.response?.data?.message ?? 'Action impossible.'); }
  };

  const handleDelete = async (actor: Actor) => {
    const msg = `Supprimer définitivement le compte de ${actor.firstName} ${actor.lastName} ? Cette action est irréversible.`;
    const run = async () => {
      try { await api.delete(`/admin/actors/${actor.id}`); setActors(prev => prev.filter(a => a.id !== actor.id)); }
      catch (e: any) { Alert.alert('Erreur', e?.response?.data?.message ?? 'Suppression impossible.'); }
    };
    if (Platform.OS === 'web') { if (confirmAction(msg)) await run(); return; }
    Alert.alert('Supprimer', msg, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: run },
    ]);
  };

  const roleMeta = ROLES.find(r => r.id === roleFilter) ?? ROLES[0];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={v => { setSearch(v); }}
          onSubmitEditing={load}
          placeholder="Rechercher par nom, email..."
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); }}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Role filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {ROLES.map(r => (
          <TouchableOpacity
            key={r.id}
            style={[styles.roleChip, roleFilter === r.id && styles.roleChipActive]}
            onPress={() => setRoleFilter(r.id)}
          >
            <Text style={styles.roleChipIcon}>{r.icon}</Text>
            <Text style={[styles.roleChipText, roleFilter === r.id && styles.roleChipTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#1565C0" />}
      >
        <Text style={styles.countText}>{actors.length} acteur{actors.length !== 1 ? 's' : ''} {roleMeta.id !== 'ALL' ? `— ${roleMeta.label}` : ''}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1565C0" style={{ marginTop: 40 }} />
        ) : actors.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{roleMeta.icon}</Text>
            <Text style={styles.emptyText}>Aucun acteur trouvé</Text>
          </View>
        ) : (
          actors.map(actor => {
            const statusColor = STATUS_COLOR[actor.verificationStatus] ?? '#9CA3AF';
            const isSuspended = actor.verificationStatus === 'SUSPENDED';
            const name = actor.agencyName ?? actor.shopName ?? `${actor.firstName} ${actor.lastName}`;
            return (
              <View key={actor.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.avatar, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.avatarText, { color: statusColor }]}>
                      {actor.firstName[0]}{actor.lastName[0]}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{name}</Text>
                    {(actor.agencyName || actor.shopName) && (
                      <Text style={styles.cardSub}>{actor.firstName} {actor.lastName}</Text>
                    )}
                    <Text style={styles.cardEmail}>{actor.email}</Text>
                    {actor.city && <Text style={styles.cardCity}>📍 {actor.city}</Text>}
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push({ pathname: '/admin/actor-edit', params: { id: actor.id } })}
                  >
                    <Text style={styles.editBtnText}>✏️ Modifier</Text>
                  </TouchableOpacity>

                  {isSuspended ? (
                    <TouchableOpacity style={styles.activateBtn} onPress={() => handleActivate(actor)}>
                      <Text style={styles.activateBtnText}>✓ Activer</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.suspendBtn} onPress={() => handleSuspend(actor)}>
                      <Text style={styles.suspendBtnText}>⏸ Suspendre</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(actor)}>
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  clearSearch: { fontSize: 16, color: '#9CA3AF', paddingHorizontal: 4 },
  filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', maxHeight: 54 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  roleChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  roleChipActive: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  roleChipIcon: { fontSize: 14 },
  roleChipText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  roleChipTextActive: { color: '#fff' },
  content: { padding: 14, paddingBottom: 40 },
  countText: { fontSize: 12, color: '#9CA3AF', marginBottom: 10, fontWeight: '500' },
  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyIcon: { fontSize: 44 },
  emptyText: { fontSize: 15, color: '#6B7280' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '800' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardSub: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  cardEmail: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  cardCity: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: { flex: 2, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: '#1565C0', alignItems: 'center', backgroundColor: '#E3F2FD' },
  editBtnText: { fontSize: 13, color: '#1565C0', fontWeight: '700' },
  suspendBtn: { flex: 2, paddingVertical: 9, borderRadius: 10, backgroundColor: '#FFF8E1', alignItems: 'center', borderWidth: 1.5, borderColor: '#F59E0B' },
  suspendBtnText: { fontSize: 12, color: '#B45309', fontWeight: '700' },
  activateBtn: { flex: 2, paddingVertical: 9, borderRadius: 10, backgroundColor: '#E8F5E9', alignItems: 'center', borderWidth: 1.5, borderColor: '#2E7D32' },
  activateBtnText: { fontSize: 12, color: '#2E7D32', fontWeight: '700' },
  deleteBtn: { width: 42, paddingVertical: 9, borderRadius: 10, backgroundColor: '#FFEBEE', alignItems: 'center' },
  deleteBtnText: { fontSize: 16 },
});
