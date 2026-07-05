import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

export default function EditProfileScreen() {
  const { user, updateMe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    city: (user as any)?.city ?? '',
    address: (user as any)?.address ?? '',
  });
  const set = (k: keyof typeof form, v: string) => { setError(''); setOk(false); setForm(p => ({ ...p, [k]: v })); };

  const handleSave = async () => {
    setError('');
    if (!form.firstName.trim()) { setError('Le prénom est requis.'); return; }
    setLoading(true);
    try {
      await updateMe({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        city: form.city.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      setOk(true);
      setTimeout(() => router.back(), 700);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Impossible d\'enregistrer les modifications.';
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

          <Text style={styles.title}>Modifier le profil</Text>
          <Text style={styles.subtitle}>Mettez à jour vos informations personnelles</Text>

          <Field label="Prénom" icon="person-outline" placeholder="Votre prénom"
            value={form.firstName} onChangeText={v => set('firstName', v)} autoCapitalize="words" />
          <Field label="Nom" icon="person-outline" placeholder="Votre nom"
            value={form.lastName} onChangeText={v => set('lastName', v)} autoCapitalize="words" />
          <Field label="Numéro de téléphone" icon="call-outline" placeholder="0701234567"
            value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
          <Field label="Ville" icon="location-outline" placeholder="Ex: Abidjan"
            value={form.city} onChangeText={v => set('city', v)} />
          <Field label="Adresse" icon="home-outline" placeholder="Ex: Cocody, Rue des Jardins"
            value={form.address} onChangeText={v => set('address', v)} />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {ok ? (
            <View style={styles.okBox}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#15803D" />
              <Text style={styles.okText}>Profil mis à jour !</Text>
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
                  <Text style={styles.btnText}>Enregistrer</Text>
                </>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label, icon, ...props
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput style={styles.input} placeholderTextColor="#9CA3AF" {...props} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F5F7' },
  content: { padding: 24, paddingBottom: 48 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { color: '#6B3FA0', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 14, paddingHorizontal: 12,
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
