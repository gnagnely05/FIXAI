import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { api } from '../../services/api';

interface EscrowOverview {
  totalFunded: number;
  totalReleased: number;
  totalRefunded: number;
  pendingEscrow: number;
  orders: Order[];
}

interface Order {
  id: string;
  escrowAmount: number;
  escrowStatus: string;
  status: string;
  createdAt: string;
  client?: { firstName: string; lastName: string };
  artisan?: { firstName: string; lastName: string };
}

const ESCROW_STATUS_COLOR: Record<string, string> = {
  PENDING: '#F59E0B',
  FUNDED: '#3B82F6',
  RELEASED: '#2E7D32',
  REFUNDED: '#9CA3AF',
};

function fmt(amount: number) {
  return amount >= 1000000
    ? `${(amount / 1000000).toFixed(1)}M`
    : amount >= 1000
    ? `${(amount / 1000).toFixed(0)}k`
    : `${amount}`;
}

export default function EscrowScreen() {
  const [data, setData] = useState<EscrowOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/admin/escrow-overview');
      setData(res.data);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les données escrow.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator size="large" color="#1565C0" style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#1565C0" />}
      >
        {/* Summary cards */}
        <View style={styles.grid}>
          <StatCard label="En escrow" value={fmt(data?.pendingEscrow ?? 0)} unit="FCFA" color="#3B82F6" icon="🔒" />
          <StatCard label="Libérés" value={fmt(data?.totalReleased ?? 0)} unit="FCFA" color="#2E7D32" icon="✅" />
          <StatCard label="Remboursés" value={fmt(data?.totalRefunded ?? 0)} unit="FCFA" color="#9CA3AF" icon="↩️" />
          <StatCard label="Commandes" value={String(data?.orders?.length ?? 0)} unit="total" color="#E65100" icon="📋" />
        </View>

        {/* Orders list */}
        <Text style={styles.sectionTitle}>Dernières commandes</Text>
        {(data?.orders ?? []).length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Aucune commande</Text>
          </View>
        ) : (
          [...(data?.orders ?? [])].reverse().map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
                <View style={[styles.badge, { backgroundColor: (ESCROW_STATUS_COLOR[order.escrowStatus] ?? '#9CA3AF') + '20' }]}>
                  <Text style={[styles.badgeText, { color: ESCROW_STATUS_COLOR[order.escrowStatus] ?? '#9CA3AF' }]}>
                    {order.escrowStatus}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderAmount}>{order.escrowAmount.toLocaleString('fr-FR')} FCFA</Text>
              {order.client && (
                <Text style={styles.orderMeta}>
                  Client : {order.client.firstName} {order.client.lastName}
                </Text>
              )}
              {order.artisan && (
                <Text style={styles.orderMeta}>
                  Artisan : {order.artisan.firstName} {order.artisan.lastName}
                </Text>
              )}
              <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, unit, color, icon }: { label: string; value: string; unit: string; color: string; icon: string }) {
  return (
    <View style={[sStyles.card, { borderColor: color + '40' }]}>
      <Text style={sStyles.icon}>{icon}</Text>
      <Text style={[sStyles.value, { color }]}>{value}</Text>
      <Text style={sStyles.unit}>{unit}</Text>
      <Text style={sStyles.label}>{label}</Text>
    </View>
  );
}

const sStyles = StyleSheet.create({
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5 },
  icon: { fontSize: 22, marginBottom: 8 },
  value: { fontSize: 22, fontWeight: '900' },
  unit: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  label: { fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '600', textAlign: 'center' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 12 },
  empty: { alignItems: 'center', marginTop: 40, gap: 10 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: '#6B7280' },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', fontFamily: 'monospace' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  orderAmount: { fontSize: 18, fontWeight: '900', color: '#111827', marginBottom: 6 },
  orderMeta: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  orderDate: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
});
