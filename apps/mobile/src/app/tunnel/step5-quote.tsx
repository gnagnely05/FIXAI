import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../services/api';

const OPERATORS = [
  { id: 'ORANGE_MONEY', label: 'Orange Money', color: '#FF6600' },
  { id: 'MTN_MONEY', label: 'MTN Money', color: '#FFCC00' },
  { id: 'WAVE', label: 'Wave', color: '#00B4D8' },
  { id: 'MOOV_MONEY', label: 'Moov Money', color: '#005EB8' },
];

export default function Step5Quote() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    serviceType: string; mode: string; address: string; city: string;
    scheduledAt: string; diagnosis: string; userAnswer: string;
  }>();

  const diagnosis = params.diagnosis ? JSON.parse(params.diagnosis) : {};
  const isUrgent = params.mode === 'URGENT';

  const basePrice = diagnosis.estimatedPriceMinXof ?? 25000;
  const travelFee = 2500;
  const urgencyFee = isUrgent ? Math.round(basePrice * 0.15) : 0;
  const fixaiCommission = Math.round((basePrice + urgencyFee) * 0.03);
  const total = basePrice + travelFee + urgencyFee + fixaiCommission;

  const [operator, setOperator] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const canPay = operator !== null && phone.length >= 8;

  const handlePay = async () => {
    if (!canPay) return;
    setLoading(true);
    try {
      await api.post('/payments/initiate', {
        amount: total,
        phoneNumber: `+225${phone}`,
        operator,
        serviceType: params.serviceType,
        address: params.address,
        city: params.city,
      });
      router.replace('/(tabs)/orders');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Impossible d\'initier le paiement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Récapitulatif & Paiement</Text>

      {/* Quote card */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteTitle}>Détail du devis</Text>
        <Row label="Prix intervention" value={basePrice} />
        <Row label="Frais de déplacement" value={travelFee} />
        <Row label="Commission FixAI (3%)" value={fixaiCommission} />
        {isUrgent && <Row label="Supplément urgent (+15%)" value={urgencyFee} highlight />}
        <View style={styles.separator} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{total.toLocaleString()} FCFA</Text>
        </View>
      </View>

      {/* Operator selector */}
      <Text style={styles.sectionLabel}>Opérateur Mobile Money</Text>
      <View style={styles.operatorsRow}>
        {OPERATORS.map(op => (
          <TouchableOpacity
            key={op.id}
            style={[styles.opChip, operator === op.id && { borderColor: op.color, backgroundColor: op.color + '22' }]}
            onPress={() => setOperator(op.id)}
          >
            <Text style={[styles.opText, operator === op.id && { color: op.color, fontWeight: '700' }]}>{op.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Phone */}
      <Text style={styles.sectionLabel}>Numéro de téléphone</Text>
      <View style={styles.phoneRow}>
        <View style={styles.prefix}><Text style={styles.prefixText}>+225</Text></View>
        <TextInput
          style={styles.phoneInput}
          placeholder="0700000000"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={10}
        />
      </View>

      {/* Escrow info */}
      <View style={styles.escrowInfo}>
        <Text style={styles.escrowText}>🔒 Paiement sécurisé par escrow FixAI. Les fonds ne sont libérés qu'après validation de l'intervention.</Text>
      </View>

      {/* Pay button */}
      <TouchableOpacity style={[styles.payBtn, !canPay && styles.payBtnDisabled]} onPress={handlePay} disabled={!canPay || loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.payBtnText}>Payer {total.toLocaleString()} FCFA</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, highlight && { color: '#EF4444' }]}>{label}</Text>
      <Text style={[styles.rowValue, highlight && { color: '#EF4444' }]}>{value.toLocaleString()} FCFA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 20 },
  quoteCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  quoteTitle: { fontSize: 16, fontWeight: '700', color: '#6B3FA0', marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { fontSize: 14, color: '#4B5563' },
  rowValue: { fontSize: 14, color: '#111827', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 17, fontWeight: '800', color: '#111827' },
  totalValue: { fontSize: 17, fontWeight: '800', color: '#6B3FA0' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10, textTransform: 'uppercase' },
  operatorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  opChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff',
  },
  opText: { fontSize: 13, color: '#374151' },
  phoneRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  prefix: { backgroundColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center' },
  prefixText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  phoneInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1.5,
    borderColor: '#E5E7EB', paddingHorizontal: 14, fontSize: 15, height: 48,
  },
  escrowInfo: { backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, marginBottom: 20 },
  escrowText: { fontSize: 13, color: '#1D4ED8', lineHeight: 18 },
  payBtn: { backgroundColor: '#6B3FA0', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  payBtnDisabled: { backgroundColor: '#D1D5DB' },
  payBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
