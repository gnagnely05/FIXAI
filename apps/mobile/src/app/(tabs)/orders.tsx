import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { api } from '../../services/api';
import type { Order } from '@fixai/shared';
import { OrderStatus } from '@fixai/shared';

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '#F59E0B',
  [OrderStatus.CONFIRMED]: '#3B82F6',
  [OrderStatus.IN_PROGRESS]: '#8B5CF6',
  [OrderStatus.COMPLETED]: '#10B981',
  [OrderStatus.CANCELLED]: '#EF4444',
  [OrderStatus.DISPUTED]: '#F97316',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'En attente',
  [OrderStatus.CONFIRMED]: 'Confirmée',
  [OrderStatus.IN_PROGRESS]: 'En cours',
  [OrderStatus.COMPLETED]: 'Terminée',
  [OrderStatus.CANCELLED]: 'Annulée',
  [OrderStatus.DISPUTED]: 'Litige',
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get<Order[]>('/orders/my');
      setOrders(response.data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('fr-CI', { day: 'numeric', month: 'long', year: 'numeric' });

  const formatAmount = (amount: number) =>
    `${amount.toLocaleString('fr-CI')} FCFA`;

  const respondQuote = async (id: string, accept: boolean) => {
    try {
      await api.patch(`/orders/${id}/quote-response`, { accept });
      loadOrders();
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Action impossible.');
    }
  };

  if (loading) {
    return <ActivityIndicator color="#FF6B00" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const o = item as any;
          const artisanName = o.artisan?.user
            ? `${o.artisan.user.firstName} ${o.artisan.user.lastName}`
            : (o.isDiagnostic ? 'Diagnostic — en attente d\'un artisan' : 'En attente d\'assignation');
          const net = Math.max(0, (o.finalQuoteXof ?? 0) - (o.diagnosticFeeXof ?? 0));
          return (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.artisanName}>{artisanName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status]}20` }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                  {STATUS_LABELS[item.status]}
                </Text>
              </View>
            </View>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

            {/* Devis final reçu → accepter / refuser */}
            {o.quoteStatus === 'SENT' ? (
              <View style={styles.quoteBox}>
                <Text style={styles.quoteTitle}>Devis de l'artisan</Text>
                {o.quoteJustification ? <Text style={styles.quoteJustif}>{o.quoteJustification}</Text> : null}
                <View style={styles.quoteLine}><Text style={styles.quoteLbl}>Devis total</Text><Text style={styles.quoteVal}>{formatAmount(o.finalQuoteXof ?? 0)}</Text></View>
                <View style={styles.quoteLine}><Text style={styles.quoteLbl}>Diagnostic déjà payé</Text><Text style={styles.quoteVal}>- {formatAmount(o.diagnosticFeeXof ?? 0)}</Text></View>
                <View style={styles.quoteLine}><Text style={styles.quoteNetLbl}>Reste à payer</Text><Text style={styles.quoteNetVal}>{formatAmount(net)}</Text></View>
                <View style={styles.quoteActions}>
                  <TouchableOpacity style={styles.refuseBtn} onPress={() => respondQuote(o.id, false)}>
                    <Text style={styles.refuseText}>Refuser</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => respondQuote(o.id, true)}>
                    <Text style={styles.acceptText}>Accepter la réparation</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : o.quoteStatus === 'ACCEPTED' ? (
              <Text style={styles.quoteAccepted}>✓ Réparation acceptée — reste à payer {formatAmount(net)}</Text>
            ) : o.quoteStatus === 'REFUSED' ? (
              <Text style={styles.quoteRefused}>Devis refusé — diagnostic réglé à l'artisan</Text>
            ) : null}

            <View style={styles.orderFooter}>
              <Text style={styles.date}>{formatDate(item.scheduledAt)}</Text>
              {item.escrowAmount > 0 && (
                <Text style={styles.amount}>{formatAmount(item.escrowAmount)}</Text>
              )}
            </View>
          </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune commande</Text>
            <Text style={styles.emptySubtext}>Vos commandes apparaîtront ici</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loader: { flex: 1, marginTop: 40 },
  list: { padding: 16, gap: 12 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  artisanName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  quoteBox: { backgroundColor: '#F5F0FF', borderRadius: 12, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#E5D9F8' },
  quoteTitle: { fontSize: 14, fontWeight: '800', color: '#6B3FA0', marginBottom: 6 },
  quoteJustif: { fontSize: 13, color: '#4B5563', lineHeight: 19, marginBottom: 10 },
  quoteLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  quoteLbl: { fontSize: 13, color: '#6B7280' },
  quoteVal: { fontSize: 13, color: '#374151', fontWeight: '600' },
  quoteNetLbl: { fontSize: 14, color: '#111827', fontWeight: '800', marginTop: 4 },
  quoteNetVal: { fontSize: 16, color: '#6B3FA0', fontWeight: '900', marginTop: 4 },
  quoteActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  refuseBtn: { flex: 1, borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  refuseText: { color: '#EF4444', fontWeight: '700' },
  acceptBtn: { flex: 2, backgroundColor: '#6B3FA0', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: '700' },
  quoteAccepted: { marginTop: 10, color: '#15803D', fontWeight: '600', fontSize: 13 },
  quoteRefused: { marginTop: 10, color: '#9CA3AF', fontWeight: '600', fontSize: 13 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  description: { fontSize: 14, color: '#666', marginBottom: 12 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontSize: 13, color: '#9CA3AF' },
  amount: { fontSize: 14, fontWeight: '600', color: '#FF6B00' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
});
