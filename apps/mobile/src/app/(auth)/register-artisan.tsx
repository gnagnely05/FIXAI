import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

const SPECIALTIES = [
  { id: 'PLOMBERIE', label: 'Plomberie', icon: '🚿' },
  { id: 'ELECTRICITE', label: 'Électricité', icon: '⚡' },
  { id: 'MACONNERIE', label: 'Maçonnerie', icon: '🧱' },
  { id: 'MENUISERIE', label: 'Menuiserie', icon: '🪚' },
  { id: 'PEINTURE', label: 'Peinture', icon: '🎨' },
  { id: 'DECORATION', label: 'Décoration', icon: '🛋️' },
  { id: 'CARRELAGE', label: 'Carrelage', icon: '⬜' },
  { id: 'CLIMATISATION', label: 'Climatisation', icon: '❄️' },
  { id: 'TOITURE', label: 'Toiture', icon: '🏠' },
  { id: 'FERRONNERIE', label: 'Ferronnerie', icon: '⚙️' },
];

const CITIES = ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man', 'Divo'];
const STEPS = ['Identité', 'Spécialité', 'Profil', 'Documents'];

export default function RegisterArtisan() {
  const router = useRouter();
  const { registerProvider } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', password: '', confirmPassword: '',
    specialty: '',
    city: '', bio: '',
    yearsOfExperience: '',
    hourlyRate: '',
    mobileMoneyNumber: '',
    mobileMoneyOperator: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validateStep0 = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password)
      return 'Veuillez remplir tous les champs.';
    if (form.password !== form.confirmPassword)
      return 'Les mots de passe ne correspondent pas.';
    if (form.password.length < 8)
      return 'Le mot de passe doit contenir au moins 8 caractères.';
    return null;
  };

  const handleNext = () => {
    if (step === 0) {
      const err = validateStep0();
      if (err) return Alert.alert('Erreur', err);
    }
    if (step === 1 && !form.specialty) {
      return Alert.alert('Erreur', 'Choisissez une spécialité.');
    }
    if (step === 2 && !form.city) {
      return Alert.alert('Erreur', 'Indiquez votre ville.');
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.mobileMoneyNumber || !form.mobileMoneyOperator) {
      return Alert.alert('Erreur', 'Le numéro Mobile Money est obligatoire.');
    }
    setLoading(true);
    try {
      await registerProvider({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'ARTISAN',
        city: form.city,
        specialty: form.specialty,
        bio: form.bio,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
        hourlyRate: form.hourlyRate ? parseInt(form.hourlyRate) : undefined,
        mobileMoneyNumber: `${form.mobileMoneyOperator}:${form.mobileMoneyNumber}`,
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
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
              <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>{s}</Text>
          </View>
        ))}
        <View style={styles.stepLine} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {step > 0 ? 'Précédent' : 'Retour'}</Text>
        </TouchableOpacity>

        {step === 0 && (
          <View>
            <Text style={styles.stepTitle}>👋 Votre identité</Text>
            <Field label="Prénom" value={form.firstName} onChangeText={v => set('firstName', v)} placeholder="Ex: Kouamé" />
            <Field label="Nom" value={form.lastName} onChangeText={v => set('lastName', v)} placeholder="Ex: Diabaté" />
            <Field label="Email" value={form.email} onChangeText={v => set('email', v)} placeholder="email@exemple.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Téléphone" value={form.phone} onChangeText={v => set('phone', v)} placeholder="0701234567" keyboardType="phone-pad" />
            <Field label="Mot de passe" value={form.password} onChangeText={v => set('password', v)} placeholder="Minimum 8 caractères" secureTextEntry />
            <Field label="Confirmer le mot de passe" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)} placeholder="Répétez le mot de passe" secureTextEntry />
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>🔧 Votre spécialité</Text>
            <Text style={styles.stepSub}>Choisissez votre domaine d'expertise principal</Text>
            <View style={styles.specialtyGrid}>
              {SPECIALTIES.map(sp => (
                <TouchableOpacity
                  key={sp.id}
                  style={[styles.specialtyCard, form.specialty === sp.id && styles.specialtyCardSelected]}
                  onPress={() => set('specialty', sp.id)}
                >
                  <Text style={styles.specialtyIcon}>{sp.icon}</Text>
                  <Text style={[styles.specialtyLabel, form.specialty === sp.id && styles.specialtyLabelSelected]}>
                    {sp.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>📋 Votre profil</Text>
            <Text style={styles.stepSub}>Ces informations seront visibles par les clients</Text>

            <Text style={styles.label}>Ville d'intervention</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.citiesScroll}>
              {CITIES.map(city => (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityChip, form.city === city && styles.cityChipSelected]}
                  onPress={() => set('city', city)}
                >
                  <Text style={[styles.cityText, form.city === city && styles.cityTextSelected]}>{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Field
              label="Biographie (optionnel)"
              value={form.bio}
              onChangeText={v => set('bio', v)}
              placeholder="Décrivez votre expérience et vos compétences..."
              multiline
              style={{ height: 90, textAlignVertical: 'top' }}
            />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Field label="Années d'expérience" value={form.yearsOfExperience} onChangeText={v => set('yearsOfExperience', v)} placeholder="Ex: 5" keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Tarif horaire (FCFA)" value={form.hourlyRate} onChangeText={v => set('hourlyRate', v)} placeholder="Ex: 5000" keyboardType="numeric" />
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>📄 Documents & Paiement</Text>
            <Text style={styles.stepSub}>Votre compte sera activé après vérification</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>ℹ️ Vous pourrez uploader vos documents (CNI + selfie) depuis votre profil après inscription.</Text>
            </View>

            <Text style={styles.label}>Opérateur Mobile Money *</Text>
            <View style={styles.operatorRow}>
              {[
                { id: 'ORANGE', label: 'Orange Money', icon: '🟠' },
                { id: 'MTN', label: 'MTN MoMo', icon: '🟡' },
                { id: 'WAVE', label: 'Wave', icon: '🔵' },
              ].map(op => (
                <TouchableOpacity
                  key={op.id}
                  style={[styles.operatorChip, form.mobileMoneyOperator === op.id && styles.operatorChipSelected]}
                  onPress={() => set('mobileMoneyOperator', op.id)}
                >
                  <Text style={styles.operatorIcon}>{op.icon}</Text>
                  <Text style={[styles.operatorText, form.mobileMoneyOperator === op.id && styles.operatorTextSelected]}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Field
              label="Numéro Mobile Money *"
              value={form.mobileMoneyNumber}
              onChangeText={v => set('mobileMoneyNumber', v)}
              placeholder="Ex: 0701234567"
              keyboardType="phone-pad"
            />

            <View style={styles.docsInfoBox}>
              <Text style={styles.docsInfoTitle}>Documents requis (à uploader après inscription)</Text>
              <Text style={styles.docsInfoItem}>• CNI / Carte nationale d'identité (photo recto-verso)</Text>
              <Text style={styles.docsInfoItem}>• Selfie avec la CNI</Text>
              <Text style={styles.docsInfoItem}>• Justificatif de compétence (optionnel)</Text>
            </View>
          </View>
        )}

        {step < 3 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>Suivant →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.nextBtn, loading && styles.nextBtnDisabled]} onPress={handleSubmit} disabled={loading}>
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
  stepBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 16, paddingHorizontal: 24,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    position: 'relative',
  },
  stepLine: { position: 'absolute', top: 28, left: '15%', right: '15%', height: 2, backgroundColor: '#E5E7EB', zIndex: 0 },
  stepItem: { alignItems: 'center', zIndex: 1 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepDotActive: { backgroundColor: '#2E7D32' },
  stepNum: { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  stepLabelActive: { color: '#2E7D32', fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#2E7D32', fontSize: 15, fontWeight: '600' },
  stepTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  stepSub: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  specialtyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  specialtyCard: { width: '30%', alignItems: 'center', paddingVertical: 14, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB' },
  specialtyCardSelected: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  specialtyIcon: { fontSize: 26, marginBottom: 6 },
  specialtyLabel: { fontSize: 11, color: '#374151', fontWeight: '600', textAlign: 'center' },
  specialtyLabelSelected: { color: '#2E7D32' },
  citiesScroll: { marginBottom: 18 },
  cityChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff', marginRight: 8 },
  cityChipSelected: { borderColor: '#2E7D32', backgroundColor: '#2E7D32' },
  cityText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  cityTextSelected: { color: '#fff' },
  row: { flexDirection: 'row' },
  infoBox: { backgroundColor: '#E3F2FD', borderRadius: 12, padding: 14, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#1565C0' },
  infoText: { fontSize: 13, color: '#1565C0', lineHeight: 19 },
  operatorRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  operatorChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  operatorChipSelected: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  operatorIcon: { fontSize: 16 },
  operatorText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  operatorTextSelected: { color: '#2E7D32', fontWeight: '700' },
  docsInfoBox: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 8 },
  docsInfoTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10 },
  docsInfoItem: { fontSize: 13, color: '#6B7280', marginBottom: 6, lineHeight: 19 },
  nextBtn: { backgroundColor: '#2E7D32', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  nextBtnDisabled: { backgroundColor: '#D1D5DB' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#6B7280', fontSize: 15 },
  link: { color: '#6B3FA0', fontWeight: '700', fontSize: 15 },
});
