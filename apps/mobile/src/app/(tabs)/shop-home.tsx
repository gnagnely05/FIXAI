import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

const ACCENT = '#E65100';

interface ShopStats {
  activeProducts: number;
  promotedProducts: number;
  toProcess: number;
  ready: number;
  totalRevenue: number;
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ShopHomeScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/product-orders/shop/stats');
      setStats(res.data);
    } catch {
      setStats({ activeProducts: 0, promotedProducts: 0, toProcess: 0, ready: 0, totalRevenue: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const shopName = (user as any)?.shopName ?? (user as any)?.merchantName ?? 'Ma Boutique';
  const walletBalance = Number((user as any)?.walletBalance ?? 0).toLocaleString('fr-FR');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <View style={[styles.hero, { backgroundColor: ACCENT }]}>
        <Text style={styles.heroGreeting}>Bienvenue,</Text>
        <Text style={styles.heroName}>{shopName}</Text>
        <View style={styles.walletRow}>
          <Ionicons name="wallet-outline" size={18} color="#fff" />
          <Text style={styles.walletText}>{walletBalance} XOF</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={ACCENT} style={{ marginTop: 40 }} />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Produits actifs" value={stats?.activeProducts ?? 0} icon="cube-outline" color="#2E7D32" />
            <StatCard label="Promus IA" value={stats?.promotedProducts ?? 0} icon="star-outline" color="#6B3FA0" />
            <StatCard label="À préparer" value={stats?.toProcess ?? 0} icon="time-outline" color="#F57C00" />
            <StatCard label="Prêts" value={stats?.ready ?? 0} icon="checkmark-circle-outline" color="#1565C0" />
          </View>

          <View style={styles.revenueCard}>
            <Ionicons name="trending-up-outline" size={28} color={ACCENT} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.revenueLabel}>Revenus totaux (net)</Text>
              <Text style={styles.revenueValue}>{Number(stats?.totalRevenue ?? 0).toLocaleString('fr-FR')} XOF</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/shop-catalog')}>
              <Ionicons name="grid-outline" size={28} color={ACCENT} />
              <Text style={styles.actionLabel}>Mon catalogue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/shop-orders')}>
              <Ionicons name="receipt-outline" size={28} color={ACCENT} />
              <Text style={styles.actionLabel}>Commandes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/profile')}>
              <Ionicons name="person-outline" size={28} color={ACCENT} />
              <Text style={styles.actionLabel}>Mon profil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/shop-catalog')}>
              <Ionicons name="add-circle-outline" size={28} color={ACCENT} />
              <Text style={styles.actionLabel}>Ajouter produit</Text>
            </TouchableOpacity>
          </View>

          {(stats?.promotedProducts ?? 0) === 0 && (
            <View style={styles.tipCard}>
              <Ionicons name="information-circle-outline" size={20} color="#6B3FA0" />
              <Text style={styles.tipText}>
                Activez la promotion IA sur vos produits pour apparaître en priorité dans les suggestions clients.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  hero: { padding: 24, paddingTop: 32, paddingBottom: 28 },
  heroGreeting: { color: '#FFCCBC', fontSize: 14 },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 },
  walletRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  walletText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
  statCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, width: '46%', borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 6 },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  revenueCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#FFF3E0', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' },
  revenueLabel: { fontSize: 13, color: '#6B7280' },
  revenueValue: { fontSize: 20, fontWeight: '800', color: ACCENT, marginTop: 2 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
  actionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '46%', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', textAlign: 'center' },
  tipCard: { margin: 16, backgroundColor: '#EDE7F6', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  tipText: { flex: 1, fontSize: 13, color: '#4A148C', lineHeight: 18 },
});
