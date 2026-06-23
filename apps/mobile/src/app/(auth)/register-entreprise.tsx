import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

const CITIES = ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man', 'Divo'];
const RADIUS_OPTIONS = [10, 20, 50, 100];
const STEPS = ['Responsable', 'Entreprise', 'Mode BTP', 'Zones', 'Documents'];

const BTP_MODES = [
  {
    id: 'AGENCY',
    label: 'Mode Agence',
    icon: '🏢',
    desc: 'Vous gérez une équipe d\'artisans salariés ou sous-traitants. Vous recevez les appels d\'offres et les distribuez.',
  },
  {
    id: 'ARTISAN',
    label: 'Mode Artisan',
    icon: '🔧',
    desc: 'Vous opérez comme un artisan indépendant sous la marque de votre entreprise. Idéal pour les auto-entrepreneurs BTP.',
  },
  {
    id: 'MIXED',
    label: 'Mode Mixte',
    icon: '⚡',
    desc: 'Combinaison des deux : vous intervenez personnellement ET gérez une équipe selon les projets.',
  },
];

export default function RegisterEntreprise() {
  const router = useRouter();
  const { registerProvider } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '',
    companyName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    btpMode: '',
    city: '', radiusKm: 20,
    description: '',
    mobileMoneyNumber: '', mobileMoneyOperator: '',
  });

  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleNext = () => {
    if (step === 0) {
      if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password)
        return Alert.alert('Erreur', 'Remplissez tous les champs obligatoires.');
      if (form.password !== form.confirmPassword)
        return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      if (form.password.length < 8)
        return Alert.alert('Erreur', 'Minimum 8 caractères pour le mot de passe.');
    }
    if (step === 1 && !form.companyName)
      return Alert.alert('Erreur', 'Le nom de l\'entreprise est requis.');
    if (step === 2 && !form.btpMode)
      return Alert.alert('Erreur', 'Choisissez un mode d\'opération.');
    if (step === 3 && !form.city)
      return Alert.alert('Erreur', 'Choisissez une ville.');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await registerProvider({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'ENTREPRISE_BTP',
        city: form.city,
        radiusKm: form.radiusKm,
        agencyName: form.companyName,
        description: form.description,
        btpMode: form.btpMode as any,
        mobileMoneyNumber: form.mobileMoneyNumber ? `${form.mobileMoneyOperator}:${form.mobileMoneyNumber}` : undefined,
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
            <Text style={styles.stepTitle}>👤 Représentant légal</Text>
            <Field label="Prénom *" value={form.firstName} onChangeText={v => set('firstName', v)} placeholder="Prénom du représentant" />
            <Field label="Nom *" value={form.lastName} onChangeText={v => set('lastName', v)} placeholder="Nom du représentant" />
            <Field label="Email *" value={form.email} onChangeText={v => set('email', v)} placeholder="email@entreprise.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Téléphone *" value={form.phone} onChangeText={v => set('phone', v)} placeholder="0701234567" keyboardType="phone-pad" />
            <Field label="Mot de passe *" value={form.password} onChangeText={v => set('password', v)} placeholder="Minimum 8 caractères" secureTextEntry />
            <Field label="Confirmer *" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)} placeholder="Répétez le mot de passe" secureTextEntry />
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>🏗️ Entreprise BTP</Text>
            <Field label="Nom de l'entreprise *" value={form.companyName} onChangeText={v => set('companyName', v)} placeholder="Ex: BTP Solutions CI SARL" />
            <Field
              label="Description (optionnel)"
              value={form.description}
              onChangeText={v => set('description', v)}
              placeholder="Décrivez vos activités et domaines d'expertise..."
              multiline
              style={{ height: 90, textAlignVertical: 'top' }}
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>⚡ Mode d'opération</Text>
            <Text style={styles.stepSub}>Choisissez comment votre entreprise opère sur la plateforme</Text>
            {BTP_MODES.map(mode => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.modeCard, form.btpMode === mode.id && styles.modeCardSelected]}
                onPress={() => set('btpMode', mode.id)}
              >
                <View style={styles.modeHeader}>
                  <Text style={styles.modeIcon}>{mode.icon}</Text>
                  <Text style={[styles.modeLabel, form.btpMode === mode.id && styles.modeLabelSelected]}>{mode.label}</Text>
                  {form.btpMode === mode.id && <Text style={styles.modeCheck}>✓</Text>}
                </View>
                <Text style={[styles.modeDesc, form.btpMode === mode.id && styles.modeDescSelected]}>{mode.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>📍 Zones d'intervention</Text>
            <Text style={styles.label}>Siège social (ville principale)</Text>
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
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>📄 Documents & Compte</Text>
            <Text style={styles.stepSub}>Votre entreprise sera activée après vérification</Text>

            <View style={styles.docsBox}>
              <Text style={styles.docsTitle}>Documents requis (à uploader après inscription)</Text>
              <Text style={styles.docsItem}>• RCCM (Registre du Commerce)</Text>
              <Text style={styles.docsItem}>• Statuts de la société</Text>
              <Text style={styles.docsItem}>• CNI du représentant légal</Text>
              <Text style={styles.docsItem}>• Attestation fiscale</Text>
            </View>

            <Text style={styles.label}>Opérateur Mobile Money</Text>
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
              label="Numéro Mobile Money / Bancaire"
              value={form.mobileMoneyNumber}
              onChangeText={v => set('mobileMoneyNumber', v)}
              placeholder="Ex: 0701234567"
              keyboardType="phone-pad"
            />
          </View>
        )}

        {step < 4 ? (
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
    paddingVertical: 16, paddingHorizontal: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    position: 'relative',
  },
  stepLine: { position: 'absolute', top: 28, left: '10%', right: '10%', height: 2, backgroundColor: '#E5E7EB', zIndex: 0 },
  stepItem: { alignItems: 'center', zIndex: 1 },
  stepDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepDotActive: { backgroundColor: '#5D4037' },
  stepNum: { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '500' },
  stepLabelActive: { color: '#5D4037', fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#5D4037', fontSize: 15, fontWeight: '600' },
  stepTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },
  stepSub: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  modeCard: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB',
    padding: 16, marginBottom: 12,
  },
  modeCardSelected: { borderColor: '#5D4037', backgroundColor: '#EFEBE9' },
  modeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  modeIcon: { fontSize: 22 },
  modeLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111827' },
  modeLabelSelected: { color: '#5D4037' },
  modeCheck: { fontSize: 18, color: '#5D4037', fontWeight: '900' },
  modeDesc: { fontSize: 13, color: '#6B7280', lineHeight: 19 },
  modeDescSelected: { color: '#5D4037' },
  citiesScroll: { marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff', marginRight: 8 },
  chipSelected: { backgroundColor: '#5D4037', borderColor: '#5D4037' },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  chipTextSelected: { color: '#fff' },
  radiusRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  radiusChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  radiusChipSelected: { backgroundColor: '#5D4037', borderColor: '#5D4037' },
  radiusText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  radiusTextSelected: { color: '#fff' },
  docsBox: { backgroundColor: '#FFF8E1', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#F57F17', marginBottom: 20 },
  docsTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10 },
  docsItem: { fontSize: 13, color: '#6B7280', marginBottom: 6, lineHeight: 19 },
  operatorRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  operatorChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  operatorChipSelected: { borderColor: '#5D4037', backgroundColor: '#EFEBE9' },
  operatorIcon: { fontSize: 16 },
  operatorText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  operatorTextSelected: { color: '#5D4037', fontWeight: '700' },
  nextBtn: { backgroundColor: '#5D4037', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  nextBtnDisabled: { backgroundColor: '#D1D5DB' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#6B7280', fontSize: 15 },
  link: { color: '#6B3FA0', fontWeight: '700', fontSize: 15 },
});
