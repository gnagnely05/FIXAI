import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

const CITIES = ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man', 'Divo'];

export default function RegisterCommerce() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { registerProvider } = useAuth();
  const [loading, setLoading] = useState(false);

  const isBoutique = type === 'BOUTIQUE';
  const config = isBoutique
    ? { label: 'Boutique', icon: '🛍️', color: '#E65100', role: 'BOUTIQUE' }
    : { label: 'Quincaillerie', icon: '🏗️', color: '#4E342E', role: 'QUINCAILLERIE' };

  const [form, setForm] = useState({
    firstName: '', lastName: '',
    shopName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    city: '', address: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.shopName || !form.email || !form.phone || !form.password || !form.city) {
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
        role: config.role,
        city: form.city,
        shopName: form.shopName,
        address: form.address,
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
          <Text style={[styles.backText, { color: config.color }]}>← Retour</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <View style={[styles.iconBox, { backgroundColor: config.color + '18' }]}>
            <Text style={styles.icon}>{config.icon}</Text>
          </View>
          <View>
            <Text style={styles.title}>{config.label}</Text>
            <Text style={styles.subtitle}>Inscription professionnelle</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>👤 Responsable</Text>
        <Field label="Prénom *" value={form.firstName} onChangeText={v => set('firstName', v)} placeholder="Prénom du responsable" />
        <Field label="Nom *" value={form.lastName} onChangeText={v => set('lastName', v)} placeholder="Nom du responsable" />

        <Text style={styles.sectionTitle}>🏪 Établissement</Text>
        <Field label={`Nom de la ${config.label.toLowerCase()} *`} value={form.shopName} onChangeText={v => set('shopName', v)} placeholder={`Ex: ${isBoutique ? 'Boutique Déco Plus' : 'Quincaillerie Centrale'}`} />
        <Field label="Adresse (optionnel)" value={form.address} onChangeText={v => set('address', v)} placeholder="Ex: Rue du Commerce, Cocody" />

        <Text style={styles.sectionTitle}>📍 Ville</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.citiesScroll}>
          {CITIES.map(city => (
            <TouchableOpacity
              key={city}
              style={[styles.cityChip, form.city === city && { backgroundColor: config.color, borderColor: config.color }]}
              onPress={() => set('city', city)}
            >
              <Text style={[styles.cityText, form.city === city && styles.cityTextSelected]}>{city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>🔐 Connexion</Text>
        <Field label="Email *" value={form.email} onChangeText={v => set('email', v)} placeholder="email@exemple.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Téléphone *" value={form.phone} onChangeText={v => set('phone', v)} placeholder="0701234567" keyboardType="phone-pad" />
        <Field label="Mot de passe *" value={form.password} onChangeText={v => set('password', v)} placeholder="Minimum 8 caractères" secureTextEntry />
        <Field label="Confirmer *" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)} placeholder="Répétez le mot de passe" secureTextEntry />

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: config.color }, loading && styles.submitBtnDisabled]}
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
  backText: { fontSize: 15, fontWeight: '600' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 14 },
  iconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 28 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10, marginTop: 8 },
  citiesScroll: { marginBottom: 16 },
  cityChip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#fff', marginRight: 8,
  },
  cityText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  cityTextSelected: { color: '#fff' },
  submitBtn: {
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 12,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#6B7280', fontSize: 15 },
  link: { color: '#6B3FA0', fontWeight: '700', fontSize: 15 },
});
