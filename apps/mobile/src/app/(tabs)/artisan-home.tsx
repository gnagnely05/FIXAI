import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { COLORS, SHADOW, RADIUS } from '../../theme';

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
  PENDING: '#D97706',
  CONFIRMED: '#1565C0',
  IN_PROGRESS: '#7C3AED',
  COMPLETED: '#1B8A2E',
  CANCELLED: '#DC2626',
  DISPUTED: '#EA580C',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  DISPUTED: 'Litige',
};

type IoniconName = keyof typeof Ionicons.glyphMap;

function StatCard({ label, value, icon, color, sub }: { label: string; value: string; icon: IoniconName; color: string; sub?: string }) {
  return (
    <View style={[sCard.card, { borderLeftColor: color }]}>
      <View style={[sCard.iconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={sCard.value}>{value}</Text>
      {sub && <Text style={sCard.sub}>{sub}</Text>}
      <Text style={sCard.label}>{label}</Text>
    </View>
  );
}

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
  const specialty = (user as any)?.specialty?.replace(/_/g, ' ') ?? 'fixAI';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.artisan} />}
      >
        {/* Hero greeting card */}
        <View style={styles.greetingCard}>
          {/* texture layer */}
          <View style={styles.greetingTexture} />
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingHi}>Bonjour 👋</Text>
            <Text style={styles.greetingName}>{user?.firstName} {user?.lastName}</Text>
            <View style={styles.specialtyBadge}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          </View>
          <View>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: isActive ? '#22C55E22' : '#F59E0B22', borderColor: isActive ? '#22C55E' : '#F59E0B' }]}>
              <View style={[styles.statusDot, { backgroundColor: isActive ? '#22C55E' : '#F59E0B' }]} />
              <Text style={[styles.statusPillText, { color: isActive ? '#22C55E' : '#F59E0B' }]}>
                {isActive ? 'Actif' : 'En vérif.'}
              </Text>
            </View>
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

        {/* Stats grid */}
        {loading ? <ActivityIndicator color={COLORS.artisan} style={{ marginTop: 20 }} /> : (
          <View style={styles.statsGrid}>
            <StatCard label="Missions totales" value={String(stats?.totalMissions ?? 0)} icon="briefcase" color="#1565C0" />
            <StatCard label="En attente" value={String(stats?.pendingMissions ?? 0)} icon="time" color="#D97706" />
            <StatCard label="Terminées" value={String(stats?.completedMissions ?? 0)} icon="checkmark-circle" color={COLORS.artisan} />
            <StatCard label="Note" value={stats?.rating ? stats.rating.toFixed(1) : '—'} icon="star" color="#EA580C" sub={stats?.reviewCount ? `${stats.reviewCount} avis` : undefined} />
          </View>
        )}

        {/* Wallet card */}
        <TouchableOpacity style={styles.walletCard} activeOpacity={0.85}>
          <View style={styles.walletTexture} />
          <View>
            <Text style={styles.walletLabel}>Solde disponible</Text>
            <Text style={styles.walletAmount}>{(stats?.walletBalance ?? 0).toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={styles.walletBtn}>
            <Ionicons name="arrow-up-circle-outline" size={16} color="#fff" />
            <Text style={styles.walletBtnText}>Retirer</Text>
          </View>
        </TouchableOpacity>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsRow}>
          <QuickAction icon="toggle" label="Disponibilité" color={COLORS.artisan} onPress={() => router.push('/(tabs)/artisan-availability' as any)} />
          <QuickAction icon="briefcase" label="Mes missions" color={COLORS.agency} onPress={() => router.push('/(tabs)/artisan-missions' as any)} />
          <QuickAction icon="person" label="Mon profil" color={COLORS.client} onPress={() => router.push('/(tabs)/profile' as any)} />
          <QuickAction icon="star" label="Mes avis" color="#EA580C" onPress={() => {}} />
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
          recentMissions.map(mission => {
            const statusColor = STATUS_COLOR[mission.status] ?? '#9CA3AF';
            return (
              <View key={mission.id} style={styles.missionCard}>
                <View style={[styles.missionAccentBar, { backgroundColor: statusColor }]} />
                <View style={styles.missionContent}>
                  <View style={styles.missionLeft}>
                    <Text style={styles.missionDesc} numberOfLines={2}>{mission.description}</Text>
                    <View style={styles.missionMeta}>
                      {mission.client && (
                        <View style={styles.clientChip}>
                          <View style={styles.clientAvatar}>
                            <Text style={styles.clientAvatarText}>{mission.client.firstName[0]}</Text>
                          </View>
                          <Text style={styles.missionClient}>{mission.client.firstName} {mission.client.lastName}</Text>
                        </View>
                      )}
                      <Text style={styles.missionDate}>{new Date(mission.scheduledAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                    </View>
                  </View>
                  <View style={styles.missionRight}>
                    <View style={[styles.missionStatus, { backgroundColor: statusColor + '18', borderColor: statusColor + '40' }]}>
                      <Text style={[styles.missionStatusText, { color: statusColor }]}>
                        {STATUS_LABEL[mission.status] ?? mission.status}
                      </Text>
                    </View>
                    <Text style={styles.missionAmount}>{Number(mission.escrowAmount).toLocaleString('fr-FR')}</Text>
                    <Text style={styles.missionAmountUnit}>FCFA</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const sCard = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 14,
    borderLeftWidth: 4,
    ...SHADOW.sm,
  },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  value: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },
  sub: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  label: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4, fontWeight: '600' },
});

