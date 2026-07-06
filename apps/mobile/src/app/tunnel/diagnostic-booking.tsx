import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, TextInput, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function DiagnosticBooking() {
  const params = useLocalSearchParams<{ serviceType: string; description: string; fee: string }>();
  const { user } = useAuth();
  const fee = Number(params.fee ?? 5000);

  const [address, setAddress] = useState((user as any)?.address ?? '');
  const [city, setCity] = useState((user as any)?.city ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleBook = async () => {
    setError('');
    if (!address.trim()) { setError('Veuillez indiquer votre adresse.'); return; }
    if (!city.trim()) { setError('Veuillez indiquer votre ville.'); return; }
    setLoading(true);
    try {
      await api.post('/orders/diagnostic', {
        serviceType: params.serviceType,
        description: params.description || 'Diagnostic sur place',
        address: address.trim(),
        city: city.trim(),
        diagnosticFeeXof: fee,
      });
      setDone(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Réservation impossible.';
      setError(Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneWrap}>
          <View style={styles.doneIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#15803D" />
          </View>
          <Text style={styles.doneTitle}>Diagnostic réservé !</Text>
          <Text style={styles.doneText}>
            Un artisan qualifié va accepter votre demande de diagnostic. Vous serez notifié
            dès qu'il aura réalisé son constat, puis vous recevrez un devis précis.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)/orders')}>
            <Text style={styles.btnText}>Voir mes demandes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#B45309" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        <View style={styles.iconWrap}>
          <Ionicons name="construct-outline" size={32} color="#B45309" />
        </View>
        <Text style={styles.title}>Réserver un diagnostic</Text>
        <Text style={styles.subtitle}>
          Un artisan se déplace pour inspecter le problème et établir un constat précis.
        </Text>

        <View style={styles.feeCard}>
          <Text style={styles.feeLabel}>Frais de diagnostic</Text>
          <Text style={styles.feeValue}>{fee.toLocaleString('fr-FR')} FCFA</Text>
          <Text style={styles.feeNote}>
            Ce montant est déduit du devis final si vous confirmez la réparation. Sinon, il
            rémunère le déplacement de l'artisan.
          </Text>
        </View>

        <Text style={styles.label}>Adresse</Text>
        <View style={styles.inputRow}>
          <Ionicons name="home-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={styles.input} placeholder="Ex: Cocody, Rue des Jardins"
            placeholderTextColor="#9CA3AF" value={address} onChangeText={v => { setAddress(v); setError(''); }} />
        </View>

        <Text style={styles.label}>Ville</Text>
        <View style={styles.inputRow}>
          <Ionicons name="location-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={styles.input} placeholder="Ex: Abidjan"
            placeholderTextColor="#9CA3AF" value={city} onChangeText={v => { setCity(v); setError(''); }} />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleBook} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Confirmer la réservation</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F5F7' },
  content: { padding: 24, paddingBottom: 48 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { color: '#B45309', fontSize: 15, fontWeight: '600' },
  iconWrap: {
    width: 72, height: 72, borderRadius: 22, alignSelf: 'center',
    backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  feeCard: {
    backgroundColor: '#FFF7ED', borderRadius: 16, padding: 18, marginBottom: 24,
    borderWidth: 1, borderColor: '#FED7AA',
  },
  feeLabel: { fontSize: 13, color: '#9A3412', fontWeight: '600' },
  feeValue: { fontSize: 28, fontWeight: '900', color: '#B45309', marginVertical: 4 },
  feeNote: { fontSize: 12, color: '#9A3412', lineHeight: 18 },
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
  btn: {
    backgroundColor: '#B45309', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  btnDisabled: { backgroundColor: '#E5C9A8' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  doneWrap: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  doneIcon: { marginBottom: 20 },
  doneTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12 },
  doneText: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
});
