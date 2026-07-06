import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Alert, Image, Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const { width: W } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
type RoomType = 'SALON'|'CHAMBRE'|'BUREAU'|'CUISINE'|'SALLE_A_MANGER'|'SALLE_DE_BAIN';
type Style = 'MODERNE_EPURE'|'CHAUD_NATUREL'|'COLORE_VIVANT'|'CLASSIQUE_ELEGANT';
type Problem = 'TROP_CHARGE'|'PAS_LUMINEUX'|'COULEURS_TERNES'|'MEUBLES_VIEUX'|'MANQUE_RANGEMENT'|'ENVIE_CHANGEMENT';
type Occupants = 'SEUL'|'COUPLE'|'FAMILLE'|'FAMILLE_ENFANTS';
type Budget = 'MOINS_100K'|'100K_300K'|'300K_500K'|'PLUS_500K';

interface FormState {
  roomPhotoUrl: string | null;
  roomPhotoBase64: string | null;
  roomType: RoomType | null;
  problems: Problem[];
  style: Style | null;
  isTenant: boolean | null;
  occupants: Occupants | null;
  budget: Budget | null;
  keepItems: boolean | null;
  keepItemsDescription: string;
}

const ROOMS: { key: RoomType; label: string; emoji: string }[] = [
  { key: 'SALON',          label: 'Salon',        emoji: '🛋️' },
  { key: 'CHAMBRE',        label: 'Chambre',       emoji: '🛏️' },
  { key: 'BUREAU',         label: 'Bureau',        emoji: '💼' },
  { key: 'CUISINE',        label: 'Cuisine',       emoji: '🍳' },
  { key: 'SALLE_A_MANGER', label: 'Salle à manger',emoji: '🍽️' },
  { key: 'SALLE_DE_BAIN',  label: 'Salle de bain', emoji: '🚿' },
];

const PROBLEMS: { key: Problem; label: string }[] = [
  { key: 'TROP_CHARGE',      label: 'Trop chargé' },
  { key: 'PAS_LUMINEUX',     label: 'Pas assez lumineux' },
  { key: 'COULEURS_TERNES',  label: 'Couleurs ternes' },
  { key: 'MEUBLES_VIEUX',    label: 'Meubles vieux' },
  { key: 'MANQUE_RANGEMENT', label: 'Manque de rangement' },
  { key: 'ENVIE_CHANGEMENT', label: 'Envie de changement' },
];

const STYLES: { key: Style; label: string; desc: string; color: string; palette: string[]; image: string }[] = [
  {
    key: 'MODERNE_EPURE', label: 'Moderne épuré', desc: 'Lignes claires, tons neutres, minimaliste',
    color: '#E8EAF6', palette: ['#FFFFFF', '#D7D7D7', '#9E9E9E', '#2E2E2E'],
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=55&auto=format&fit=crop',
  },
  {
    key: 'CHAUD_NATUREL', label: 'Chaud & naturel', desc: 'Bois, textiles cosy, plantes, tons terre',
    color: '#FFF3E0', palette: ['#F3E3CE', '#C89B6C', '#8B5A2B', '#4E7C4E'],
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=55&auto=format&fit=crop',
  },
  {
    key: 'COLORE_VIVANT', label: 'Coloré & vivant', desc: 'Accents vifs, motifs audacieux, énergique',
    color: '#FCE4EC', palette: ['#FFD166', '#EF476F', '#06D6A0', '#118AB2'],
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&q=55&auto=format&fit=crop',
  },
  {
    key: 'CLASSIQUE_ELEGANT', label: 'Classique élégant', desc: 'Raffiné, matières nobles, intemporel',
    color: '#EDE7F6', palette: ['#F4EFE6', '#C9A66B', '#6B4E2E', '#2B2B3A'],
    image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&q=55&auto=format&fit=crop',
  },
];

const BUDGETS: { key: Budget; label: string }[] = [
  { key: 'MOINS_100K',  label: '< 100 000 FCFA' },
  { key: '100K_300K',   label: '100 000 – 300 000 FCFA' },
  { key: '300K_500K',   label: '300 000 – 500 000 FCFA' },
  { key: 'PLUS_500K',   label: '+ 500 000 FCFA' },
];

const STEP_LABELS = [
  'Photo','Pièce','Problèmes','Style','Statut','Occupants','Budget','Meubles'
];

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={prog.container}>
      <View style={prog.track}>
        <View style={[prog.fill, { width: `${((step) / total) * 100}%` }]} />
      </View>
      <Text style={prog.label}>Étape {step}/{total} — {STEP_LABELS[step - 1]}</Text>
    </View>
  );
}

const prog = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  track: { height: 4, backgroundColor: '#EDE7F6', borderRadius: 2, marginBottom: 6 },
  fill: { height: 4, backgroundColor: '#6B3FA0', borderRadius: 2 },
  label: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
});