const qa = StyleSheet.create({
  btn: { alignItems: 'center', flex: 1 },
  icon: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  label: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },

  greetingCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1B4332', borderRadius: RADIUS.lg, padding: 20, marginBottom: 16,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  greetingTexture: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#2E7D3218', top: -60, right: -40,
  },
  greetingLeft: { flex: 1, gap: 4 },
  greetingHi: { color: '#86EFAC', fontSize: 13, fontWeight: '600' },
  greetingName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  specialtyBadge: { alignSelf: 'flex-start', backgroundColor: '#ffffff22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  specialtyText: { color: '#A7F3D0', fontSize: 11, fontWeight: '700' },
  avatarBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ffffff28', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 10, fontWeight: '700' },

  alertBox: { flexDirection: 'row', gap: 10, backgroundColor: '#FFF8E1', borderRadius: RADIUS.md, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#F59E0B', alignItems: 'flex-start' },
  alertTitle: { fontSize: 13, fontWeight: '700', color: '#B45309', marginBottom: 2 },
  alertText: { fontSize: 12, color: '#92400E', lineHeight: 18 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },

  walletCard: {
    backgroundColor: '#0D47A1', borderRadius: RADIUS.lg, padding: 20, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, overflow: 'hidden',
    ...SHADOW.md,
  },
  walletTexture: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#ffffff0C', top: -60, right: -40 },
  walletLabel: { color: '#90CAF9', fontSize: 12, marginBottom: 4, fontWeight: '600' },
  walletAmount: { color: '#fff', fontSize: 24, fontWeight: '900' },
  walletBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffffff22', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24 },
  walletBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  seeAll: { fontSize: 13, color: COLORS.artisan, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },

  empty: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },

  missionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, marginBottom: 10,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  missionAccentBar: { width: 4 },
  missionContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 14 },
  missionLeft: { flex: 1, marginRight: 10 },
  missionDesc: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  missionMeta: { gap: 4 },
  clientChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clientAvatar: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.artisan + '30', alignItems: 'center', justifyContent: 'center' },
  clientAvatarText: { fontSize: 10, fontWeight: '700', color: COLORS.artisan },
  missionClient: { fontSize: 12, color: COLORS.textSecondary },
  missionDate: { fontSize: 11, color: COLORS.textMuted },
  missionRight: { alignItems: 'flex-end', gap: 4 },
  missionStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, marginBottom: 4 },
  missionStatusText: { fontSize: 11, fontWeight: '700' },
  missionAmount: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  missionAmountUnit: { fontSize: 10, color: COLORS.textMuted },
});
