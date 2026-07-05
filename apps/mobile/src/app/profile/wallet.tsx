import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

const OPERATORS: Array<{ id: string; label: string; color: string }> = [
  { id: 'ORANGE_MONEY', label: 'Orange Money', color: '#FF6600' },
  { id: 'MTN',          label: 'MTN MoMo',     color: '#FFCB05' },
  { id: 'MOOV',         label: 'Moov Money',   color: '#0066B3' },
  { id: 'WAVE',         label: 'Wave',         color: '#1DC3F3' },
];

export default function WalletScreen() {
  const { user, updateMe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  const balance = Number((user as any)?.walletBalance ?? 0);
  const [method, setMethod] = useState<string>((user as any)?.payoutMethod ?? '');
  const [number, setNumber] = useState<string>((user as any)?.payoutNumber ?? '');

  const handleSave = async () => {
    setError(''); setOk(false);
    if (!method) { setError('Choisissez un opérateur de paiement.'); return; }
    if (!number.trim()) { setError('Entrez le numéro qui recevra les paiements.'); return; }
    setLoading(true);
    try {
      await updateMe({ payoutMethod: method, payoutNumber: number.trim() });
      setOk(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Impossible d\'enregistrer le compte de paiement.';
      setError(Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#6B3FA0" />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Mon portefeuille</Text>

          {/* Solde */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <Ionicons name="wallet" size={22} color="#fff" />
              <Text style={styles.balanceLabel}>Solde disponible</Text>
            </View>
            <Text style={styles.balanceAmount}>{balance.toLocaleString('fr-FR')} FCFA</Text>
          </View>

          {/* Compte de paiement */}
          <Text style={styles.sectionTitle}>Compte de paiement</Text>
          <Text style={styles.sectionSub}>
            Choisissez l'opérateur et le numéro qui recevront vos retraits.
          </Text>

          <View style={styles.opGrid}>
            {OPERATORS.map(op => {
              const active = method === op.id;
              return (
                <TouchableOpacity
                  key={op.id}
                  style={[styles.opChip, active && { borderColor: op.color, backgroundColor: op.color + '15' }]}
                  onPress={() => { setMethod(op.id); setError(''); setOk(false); }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.opDot, { backgroundColor: op.color }]} />
                  <Text style={[styles.opText, active && { color: '#111827', fontWeight: '700' }]}>{op.label}</Text>
                  {active && <Ionicons name="checkmark-circle" size={18} color={op.color} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Numéro de paiement</Text>
          <View style={styles.inputRow}>
            <Ionicons name="call-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="0701234567"
              placeholderTextColor="#9CA3AF"
              value={number}
              onChangeText={v => { setNumber(v); setError(''); setOk(false); }}
              keyboardType="phone-pad"
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {ok ? (
            <View style={styles.okBox}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#15803D" />
              <Text style={styles.okText}>Compte de paiement enregistré !</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.btnText}>Enregistrer le compte</Text>
                </>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F5F7' },
  content: { padding: 24, paddingBottom: 48 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { color: '#6B3FA0', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 20 },
  balanceCard: {
    backgroundColor: '#6B3FA0', borderRadius: 20, padding: 20, marginBottom: 28,
    shadowColor: '#6B3FA0', shadowOpacity: 0.25, shadowRadius: 12, elevation: 4,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  balanceAmount: { color: '#fff', fontSize: 30, fontWeight: '900' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 19 },
  opGrid: { gap: 10, marginBottom: 20 },
  opChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
  },
  opDot: { width: 12, height: 12, borderRadius: 6 },
  opText: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '500' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 14, paddingHorizontal: 12, marginBottom: 16,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: '#111827' },
  errorBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626', lineHeight: 19 },
  okBox: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: '#ECFDF3', borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  okText: { flex: 1, fontSize: 13, color: '#15803D', lineHeight: 19, fontWeight: '600' },
  btn: {
    backgroundColor: '#6B3FA0', borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8,
  },
  btnDisabled: { backgroundColor: '#C4B5E8' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
