import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

const ACCENT = '#E65100';

type OrderStatus = 'PENDING_PROVISIONING' | 'PENDING_ARTISAN' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  PENDING_PROVISIONING: { label: 'En attente de paiement', color: '#92400E', bg: '#FEF3C7' },
  PENDING_ARTISAN:      { label: 'En attente artisan',     color: '#92400E', bg: '#FEF3C7' },
  PROCESSING:           { label: 'À préparer',             color: '#1D4ED8', bg: '#DBEAFE' },
  READY:                { label: 'Prêt',                   color: '#065F46', bg: '#D1FAE5' },
  DELIVERED:            { label: 'Livré',                  color: '#374151', bg: '#F3F4F6' },
  CANCELLED:            { label: 'Annulée',                color: '#9CA3AF', bg: '#F3F4F6' },
};

const FILTER_TABS = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'PROCESSING', label: 'À préparer' },
  { key: 'READY', label: 'Prêtes' },
  { key: 'DELIVERED', label: 'Livrées' },
];

interface OrderItem {
  name: string;
  qty: number;
  unitPriceXof: number;
  subtotalXof: number;
  unit?: string;
}

interface ProductOrder {
  id: string;
  status: OrderStatus;
  totalAmountXof: number;
  netAmountXof: number;
  items: OrderItem[];
  client: { firstName?: string; lastName?: string };
  notes?: string;
  createdAt: string;
}

export default function ShopOrdersScreen() {
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(async () => {
    try {
      const res = await api.get('/product-orders/shop/mine');
      setOrders(res.data ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  async function markReady(id: string) {
    Alert.alert('Confirmer', 'Marquer cette commande comme prête ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Prête', onPress: async () => {
          try {
            await api.patch(`/product-orders/${id}/ready`, {});
            load();
          } catch (e: any) {
            Alert.alert('Erreur', e?.response?.data?.message ?? 'Impossible');
          }
        },
      },
    ]);
  }

  function renderOrder({ item }: { item: ProductOrder }) {
    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.CANCELLED;
    const clientName = [item.client?.firstName, item.client?.lastName].filter(Boolean).join(' ') || 'Client';
    const date = new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.clientName}>{clientName}</Text>
            <Text style={styles.orderDate}>{date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((li, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{li.name}</Text>
              <Text style={styles.itemQty}>×{li.qty}{li.unit ? ` ${li.unit}` : ''}</Text>
              <Text style={styles.itemSubtotal}>{Number(li.subtotalXof).toLocaleString('fr-FR')} XOF</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total commande</Text>
          <Text style={styles.totalValue}>{Number(item.totalAmountXof).toLocaleString('fr-FR')} XOF</Text>
        </View>
        <View style={styles.netRow}>
          <Text style={styles.netLabel}>Votre part (net)</Text>
          <Text style={styles.netValue}>{Number(item.netAmountXof).toLocaleString('fr-FR')} XOF</Text>
        </View>

        {item.notes && (
          <View style={styles.notesBox}>
            <Ionicons name="chatbubble-outline" size={12} color="#6B7280" />
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}

        {item.status === 'PROCESSING' && (
          <TouchableOpacity style={styles.readyBtn} onPress={() => markReady(item.id)}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={styles.readyBtnText}>Marquer comme prête</Text>
          </TouchableOpacity>
        )}

        {item.status === 'READY' && (
          <View style={styles.readyInfo}>
            <Ionicons name="information-circle-outline" size={16} color="#065F46" />
            <Text style={styles.readyInfoText}>En attente de confirmation de livraison par le client</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, filter === tab.key && styles.filterTabActive]}
            onPress={() => setFilter(tab.key)}
          >
            <Text style={[styles.filterTabText, filter === tab.key && styles.filterTabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={ACCENT} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={o => o.id}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aucune commande{filter !== 'ALL' ? ' dans cette catégorie' : ''}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  filterBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 12 },
  filterTab: { paddingHorizontal: 12, paddingVertical: 12 },
  filterTabActive: { borderBottomWidth: 2, borderBottomColor: ACCENT },
  filterTabText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  filterTabTextActive: { color: ACCENT },
  orderCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  orderHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  clientName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  orderDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  itemsList: { gap: 4, marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemName: { flex: 1, fontSize: 13, color: '#374151' },
  itemQty: { fontSize: 12, color: '#6B7280', marginRight: 8 },
  itemSubtotal: { fontSize: 13, fontWeight: '600', color: '#374151' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  totalLabel: { fontSize: 13, color: '#6B7280' },
  totalValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  netRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  netLabel: { fontSize: 13, color: '#6B7280' },
  netValue: { fontSize: 14, fontWeight: '800', color: ACCENT },
  notesBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 8, backgroundColor: '#F9FAFB', borderRadius: 6, padding: 8 },
  notesText: { flex: 1, fontSize: 12, color: '#6B7280', fontStyle: 'italic' },
  readyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 10 },
  readyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  readyInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 10, backgroundColor: '#D1FAE5', borderRadius: 6, padding: 10 },
  readyInfoText: { flex: 1, fontSize: 12, color: '#065F46' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});
