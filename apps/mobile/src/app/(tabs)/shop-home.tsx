import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { COLORS, SHADOW, RADIUS } from '../../theme';

const ACCENT = COLORS.shop;

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
      <View style={[styles.statIconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={ACCENT} />}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroTexture} />
        <Text style={styles.heroGreeting}>Bienvenue,</Text>
        <Text style={styles.heroName}>{shopName}</Text>
        <View style={styles.walletRow}>
          <Ionicons name="wallet-outline" size={16} color={ACCENT} />
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

          {/* Revenue card */}
          <View style={styles.revenueCard}>
            <View style={styles.revenueTexture} />
            <View style={[styles.revenuIconWrap, { backgroundColor: ACCENT + '20' }]}>
              <Ionicons name="trending-up-outline" size={24} color={ACCENT} />
            </View>
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.revenueLabel}>Revenus totaux (net)</Text>
              <Text style={styles.revenueValue}>{Number(stats?.totalRevenue ?? 0).toLocaleString('fr-FR')} XOF</Text>
            </View>
          </View>

          {/* Quick actions */}
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/shop-catalog')}>
              <View style={[styles.actionIconWrap, { backgroundColor: ACCENT + '15' }]}>
                <Ionicons name="grid-outline" size={24} color={ACCENT} />
              </View>
              <Text style={styles.actionLabel}>Mon catalogue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/shop-orders')}>
              <View style={[styles.actionIconWrap, { backgroundColor: ACCENT + '15' }]}>
                <Ionicons name="receipt-outline" size={24} color={ACCENT} />
              </View>
              <Text style={styles.actionLabel}>Commandes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/profile')}>
              <View style={[styles.actionIconWrap, { backgroundColor: ACCENT + '15' }]}>
                <Ionicons name="person-outline" size={24} color={ACCENT} />
              </View>
              <Text style={styles.actionLabel}>Mon profil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/shop-catalog')}>
              <View style={[styles.actionIconWrap, { backgroundColor: ACCENT + '15' }]}>
                <Ionicons name="add-circle-outline" size={24} color={ACCENT} />
              </View>
              <Text style={styles.actionLabel}>Ajouter produit</Text>
            </TouchableOpacity>
          </View>

          {/* AI Promotion tip */}
          {(stats?.promotedProducts ?? 0) === 0 && (
            <View style={styles.tipCard}>
              <View style={styles.tipTexture} />
              <View style={styles.tipHeader}>
                <View style={styles.tipIconWrap}>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                </View>
                <Text style={styles.tipTitle}>Promotion IA disponible</Text>
              </View>
              <Text style={styles.tipText}>
                Activez la promotion IA sur vos produits pour apparaître en priorité dans les suggestions clients.
              </Text>
              <TouchableOpacity style={styles.tipCta} onPress={() => router.push('/(tabs)/shop-catalog')}>
                <Text style={styles.tipCtaText}>Activer maintenant</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  hero: {
    backgroundColor: '#BF360C',
    padding: 24, paddingTop: 32, paddingBottom: 32,
    overflow: 'hidden',
  },
  heroTexture: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#ffffff10', top: -60, right: -50,
  },
  heroGreeting: { color: '#FFCCBC', fontSize: 13, fontWeight: '600' },
  heroName: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 2, marginBottom: 12 },
  walletRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    alignSelf: 'flex-start',
    ...SHADOW.sm,
  },
  walletText: { color: ACCENT, fontWeight: '800', fontSize: 14 },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary, marginHorizontal: 16, marginTop: 22, marginBottom: 12 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
  statCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 14, width: '46%',
    borderLeftWidth: 4,
    ...SHADOW.sm,
  },
  statIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 26, fontWeight: '900', color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' },

  revenueCard: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: '#FFF8F5',
    borderRadius: RADIUS.lg, padding: 18, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: ACCENT + '30', overflow: 'hidden',
    ...SHADOW.sm,
  },
  revenueTexture: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: ACCENT + '08', top: -30, right: -20 },
  revenuIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  revenueLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  revenueValue: { fontSize: 22, fontWeight: '900', color: ACCENT, marginTop: 2 },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
  actionCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 16,
    width: '46%', alignItems: 'center', gap: 10,
    ...SHADOW.sm,
  },
  actionIconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },

  tipCard: {
    margin: 16, backgroundColor: '#4A148C', borderRadius: RADIUS.lg, padding: 18,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  tipTexture: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#ffffff0C', top: -50, right: -30 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  tipIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#ffffff22', alignItems: 'center', justifyContent: 'center' },
  tipTitle: { fontSize: 15, fontWeight: '800', color: '#fff' },
  tipText: { fontSize: 13, color: '#E1BEE7', lineHeight: 20, marginBottom: 14 },
  tipCta: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  tipCtaText: { color: '#4A148C', fontWeight: '700', fontSize: 13 },
});
