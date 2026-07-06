import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, SafeAreaView, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';

/** Ouvre la galerie et renvoie une data URI (base64) exploitable sur web et natif. */
async function pickImageAsDataUri(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.6,
    base64: true,
  });
  if (result.canceled || !result.assets?.length) return null;
  const a = result.assets[0];
  if (a.base64) return `data:${a.mimeType ?? 'image/jpeg'};base64,${a.base64}`;
  return a.uri;
}

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
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    specialty: '', city: '', agencyName: '', shopName: '', address: '', description: '', btpMode: 'AGENCE',
  });
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [showCustomSpecialty, setShowCustomSpecialty] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [showCustomCity, setShowCustomCity] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  // Pièces justificatives (data URIs base64)
  const [idDoc, setIdDoc] = useState<string | null>(null);       // ARTISAN — pièce d'identité
  const [selfieDoc, setSelfieDoc] = useState<string | null>(null); // ARTISAN — selfie
  const [adminDocs, setAdminDocs] = useState<string[]>([]);       // Agence/BTP/Boutique/Quincaillerie
  const [uploading, setUploading] = useState<string | null>(null);

  const pickSingle = async (setter: (v: string | null) => void, key: string) => {
    setUploading(key);
    try { const uri = await pickImageAsDataUri(); if (uri) setter(uri); }
    finally { setUploading(null); }
  };
  const addAdminDoc = async () => {
    setUploading('admin');
    try { const uri = await pickImageAsDataUri(); if (uri) setAdminDocs(prev => [...prev, uri]); }
    finally { setUploading(null); }
  };
  const removeAdminDoc = (i: number) => setAdminDocs(prev => prev.filter((_, idx) => idx !== i));

  const proType = PRO_TYPES.find(p => p.role === selected);

  const handleChoose = (role: ProRole) => {
    setSelected(role);
    setStep('form');
  };

  const handleSubmit = async () => {
    setError('');
    if (!selected) return;
    if ((selected === 'ARTISAN') && !form.specialty) {
      return setError('Veuillez choisir votre spécialité.');
    }
    if (['ARTISAN', 'AGENCE_HOTE', 'ENTREPRISE_BTP'].includes(selected) && !form.city) {
      return setError('Veuillez sélectionner votre ville.');
    }
    if (selected === 'AGENCE_HOTE' && !form.agencyName.trim()) {
      return setError('Veuillez entrer le nom de votre agence.');
    }
    if (selected === 'ENTREPRISE_BTP' && !form.agencyName.trim()) {
      return setError('Veuillez entrer le nom de votre entreprise.');
    }
    if (['BOUTIQUE', 'QUINCAILLERIE'].includes(selected) && !form.shopName.trim()) {
      return setError('Veuillez entrer le nom de votre établissement.');
    }

    // Validation des pièces justificatives
    if (selected === 'ARTISAN') {
      if (!idDoc) return setError("Veuillez ajouter une photo de votre pièce d'identité.");
      if (!selfieDoc) return setError('Veuillez ajouter un selfie.');
    }
    if (['AGENCE_HOTE', 'ENTREPRISE_BTP', 'BOUTIQUE', 'QUINCAILLERIE'].includes(selected) && adminDocs.length === 0) {
      return setError('Veuillez ajouter au moins un document administratif.');
    }

    // Construction de la liste des documents
    const documents: Array<{ type: string; url: string }> = [];
    if (idDoc) documents.push({ type: 'NATIONAL_ID', url: idDoc });
    if (selfieDoc) documents.push({ type: 'SELFIE', url: selfieDoc });
    adminDocs.forEach(url => documents.push({ type: 'RCCM', url }));

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
        documents: documents.length ? documents : undefined,
      });
      // Navigation directe (pas de dépendance à un bouton d'Alert non fiable sur web)
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Impossible d'activer l'espace pro.";
      setError(Array.isArray(msg) ? msg.join('\n') : msg);
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

        {/* Pièces justificatives — Artisan */}
        {selected === 'ARTISAN' && (
          <>
            <SectionLabel>Pièces justificatives</SectionLabel>
            <DocSlot
              label="Pièce d'identité (CNI, passeport)"
              icon="card-outline"
              value={idDoc}
              busy={uploading === 'id'}
              onPick={() => pickSingle(setIdDoc, 'id')}
              onRemove={() => setIdDoc(null)}
            />
            <DocSlot
              label="Selfie (photo de votre visage)"
              icon="happy-outline"
              value={selfieDoc}
              busy={uploading === 'selfie'}
              onPick={() => pickSingle(setSelfieDoc, 'selfie')}
              onRemove={() => setSelfieDoc(null)}
            />
          </>
        )}

        {/* Documents administratifs — Agence / BTP / Boutique / Quincaillerie */}
        {['AGENCE_HOTE', 'ENTREPRISE_BTP', 'BOUTIQUE', 'QUINCAILLERIE'].includes(selected ?? '') && (
          <>
            <SectionLabel>Documents administratifs</SectionLabel>
            <Text style={styles.docHint}>
              Registre de commerce (RCCM), statuts, attestation fiscale, licence… Ajoutez une ou plusieurs photos.
            </Text>
            <View style={styles.adminGrid}>
              {adminDocs.map((uri, i) => (
                <View key={i} style={styles.adminThumbWrap}>
                  <Image source={{ uri }} style={styles.adminThumb} />
                  <TouchableOpacity style={styles.adminRemove} onPress={() => removeAdminDoc(i)}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.adminAdd} onPress={addAdminDoc} disabled={uploading === 'admin'}>
                {uploading === 'admin'
                  ? <ActivityIndicator color="#6B3FA0" />
                  : <>
                      <Ionicons name="add" size={24} color="#6B3FA0" />
                      <Text style={styles.adminAddText}>Ajouter</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={[styles.verifBanner, styles.verifBannerShop]}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#1B8A2E" />
          <Text style={[styles.verifText, styles.verifTextShop]}>
            Aucune validation requise. Votre profil sera actif immédiatement dès l'enregistrement.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

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

function DocSlot({
  label, icon, value, busy, onPick, onRemove,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string | null;
  busy: boolean;
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {value ? (
        <View style={styles.docFilled}>
          <Image source={{ uri: value }} style={styles.docThumb} />
          <Text style={styles.docFilledText} numberOfLines={1}>Document ajouté</Text>
          <TouchableOpacity onPress={onRemove} style={styles.docChange}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.docEmpty} onPress={onPick} disabled={busy} activeOpacity={0.8}>
          {busy
            ? <ActivityIndicator color="#6B3FA0" />
            : <>
                <Ionicons name={icon} size={22} color="#6B3FA0" />
                <Text style={styles.docEmptyText}>Ajouter une photo</Text>
              </>
          }
        </TouchableOpacity>
      )}
    </View>
  );
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
  docHint: { fontSize: 12, color: '#6B7280', marginBottom: 12, marginTop: -4, lineHeight: 17 },
  docEmpty: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#C4B5E8', borderStyle: 'dashed',
    borderRadius: 12, paddingVertical: 18, backgroundColor: '#FAF7FF',
  },
  docEmptyText: { color: '#6B3FA0', fontSize: 14, fontWeight: '600' },
  docFilled: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#BBF7D0',
    borderRadius: 12, padding: 10,
  },
  docThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#EEE' },
  docFilledText: { flex: 1, fontSize: 14, color: '#15803D', fontWeight: '600' },
  docChange: { padding: 6 },
  adminGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  adminThumbWrap: { position: 'relative' },
  adminThumb: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#EEE' },
  adminRemove: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#DC2626',
    alignItems: 'center', justifyContent: 'center',
  },
  adminAdd: {
    width: 80, height: 80, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#C4B5E8', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7FF', gap: 2,
  },
  adminAddText: { color: '#6B3FA0', fontSize: 11, fontWeight: '600' },
  errorBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626', lineHeight: 19 },
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