export default function DecorationScreen() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    roomPhotoUrl: null, roomPhotoBase64: null,
    roomType: null, problems: [], style: null,
    isTenant: null, occupants: null, budget: null,
    keepItems: null, keepItemsDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imageUrl: string; totalEstimateXof: number; selectedProducts: Array<{name:string;priceXof:number;merchantName:string}> } | null>(null);

  const next = () => setStep(s => s + 1);
  const back = () => { if (step > 1) setStep(s => s - 1); };

  async function pickRoomPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission requise'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7, mediaTypes: ['images'] });
    if (!res.canceled && res.assets[0]) {
      const asset = res.assets[0];
      setForm(f => ({ ...f, roomPhotoUrl: asset.uri, roomPhotoBase64: asset.base64 ?? null }));
    }
  }

  function toggleProblem(p: Problem) {
    setForm(f => ({
      ...f,
      problems: f.problems.includes(p) ? f.problems.filter(x => x !== p) : [...f.problems, p],
    }));
  }

  async function generate() {
    setLoading(true);
    try {
      const body = {
        roomPhotoUrl: form.roomPhotoUrl ?? '',
        roomType: form.roomType,
        problems: form.problems,
        style: form.style,
        isTenant: form.isTenant,
        occupants: form.occupants,
        budget: form.budget,
        keepItemsDescription: form.keepItemsDescription || undefined,
      };
      const res = await fetch(`${API_BASE}/ai/decoration/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
      setStep(9); // résultat
    } catch {
      Alert.alert('Erreur', 'Impossible de générer la visualisation.');
    } finally {
      setLoading(false);
    }
  }

  function canProceed(): boolean {
    if (step === 1) return !!form.roomPhotoUrl;
    if (step === 2) return !!form.roomType;
    if (step === 3) return form.problems.length > 0;
    if (step === 4) return !!form.style;
    if (step === 5) return form.isTenant !== null;
    if (step === 6) return !!form.occupants;
    if (step === 7) return !!form.budget;
    if (step === 8) return form.keepItems !== null;
    return false;
  }

  // ─── Résultat ───────────────────────────────────────────────────────────────
  if (step === 9 && result) {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <Text style={s.resultTitle}>Votre visualisation</Text>
        <Image source={{ uri: result.imageUrl }} style={s.resultImage} resizeMode="cover" />
        <View style={s.resultEstimate}>
          <Text style={s.estimateLabel}>Estimation produits</Text>
          <Text style={s.estimateValue}>{Number(result.totalEstimateXof).toLocaleString('fr-FR')} FCFA</Text>
        </View>
        {result.selectedProducts.length > 0 && (
          <View style={s.productList}>
            <Text style={s.productListTitle}>Produits sélectionnés</Text>
            {result.selectedProducts.map((p, i) => (
              <View key={i} style={s.productRow}>
                <Text style={s.productName}>{p.name}</Text>
                <Text style={s.productPrice}>{Number(p.priceXof).toLocaleString('fr-FR')} FCFA</Text>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity style={s.restartBtn} onPress={() => { setStep(1); setResult(null); }}>
          <Text style={s.restartBtnText}>Nouvelle visualisation</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={s.container}>
      <ProgressBar step={step} total={8} />
      <ScrollView contentContainerStyle={s.content}>

        {/* Étape 1 — Photo */}
        {step === 1 && (
          <View style={s.stepBox}>
            <Text style={s.stepTitle}>Photo de ta pièce actuelle</Text>
            <Text style={s.stepSub}>L'IA analyse la luminosité, les couleurs et les meubles existants.</Text>
            <TouchableOpacity style={s.photoBtn} onPress={pickRoomPhoto}>
              {form.roomPhotoUrl ? (
                <Image source={{ uri: form.roomPhotoUrl }} style={s.photoPreview} resizeMode="cover" />
              ) : (
                <View style={s.photoPlaceholder}>
                  <Text style={s.photoPlaceholderIcon}>📷</Text>
                  <Text style={s.photoPlaceholderText}>Prendre ou choisir une photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Étape 2 — Pièce */}
        {step === 2 && (
          <View style={s.stepBox}>
            <Text style={s.stepTitle}>Quelle pièce veux-tu transformer ?</Text>
            <View style={s.grid2}>
              {ROOMS.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[s.optionCard, form.roomType === r.key && s.optionCardActive]}
                  onPress={() => setForm(f => ({ ...f, roomType: r.key }))}
                >
                  <Text style={s.optionEmoji}>{r.emoji}</Text>
                  <Text style={[s.optionLabel, form.roomType === r.key && s.optionLabelActive]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Étape 3 — Problèmes */}
        {step === 3 && (
          <View style={s.stepBox}>
            <Text style={s.stepTitle}>Qu'est-ce qui te dérange le plus ?</Text>
            <Text style={s.stepSub}>Plusieurs choix possibles</Text>
            <View style={s.chipGrid}>
              {PROBLEMS.map(p => (
                <TouchableOpacity
                  key={p.key}
                  style={[s.chip, form.problems.includes(p.key) && s.chipActive]}
                  onPress={() => toggleProblem(p.key)}
                >
                  <Text style={[s.chipText, form.problems.includes(p.key) && s.chipTextActive]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Étape 4 — Style */}
        {step === 4 && (
          <View style={s.stepBox}>
            <Text style={s.stepTitle}>Quel style tu aimes ?</Text>
            <Text style={s.stepSub}>Regarde les exemples ci-dessous et choisis l'ambiance qui te parle.</Text>
            <View style={s.styleGrid}>
              {STYLES.map(st => {
                const active = form.style === st.key;
                return (
                  <TouchableOpacity
                    key={st.key}
                    style={[s.styleCard, active && s.styleCardActive]}
                    onPress={() => setForm(f => ({ ...f, style: st.key }))}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: st.image }} style={s.styleImage} resizeMode="cover" />
                    <View style={s.stylePalette}>
                      {st.palette.map((c, i) => (
                        <View key={i} style={[s.styleSwatch, { backgroundColor: c }]} />
                      ))}
                    </View>
                    <View style={s.styleInfo}>
                      <Text style={[s.styleLabel, active && s.styleLabelActive]}>{st.label}</Text>
                      <Text style={s.styleDesc}>{st.desc}</Text>
                    </View>
                    {active && (
                      <View style={s.styleCheck}>
                        <Ionicons name="checkmark-circle" size={22} color="#6B3FA0" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Étape 5 — Statut */}
        {step === 5 && (
          <View style={s.stepBox}>
            <Text style={s.stepTitle}>Tu es propriétaire ou locataire ?</Text>
            <Text style={s.stepSub}>Important : l'IA adapte ses propositions en conséquence.</Text>
            {[
              { val: false, label: 'Propriétaire', sub: 'Je fais ce que je veux', emoji: '🏠' },
              { val: true,  label: 'Locataire',    sub: 'Pas de travaux structurels', emoji: '🔑' },
            ].map(opt => (
              <TouchableOpacity
                key={String(opt.val)}
                style={[s.bigOption, form.isTenant === opt.val && s.bigOptionActive]}
                onPress={() => setForm(f => ({ ...f, isTenant: opt.val }))}
              >
                <Text style={s.bigOptionEmoji}>{opt.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.bigOptionLabel, form.isTenant === opt.val && s.bigOptionLabelActive]}>{opt.label}</Text>
                  <Text style={s.bigOptionSub}>{opt.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Étape 6 — Occupants */}
        {step === 6 && (
          <View style={s.stepBox}>
            <Text style={s.stepTitle}>C'est pour combien de personnes ?</Text>
            {[
              { val: 'SEUL' as Occupants,           label: 'Seul(e)',                     emoji: '👤' },
              { val: 'COUPLE' as Occupants,          label: 'Couple',                      emoji: '👫' },
              { val: 'FAMILLE' as Occupants,         label: 'Famille sans jeunes enfants', emoji: '👨‍👩‍👧' },
              { val: 'FAMILLE_ENFANTS' as Occupants, label: 'Famille avec enfants en bas âge', emoji: '👶' },
            ].map(opt => (
              <TouchableOpacity
                key={opt.val}
                style={[s.bigOption, form.occupants === opt.val && s.bigOptionActive]}
                onPress={() => setForm(f => ({ ...f, occupants: opt.val }))}
              >
                <Text style={s.bigOptionEmoji}>{opt.emoji}</Text>
                <Text style={[s.bigOptionLabel, form.occupants === opt.val && s.bigOptionLabelActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Étape 7 — Budget */}
        {step === 7 && (
          <View style={s.stepBox}>
            <Text style={s.stepTitle}>Ton budget approximatif ?</Text>
            {BUDGETS.map(b => (
              <TouchableOpacity
                key={b.key}
                style={[s.bigOption, form.budget === b.key && s.bigOptionActive]}
                onPress={() => setForm(f => ({ ...f, budget: b.key }))}
              >
                <Text style={[s.bigOptionLabel, form.budget === b.key && s.bigOptionLabelActive]}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Étape 8 — Meubles à garder */}
        {step === 8 && (
          <View style={s.stepBox}>
            <Text style={s.stepTitle}>Il y a des meubles que tu veux garder ?</Text>
            {[
              { val: false, label: 'Non, on repart de zéro', emoji: '🆕' },
              { val: true,  label: 'Oui, j\'en ai à garder', emoji: '🪑' },
            ].map(opt => (
              <TouchableOpacity
                key={String(opt.val)}
                style={[s.bigOption, form.keepItems === opt.val && s.bigOptionActive]}
                onPress={() => setForm(f => ({ ...f, keepItems: opt.val }))}
              >
                <Text style={s.bigOptionEmoji}>{opt.emoji}</Text>
                <Text style={[s.bigOptionLabel, form.keepItems === opt.val && s.bigOptionLabelActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            {form.keepItems && (
              <View style={{ marginTop: 12 }}>
                <Text style={s.stepSub}>Décrivez le(s) meuble(s) à intégrer dans le rendu :</Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Navigation */}
      <View style={s.navBar}>
        {step > 1 && (
          <TouchableOpacity style={s.backBtn} onPress={back}>
            <Text style={s.backBtnText}>← Retour</Text>
          </TouchableOpacity>
        )}
        {step < 8 ? (
          <TouchableOpacity
            style={[s.nextBtn, !canProceed() && s.nextBtnDisabled]}
            onPress={next}
            disabled={!canProceed()}
          >
            <Text style={s.nextBtnText}>Suivant →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.generateBtn, (!canProceed() || loading) && s.nextBtnDisabled]}
            onPress={generate}
            disabled={!canProceed() || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.generateBtnText}>✨ Générer la visualisation</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FC' },
  content: { padding: 20, paddingBottom: 100 },
  stepBox: { gap: 16 },
  stepTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  stepSub: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  photoBtn: { borderRadius: 16, overflow: 'hidden', height: 220, backgroundColor: '#EDE7F6' },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  photoPlaceholderIcon: { fontSize: 48 },
  photoPlaceholderText: { fontSize: 15, color: '#6B3FA0', fontWeight: '600' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  optionCard: {
    width: (W - 40 - 12) / 2, borderRadius: 14, backgroundColor: '#fff',
    padding: 16, alignItems: 'center', gap: 8,
    borderWidth: 2, borderColor: '#E5E7EB',
  },
  optionCardActive: { borderColor: '#6B3FA0', backgroundColor: '#EDE7F6' },
  optionEmoji: { fontSize: 32 },
  optionLabel: { fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center' },
  optionLabelActive: { color: '#6B3FA0' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22,
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#E5E7EB',
  },
  chipActive: { borderColor: '#6B3FA0', backgroundColor: '#6B3FA0' },
  chipText: { fontSize: 14, color: '#374151', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  styleGrid: { gap: 14 },
  styleCard: {
    borderRadius: 16, borderWidth: 2, borderColor: '#EEE', backgroundColor: '#fff',
    overflow: 'hidden', position: 'relative',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  styleCardActive: { borderColor: '#6B3FA0' },
  styleImage: { width: '100%', height: 140, backgroundColor: '#EEE' },
  stylePalette: { flexDirection: 'row', height: 10 },
  styleSwatch: { flex: 1 },
  styleInfo: { padding: 14 },
  styleLabel: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  styleLabelActive: { color: '#6B3FA0' },
  styleDesc: { fontSize: 13, color: '#6B7280' },
  styleCheck: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: '#fff', borderRadius: 12,
  },
  bigOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 2, borderColor: '#E5E7EB',
  },
  bigOptionActive: { borderColor: '#6B3FA0', backgroundColor: '#EDE7F6' },
  bigOptionEmoji: { fontSize: 28 },
  bigOptionLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  bigOptionLabelActive: { color: '#6B3FA0' },
  bigOptionSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  navBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 28,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  backBtn: {
    flex: 1, borderRadius: 12, padding: 14, alignItems: 'center',
    borderWidth: 2, borderColor: '#6B3FA0',
  },
  backBtnText: { color: '#6B3FA0', fontWeight: '700', fontSize: 15 },
  nextBtn: {
    flex: 2, backgroundColor: '#6B3FA0', borderRadius: 12, padding: 14, alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  generateBtn: { flex: 2, backgroundColor: '#6B3FA0', borderRadius: 12, padding: 14, alignItems: 'center' },
  generateBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  // Résultat
  resultTitle: { fontSize: 24, fontWeight: '800', color: '#6B3FA0', marginBottom: 16 },
  resultImage: { width: '100%', height: 280, borderRadius: 16, marginBottom: 16 },
  resultEstimate: {
    backgroundColor: '#6B3FA0', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16,
  },
  estimateLabel: { color: '#EDE7F6', fontSize: 13 },
  estimateValue: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },
  productList: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 10, marginBottom: 16 },
  productListTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between' },
  productName: { fontSize: 13, color: '#374151', flex: 1 },
  productPrice: { fontSize: 13, fontWeight: '700', color: '#6B3FA0' },
  restartBtn: { borderRadius: 12, borderWidth: 2, borderColor: '#6B3FA0', padding: 14, alignItems: 'center' },
  restartBtnText: { color: '#6B3FA0', fontWeight: '700', fontSize: 15 },
});
