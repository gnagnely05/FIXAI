import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
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

  if (loading) {
    return <ActivityIndicator color="#FF6B00" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.artisanName}>
                {item.artisan.user.firstName} {item.artisan.user.lastName}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status]}20` }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                  {STATUS_LABELS[item.status]}
                </Text>
              </View>
            </View>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            <View style={styles.orderFooter}>
              <Text style={styles.date}>{formatDate(item.scheduledAt)}</Text>
              {item.escrowAmount > 0 && (
                <Text style={styles.amount}>{formatAmount(item.escrowAmount)}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
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
  artisanName: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
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
