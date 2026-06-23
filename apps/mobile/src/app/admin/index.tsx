import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

interface Stats {
  pendingCount: number;
  escrow: { totalFunded: number; pendingEscrow: number };
  commission: { fixaiRate: number; agencyRate: number; artisanRate: number };
}

const MENU = [
  { id: 'verifications', label: 'Vérifications KYC', icon: '✅', color: '#2E7D32', desc: 'Approuver / rejeter les inscriptions' },
  { id: 'commission', label: 'Commissions', icon: '💰', color: '#E65100', desc: 'Configurer les taux fixAI / agence' },
  { id: 'escrow', label: 'Escrow & Paiements', icon: '🏦', color: '#1565C0', desc: 'Vue globale des fonds en escrow' },
  { id: 'disputes', label: 'Litiges', icon: '⚠️', color: '#B71C1C', desc: 'Gérer les commandes disputées' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const [veriRes, escrowRes, commRes] = await Promise.all([
        api.get('/admin/verifications'),
        api.get('/admin/escrow-overview'),
        api.get('/admin/commission'),
      ]);
      setStats({
        pendingCount: veriRes.data.users?.length ?? 0,
        escrow: escrowRes.data,
        commission: commRes.data,
      });
    } catch (e: any) {
      Alert.alert('Erreur', 'Impossible de charger les statistiques.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const onRefresh = () => { setRefreshing(true); loadStats(); };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Confirmer la déconnexion ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1565C0" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.adminName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.adminRole}>Administrateur fixAI</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        {/* Stats cards */}
        {loading ? (
          <ActivityIndicator size="large" color="#1565C0" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.statValue}>{stats?.pendingCount ?? 0}</Text>
              <Text style={styles.statLabel}>En attente{'\n'}de vérification</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.statValue}>
                {stats?.escrow.pendingEscrow
                  ? `${(stats.escrow.pendingEscrow / 1000).toFixed(0)}k`
                  : '0'}
              </Text>
              <Text style={styles.statLabel}>FCFA en{'\n'}escrow</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FFF8E1' }]}>
              <Text style={styles.statValue}>
                {stats?.commission ? `${(stats.commission.fixaiRate * 100).toFixed(0)}%` : '—'}
              </Text>
              <Text style={styles.statLabel}>Commission{'\n'}fixAI</Text>
            </View>
          </View>
        )}

        {/* Menu */}
        <Text style={styles.sectionTitle}>Gestion</Text>
        {MENU.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuCard}
            onPress={() => router.push(`/admin/${item.id}` as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
              <Text style={styles.menuEmoji}>{item.icon}</Text>
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: item.color }]}>{item.label}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Text style={[styles.menuArrow, { color: item.color }]}>›</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.version}>fixAI Admin v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: '#1565C0', borderRadius: 20, padding: 20, marginBottom: 20,
  },
  greeting: { color: '#BBDEFB', fontSize: 13, marginBottom: 2 },
  adminName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  adminRole: { color: '#90CAF9', fontSize: 12, marginTop: 2 },
  logoutBtn: { backgroundColor: '#ffffff22', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center', lineHeight: 15 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 12 },
  menuCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  menuIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuEmoji: { fontSize: 24 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  menuDesc: { fontSize: 12, color: '#6B7280' },
  menuArrow: { fontSize: 28 },
  version: { textAlign: 'center', color: '#D1D5DB', fontSize: 12, marginTop: 24 },
});
