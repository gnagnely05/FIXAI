import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../services/api';

const CITIES = ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man', 'Divo'];

const STATUSES = [
  { id: 'REGISTERED', label: 'Inscrit', color: '#9CA3AF' },
  { id: 'DOCS_SUBMITTED', label: 'Docs soumis', color: '#F59E0B' },
  { id: 'PENDING_VERIFICATION', label: 'En vérification', color: '#3B82F6' },
  { id: 'IDENTITY_VERIFIED', label: 'Identité vérifiée', color: '#8B5CF6' },
  { id: 'ACTIVE', label: 'Actif', color: '#2E7D32' },
  { id: 'AGENCY_ACTIVE', label: 'Agence active', color: '#2E7D32' },
  { id: 'SHOP_REGISTERED', label: 'Boutique enregistrée', color: '#E65100' },
  { id: 'HARDWARE_REGISTERED', label: 'Quincaillerie enregistrée', color: '#4E342E' },
  { id: 'SUSPENDED', label: 'Suspendu', color: '#B71C1C' },
  { id: 'REJECTED', label: 'Rejeté', color: '#EF4444' },
];

export default function ActorEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [originalRole, setOriginalRole] = useState('');

  useEffect(() => {
    api.get(`/admin/actors/${id}`)
      .then(res => {
        const { documents, ...user } = res.data;
        setForm(user);
        setOriginalRole(user.role);
      })
      .catch(() => Alert.alert('Erreur', 'Impossible de charger cet acteur.'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/actors/${id}`, form);
      Alert.alert('Succès', 'Profil mis à jour.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Sauvegarde impossible.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator size="large" color="#1565C0" style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Identity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Identité</Text>
          <Field label="Prénom" value={form.firstName ?? ''} onChangeText={v => set('firstName', v)} />
          <Field label="Nom" value={form.lastName ?? ''} onChangeText={v => set('lastName', v)} />
          <Field label="Email" value={form.email ?? ''} onChangeText={v => set('email', v)} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Téléphone" value={form.phone ?? ''} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
        </View>

        {/* Role-specific fields */}
        {(originalRole === 'AGENCE_HOTE' || originalRole === 'ENTREPRISE_BTP') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏢 Agence / Entreprise</Text>
            <Field label="Nom de l'agence" value={form.agencyName ?? ''} onChangeText={v => set('agencyName', v)} />
            <Field label="Description" value={form.description ?? ''} onChangeText={v => set('description', v)} multiline style={{ height: 70, textAlignVertical: 'top' }} />
            <Text style={styles.fieldLabel}>Rayon (km)</Text>
            <TextInput
              style={styles.input}
              value={String(form.radiusKm ?? '')}
              onChangeText={v => set('radiusKm', parseInt(v) || 0)}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}

        {(originalRole === 'BOUTIQUE' || originalRole === 'QUINCAILLERIE') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏪 Établissement</Text>
            <Field label="Nom" value={form.shopName ?? ''} onChangeText={v => set('shopName', v)} />
            <Field label="Adresse" value={form.address ?? ''} onChangeText={v => set('address', v)} />
          </View>
        )}

        {/* City */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Ville</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipsRow}>
              {CITIES.map(city => (
                <TouchableOpacity
                  key={city}
                  style={[styles.chip, form.city === city && styles.chipSelected]}
                  onPress={() => set('city', city)}
                >
                  <Text style={[styles.chipText, form.city === city && styles.chipTextSelected]}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Verification status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 Statut de vérification</Text>
          <View style={styles.statusGrid}>
            {STATUSES.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[styles.statusChip, form.verificationStatus === s.id && { borderColor: s.color, backgroundColor: s.color + '18' }]}
                onPress={() => set('verificationStatus', s.id)}
              >
                <View style={[styles.statusDot, { backgroundColor: s.color }]} />
                <Text style={[styles.statusChipText, form.verificationStatus === s.id && { color: s.color, fontWeight: '700' }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, style, ...props }: { label: string; style?: any } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={fStyles.field}>
      <Text style={fStyles.label}>{label}</Text>
      <TextInput style={[fStyles.input, style]} placeholderTextColor="#9CA3AF" {...props} />
    </View>
  );
}

const fStyles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 5 },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827',
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 40 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 5 },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827', marginBottom: 12,
  },
  chipsRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  chipSelected: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusChipText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  saveBtn: { backgroundColor: '#1565C0', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  saveBtnDisabled: { backgroundColor: '#D1D5DB' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
