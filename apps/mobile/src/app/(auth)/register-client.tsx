import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

const CITIES = ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man', 'Divo'];
const PAYMENT_METHODS = [
  { id: 'ORANGE_MONEY', label: 'Orange Money', icon: '🟠' },
  { id: 'MTN_MOMO', label: 'MTN MoMo', icon: '🟡' },
  { id: 'WAVE', label: 'Wave', icon: '🔵' },
  { id: 'CARTE_BANCAIRE', label: 'Carte bancaire', icon: '💳' },
];

export default function RegisterClient() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', password: '', confirmPassword: '',
    city: '', preferredPayment: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      return Alert.alert('Champs manquants', 'Veuillez remplir tous les champs.');
    }
    if (form.password !== form.confirmPassword) {
      return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
    }
    if (form.password.length < 8) {
      return Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
    }
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'CLIENT' as any,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Inscription impossible. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>👤</Text>
          </View>
          <View>
            <Text style={styles.title}>Compte Client</Text>
            <Text style={styles.subtitle}>Accédez aux meilleurs artisans</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>👤 Identité</Text>
        <Field label="Prénom" value={form.firstName} onChangeText={v => set('firstName', v)} placeholder="Ex: Kouamé" />
        <Field label="Nom" value={form.lastName} onChangeText={v => set('lastName', v)} placeholder="Ex: Diabaté" />
        <Field label="Email" value={form.email} onChangeText={v => set('email', v)} placeholder="email@exemple.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Téléphone" value={form.phone} onChangeText={v => set('phone', v)} placeholder="0701234567" keyboardType="phone-pad" />

        <Text style={styles.sectionTitle}>📍 Localisation</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
          {CITIES.map(city => (
            <TouchableOpacity
              key={city}
              style={[styles.chip, form.city === city && styles.chipSelected]}
              onPress={() => set('city', city)}
            >
              <Text style={[styles.chipText, form.city === city && styles.chipTextSelected]}>{city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>💳 Moyen de paiement préféré</Text>
        <View style={styles.paymentRow}>
          {PAYMENT_METHODS.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.payChip, form.preferredPayment === p.id && styles.payChipSelected]}
              onPress={() => set('preferredPayment', p.id)}
            >
              <Text style={styles.payIcon}>{p.icon}</Text>
              <Text style={[styles.payText, form.preferredPayment === p.id && styles.payTextSelected]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>🔐 Sécurité</Text>
        <Field label="Mot de passe" value={form.password} onChangeText={v => set('password', v)} placeholder="Minimum 8 caractères" secureTextEntry />
        <Field label="Confirmer le mot de passe" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)} placeholder="Répétez le mot de passe" secureTextEntry />

        <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Créer mon compte</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <Link href="/(auth)/login" style={styles.link}>Se connecter</Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={fStyles.field}>
      <Text style={fStyles.label}>{label}</Text>
      <TextInput style={fStyles.input} placeholderTextColor="#9CA3AF" {...props} />
    </View>
  );
}

const fStyles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#111827',
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#6B3FA0', fontSize: 15, fontWeight: '600' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 14 },
  iconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#6B3FA018', alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 28 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10, marginTop: 8 },
  scroll: { marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff', marginRight: 8 },
  chipSelected: { backgroundColor: '#6B3FA0', borderColor: '#6B3FA0' },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  paymentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  payChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  payChipSelected: { borderColor: '#6B3FA0', backgroundColor: '#6B3FA010' },
  payIcon: { fontSize: 16 },
  payText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  payTextSelected: { color: '#6B3FA0', fontWeight: '700' },
  submitBtn: { backgroundColor: '#6B3FA0', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { backgroundColor: '#D1D5DB' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#6B7280', fontSize: 15 },
  link: { color: '#6B3FA0', fontWeight: '700', fontSize: 15 },
});
