import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

const CITIES = ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man', 'Divo'];
const RADIUS_OPTIONS = [5, 10, 20, 30, 50];

export default function RegisterAgence() {
  const router = useRouter();
  const { registerProvider } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', agencyName: '',
    email: '', phone: '', password: '', confirmPassword: '',
    city: '', radiusKm: 10,
    description: '',
  });

  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.agencyName || !form.email || !form.phone || !form.password || !form.city) {
      return Alert.alert('Champs manquants', 'Veuillez remplir tous les champs obligatoires.');
    }
    if (form.password !== form.confirmPassword) {
      return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
    }
    if (form.password.length < 8) {
      return Alert.alert('Erreur', 'Minimum 8 caractères pour le mot de passe.');
    }
    setLoading(true);
    try {
      await registerProvider({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'AGENCE_HOTE',
        city: form.city,
        radiusKm: form.radiusKm,
        agencyName: form.agencyName,
        description: form.description,
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
            <Text style={styles.icon}>🏢</Text>
          </View>
          <View>
            <Text style={styles.title}>Agence</Text>
            <Text style={styles.subtitle}>Inscription professionnelle</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>👤 Responsable</Text>
        <Field label="Prénom *" value={form.firstName} onChangeText={v => set('firstName', v)} placeholder="Prénom du responsable" />
        <Field label="Nom *" value={form.lastName} onChangeText={v => set('lastName', v)} placeholder="Nom du responsable" />

        <Text style={styles.sectionTitle}>🏢 Agence</Text>
        <Field label="Nom de l'agence *" value={form.agencyName} onChangeText={v => set('agencyName', v)} placeholder="Ex: Agence Construire CI" />
        <Field
          label="Description (optionnel)"
          value={form.description}
          onChangeText={v => set('description', v)}
          placeholder="Décrivez les services de votre agence..."
          multiline
          style={{ height: 80, textAlignVertical: 'top' }}
        />

        <Text style={styles.sectionTitle}>📍 Zone de couverture</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.citiesScroll}>
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

        <Text style={styles.label}>Rayon d'intervention (km)</Text>
        <View style={styles.radiusRow}>
          {RADIUS_OPTIONS.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusChip, form.radiusKm === r && styles.radiusChipSelected]}
              onPress={() => set('radiusKm', r)}
            >
              <Text style={[styles.radiusText, form.radiusKm === r && styles.radiusTextSelected]}>{r} km</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>🔐 Connexion</Text>
        <Field label="Email *" value={form.email} onChangeText={v => set('email', v)} placeholder="email@agence.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Téléphone *" value={form.phone} onChangeText={v => set('phone', v)} placeholder="0701234567" keyboardType="phone-pad" />
        <Field label="Mot de passe *" value={form.password} onChangeText={v => set('password', v)} placeholder="Minimum 8 caractères" secureTextEntry />
        <Field label="Confirmer *" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)} placeholder="Répétez le mot de passe" secureTextEntry />

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
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
  backText: { color: '#1565C0', fontSize: 15, fontWeight: '600' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 14 },
  iconBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#1565C018', alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 28 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10, marginTop: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  citiesScroll: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#fff', marginRight: 8,
  },
  chipSelected: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  radiusRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  radiusChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff',
  },
  radiusChipSelected: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  radiusText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  radiusTextSelected: { color: '#fff' },
  submitBtn: {
    backgroundColor: '#1565C0', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 12,
  },
  submitBtnDisabled: { backgroundColor: '#D1D5DB' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#6B7280', fontSize: 15 },
  link: { color: '#6B3FA0', fontWeight: '700', fontSize: 15 },
});
