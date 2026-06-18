import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const PROVIDERS = [
  { id: 'ORANGE_MONEY', label: 'Orange Money', color: '#FF6600', emoji: '🟠' },
  { id: 'MTN_MONEY', label: 'MTN Money', color: '#FFCC00', emoji: '🟡' },
  { id: 'WAVE', label: 'Wave', color: '#1B75FF', emoji: '🔵' },
  { id: 'MOOV_MONEY', label: 'Moov Money', color: '#00A651', emoji: '🟢' },
];

export default function Step6Payment() {
  const params = useLocalSearchParams();
  const [provider, setProvider] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const amount = 15000; // TODO: from artisan hourly rate
  const urgencyFee = params.mode === 'URGENT' ? 2000 : 0;
  const total = amount + urgencyFee;
  const commission = Math.round(total * 0.05);

  const handlePay = async () => {
    if (!provider || phone.length < 10) return;
    setLoading(true);
    // TODO: call API POST /payments/initiate → open paymentLink in WebView
    setTimeout(() => {
      router.push({ pathname: '/depannage/step7-confirmation', params });
      setLoading(false);
    }, 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Paiement sécurisé par escrow</Text>
      <Text style={styles.subtitle}>Vos fonds sont retenus par fixAI et libérés après validation de la prestation.</Text>

      <View style={styles.summary}>
        <View style={styles.summaryRow}><Text>Prestation</Text><Text style={styles.summaryAmount}>{amount.toLocaleString('fr-CI')} FCFA</Text></View>
        {urgencyFee > 0 && <View style={styles.summaryRow}><Text>Supplément urgence</Text><Text style={styles.summaryAmount}>+{urgencyFee.toLocaleString('fr-CI')} FCFA</Text></View>}
        <View style={styles.summaryRow}><Text>Commission fixAI (5%)</Text><Text style={styles.summaryAmount}>{commission.toLocaleString('fr-CI')} FCFA</Text></View>
        <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalAmount}>{total.toLocaleString('fr-CI')} FCFA</Text></View>
      </View>

      <Text style={styles.label}>Mode de paiement Mobile Money</Text>
      <View style={styles.providerGrid}>
        {PROVIDERS.map((p) => (
          <TouchableOpacity key={p.id} style={[styles.providerCard, provider === p.id && { borderColor: p.color, borderWidth: 2 }]} onPress={() => setProvider(p.id)}>
            <Text style={styles.providerEmoji}>{p.emoji}</Text>
            <Text style={styles.providerLabel}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Numéro de téléphone</Text>
      <TextInput style={styles.input} placeholder="07 00 00 00 00" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

      <TouchableOpacity style={[styles.button, (!provider || phone.length < 10) && styles.buttonDisabled]} onPress={handlePay} disabled={!provider || phone.length < 10 || loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Payer {total.toLocaleString('fr-CI')} FCFA</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 20 },
  summary: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryAmount: { fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderColor: '#e5e7eb', paddingTop: 8, marginTop: 4 },
  totalLabel: { fontWeight: '700', fontSize: 16 },
  totalAmount: { fontWeight: '700', fontSize: 16, color: '#F97316' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 10, color: '#333' },
  providerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  providerCard: { width: '47%', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, alignItems: 'center' },
  providerEmoji: { fontSize: 28, marginBottom: 6 },
  providerLabel: { fontSize: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 24, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#F97316', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
