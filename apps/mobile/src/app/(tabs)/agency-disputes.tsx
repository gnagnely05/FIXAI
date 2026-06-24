import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  Modal, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

interface DisputedOrder {
  id: string;
  description: string;
  disputeReason?: string;
  disputeResolution?: string;
  escrowAmount: number;
  scheduledAt: string;
  client?: { firstName: string; lastName: string; phone?: string };
  artisan?: { firstName: string; lastName: string; specialty?: string };
}

export default function AgencyDisputesScreen() {
  const [disputes, setDisputes] = useState<DisputedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolveModal, setResolveModal] = useState<DisputedOrder | null>(null);
  const [outcome, setOutcome] = useState<'CLIENT' | 'ARTISAN'>('ARTISAN');
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/orders/disputes/mine');
      setDisputes(res.data ?? []);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les litiges.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async () => {
    if (!resolveModal || !resolution.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir la résolution.');
      return;
    }
    setResolving(true);
    try {
      await api.patch(`/orders/${resolveModal.id}/resolve-dispute`, { outcome, resolution: resolution.trim() });
      setResolveModal(null);
      setResolution('');
      setOutcome('ARTISAN');
      load();
      Alert.alert('Litige résolu', 'La décision a été enregistrée.');
    } catch {
      Alert.alert('Erreur', 'Impossible de résoudre le litige.');
    } finally {
      setResolving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#1565C0" />}
      >
        {loading ? (
          <ActivityIndicator color="#1565C0" style={{ marginTop: 40 }} />
        ) : disputes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⚖️</Text>
            <Text style={styles.emptyTitle}>Aucun litige en cours</Text>
            <Text style={styles.emptyText}>Les litiges de vos artisans apparaîtront ici</Text>
          </View>
        ) : (
          <>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color="#1565C0" />
              <Text style={styles.infoText}>
                Ces litiges vous sont assignés en tant que gestionnaire. Votre décision est finale.
              </Text>
            </View>

            {disputes.map(d => (
              <View key={d.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.alertBadge}>
                    <Ionicons name="warning" size={14} color="#B71C1C" />
                    <Text style={styles.alertBadgeText}>LITIGE</Text>
                  </View>
                  <Text style={styles.amount}>
                    {Number(d.escrowAmount).toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>

                <Text style={styles.desc} numberOfLines={2}>{d.description}</Text>

                <View style={styles.partiesRow}>
                  <View style={styles.partyBox}>
                    <Text style={styles.partyLabel}>👤 CLIENT</Text>
                    <Text style={styles.partyName}>
                      {d.client ? `${d.client.firstName} ${d.client.lastName}` : '—'}
                    </Text>
                  </View>
                  <View style={styles.partySep}><Text style={styles.vs}>VS</Text></View>
                  <View style={[styles.partyBox, { alignItems: 'flex-end' }]}>
                    <Text style={styles.partyLabel}>🔧 ARTISAN</Text>
                    <Text style={styles.partyName}>
                      {d.artisan ? `${d.artisan.firstName} ${d.artisan.lastName}` : '—'}
                    </Text>
                    {d.artisan?.specialty && (
                      <Text style={styles.partySpec}>{d.artisan.specialty.replace(/_/g, ' ')}</Text>
                    )}
                  </View>
                </View>

                {d.disputeReason && (
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>Motif du litige</Text>
                    <Text style={styles.reasonText}>{d.disputeReason}</Text>
                  </View>
                )}

                <Text style={styles.date}>
                  Mission prévue le {new Date(d.scheduledAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Text>

                <TouchableOpacity style={styles.resolveBtn} onPress={() => setResolveModal(d)} activeOpacity={0.85}>
                  <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
                  <Text style={styles.resolveBtnText}>Trancher le litige</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Modal de résolution */}
      <Modal visible={!!resolveModal} transparent animationType="slide" onRequestClose={() => setResolveModal(null)}>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.header}>
              <Text style={modal.title}>Trancher le litige</Text>
              <TouchableOpacity onPress={() => setResolveModal(null)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={modal.subtitle} numberOfLines={2}>{resolveModal?.description}</Text>

            <Text style={modal.sectionLabel}>Décision — En faveur de :</Text>
            <View style={modal.outcomeRow}>
              <TouchableOpacity
                style={[modal.outcomeBtn, outcome === 'ARTISAN' && modal.outcomeBtnActive]}
                onPress={() => setOutcome('ARTISAN')}
              >
                <Text style={[modal.outcomeBtnText, outcome === 'ARTISAN' && modal.outcomeBtnTextActive]}>
                  🔧 L'Artisan
                </Text>
                <Text style={modal.outcomeSub}>Escrow libéré</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modal.outcomeBtn, outcome === 'CLIENT' && modal.outcomeBtnActiveClient]}
                onPress={() => setOutcome('CLIENT')}
              >
                <Text style={[modal.outcomeBtnText, outcome === 'CLIENT' && modal.outcomeBtnTextActive]}>
                  👤 Le Client
                </Text>
                <Text style={modal.outcomeSub}>Remboursement</Text>
              </TouchableOpacity>
            </View>

            <Text style={modal.sectionLabel}>Résolution / Justification *</Text>
            <TextInput
              style={modal.input}
              placeholder="Décrivez les raisons de votre décision..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={resolution}
              onChangeText={setResolution}
            />

            <TouchableOpacity
              style={[modal.submitBtn, resolving && { opacity: 0.6 }]}
              onPress={handleResolve}
              disabled={resolving}
              activeOpacity={0.85}
            >
              {resolving ? <ActivityIndicator color="#fff" /> : (
                <Text style={modal.submitBtnText}>Confirmer la décision</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 70, gap: 10 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  infoBox: { flexDirection: 'row', gap: 10, backgroundColor: '#E3F2FD', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'flex-start' },
  infoText: { fontSize: 12, color: '#1565C0', flex: 1, lineHeight: 18 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1.5, borderColor: '#FFCDD2',
    shadowColor: '#B71C1C', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  alertBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFEBEE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  alertBadgeText: { fontSize: 11, fontWeight: '800', color: '#B71C1C' },
  amount: { fontSize: 16, fontWeight: '900', color: '#111827' },
  desc: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12, lineHeight: 20 },
  partiesRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 12 },
  partyBox: { flex: 1 },
  partyLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', marginBottom: 3, letterSpacing: 0.5 },
  partyName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  partySpec: { fontSize: 11, color: '#6B7280' },
  partySep: { paddingHorizontal: 12, alignItems: 'center' },
  vs: { fontSize: 12, fontWeight: '900', color: '#EF4444' },
  reasonBox: { backgroundColor: '#FFF8E1', borderRadius: 10, padding: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  reasonLabel: { fontSize: 11, color: '#B45309', fontWeight: '700', marginBottom: 3 },
  reasonText: { fontSize: 12, color: '#78350F', lineHeight: 18 },
  date: { fontSize: 11, color: '#9CA3AF', marginBottom: 14 },
  resolveBtn: { flexDirection: 'row', gap: 8, backgroundColor: '#1565C0', borderRadius: 12, paddingVertical: 12, justifyContent: 'center', alignItems: 'center' },
  resolveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 17, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 18 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 10 },
  outcomeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  outcomeBtn: { flex: 1, borderRadius: 14, padding: 14, backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: 'transparent', alignItems: 'center' },
  outcomeBtnActive: { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' },
  outcomeBtnActiveClient: { backgroundColor: '#E3F2FD', borderColor: '#1565C0' },
  outcomeBtnText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  outcomeBtnTextActive: { color: '#111827' },
  outcomeSub: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
  input: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, padding: 14,
    fontSize: 14, color: '#111827', minHeight: 100, textAlignVertical: 'top', marginBottom: 16,
  },
  submitBtn: { backgroundColor: '#1565C0', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
