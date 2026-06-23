import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { api } from '../../services/api';

interface Commission {
  id: string;
  fixaiRate: number;
  agencyRate: number;
  artisanRate: number;
  isActive: boolean;
}

export default function CommissionScreen() {
  const [commission, setCommission] = useState<Commission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fixai, setFixai] = useState('');
  const [agency, setAgency] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/admin/commission');
      setCommission(res.data);
      setFixai(String(Math.round(res.data.fixaiRate * 100)));
      setAgency(String(Math.round(res.data.agencyRate * 100)));
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les commissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const fixaiNum = parseFloat(fixai) || 0;
  const agencyNum = parseFloat(agency) || 0;
  const artisanNum = Math.max(0, 100 - fixaiNum - agencyNum);
  const isValid = fixaiNum + agencyNum < 100 && fixaiNum >= 0 && agencyNum >= 0;

  const handleSave = async () => {
    if (!isValid) return Alert.alert('Erreur', 'La somme fixAI + agence doit être inférieure à 100%.');
    setSaving(true);
    try {
      await api.post('/admin/commission', {
        fixaiRate: fixaiNum / 100,
        agencyRate: agencyNum / 100,
      });
      Alert.alert('Succès', 'Commissions mises à jour.');
      load();
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Sauvegarde impossible.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator size="large" color="#E65100" style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Current config */}
        <View style={styles.currentCard}>
          <Text style={styles.currentTitle}>Configuration actuelle</Text>
          <View style={styles.rateRow}>
            <RateCard label="fixAI" rate={commission?.fixaiRate ?? 0} color="#1565C0" />
            <RateCard label="Agence" rate={commission?.agencyRate ?? 0} color="#E65100" />
            <RateCard label="Artisan" rate={commission?.artisanRate ?? 0} color="#2E7D32" />
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, { flex: commission?.fixaiRate ?? 0, backgroundColor: '#1565C0' }]} />
            <View style={[styles.progressSegment, { flex: commission?.agencyRate ?? 0, backgroundColor: '#E65100' }]} />
            <View style={[styles.progressSegment, { flex: commission?.artisanRate ?? 1, backgroundColor: '#2E7D32' }]} />
          </View>
        </View>

        {/* Edit */}
        <View style={styles.editCard}>
          <Text style={styles.editTitle}>Modifier les taux</Text>
          <Text style={styles.editSub}>La part artisan est calculée automatiquement</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>fixAI (%)</Text>
              <TextInput
                style={styles.input}
                value={fixai}
                onChangeText={setFixai}
                keyboardType="numeric"
                placeholder="Ex: 3"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Agence (%)</Text>
              <TextInput
                style={styles.input}
                value={agency}
                onChangeText={setAgency}
                keyboardType="numeric"
                placeholder="Ex: 2"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={[styles.artisanPreview, { backgroundColor: isValid ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[styles.artisanLabel, { color: isValid ? '#2E7D32' : '#B71C1C' }]}>
              Part artisan calculée : {artisanNum.toFixed(1)}%
            </Text>
            {!isValid && <Text style={styles.errorText}>⚠️ Taux invalides (total &gt; 100%)</Text>}
          </View>

          <View style={styles.previewBar}>
            {fixaiNum > 0 && <View style={[styles.previewSeg, { flex: fixaiNum, backgroundColor: '#1565C0' }]}><Text style={styles.previewSegText}>{fixaiNum}%</Text></View>}
            {agencyNum > 0 && <View style={[styles.previewSeg, { flex: agencyNum, backgroundColor: '#E65100' }]}><Text style={styles.previewSegText}>{agencyNum}%</Text></View>}
            {artisanNum > 0 && <View style={[styles.previewSeg, { flex: artisanNum, backgroundColor: '#2E7D32' }]}><Text style={styles.previewSegText}>{artisanNum.toFixed(0)}%</Text></View>}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, (!isValid || saving) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!isValid || saving}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Sauvegarde...' : 'Sauvegarder les taux'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Comment ça fonctionne</Text>
          <Text style={styles.infoText}>
            Pour chaque paiement client :{'\n'}
            • fixAI perçoit {commission ? (commission.fixaiRate * 100).toFixed(0) : '—'}% de commission{'\n'}
            • L'agence perçoit {commission ? (commission.agencyRate * 100).toFixed(0) : '—'}% (si applicable){'\n'}
            • L'artisan reçoit {commission ? (commission.artisanRate * 100).toFixed(0) : '—'}% du montant total
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RateCard({ label, rate, color }: { label: string; rate: number; color: string }) {
  return (
    <View style={[rStyles.card, { borderColor: color }]}>
      <Text style={[rStyles.rate, { color }]}>{(rate * 100).toFixed(1)}%</Text>
      <Text style={rStyles.label}>{label}</Text>
    </View>
  );
}

const rStyles = StyleSheet.create({
  card: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 2, backgroundColor: '#fff' },
  rate: { fontSize: 22, fontWeight: '900' },
  label: { fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '600' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 40 },
  currentCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  currentTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 14 },
  rateRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  progressBar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 },
  progressSegment: { borderRadius: 4 },
  editCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  editTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 4 },
  editSub: { fontSize: 12, color: '#6B7280', marginBottom: 16 },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center',
  },
  artisanPreview: { borderRadius: 12, padding: 14, marginBottom: 16, alignItems: 'center' },
  artisanLabel: { fontSize: 16, fontWeight: '800' },
  errorText: { fontSize: 12, color: '#B71C1C', marginTop: 4 },
  previewBar: { flexDirection: 'row', height: 32, borderRadius: 10, overflow: 'hidden', gap: 2, marginBottom: 16 },
  previewSeg: { justifyContent: 'center', alignItems: 'center', borderRadius: 6, minWidth: 30 },
  previewSegText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  saveBtn: { backgroundColor: '#E65100', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#D1D5DB' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  infoBox: { backgroundColor: '#E3F2FD', borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: '#1565C0' },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#1565C0', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#374151', lineHeight: 22 },
});
