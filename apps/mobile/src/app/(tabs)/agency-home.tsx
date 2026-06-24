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

interface AgencyStats {
  artisanCount: number;
  pendingRequests: number;
  activeOrders: number;
  totalRevenue: number;
  walletBalance: number;
}

interface RecentRequest {
  id: string;
  description: string;
  status: string;
  scheduledAt: string;
  escrowAmount: number;
  client?: { firstName: string; lastName: string };
  artisan?: { firstName: string; lastName: string };
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#D97706', CONFIRMED: '#1565C0', IN_PROGRESS: '#7C3AED',
  COMPLETED: '#1B8A2E', CANCELLED: '#DC2626', DISPUTED: '#EA580C',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente', CONFIRMED: 'Confirmée', IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée', CANCELLED: 'Annulée', DISPUTED: 'Litige',
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

export default function AgencyHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [ordersRes, artisansRes] = await Promise.all([
        api.get('/orders/my'),
        api.get('/artisans/my-agency'),
      ]);
      const orders: RecentRequest[] = ordersRes.data ?? [];
      const artisans = artisansRes.data ?? [];
      const pending = orders.filter(o => o.status === 'PENDING');
      const active = orders.filter(o => ['CONFIRMED', 'IN_PROGRESS'].includes(o.status));
      const revenue = orders
        .filter(o => o.status === 'COMPLETED')
        .reduce((s, o) => s + Number(o.escrowAmount), 0);
      setStats({
        artisanCount: artisans.length,
        pendingRequests: pending.length,
        activeOrders: active.length,
        totalRevenue: revenue,
        walletBalance: user?.walletBalance ?? 0,
      });
      setRecentRequests(orders.slice(0, 5));
    } catch {
      setStats({ artisanCount: 0, pendingRequests: 0, activeOrders: 0, totalRevenue: 0, walletBalance: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const agencyName = (user as any)?.agencyName ?? (user as any)?.agencyProfile?.name ?? 'Agence';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.agency} />}
      >
        {/* Hero greeting card */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingTexture} />
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingHi}>Bonjour 👋</Text>
            <Text style={styles.greetingName}>{user?.firstName} {user?.lastName}</Text>
            <View style={styles.agencyBadge}>
              <Ionicons name="business-outline" size={11} color="#90CAF9" />
              <Text style={styles.agencyBadgeText}>{agencyName}</Text>
            </View>
          </View>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
          </View>
        </View>

        {/* Stats grid */}
        {loading ? <ActivityIndicator color={COLORS.agency} style={{ marginTop: 20 }} /> : (
          <View style={styles.statsGrid}>
            <StatCard label="Artisans" value={String(stats?.artisanCount ?? 0)} icon="people" color={COLORS.agency} />
            <StatCard label="Demandes" value={String(stats?.pendingRequests ?? 0)} icon="time" color="#D97706" />
            <StatCard label="En cours" value={String(stats?.activeOrders ?? 0)} icon="briefcase" color="#7C3AED" />
            <StatCard label="Revenus" value={stats?.totalRevenue ? `${(stats.totalRevenue / 1000).toFixed(0)}k` : '0'} icon="trending-up" color="#1B8A2E" sub="FCFA" />
          </View>
        )}

        {/* Wallet */}
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
          <QuickAction icon="people" label="Artisans" color={COLORS.agency} onPress={() => router.push('/(tabs)/agency-artisans' as any)} />
          <QuickAction icon="document-text" label="Demandes" color="#D97706" onPress={() => router.push('/(tabs)/agency-requests' as any)} />
          <QuickAction icon="person" label="Mon profil" color={COLORS.client} onPress={() => router.push('/(tabs)/profile' as any)} />
          <QuickAction icon="bar-chart" label="Statistiques" color="#1B8A2E" onPress={() => {}} />
        </View>

        {/* Recent requests */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Demandes récentes</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/agency-requests' as any)}>
            <Text style={styles.seeAll}>Voir tout →</Text>
          </TouchableOpacity>
        </View>

        {recentRequests.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Aucune demande pour le moment</Text>
          </View>
        ) : (
          recentRequests.map(req => {
            const statusColor = STATUS_COLOR[req.status] ?? '#9CA3AF';
            return (
              <View key={req.id} style={styles.requestCard}>
                <View style={[styles.requestAccentBar, { backgroundColor: statusColor }]} />
                <View style={styles.requestContent}>
                  <View style={styles.requestLeft}>
                    <Text style={styles.requestDesc} numberOfLines={2}>{req.description}</Text>
                    <View style={styles.requestMeta}>
                      <Text style={styles.requestMetaText}>
                        {req.client ? `${req.client.firstName} ${req.client.lastName}` : 'Client inconnu'}
                      </Text>
                      {req.artisan && (
                        <Text style={[styles.requestMetaText, { color: COLORS.agency }]}>
                          🔧 {req.artisan.firstName} {req.artisan.lastName}
                        </Text>
                      )}
                      <Text style={styles.requestDate}>
                        {new Date(req.scheduledAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.requestRight}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '18', borderColor: statusColor + '40' }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {STATUS_LABEL[req.status] ?? req.status}
                      </Text>
                    </View>
                    <Text style={styles.requestAmount}>{Number(req.escrowAmount).toLocaleString('fr-FR')}</Text>
                    <Text style={styles.requestAmountUnit}>FCFA</Text>
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
    width: '47%', backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    padding: 14, borderLeftWidth: 4,
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
    backgroundColor: '#0D2B6E', borderRadius: RADIUS.lg, padding: 20, marginBottom: 16,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  greetingTexture: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#1565C018', top: -60, right: -40 },
  greetingLeft: { flex: 1, gap: 4 },
  greetingHi: { color: '#90CAF9', fontSize: 13, fontWeight: '600' },
  greetingName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  agencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#ffffff22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  agencyBadgeText: { color: '#90CAF9', fontSize: 11, fontWeight: '700' },
  avatarBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ffffff28', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900', color: '#fff' },

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
  seeAll: { fontSize: 13, color: COLORS.agency, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },

  empty: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },

  requestCard: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: RADIUS.md, marginBottom: 10, overflow: 'hidden',
    ...SHADOW.sm,
  },
  requestAccentBar: { width: 4 },
  requestContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 14 },
  requestLeft: { flex: 1, marginRight: 10 },
  requestDesc: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  requestMeta: { gap: 3 },
  requestMetaText: { fontSize: 12, color: COLORS.textSecondary },
  requestDate: { fontSize: 11, color: COLORS.textMuted },
  requestRight: { alignItems: 'flex-end', gap: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, marginBottom: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  requestAmount: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  requestAmountUnit: { fontSize: 10, color: COLORS.textMuted },
});
