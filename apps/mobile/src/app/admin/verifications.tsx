import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verificationStatus: string;
  city?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  REGISTERED: '#9CA3AF',
  DOCS_SUBMITTED: '#F59E0B',
  PENDING_VERIFICATION: '#3B82F6',
  IDENTITY_VERIFIED: '#8B5CF6',
  AFFILIATION_REQUESTED: '#EC4899',
  DOCS_INCOMPLETE: '#EF4444',
};

const ROLE_LABELS: Record<string, string> = {
  ARTISAN: '🔧 Artisan',
  AGENCE_HOTE: '🏢 Agence',
  ENTREPRISE_BTP: '🏗️ BTP',
  BOUTIQUE: '🛍️ Boutique',
  QUINCAILLERIE: '🔩 Quincaillerie',
};

export default function VerificationsScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

  const load = async () => {
    try {
      const res = await api.get('/admin/verifications');
      setUsers(res.data.users ?? []);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les vérifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const quickApprove = async (userId: string, name: string) => {
    Alert.alert(
      'Approuver',
      `Approuver l'étape de vérification de ${name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Approuver ✓',
          onPress: async () => {
            try {
              await api.post('/admin/verify-step', { userId, action: 'APPROVE' });
              setUsers(prev => prev.filter(u => u.id !== userId));
              Alert.alert('Succès', `${name} a été approuvé(e).`);
            } catch (e: any) {
              Alert.alert('Erreur', e?.response?.data?.message ?? 'Action impossible.');
            }
          },
        },
      ]
    );
  };

  const quickReject = async (userId: string, name: string) => {
    Alert.prompt(
      'Rejeter',
      `Raison du rejet pour ${name} :`,
      async (reason) => {
        if (!reason) return;
        try {
          await api.post('/admin/verify-step', { userId, action: 'REJECT', reason });
          setUsers(prev => prev.filter(u => u.id !== userId));
          Alert.alert('Fait', `${name} a été rejeté(e).`);
        } catch (e: any) {
          Alert.alert('Erreur', e?.response?.data?.message ?? 'Action impossible.');
        }
      },
      'plain-text'
    );
  };

  const FILTERS = ['ALL', 'DOCS_SUBMITTED', 'PENDING_VERIFICATION', 'IDENTITY_VERIFIED'];
  const filtered = filter === 'ALL' ? users : users.filter(u => u.verificationStatus === filter);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Filter bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'ALL' ? `Tous (${users.length})` : f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#1565C0" />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#1565C0" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>Aucune vérification en attente</Text>
          </View>
        ) : (
          filtered.map(user => (
            <View key={user.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.firstName[0]}{user.lastName[0]}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{user.firstName} {user.lastName}</Text>
                  <Text style={styles.cardEmail}>{user.email}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.roleTag}>{ROLE_LABELS[user.role] ?? user.role}</Text>
                    {user.city && <Text style={styles.cityTag}>📍 {user.city}</Text>}
                  </View>
                </View>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[user.verificationStatus] ?? '#9CA3AF') + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[user.verificationStatus] ?? '#9CA3AF' }]} />
                <Text style={[styles.statusText, { color: STATUS_COLORS[user.verificationStatus] ?? '#9CA3AF' }]}>
                  {user.verificationStatus.replace(/_/g, ' ')}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => router.push({ pathname: '/admin/user-detail', params: { id: user.id } })}
                >
                  <Text style={styles.detailBtnText}>Voir détail</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => quickApprove(user.id, `${user.firstName} ${user.lastName}`)}
                >
                  <Text style={styles.approveBtnText}>✓ Approuver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => quickReject(user.id, `${user.firstName} ${user.lastName}`)}
                >
                  <Text style={styles.rejectBtnText}>✗</Text>
                </TouchableOpacity>
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
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  filterText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1565C020', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '800', color: '#1565C0' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardEmail: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  cardMeta: { flexDirection: 'row', gap: 8, marginTop: 6 },
  roleTag: { fontSize: 11, color: '#374151', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  cityTag: { fontSize: 11, color: '#6B7280' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginBottom: 12, alignSelf: 'flex-start' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  detailBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center' },
  detailBtnText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  approveBtn: { flex: 2, paddingVertical: 9, borderRadius: 10, backgroundColor: '#2E7D32', alignItems: 'center' },
  approveBtnText: { fontSize: 13, color: '#fff', fontWeight: '700' },
  rejectBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, backgroundColor: '#FFEBEE', alignItems: 'center' },
  rejectBtnText: { fontSize: 13, color: '#B71C1C', fontWeight: '800' },
});
