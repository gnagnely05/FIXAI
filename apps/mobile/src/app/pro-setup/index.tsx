import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

type ProRole = 'ARTISAN' | 'AGENCE_HOTE' | 'ENTREPRISE_BTP' | 'BOUTIQUE' | 'QUINCAILLERIE';

const PRO_TYPES: Array<{
  role: ProRole;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  desc: string;
  color: string;
}> = [
  { role: 'ARTISAN',       label: 'Artisan',        icon: 'construct-outline',  desc: 'Proposez vos services de réparation et construction', color: '#1B8A2E' },
  { role: 'AGENCE_HOTE',   label: 'Agence',          icon: 'business-outline',   desc: 'Gérez une agence avec plusieurs artisans',             color: '#1565C0' },
  { role: 'ENTREPRISE_BTP',label: 'Entreprise BTP',  icon: 'hammer-outline',     desc: 'Dirigez une entreprise de BTP',                        color: '#5D4037' },
  { role: 'BOUTIQUE',      label: 'Boutique',        icon: 'storefront-outline', desc: 'Vendez des produits de décoration et ameublement',     color: '#E65100' },
  { role: 'QUINCAILLERIE', label: 'Quincaillerie',   icon: 'hardware-chip-outline', desc: 'Vendez des matériaux et fournitures de construction', color: '#4E342E' },
];

const CITIES = ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man', 'Divo'];

const ARTISAN_SPECIALTIES = [
  'ELECTRICITE', 'PLOMBERIE', 'MENUISERIE', 'PEINTURE',
  'CARRELAGE', 'MACONNERIE', 'CLIMATISATION', 'SERRURERIE',
];

