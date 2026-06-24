import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

interface Request {
  id: string;
  description: string;
  status: string;
  scheduledAt: string;
  escrowAmount: number;
  address?: string;
  client?: { firstName: string; lastName: string; phone?: string };
  artisan?: { id: string; firstName: string; lastName: string; specialty?: string };
}

interface Artisan {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  isAvailable?: boolean;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#F59E0B', CONFIRMED: '#3B82F6', IN_PROGRESS: '#8B5CF6',
  COMPLETED: '#2E7D32', CANCELLED: '#EF4444', DISPUTED: '#F97316',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente', CONFIRMED: 'Confirmée', IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée', CANCELLED: 'Annulée', DISPUTED: 'Litige',
};

const FILTERS = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'PENDING', label: 'En attente' },
  { key: 'CONFIRMED', label: 'Confirmées' },
  { key: 'IN_PROGRESS', label: 'En cours' },
  { key: 'COMPLETED', label: 'Terminées' },
];

export default function AgencyRequestsScreen() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filtered, setFiltered] = useState<Request[]>([]);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignModal, setAssignModal] = useState<Request | null>(null);
  const [assigning, setAssigning] = useState(false);

  const load = async () => {
    try {
      const [reqRes, artRes] = await Promise.all([
        api.get('/orders/my'),
        api.get('/artisans/my-agency'),
      ]);
      const reqs: Request[] = reqRes.data ?? [];
      setRequests(reqs);
      applyFilter(reqs, activeFilter);
      setArtisans(artRes.data ?? []);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les demandes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (data: Request[], key: string) => {
    setFiltered(key === 'ALL' ? data : data.filter(r => r.status === key));
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (key: string) => {
    setActiveFilter(key);
    applyFilter(requests, key);
  };

  const handleAssign = async (requestId: string, artisanId: string) => {
    setAssigning(true);
    try {
      await api.patch(`/orders/${requestId}/assign`, { artisanId });
      setAssignModal(null);
      load();
      // Règle 3 : l'agence hôte assigne mais ne confirme pas — c'est à l'artisan de confirmer
      Alert.alert(
        'Artisan proposé',
        'L\'artisan a été assigné à cette demande. Il devra confirmer sa prise en charge pour valider la mission.',
      );
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Impossible d\'assigner l\'artisan.');
    } finally {
      setAssigning(false);
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#1565C0" />}
      >
        {/* Règle 3 : rappel que l'agence hôte ne peut pas confirmer directement */}
        <View style={styles.ruleBanner}>
          <Ionicons name="information-circle-outline" size={15} color="#1565C0" />
          <Text style={styles.ruleBannerText}>
            En tant qu'agence hôte, vous proposez un artisan. C'est lui qui doit confirmer la mission.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#1565C0" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Aucune demande</Text>
            <Text style={styles.emptyText}>Aucune demande dans cette catégorie</Text>
          </View>
        ) : (
          filtered.map(req => (
            <View key={req.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.desc} numberOfLines={2}>{req.description}</Text>
                  {req.address && (
                    <Text style={styles.address}><Ionicons name="location-outline" size={12} color="#9CA3AF" /> {req.address}</Text>
                  )}
                </View>
                <View style={[styles.badge, { backgroundColor: (STATUS_COLOR[req.status] ?? '#9CA3AF') + '20' }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLOR[req.status] ?? '#9CA3AF' }]}>
                    {STATUS_LABEL[req.status] ?? req.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardMeta}>
                <Text style={styles.metaText}>👤 {req.client ? `${req.client.firstName} ${req.client.lastName}` : 'Client inconnu'}</Text>
                <Text style={styles.metaText}>📅 {new Date(req.scheduledAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</Text>
              </View>

              {req.artisan ? (
                <View style={[styles.assignedRow, req.status === 'PENDING' && styles.assignedRowPending]}>
                  <Ionicons
                    name={req.status === 'PENDING' ? 'time-outline' : 'checkmark-circle'}
                    size={14}
                    color={req.status === 'PENDING' ? '#F59E0B' : '#2E7D32'}
                  />
                  <Text style={[styles.assignedText, req.status === 'PENDING' && { color: '#B45309' }]}>
                    {req.status === 'PENDING' ? 'En attente de confirmation de ' : 'Confirmé par '}
                    {req.artisan.firstName} {req.artisan.lastName}
                    {req.artisan.specialty ? ` · ${req.artisan.specialty.replace(/_/g, ' ')}` : ''}
                  </Text>
                </View>
              ) : req.status === 'PENDING' ? (
                <TouchableOpacity style={styles.assignBtn} onPress={() => setAssignModal(req)}>
                  <Ionicons name="person-add-outline" size={15} color="#1565C0" />
                  <Text style={styles.assignBtnText}>Assigner un artisan</Text>
                </TouchableOpacity>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.amount}>{Number(req.escrowAmount).toLocaleString('fr-FR')} <Text style={styles.amountUnit}>FCFA</Text></Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Assign modal */}
      <Modal visible={!!assignModal} transparent animationType="slide" onRequestClose={() => setAssignModal(null)}>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.header}>
              <Text style={modal.title}>Assigner un artisan</Text>
              <TouchableOpacity onPress={() => setAssignModal(null)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={modal.subtitle} numberOfLines={2}>{assignModal?.description}</Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {artisans.filter(a => a.isAvailable !== false).map(artisan => (
                <TouchableOpacity
                  key={artisan.id}
                  style={modal.artisanRow}
                  onPress={() => assignModal && handleAssign(assignModal.id, artisan.id)}
                  disabled={assigning}
                >
                  <View style={modal.artisanAvatar}>
                    <Text style={modal.artisanInitials}>{artisan.firstName[0]}{artisan.lastName[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={modal.artisanName}>{artisan.firstName} {artisan.lastName}</Text>
                    <Text style={modal.artisanSpec}>{artisan.specialty?.replace(/_/g, ' ') ?? 'Polyvalent'}</Text>
                  </View>
                  {assigning ? <ActivityIndicator size="small" color="#1565C0" /> : (
                    <Ionicons name="chevron-forward" size={18} color="#1565C0" />
                  )}
                </TouchableOpacity>
              ))}
              {artisans.filter(a => a.isAvailable !== false).length === 0 && (
                <Text style={modal.noArtisan}>Aucun artisan disponible</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', maxHeight: 52 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent' },
  filterChipActive: { backgroundColor: '#E3F2FD', borderColor: '#1565C0' },
  filterText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  filterTextActive: { color: '#1565C0' },
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
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metaText: { fontSize: 12, color: '#6B7280' },
  ruleBanner: { flexDirection: 'row', gap: 8, backgroundColor: '#E3F2FD', borderRadius: 12, padding: 10, marginBottom: 12, alignItems: 'flex-start' },
  ruleBannerText: { fontSize: 12, color: '#1565C0', flex: 1, lineHeight: 17 },
  assignedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FDF4', borderRadius: 10, padding: 8, marginBottom: 10 },
  assignedRowPending: { backgroundColor: '#FFF8E1' },
  assignedText: { fontSize: 12, color: '#2E7D32', fontWeight: '600', flex: 1 },
  assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: '#1565C0', borderRadius: 10, padding: 8, marginBottom: 10, justifyContent: 'center' },
  assignBtnText: { fontSize: 13, color: '#1565C0', fontWeight: '700' },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
  amount: { fontSize: 16, fontWeight: '900', color: '#111827' },
  amountUnit: { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 17, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 18 },
  artisanRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  artisanAvatar: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  artisanInitials: { fontSize: 14, fontWeight: '800', color: '#1565C0' },
  artisanName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  artisanSpec: { fontSize: 12, color: '#6B7280' },
  noArtisan: { textAlign: 'center', color: '#9CA3AF', paddingVertical: 20, fontSize: 14 },
});
