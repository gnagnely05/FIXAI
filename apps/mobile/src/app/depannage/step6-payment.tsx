import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const OPERATORS = [
  { id: 'ORANGE_MONEY', label: 'Orange Money', color: '#FF6600', prefix: '07' },
  { id: 'MTN_MONEY', label: 'MTN Money', color: '#FFCC00', textColor: '#111', prefix: '05' },
  { id: 'WAVE', label: 'Wave', color: '#00B4D8', prefix: '01' },
  { id: 'MOOV_MONEY', label: 'Moov Money', color: '#005EB8', prefix: '01' },
];

export default function Step6Payment() {
  const params = useLocalSearchParams<{ mode: string }>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [operator, setOperator] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const baseAmount = 15000;
  const urgencyFee = params.mode === 'URGENT' ? Math.round(baseAmount * 0.15) : 0;
  const total = baseAmount + urgencyFee;

  const isValid = phoneNumber.replace(/\s/g, '').length >= 10 && operator !== null;

  const handlePay = async () => {
    if (!isValid) return;
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    router.replace({ pathname: '/depannage/step7-confirmation', params: { ...params, total: String(total) } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepIndicator}><Text style={styles.stepText}>Étape 6 / 7</Text></View>
        <Text style={styles.title}>Paiement sécurisé</Text>

        <View style={styles.amountCard}>
          <View style={styles.amountRow}><Text style={styles.amountLabel}>Prestation</Text><Text style={styles.amountValue}>{baseAmount.toLocaleString()} FCFA</Text></View>
          {urgencyFee > 0 && <View style={styles.amountRow}><Text style={[styles.amountLabel, { color: '#EF4444' }]}>Frais d'urgence (+15%)</Text><Text style={[styles.amountValue, { color: '#EF4444' }]}>+{urgencyFee.toLocaleString()} FCFA</Text></View>}
          <View style={styles.divider} />
          <View style={styles.amountRow}><Text style={styles.totalLabel}>Total en escrow</Text><Text style={styles.totalValue}>{total.toLocaleString()} FCFA</Text></View>
          <Text style={styles.escrowNote}>
            Le paiement est sécurisé. L'artisan ne reçoit son paiement qu'après validation de votre part.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Opérateur Mobile Money</Text>
        <View style={styles.operatorGrid}>
          {OPERATORS.map((op) => (
            <TouchableOpacity
              key={op.id}
              style={[styles.operatorCard, operator === op.id && { borderColor: op.color, borderWidth: 2 }]}
              onPress={() => setOperator(op.id)}
            >
              <View style={[styles.operatorDot, { backgroundColor: op.color }]} />
              <Text style={styles.operatorLabel}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Numéro de téléphone</Text>
        <View style={styles.phoneRow}>
          <View style={styles.flag}><Text>+225</Text></View>
          <TextInput
            style={styles.phoneInput}
            placeholder="07 00 00 00 00"
            placeholderTextColor="#9CA3AF"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={14}
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, (!isValid || loading) && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={!isValid || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.payButtonText}>Payer {total.toLocaleString()} FCFA</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  stepIndicator: { marginBottom: 8 },
  stepText: { color: '#FF6B00', fontWeight: '600', fontSize: 13 },
  title: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 20 },
  amountCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  amountLabel: { fontSize: 14, color: '#6B7280' },
  amountValue: { fontSize: 14, fontWeight: '600', color: '#111' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#FF6B00' },
  escrowNote: { fontSize: 12, color: '#6B7280', marginTop: 10, lineHeight: 18 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  operatorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  operatorCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: '#E5E7EB', flex: 1, minWidth: '45%' },
  operatorDot: { width: 12, height: 12, borderRadius: 6 },
  operatorLabel: { fontSize: 13, fontWeight: '600', color: '#111' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', overflow: 'hidden' },
  flag: { paddingHorizontal: 14, paddingVertical: 14, borderRightWidth: 1, borderRightColor: '#E5E7EB' },
  phoneInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: '#111' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  payButton: { backgroundColor: '#FF6B00', borderRadius: 14, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  payButtonDisabled: { backgroundColor: '#FCA97E' },
  payButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
