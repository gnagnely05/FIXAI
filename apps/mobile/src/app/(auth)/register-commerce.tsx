import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

const CITIES = ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man', 'Divo'];

const BOUTIQUE_CATEGORIES = [
  { id: 'MOBILIER', label: 'Mobilier', icon: '🛋️' },
  { id: 'DECORATION_INTERIEURE', label: 'Décoration intérieure', icon: '🖼️' },
  { id: 'LUMINAIRES', label: 'Luminaires', icon: '💡' },
  { id: 'ELECTROMENAGER', label: 'Électroménager', icon: '🏠' },
  { id: 'TEXTILE_TAPIS', label: 'Textile & Tapis', icon: '🧵' },
  { id: 'ACCESSOIRES_DECO', label: 'Accessoires déco', icon: '🎀' },
  { id: 'PEINTURE_DECORATIVE', label: 'Peinture décorative', icon: '🎨' },
  { id: 'MIROIRS_CADRES', label: 'Miroirs & Cadres', icon: '🪞' },
];

const QUINCAILLERIE_CATEGORIES = [
  { id: 'CIMENT_BETON', label: 'Ciment & Béton', icon: '🧱' },
  { id: 'FER_METAUX', label: 'Fer & Métaux', icon: '⚙️' },
  { id: 'PLOMBERIE', label: 'Plomberie', icon: '🚿' },
  { id: 'ELECTRICITE_BTP', label: 'Électricité BTP', icon: '⚡' },
  { id: 'PEINTURE_MURALE', label: 'Peinture murale BTP', icon: '🖌️' },
  { id: 'CARRELAGE', label: 'Carrelage', icon: '⬜' },
  { id: 'VISSERIE_FIXATION', label: 'Visserie & Fixation', icon: '🔩' },
];

const STEPS = ['Responsable', 'Établissement', 'Catégories'];

export default function RegisterCommerce() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { registerProvider } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const isBoutique = type === 'BOUTIQUE';
  const config = isBoutique
    ? { label: 'Boutique', icon: '🛍️', color: '#E65100', role: 'BOUTIQUE', categories: BOUTIQUE_CATEGORIES }
    : { label: 'Quincaillerie', icon: '🏗️', color: '#4E342E', role: 'QUINCAILLERIE', categories: QUINCAILLERIE_CATEGORIES };

  const [form, setForm] = useState({
    firstName: '', lastName: '',
    shopName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    city: '', address: '',
    selectedCategories: [] as string[],
  });

  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const toggleCategory = (catId: string) => {
    setForm(p => ({
      ...p,
      selectedCategories: p.selectedCategories.includes(catId)
        ? p.selectedCategories.filter(c => c !== catId)
        : [...p.selectedCategories, catId],
    }));
  };

  const handleNext = () => {
    if (step === 0) {
      if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password)
        return Alert.alert('Erreur', 'Remplissez tous les champs obligatoires.');
      if (form.password !== form.confirmPassword)
        return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      if (form.password.length < 8)
        return Alert.alert('Erreur', 'Minimum 8 caractères pour le mot de passe.');
    }
    if (step === 1 && !form.shopName)
      return Alert.alert('Erreur', 'Le nom de l\'établissement est requis.');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.city) return Alert.alert('Erreur', 'Choisissez une ville.');
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
        catalogCategories: form.selectedCategories,
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
      <View style={styles.stepBar}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= step && { backgroundColor: config.color }]}>
              <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i <= step && { color: config.color, fontWeight: '700' }]}>{s}</Text>
          </View>
        ))}
        <View style={styles.stepLine} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: config.color }]}>← {step > 0 ? 'Précédent' : 'Retour'}</Text>
        </TouchableOpacity>

        {step === 0 && (
          <View>
            <View style={styles.headerRow}>
              <View style={[styles.iconBox, { backgroundColor: config.color + '18' }]}>
                <Text style={styles.icon}>{config.icon}</Text>
              </View>
              <View>
                <Text style={styles.title}>{config.label}</Text>
                <Text style={styles.subtitle}>Inscription professionnelle</Text>
              </View>
            </View>
            <Text style={styles.stepTitle}>👤 Responsable</Text>
            <Field label="Prénom *" value={form.firstName} onChangeText={v => set('firstName', v)} placeholder="Prénom du responsable" />
            <Field label="Nom *" value={form.lastName} onChangeText={v => set('lastName', v)} placeholder="Nom du responsable" />
            <Field label="Email *" value={form.email} onChangeText={v => set('email', v)} placeholder="email@exemple.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Téléphone *" value={form.phone} onChangeText={v => set('phone', v)} placeholder="0701234567" keyboardType="phone-pad" />
            <Field label="Mot de passe *" value={form.password} onChangeText={v => set('password', v)} placeholder="Minimum 8 caractères" secureTextEntry />
            <Field label="Confirmer *" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)} placeholder="Répétez le mot de passe" secureTextEntry />
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>🏪 Établissement</Text>
            <Field label={`Nom de la ${config.label.toLowerCase()} *`} value={form.shopName} onChangeText={v => set('shopName', v)} placeholder={`Ex: ${isBoutique ? 'Boutique Déco Plus' : 'Quincaillerie Centrale'}`} />
            <Field label="Adresse (optionnel)" value={form.address} onChangeText={v => set('address', v)} placeholder="Ex: Rue du Commerce, Cocody" />

            <Text style={styles.label}>Ville *</Text>
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
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>📦 Catégories de catalogue</Text>
            <Text style={styles.stepSub}>Sélectionnez vos catégories de produits (plusieurs choix possibles)</Text>
            <View style={styles.categoriesGrid}>
              {config.categories.map(cat => {
                const selected = form.selectedCategories.includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catCard, selected && { borderColor: config.color, backgroundColor: config.color + '12' }]}
                    onPress={() => toggleCategory(cat.id)}
                  >
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <Text style={[styles.catLabel, selected && { color: config.color }]}>{cat.label}</Text>
                    {selected && <Text style={[styles.catCheck, { color: config.color }]}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
            {form.selectedCategories.length === 0 && (
              <Text style={styles.catHint}>Aucune catégorie sélectionnée — vous pourrez les ajouter depuis votre profil.</Text>
            )}
          </View>
        )}

        {step < 2 ? (
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: config.color }]} onPress={handleNext}>
            <Text style={styles.nextBtnText}>Suivant →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: config.color }, loading && styles.nextBtnDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextBtnText}>Créer mon compte</Text>}
          </TouchableOpacity>
        )}

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
  stepBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 16, paddingHorizontal: 24,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    position: 'relative',
  },
  stepLine: { position: 'absolute', top: 28, left: '20%', right: '20%', height: 2, backgroundColor: '#E5E7EB', zIndex: 0 },
  stepItem: { alignItems: 'center', zIndex: 1 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepNum: { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 15, fontWeight: '600' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 14 },
  iconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 28 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280' },
  stepTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 16 },
  stepSub: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  citiesScroll: { marginBottom: 16 },
  cityChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff', marginRight: 8 },
  cityText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  cityTextSelected: { color: '#fff' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: '47%', padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#fff', alignItems: 'center', position: 'relative',
  },
  catIcon: { fontSize: 26, marginBottom: 6 },
  catLabel: { fontSize: 12, color: '#374151', fontWeight: '600', textAlign: 'center' },
  catCheck: { position: 'absolute', top: 8, right: 10, fontSize: 14, fontWeight: '800' },
  catHint: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
  nextBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#6B7280', fontSize: 15 },
  link: { color: '#6B3FA0', fontWeight: '700', fontSize: 15 },
});
