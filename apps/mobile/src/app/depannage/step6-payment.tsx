import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDepannage } from '../../hooks/useDepannage';

const OPERATORS = [
  { id: 'ORANGE_MONEY', label: 'Orange Money', color: '#FF6600', prefix: '07' },
  { id: 'MTN_MONEY',    label: 'MTN Money',    color: '#FFCC00', textColor: '#111', prefix: '05' },
  { id: 'WAVE',         label: 'Wave',         color: '#00B4D8', prefix: '01' },
  { id: 'MOOV_MONEY',   label: 'Moov Money',   color: '#005EB8', prefix: '01' },
];

export default function Step6Payment() {
  const params = useLocalSearchParams<{
    requestId: string;
    mode: string;
    agreedPrice: string;
    urgencyFee: string;
    description: string;
    category: string;
    address: string;
    city: string;
  }>();

  const { fundEscrow, reachAgreement, loading, error } = useDepannage();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [operator, setOperator] = useState<string | null>(null);

  const agreedPrice = Number(params.agreedPrice ?? 15000);
  const urgencyFee = Number(params.urgencyFee ?? 0);
  const total = agreedPrice + urgencyFee;
  const isValid = phoneNumber.replace(/\s/g, '').length >= 10 && operator !== null;

  const handlePay = async () => {
    if (!isValid || loading) return;

    // Étape 6a — accord de prix si pas encore fait
    if (params.requestId) {
      const agreed = await reachAgreement(params.requestId);
      if (!agreed) {
        Alert.alert('Erreur', error ?? 'Impossible de finaliser l\'accord');
        return;
      }
      // Étape 6b/c — simule le rechargement et le blocage des fonds
      const funded = await fundEscrow(params.requestId, `${operator}_${Date.now()}`);
      if (!funded) {
        Alert.alert('Erreur paiement', error ?? 'Paiement non confirmé');
        return;
      }
    }

    router.replace({
      pathname: '/depannage/step7-confirmation',
      params: { ...params, total: String(total) },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Étape 6 / 7</Text>
        </View>
        <Text style={styles.title}>Paiement sécurisé</Text>

        <View style={styles.amountCard}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Prestation</Text>
            <Text style={styles.amountValue}>{agreedPrice.toLocaleString()} FCFA</Text>
          </View>
          {urgencyFee > 0 && (
            <View style={styles.amountRow}>
              <Text style={[styles.amountLabel, { color: '#EF4444' }]}>
                Frais d'urgence (+15%)
              </Text>
              <Text style={[styles.amountValue, { color: '#EF4444' }]}>
                +{urgencyFee.toLocaleString()} FCFA
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.amountRow}>
            <Text style={styles.totalLabel}>Total en escrow</Text>
            <Text style={styles.totalValue}>{total.toLocaleString()} FCFA</Text>
          </View>
          <Text style={styles.escrowNote}>
            Le paiement est sécurisé. L'artisan ne reçoit son paiement qu'après votre validation.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Opérateur Mobile Money</Text>
        <View style={styles.operatorGrid}>
          {OPERATORS.map((op) => (
            <TouchableOpacity
              key={op.id}
              style={[
                styles.operatorCard,
                operator === op.id && { borderColor: op.color, borderWidth: 2 },
              ]}
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

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, (!isValid || loading) && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={!isValid || loading}
        >
          <Ionicons name="lock-closed" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.payButtonText}>
            {loading ? 'Traitement...' : `Payer ${total.toLocaleString()} FCFA`}
          </Text>
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
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  amountLabel: { fontSize: 14, color: '#6B7280' },
  amountValue: { fontSize: 14, fontWeight: '600', color: '#111' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#111' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#FF6B00' },
  escrowNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 10,
    lineHeight: 16,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
  },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  operatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  operatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 8,
    flex: 1,
    minWidth: '45%',
  },
  operatorDot: { width: 12, height: 12, borderRadius: 6 },
  operatorLabel: { fontSize: 13, fontWeight: '500', color: '#111' },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 16,
  },
  flag: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  phoneInput: { flex: 1, paddingHorizontal: 14, fontSize: 15, color: '#111' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  errorText: { color: '#DC2626', fontSize: 13, flex: 1 },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  payButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  payButtonDisabled: { backgroundColor: '#FED7AA' },
  payButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