export default function ProSetupScreen() {
  const { upgradeToPro } = useAuth();
  const [step, setStep] = useState<'choose' | 'form'>('choose');
  const [selected, setSelected] = useState<ProRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    specialty: '', city: '', agencyName: '', shopName: '', address: '', description: '', btpMode: 'AGENCE',
  });
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [showCustomSpecialty, setShowCustomSpecialty] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [showCustomCity, setShowCustomCity] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const proType = PRO_TYPES.find(p => p.role === selected);
  const isShop = selected === 'BOUTIQUE' || selected === 'QUINCAILLERIE';

  const handleChoose = (role: ProRole) => {
    setSelected(role);
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!selected) return;
    if ((selected === 'ARTISAN') && !form.specialty) {
      return Alert.alert('Champs manquants', 'Veuillez choisir votre spécialité.');
    }
    if (['ARTISAN', 'AGENCE_HOTE', 'ENTREPRISE_BTP'].includes(selected) && !form.city) {
      return Alert.alert('Champs manquants', 'Veuillez sélectionner votre ville.');
    }
    if (selected === 'AGENCE_HOTE' && !form.agencyName.trim()) {
      return Alert.alert('Champs manquants', 'Veuillez entrer le nom de votre agence.');
    }
    if (selected === 'ENTREPRISE_BTP' && !form.agencyName.trim()) {
      return Alert.alert('Champs manquants', 'Veuillez entrer le nom de votre entreprise.');
    }
    if (['BOUTIQUE', 'QUINCAILLERIE'].includes(selected) && !form.shopName.trim()) {
      return Alert.alert('Champs manquants', 'Veuillez entrer le nom de votre établissement.');
    }

    setLoading(true);
    try {
      await upgradeToPro({
        role: selected,
        specialty: form.specialty || undefined,
        city: form.city || undefined,
        agencyName: form.agencyName || undefined,
        shopName: form.shopName || undefined,
        address: form.address || undefined,
        description: form.description || undefined,
        btpMode: selected === 'ENTREPRISE_BTP' ? form.btpMode : undefined,
      });
      Alert.alert(
        'Espace Pro activé !',
        isShop
          ? 'Votre établissement est activé. Un e-mail de confirmation vous a été envoyé.'
          : 'Votre profil professionnel est en cours de vérification. Vous serez notifié sous 24-48h.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }],
      );
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Impossible d\'activer l\'espace pro.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'choose') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#6B3FA0" />
            <Text style={styles.backText}>Retour</Text>
          </TouchableOpacity>

          <View style={styles.titleBlock}>
            <View style={styles.titleIcon}>
              <Ionicons name="briefcase" size={26} color="#6B3FA0" />
            </View>
            <Text style={styles.title}>Espace Pro</Text>
            <Text style={styles.subtitle}>Choisissez votre type de profil professionnel</Text>
          </View>

          {PRO_TYPES.map(pt => (
            <TouchableOpacity key={pt.role} style={styles.card} onPress={() => handleChoose(pt.role)} activeOpacity={0.85}>
              <View style={[styles.cardIcon, { backgroundColor: pt.color + '18' }]}>
                <Ionicons name={pt.icon} size={22} color={pt.color} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardLabel, { color: pt.color }]}>{pt.label}</Text>
                <Text style={styles.cardDesc}>{pt.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C4CAD4" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep('choose')}>
          <Ionicons name="arrow-back" size={20} color="#6B3FA0" />
          <Text style={styles.backText}>Choisir un autre type</Text>
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <View style={[styles.titleIcon, { backgroundColor: (proType?.color ?? '#6B3FA0') + '18' }]}>
            <Ionicons name={proType?.icon ?? 'briefcase'} size={26} color={proType?.color ?? '#6B3FA0'} />
          </View>
          <Text style={styles.title}>{proType?.label}</Text>
          <Text style={styles.subtitle}>Complétez votre profil professionnel</Text>
        </View>

        {/* Artisan fields */}
        {selected === 'ARTISAN' && (
          <>
            <SectionLabel>Spécialité</SectionLabel>
            <View style={styles.chipGrid}>
              {ARTISAN_SPECIALTIES.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, form.specialty === s && styles.chipActive]}
                  onPress={() => { set('specialty', s); setShowCustomSpecialty(false); setCustomSpecialty(''); }}
                >
                  <Text style={[styles.chipText, form.specialty === s && styles.chipTextActive]}>
                    {s.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.chip, showCustomSpecialty && styles.chipActive]}
                onPress={() => { setShowCustomSpecialty(true); set('specialty', customSpecialty); }}
              >
                <Text style={[styles.chipText, showCustomSpecialty && styles.chipTextActive]}>Autre...</Text>
              </TouchableOpacity>
            </View>
            {showCustomSpecialty && (
              <TextInput
                style={[styles.fieldInput, { marginBottom: 16 }]}
                placeholder="Saisir votre spécialité"
                placeholderTextColor="#9CA3AF"
                value={customSpecialty}
                onChangeText={v => { setCustomSpecialty(v); set('specialty', v); }}
                autoFocus
              />
            )}
            <Field label="Adresse / zone de travail" placeholder="Ex: Yopougon, Abidjan" value={form.address} onChangeText={v => set('address', v)} />
            <Field
              label="Décrivez votre expérience"
              placeholder="Ex: 8 ans d'expérience en installation électrique et dépannage..."
              value={form.description}
              onChangeText={v => set('description', v)}
              multiline
              numberOfLines={3}
              style={[styles.fieldInput, { minHeight: 80, textAlignVertical: 'top' }]}
            />
          </>
        )}

        {/* Agence fields */}
        {selected === 'AGENCE_HOTE' && (
          <>
            <Field label="Nom de l'agence" placeholder="Ex: Agence Pro Bâtiment" value={form.agencyName} onChangeText={v => set('agencyName', v)} />
            <Field label="Adresse" placeholder="Ex: Cocody, Rue des Jardins" value={form.address} onChangeText={v => set('address', v)} />
            <Field
              label="Description de l'activité"
              placeholder="Ex: Agence spécialisée en gros œuvre et second œuvre..."
              value={form.description}
              onChangeText={v => set('description', v)}
              multiline
              numberOfLines={3}
              style={[styles.fieldInput, { minHeight: 80, textAlignVertical: 'top' }]}
            />
          </>
        )}

        {/* BTP fields */}
        {selected === 'ENTREPRISE_BTP' && (
          <>
            <Field label="Nom de l'entreprise" placeholder="Ex: BTP Kouassi & Fils" value={form.agencyName} onChangeText={v => set('agencyName', v)} />
            <SectionLabel>Mode de fonctionnement</SectionLabel>
            <View style={styles.modeRow}>
              {['AGENCE', 'ARTISAN', 'MIXTE'].map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeChip, form.btpMode === m && styles.modeChipActive]}
                  onPress={() => set('btpMode', m)}
                >
                  <Text style={[styles.modeText, form.btpMode === m && styles.modeTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Field label="Adresse" placeholder="Ex: Yopougon, Zone industrielle" value={form.address} onChangeText={v => set('address', v)} />
            <Field
              label="Description de l'activité"
              placeholder="Ex: Construction de bâtiments, VRD, réhabilitation..."
              value={form.description}
              onChangeText={v => set('description', v)}
              multiline
              numberOfLines={3}
              style={[styles.fieldInput, { minHeight: 80, textAlignVertical: 'top' }]}
            />
          </>
        )}

        {/* Shop fields */}
        {(selected === 'BOUTIQUE' || selected === 'QUINCAILLERIE') && (
          <>
            <Field label="Nom de l'établissement" placeholder="Ex: Déco Plus Abidjan" value={form.shopName} onChangeText={v => set('shopName', v)} />
            <Field label="Adresse" placeholder="Ex: Cocody, Rue des Jardins" value={form.address} onChangeText={v => set('address', v)} />
          </>
        )}

        {/* City picker (for artisan, agence, btp) */}
        {['ARTISAN', 'AGENCE_HOTE', 'ENTREPRISE_BTP'].includes(selected ?? '') && (
          <>
            <SectionLabel>Ville d'intervention</SectionLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityRow}>
              {CITIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, form.city === c && styles.chipActive]}
                  onPress={() => { set('city', c); setShowCustomCity(false); setCustomCity(''); }}
                >
                  <Text style={[styles.chipText, form.city === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.chip, showCustomCity && styles.chipActive]}
                onPress={() => { setShowCustomCity(true); set('city', customCity); }}
              >
                <Text style={[styles.chipText, showCustomCity && styles.chipTextActive]}>Autre...</Text>
              </TouchableOpacity>
            </ScrollView>
            {showCustomCity && (
              <TextInput
                style={[styles.fieldInput, { marginBottom: 16 }]}
                placeholder="Saisir votre ville"
                placeholderTextColor="#9CA3AF"
                value={customCity}
                onChangeText={v => { setCustomCity(v); set('city', v); }}
                autoFocus
              />
            )}
          </>
        )}

        <View style={[styles.verifBanner, isShop && styles.verifBannerShop]}>
          <Ionicons
            name={isShop ? 'mail-outline' : 'shield-checkmark-outline'}
            size={18}
            color={isShop ? '#1B8A2E' : '#1565C0'}
          />
          <Text style={[styles.verifText, isShop && styles.verifTextShop]}>
            {isShop
              ? "Aucune validation requise. Votre établissement sera actif immédiatement, avec une confirmation par e-mail."
              : "Votre profil sera vérifié par notre équipe sous 24-48h avant d'être visible aux clients."}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.btnText}>Activer mon espace pro</Text>
              </>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F5F7' },
  content: { padding: 20, paddingBottom: 48 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { color: '#6B3FA0', fontSize: 15, fontWeight: '600' },
  titleBlock: { alignItems: 'center', marginBottom: 28 },
  titleIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: '#EDE9F8', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  cardDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10, marginTop: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldInput: {
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827',
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#6B3FA0', borderColor: '#6B3FA0' },
  chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  cityRow: { marginBottom: 16 },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  modeChip: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff',
  },
  modeChipActive: { backgroundColor: '#5D4037', borderColor: '#5D4037' },
  modeText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  modeTextActive: { color: '#fff' },
  verifBanner: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginBottom: 20,
  },
  verifBannerShop: { backgroundColor: '#ECFDF3' },
  verifText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 19 },
  verifTextShop: { color: '#15803D' },
  btn: {
    backgroundColor: '#6B3FA0', borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  btnDisabled: { backgroundColor: '#C4B5E8' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
