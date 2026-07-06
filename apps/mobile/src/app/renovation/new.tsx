import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, ActivityIndicator, Image, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../services/api';
import { storage } from '../../services/storage';

type Room = 'SALON' | 'CHAMBRE' | 'CUISINE' | 'SALLE_DE_BAIN' | 'EXTERIEUR' | 'AUTRE';
type Scale = 'RAFRAICHISSEMENT' | 'MOYENNE' | 'GROS_OEUVRE';
type Budget = 'M500K' | '500K_2M' | '2M_5M' | 'P5M';

const ROOMS: { key: Room; label: string; emoji: string }[] = [
  { key: 'SALON', label: 'Salon', emoji: '🛋️' },
  { key: 'CHAMBRE', label: 'Chambre', emoji: '🛏️' },
  { key: 'CUISINE', label: 'Cuisine', emoji: '🍳' },
  { key: 'SALLE_DE_BAIN', label: 'Salle de bain', emoji: '🚿' },
  { key: 'EXTERIEUR', label: 'Extérieur / Façade', emoji: '🏠' },
  { key: 'AUTRE', label: 'Autre', emoji: '📐' },
];

const WORKS = ['Carrelage', 'Peinture', 'Plomberie', 'Électricité', 'Maçonnerie', 'Menuiserie', 'Toiture', 'Faux plafond'];

const SCALES: { key: Scale; label: string; desc: string }[] = [
  { key: 'RAFRAICHISSEMENT', label: 'Petit rafraîchissement', desc: 'Peinture, retouches, petites reprises' },
  { key: 'MOYENNE', label: 'Rénovation moyenne', desc: 'Une pièce complète à refaire' },
  { key: 'GROS_OEUVRE', label: 'Gros œuvre', desc: 'Travaux lourds, structure, plusieurs corps de métier' },
];

const BUDGETS: { key: Budget; label: string }[] = [
  { key: 'M500K', label: 'Moins de 500 000 FCFA' },
  { key: '500K_2M', label: '500 000 – 2 000 000 FCFA' },
  { key: '2M_5M', label: '2 000 000 – 5 000 000 FCFA' },
  { key: 'P5M', label: 'Plus de 5 000 000 FCFA' },
];

const ROOM_LABEL: Record<Room, string> = {
  SALON: 'salon', CHAMBRE: 'chambre', CUISINE: 'cuisine',
  SALLE_DE_BAIN: 'salle de bain', EXTERIEUR: 'extérieur/façade', AUTRE: 'pièce',
};
const SCALE_LABEL: Record<Scale, string> = {
  RAFRAICHISSEMENT: 'petit rafraîchissement', MOYENNE: 'rénovation moyenne', GROS_OEUVRE: 'gros œuvre',
};
const BUDGET_LABEL: Record<Budget, string> = {
  M500K: 'moins de 500 000 FCFA', '500K_2M': '500 000 à 2 000 000 FCFA',
  '2M_5M': '2 000 000 à 5 000 000 FCFA', P5M: 'plus de 5 000 000 FCFA',
};

const TOTAL = 6;

