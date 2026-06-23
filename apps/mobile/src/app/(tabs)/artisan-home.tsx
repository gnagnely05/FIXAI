import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

interface Stats {
  totalMissions: number;
  pendingMissions: number;
  completedMissions: number;
  rating: number;
  reviewCount: number;
  walletBalance: number;
}

interface Mission {
  id: string;
  description: string;
  status: string;
  scheduledAt: string;
  escrowAmount: number;
  client?: { firstName: string; lastName: string };
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

export default function ArtisanHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMissions, setRecentMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/orders/my');
      const orders: Mission[] = res.data ?? [];
      const pending = orders.filter(o => ['PENDING', 'CONFIRMED'].includes(o.status));
      const completed = orders.filter(o => o.status === 'COMPLETED');
      setStats({
        totalMissions: orders.length,
        pendingMissions: pending.length,
        completedMissions: completed.length,
        rating: (user as any)?.artisanProfile?.rating ?? 0,
        reviewCount: (user as any)?.artisanProfile?.reviewCount ?? 0,
        walletBalance: user?.walletBalance ?? 0,
      });
      setRecentMissions(orders.slice(0, 4));
    } catch {
      setStats({ totalMissions: 0, pendingMissions: 0, completedMissions: 0, rating: 0, reviewCount: 0, walletBalance: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const verificationStatus = (user as any)?.verificationStatus ?? '';
  const isActive = verificationStatus === 'ACTIVE';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2E7D32" />}
      >
        {/* Greeting card */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingHi}>Bonjour 👋</Text>
            <Text style={styles.greetingName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.greetingRole}>Artisan · {(user as any)?.specialty?.replace(/_/g, ' ') ?? 'fixAI'}</Text>
          </View>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
          </View>
        </View>

        {/* Verification alert */}
        {!isActive && (
          <View style={styles.alertBox}>
            <Ionicons name="warning-outline" size={20} color="#B45309" />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Compte en cours de vérification</Text>
              <Text style={styles.alertText}>Votre compte sera activé après validation de vos documents par fixAI.</Text>
            </View>
          </View>
        )}

        {/* Stats */}
        {loading ? <ActivityIndicator color="#2E7D32" style={{ marginTop: 20 }} /> : (
          <View style={styles.statsGrid}>
            <StatCard label="Missions totales" value={String(stats?.totalMissions ?? 0)} icon="briefcase" color="#1565C0" />
            <StatCard label="En attente" value={String(stats?.pendingMissions ?? 0)} icon="time" color="#F59E0B" />
            <StatCard label="Terminées" value={String(stats?.completedMissions ?? 0)} icon="checkmark-circle" color="#2E7D32" />
            <StatCard label="Note" value={stats?.rating ? stats.rating.toFixed(1) : '—'} icon="star" color="#F97316" sub={stats?.reviewCount ? `${stats.reviewCount} avis` : undefined} />
          </View>
        )}

        {/* Wallet */}
        <TouchableOpacity style={styles.walletCard} activeOpacity={0.85}>
          <View>
            <Text style={styles.walletLabel}>Solde disponible</Text>
            <Text style={styles.walletAmount}>{(stats?.walletBalance ?? 0).toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={styles.walletBtn}>
            <Text style={styles.walletBtnText}>Retirer</Text>
          </View>
        </TouchableOpacity>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsRow}>
          <QuickAction icon="toggle" label="Disponibilité" color="#2E7D32" onPress={() => router.push('/(tabs)/artisan-availability' as any)} />
          <QuickAction icon="briefcase" label="Mes missions" color="#1565C0" onPress={() => router.push('/(tabs)/artisan-missions' as any)} />
          <QuickAction icon="person" label="Mon profil" color="#7B1FA2" onPress={() => router.push('/(tabs)/profile' as any)} />
          <QuickAction icon="star" label="Mes avis" color="#F97316" onPress={() => {}} />
        </View>

        {/* Recent missions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Missions récentes</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/artisan-missions' as any)}>
            <Text style={styles.seeAll}>Voir tout →</Text>
          </TouchableOpacity>
        </View>

        {recentMissions.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Aucune mission pour le moment</Text>
          </View>
        ) : (
          recentMissions.map(mission => (
            <View key={mission.id} style={styles.missionCard}>
              <View style={styles.missionLeft}>
                <Text style={styles.missionDesc} numberOfLines={2}>{mission.description}</Text>
                <Text style={styles.missionClient}>
                  {mission.client ? `👤 ${mission.client.firstName} ${mission.client.lastName}` : 'Client inconnu'}
                </Text>
                <Text style={styles.missionDate}>{new Date(mission.scheduledAt).toLocaleDateString('fr-FR')}</Text>
              </View>
              <View style={styles.missionRight}>
                <View style={[styles.missionStatus, { backgroundColor: (STATUS_COLOR[mission.status] ?? '#9CA3AF') + '20' }]}>
                  <Text style={[styles.missionStatusText, { color: STATUS_COLOR[mission.status] ?? '#9CA3AF' }]}>
                    {STATUS_LABEL[mission.status] ?? mission.status}
                  </Text>
                </View>
                <Text style={styles.missionAmount}>{Number(mission.escrowAmount).toLocaleString('fr-FR')}</Text>
                <Text style={styles.missionAmountUnit}>FCFA</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon, color, sub }: { label: string; value: string; icon: IoniconName; color: string; sub?: string }) {
  return (
    <View style={[sCard.card, { borderColor: color + '30' }]}>
      <Ionicons name={icon} size={20} color={color} style={{ marginBottom: 6 }} />
      <Text style={[sCard.value, { color }]}>{value}</Text>
      {sub && <Text style={sCard.sub}>{sub}</Text>}
      <Text style={sCard.label}>{label}</Text>
    </View>
  );
}
type IoniconName = keyof typeof Ionicons.glyphMap;

function QuickAction({ icon, label, color, onPress }: { icon: IoniconName; label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={qa.btn} onPress={onPress} activeOpacity={0.8}>
      <View style={[qa.icon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={qa.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const sCard = StyleSheet.create({
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1.5, alignItems: 'center' },
  value: { fontSize: 22, fontWeight: '900' },
  sub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  label: { fontSize: 11, color: '#6B7280', marginTop: 4, fontWeight: '600', textAlign: 'center' },
});

const qa = StyleSheet.create({
  btn: { alignItems: 'center', flex: 1 },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  label: { fontSize: 11, color: '#374151', fontWeight: '600', textAlign: 'center' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 40 },
  greetingCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#2E7D32', borderRadius: 20, padding: 20, marginBottom: 16,
  },
  greetingLeft: { flex: 1 },
  greetingHi: { color: '#A5D6A7', fontSize: 13, marginBottom: 2 },
  greetingName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  greetingRole: { color: '#81C784', fontSize: 12, marginTop: 2 },
  avatarBox: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#ffffff30', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  alertBox: { flexDirection: 'row', gap: 10, backgroundColor: '#FFF8E1', borderRadius: 14, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#F59E0B', alignItems: 'flex-start' },
  alertTitle: { fontSize: 13, fontWeight: '700', color: '#B45309', marginBottom: 2 },
  alertText: { fontSize: 12, color: '#92400E', lineHeight: 18 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  walletCard: {
    backgroundColor: '#1565C0', borderRadius: 18, padding: 18, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  walletLabel: { color: '#90CAF9', fontSize: 12, marginBottom: 4 },
  walletAmount: { color: '#fff', fontSize: 22, fontWeight: '900' },
  walletBtn: { backgroundColor: '#ffffff22', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  walletBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  seeAll: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  empty: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 14, color: '#6B7280' },
  missionCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  missionLeft: { flex: 1, marginRight: 10 },
  missionDesc: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  missionClient: { fontSize: 12, color: '#6B7280', marginBottom: 3 },
  missionDate: { fontSize: 11, color: '#9CA3AF' },
  missionRight: { alignItems: 'flex-end' },
  missionStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 6 },
  missionStatusText: { fontSize: 11, fontWeight: '700' },
  missionAmount: { fontSize: 15, fontWeight: '800', color: '#111827' },
  missionAmountUnit: { fontSize: 10, color: '#9CA3AF' },
});
