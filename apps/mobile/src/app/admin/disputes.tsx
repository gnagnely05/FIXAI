import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { api } from '../../services/api';

interface Order {
  id: string;
  escrowAmount: number;
  escrowStatus: string;
  status: string;
  createdAt: string;
  client?: { firstName: string; lastName: string; email: string };
  artisan?: { firstName: string; lastName: string; email: string };
}

export default function DisputesScreen() {
  const [disputes, setDisputes] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/admin/disputes');
      setDisputes(res.data ?? []);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les litiges.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator size="large" color="#B71C1C" style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#B71C1C" />}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>⚠️</Text>
          <Text style={styles.summaryCount}>{disputes.length}</Text>
          <Text style={styles.summaryLabel}>litige{disputes.length !== 1 ? 's' : ''} en cours</Text>
        </View>

        {disputes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyText}>Aucun litige en cours</Text>
            <Text style={styles.emptySubText}>Tout est en ordre !</Text>
          </View>
        ) : (
          disputes.map(order => (
            <View key={order.id} style={styles.disputeCard}>
              <View style={styles.disputeHeader}>
                <View style={styles.alertBadge}>
                  <Text style={styles.alertText}>⚠️ LITIGE</Text>
                </View>
                <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
              </View>

              <Text style={styles.amount}>{order.escrowAmount.toLocaleString('fr-FR')} FCFA</Text>
              <Text style={styles.date}>{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>

              <View style={styles.partiesRow}>
                <View style={styles.partyBox}>
                  <Text style={styles.partyRole}>👤 Client</Text>
                  <Text style={styles.partyName}>{order.client?.firstName} {order.client?.lastName}</Text>
                  <Text style={styles.partyEmail}>{order.client?.email}</Text>
                </View>
                <Text style={styles.vs}>VS</Text>
                <View style={styles.partyBox}>
                  <Text style={styles.partyRole}>🔧 Artisan</Text>
                  <Text style={styles.partyName}>{order.artisan?.firstName} {order.artisan?.lastName}</Text>
                  <Text style={styles.partyEmail}>{order.artisan?.email}</Text>
                </View>
              </View>

              <View style={styles.escrowStatus}>
                <Text style={styles.escrowLabel}>Statut escrow :</Text>
                <Text style={styles.escrowValue}>{order.escrowStatus}</Text>
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
  content: { padding: 16, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: '#B71C1C', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20,
  },
  summaryIcon: { fontSize: 36, marginBottom: 8 },
  summaryCount: { fontSize: 48, fontWeight: '900', color: '#fff' },
  summaryLabel: { fontSize: 16, color: '#FFCDD2', fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptySubText: { fontSize: 14, color: '#6B7280' },
  disputeCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 2, borderColor: '#EF4444',
    shadowColor: '#B71C1C', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  disputeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  alertBadge: { backgroundColor: '#FFEBEE', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  alertText: { color: '#B71C1C', fontSize: 12, fontWeight: '800' },
  orderId: { fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace', fontWeight: '700' },
  amount: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 4 },
  date: { fontSize: 12, color: '#6B7280', marginBottom: 16 },
  partiesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  partyBox: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 },
  partyRole: { fontSize: 11, color: '#6B7280', marginBottom: 4, fontWeight: '600' },
  partyName: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  partyEmail: { fontSize: 11, color: '#9CA3AF' },
  vs: { fontSize: 14, fontWeight: '900', color: '#B71C1C' },
  escrowStatus: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#FFF8E1', borderRadius: 8, padding: 10 },
  escrowLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  escrowValue: { fontSize: 12, fontWeight: '800', color: '#B45309' },
});