export default function RenovationWizard() {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [works, setWorks] = useState<string[]>([]);
  const [scale, setScale] = useState<Scale | null>(null);
  const [isTenant, setIsTenant] = useState<boolean | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.5, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled && res.assets?.length) {
      const a = res.assets[0];
      setPhoto(a.base64 ? `data:${a.mimeType ?? 'image/jpeg'};base64,${a.base64}` : a.uri);
    }
  };

  const toggleWork = (w: string) =>
    setWorks(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]);

  const canNext =
    (step === 1 && !!photo) ||
    (step === 2 && !!room) ||
    (step === 3 && works.length > 0) ||
    (step === 4 && !!scale) ||
    (step === 5 && isTenant !== null) ||
    (step === 6 && !!budget);

  const submit = async () => {
    setLoading(true);
    try {
      const description =
        `Projet de rénovation — ${ROOM_LABEL[room!]}. ` +
        `Travaux souhaités : ${works.join(', ')}. ` +
        `Ampleur : ${SCALE_LABEL[scale!]}. ` +
        `${isTenant ? 'Locataire (pas de gros travaux structurels).' : 'Propriétaire.'} ` +
        `Budget approximatif : ${BUDGET_LABEL[budget!]}.`;
      const res = await api.post('/ai/diagnose', {
        serviceType: 'RENOVATION',
        messages: [description],
        imageUrls: photo ? [photo] : [],
        clientTurns: 4, // décision directe : le formulaire fournit déjà tout
      });
      setResult(res.data);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Analyse impossible.';
      Alert.alert('Erreur', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  const bookDiagnostic = async () => {
    await storage.setItem('fixai_diag_payload', JSON.stringify({
      artisanSummary: result?.artisanSummary || 'Projet de rénovation',
      images: photo ? [photo] : [],
    }));
    router.push(`/tunnel/diagnostic-booking?serviceType=RENOVATION&fee=${result?.diagnosticFeeXof ?? 5000}`);
  };

  // ── Écran résultat ────────────────────────────────────────────────
  if (result) {
    const min = Number(result.estimatedPriceMinXof ?? 0);
    const max = Number(result.estimatedPriceMaxXof ?? 0);
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.title}>Analyse de votre projet</Text>
          {photo && <Image source={{ uri: photo }} style={s.resultPhoto} />}
          <View style={s.card}>
            <Text style={s.cardLabel}>Ce que nous avons compris</Text>
            <Text style={s.cardText}>{result.summary}</Text>
          </View>
          {(min > 0 || max > 0) && (
            <View style={s.estimateCard}>
              <Text style={s.estimateLabel}>Estimation indicative</Text>
              <Text style={s.estimateValue}>{min.toLocaleString('fr-FR')} – {max.toLocaleString('fr-FR')} FCFA</Text>
            </View>
          )}
          {result.requiresDiagnostic ? (
            <>
              <View style={s.diagNote}>
                <Ionicons name="construct-outline" size={18} color="#B45309" />
                <Text style={s.diagNoteText}>
                  Ce projet nécessite une visite technique d'un artisan pour un devis précis
                  ({(result.diagnosticFeeXof ?? 5000).toLocaleString('fr-FR')} FCFA, déduit du devis si vous confirmez).
                </Text>
              </View>
              <TouchableOpacity style={[s.btn, { backgroundColor: '#B45309' }]} onPress={bookDiagnostic}>
                <Text style={s.btnText}>Réserver la visite technique</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={s.btn} onPress={() => router.replace('/(tabs)/orders')}>
              <Text style={s.btnText}>Demander un devis détaillé</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.linkBtn} onPress={() => { setResult(null); setStep(1); }}>
            <Text style={s.linkText}>Recommencer</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Progress */}
      <View style={s.progress}>
        <View style={s.track}><View style={[s.fill, { width: `${(step / TOTAL) * 100}%` }]} /></View>
        <Text style={s.progressLabel}>Étape {step}/{TOTAL}</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {step === 1 && (
          <View>
            <Text style={s.title}>Photo de la zone à rénover</Text>
            <Text style={s.sub}>Obligatoire — la photo aide l'artisan à comprendre le chantier.</Text>
            <TouchableOpacity style={s.photoBox} onPress={pickPhoto}>
              {photo
                ? <Image source={{ uri: photo }} style={s.photoPreview} />
                : <><Ionicons name="camera-outline" size={40} color="#B45309" /><Text style={s.photoHint}>Ajouter une photo</Text></>}
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={s.title}>Quelle pièce / zone ?</Text>
            <View style={s.grid}>
              {ROOMS.map(r => (
                <TouchableOpacity key={r.key} style={[s.tile, room === r.key && s.tileActive]} onPress={() => setRoom(r.key)}>
                  <Text style={s.tileEmoji}>{r.emoji}</Text>
                  <Text style={[s.tileLabel, room === r.key && s.tileLabelActive]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={s.title}>Quels travaux ?</Text>
            <Text style={s.sub}>Plusieurs choix possibles.</Text>
            <View style={s.chipWrap}>
              {WORKS.map(w => (
                <TouchableOpacity key={w} style={[s.chip, works.includes(w) && s.chipActive]} onPress={() => toggleWork(w)}>
                  <Text style={[s.chipText, works.includes(w) && s.chipTextActive]}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={s.title}>Quelle ampleur ?</Text>
            {SCALES.map(sc => (
              <TouchableOpacity key={sc.key} style={[s.bigOption, scale === sc.key && s.bigOptionActive]} onPress={() => setScale(sc.key)}>
                <Text style={[s.bigLabel, scale === sc.key && s.bigLabelActive]}>{sc.label}</Text>
                <Text style={s.bigDesc}>{sc.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={s.title}>Vous êtes ?</Text>
            {[{ v: false, l: 'Propriétaire', d: 'Je peux faire tous les travaux' }, { v: true, l: 'Locataire', d: 'Travaux structurels limités' }].map(o => (
              <TouchableOpacity key={String(o.v)} style={[s.bigOption, isTenant === o.v && s.bigOptionActive]} onPress={() => setIsTenant(o.v)}>
                <Text style={[s.bigLabel, isTenant === o.v && s.bigLabelActive]}>{o.l}</Text>
                <Text style={s.bigDesc}>{o.d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 6 && (
          <View>
            <Text style={s.title}>Budget approximatif ?</Text>
            {BUDGETS.map(b => (
              <TouchableOpacity key={b.key} style={[s.bigOption, budget === b.key && s.bigOptionActive]} onPress={() => setBudget(b.key)}>
                <Text style={[s.bigLabel, budget === b.key && s.bigLabelActive]}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Nav */}
      <View style={s.nav}>
        <TouchableOpacity style={s.prevBtn} onPress={() => step === 1 ? router.back() : setStep(step - 1)}>
          <Text style={s.prevText}>← {step === 1 ? 'Quitter' : 'Précédent'}</Text>
        </TouchableOpacity>
        {step < TOTAL ? (
          <TouchableOpacity style={[s.nextBtn, !canNext && s.nextDisabled]} onPress={() => canNext && setStep(step + 1)} disabled={!canNext}>
            <Text style={s.nextText}>Suivant →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.nextBtn, (!canNext || loading) && s.nextDisabled]} onPress={submit} disabled={!canNext || loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.nextText}>Analyser mon projet</Text>}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const ORANGE = '#B45309';
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F5F7' },
  progress: { padding: 16, paddingBottom: 8 },
  track: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: ORANGE },
  progressLabel: { fontSize: 12, color: '#6B7280', marginTop: 6 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6 },
  sub: { fontSize: 14, color: '#6B7280', marginBottom: 18 },
  photoBox: {
    height: 200, borderRadius: 16, borderWidth: 2, borderColor: '#FED7AA', borderStyle: 'dashed',
    backgroundColor: '#FFFBF5', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8,
  },
  photoHint: { color: ORANGE, fontWeight: '600' },
  photoPreview: { width: '100%', height: '100%', borderRadius: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 18, alignItems: 'center',
    borderWidth: 2, borderColor: '#EEE', gap: 6,
  },
  tileActive: { borderColor: ORANGE, backgroundColor: '#FFFBF5' },
  tileEmoji: { fontSize: 30 },
  tileLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  tileLabelActive: { color: ORANGE },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  chipActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  chipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  bigOption: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 12, borderWidth: 2, borderColor: '#EEE' },
  bigOptionActive: { borderColor: ORANGE, backgroundColor: '#FFFBF5' },
  bigLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  bigLabelActive: { color: ORANGE },
  bigDesc: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  nav: { flexDirection: 'row', padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: '#EEE' },
  prevBtn: { flex: 1, borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  prevText: { color: '#6B7280', fontWeight: '600' },
  nextBtn: { flex: 2, backgroundColor: ORANGE, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  nextDisabled: { backgroundColor: '#E5C9A8' },
  nextText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  cardLabel: { fontSize: 13, fontWeight: '700', color: ORANGE, marginBottom: 8 },
  cardText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  resultPhoto: { width: '100%', height: 200, borderRadius: 14, marginBottom: 16 },
  estimateCard: { backgroundColor: '#FFF7ED', borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#FED7AA' },
  estimateLabel: { fontSize: 13, color: '#9A3412', fontWeight: '600' },
  estimateValue: { fontSize: 22, fontWeight: '900', color: ORANGE, marginTop: 4 },
  diagNote: { flexDirection: 'row', gap: 10, backgroundColor: '#FFFBF5', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#FED7AA' },
  diagNoteText: { flex: 1, fontSize: 13, color: '#9A3412', lineHeight: 19 },
  btn: { backgroundColor: '#6B3FA0', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkBtn: { alignItems: 'center', paddingVertical: 16 },
  linkText: { color: '#6B7280', fontWeight: '600' },
});
