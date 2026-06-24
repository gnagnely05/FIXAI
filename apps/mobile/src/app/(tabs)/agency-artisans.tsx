import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  TextInput, Alert, Modal,
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
  user?: { id: string; verificationStatus: string; phone?: string };
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: '#2E7D32',
  PENDING_VERIFICATION: '#F59E0B',
  IDENTITY_VERIFIED: '#3B82F6',
  SUSPENDED: '#EF4444',
  REGISTERED: '#9CA3AF',
  DOCS_SUBMITTED: '#8B5CF6',
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Actif',
  PENDING_VERIFICATION: 'En vérification',
  IDENTITY_VERIFIED: 'Vérifié',
  SUSPENDED: 'Suspendu',
  REGISTERED: 'Inscrit',
  DOCS_SUBMITTED: 'Docs soumis',
};

export default function AgencyArtisansScreen() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [filtered, setFiltered] = useState<Artisan[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionTarget, setActionTarget] = useState<Artisan | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/artisans/my-agency');
      const data: Artisan[] = res.data ?? [];
      setArtisans(data);
      applySearch(data, search);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les artisans.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const applySearch = (data: Artisan[], q: string) => {
    const lower = q.toLowerCase();
    setFiltered(!q ? data : data.filter(a =>
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(lower) ||
      (a.specialty ?? '').toLowerCase().includes(lower),
    ));
  };

  const handleSearch = (q: string) => { setSearch(q); applySearch(artisans, q); };

  const doAction = async (action: 'validate' | 'suspend' | 'remove') => {
    if (!actionTarget) return;
    setActing(true);
    try {
      if (action === 'validate') {
        await api.patch(`/artisans/${actionTarget.id}/validate`);
        Alert.alert('Succès', `${actionTarget.firstName} a été validé(e).`);
      } else if (action === 'suspend') {
        if (!suspendReason.trim()) { Alert.alert('Requis', 'Précisez le motif de suspension.'); setActing(false); return; }
        await api.patch(`/artisans/${actionTarget.id}/suspend`, { reason: suspendReason.trim() });
        Alert.alert('Suspendu', `${actionTarget.firstName} a été suspendu(e).`);
      } else {
        await api.delete(`/artisans/${actionTarget.id}/affiliate`);
        Alert.alert('Désaffilié', `${actionTarget.firstName} a été retiré(e) de votre organisation.`);
      }
      setActionTarget(null);
      setSuspendReason('');
      load();
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Action impossible.');
    } finally {
      setActing(false);
    }
  };

  const confirmRemove = (a: Artisan) => {
    Alert.alert(
      'Désaffilier',
      `Retirer ${a.firstName} ${a.lastName} de votre organisation ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Désaffilier', style: 'destructive', onPress: () => { setActionTarget(a); doAction('remove'); } },
      ],
    );
  };

  const vStatus = (a: Artisan) => a.user?.verificationStatus ?? a.verificationStatus;
  const initials = (a: Artisan) => `${a.firstName[0] ?? ''}${a.lastName[0] ?? ''}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
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
              {search ? 'Aucun résultat' : 'Aucun artisan affilié pour le moment'}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.countText}>{filtered.length} artisan{filtered.length > 1 ? 's' : ''}</Text>
            {filtered.map(artisan => {
              const status = vStatus(artisan);
              const isActive = status === 'ACTIVE';
              const isSuspended = status === 'SUSPENDED';

              return (
                <View key={artisan.id} style={styles.card}>
                  {/* Infos artisan */}
                  <View style={styles.cardTop}>
                    <View style={[styles.avatar, { backgroundColor: isActive ? '#E8F5E9' : isSuspended ? '#FFEBEE' : '#F3F4F6' }]}>
                      <Text style={[styles.avatarText, { color: isActive ? '#2E7D32' : isSuspended ? '#B71C1C' : '#9CA3AF' }]}>
                        {initials(artisan)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{artisan.firstName} {artisan.lastName}</Text>
                      <Text style={styles.specialty}>{artisan.specialty?.replace(/_/g, ' ') ?? 'Artisan polyvalent'}</Text>
                      {artisan.rating != null && artisan.rating > 0 && (
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text style={styles.ratingText}>{artisan.rating.toFixed(1)}</Text>
                          {artisan.reviewCount != null && <Text style={styles.reviewCount}>({artisan.reviewCount} avis)</Text>}
                        </View>
                      )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLOR[status] ?? '#9CA3AF') + '20' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLOR[status] ?? '#9CA3AF' }]}>
                        {STATUS_LABEL[status] ?? status}
                      </Text>
                    </View>
                  </View>

                  {/* Actions — Règle 1 */}
                  <View style={styles.actionsRow}>
                    {!isActive && !isSuspended && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' }]}
                        onPress={() => { setActionTarget(artisan); doAction('validate'); }}>
                        <Ionicons name="checkmark-circle-outline" size={15} color="#2E7D32" />
                        <Text style={[styles.actionBtnText, { color: '#2E7D32' }]}>Valider</Text>
                      </TouchableOpacity>
                    )}
                    {isActive && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFF8E1', borderColor: '#F59E0B' }]}
                        onPress={() => setActionTarget(artisan)}>
                        <Ionicons name="pause-circle-outline" size={15} color="#B45309" />
                        <Text style={[styles.actionBtnText, { color: '#B45309' }]}>Suspendre</Text>
                      </TouchableOpacity>
                    )}
                    {isSuspended && (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' }]}
                        onPress={() => { setActionTarget(artisan); doAction('validate'); }}>
                        <Ionicons name="refresh-circle-outline" size={15} color="#2E7D32" />
                        <Text style={[styles.actionBtnText, { color: '#2E7D32' }]}>Réactiver</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFEBEE', borderColor: '#EF4444' }]}
                      onPress={() => confirmRemove(artisan)}>
                      <Ionicons name="remove-circle-outline" size={15} color="#EF4444" />
                      <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Désaffilier</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Modal suspension */}
      <Modal visible={!!actionTarget && !acting} transparent animationType="slide" onRequestClose={() => { setActionTarget(null); setSuspendReason(''); }}>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.header}>
              <Text style={modal.title}>Suspendre {actionTarget?.firstName}</Text>
              <TouchableOpacity onPress={() => { setActionTarget(null); setSuspendReason(''); }}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={modal.subtitle}>Précisez le motif de suspension (obligatoire)</Text>
            <TextInput
              style={modal.input}
              placeholder="Ex : non-respect des délais, plaintes répétées..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              value={suspendReason}
              onChangeText={setSuspendReason}
            />
            <TouchableOpacity style={modal.suspendBtn} onPress={() => doAction('suspend')} activeOpacity={0.85}>
              <Text style={modal.suspendBtnText}>Confirmer la suspension</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800' },
  name: { fontSize: 14, fontWeight: '700', color: '#111827' },
  specialty: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#F59E0B' },
  reviewCount: { fontSize: 11, color: '#9CA3AF' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5 },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 17, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 14 },
  input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, padding: 14, fontSize: 14, color: '#111827', minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  suspendBtn: { backgroundColor: '#EF4444', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  suspendBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
