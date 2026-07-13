import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Image,
  StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../services/api';
import { storage } from '../../services/storage';
import TunnelHeader, { getTunnelTitle } from '../../components/TunnelHeader';

type Opt = { label: string; value: any; image?: string; palette?: string[] };
type Step = {
  key: string;
  prompt: string;
  kind: 'photo' | 'single' | 'multi' | 'style';
  field: string;
  options?: Opt[];
};

const STYLE_OPTS: Opt[] = [
  { label: 'Moderne épuré', value: 'MODERNE_EPURE', palette: ['#FFFFFF', '#D7D7D7', '#9E9E9E', '#2E2E2E'], image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=55&auto=format&fit=crop' },
  { label: 'Chaud & naturel', value: 'CHAUD_NATUREL', palette: ['#F3E3CE', '#C89B6C', '#8B5A2B', '#4E7C4E'], image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=55&auto=format&fit=crop' },
  { label: 'Coloré & vivant', value: 'COLORE_VIVANT', palette: ['#FFD166', '#EF476F', '#06D6A0', '#118AB2'], image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&q=55&auto=format&fit=crop' },
  { label: 'Classique élégant', value: 'CLASSIQUE_ELEGANT', palette: ['#F4EFE6', '#C9A66B', '#6B4E2E', '#2B2B3A'], image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&q=55&auto=format&fit=crop' },
];

const DECO_SCRIPT: Step[] = [
  { key: 'photo', field: 'roomPhotoUrl', kind: 'photo', prompt: "Bonjour ! Je vais t'aider à imaginer ta déco 🎨\n\nPour commencer, envoie-moi une photo de la pièce (obligatoire)." },
  { key: 'room', field: 'roomType', kind: 'single', prompt: 'Super ! Quelle pièce veux-tu transformer ?', options: [
    { label: 'Salon', value: 'SALON' }, { label: 'Chambre', value: 'CHAMBRE' }, { label: 'Bureau', value: 'BUREAU' },
    { label: 'Cuisine', value: 'CUISINE' }, { label: 'Salle à manger', value: 'SALLE_A_MANGER' }, { label: 'Salle de bain', value: 'SALLE_DE_BAIN' },
  ] },
  { key: 'problems', field: 'problems', kind: 'multi', prompt: "Qu'est-ce qui te dérange le plus ? (plusieurs choix possibles)", options: [
    { label: 'Trop chargé', value: 'TROP_CHARGE' }, { label: 'Pas assez lumineux', value: 'PAS_LUMINEUX' },
    { label: 'Couleurs ternes', value: 'COULEURS_TERNES' }, { label: 'Meubles vieux', value: 'MEUBLES_VIEUX' },
    { label: 'Manque de rangement', value: 'MANQUE_RANGEMENT' }, { label: 'Envie de changement', value: 'ENVIE_CHANGEMENT' },
  ] },
  { key: 'style', field: 'style', kind: 'style', prompt: 'Quelle ambiance te plaît ? Regarde les exemples 👇', options: STYLE_OPTS },
  { key: 'budget', field: 'budget', kind: 'single', prompt: 'Ton budget approximatif ?', options: [
    { label: 'Moins de 100 000 FCFA', value: 'MOINS_100K' }, { label: '100 000 – 300 000 FCFA', value: '100K_300K' },
    { label: '300 000 – 500 000 FCFA', value: '300K_500K' }, { label: 'Plus de 500 000 FCFA', value: 'PLUS_500K' },
  ] },
  { key: 'keep', field: 'keepItems', kind: 'single', prompt: 'Des meubles que tu veux garder ?', options: [
    { label: 'Non, on repart de zéro', value: false }, { label: "Oui, j'en ai à garder", value: true },
  ] },
];

const RENO_SCRIPT: Step[] = [
  { key: 'photo', field: 'photo', kind: 'photo', prompt: "Bonjour ! Parlons de ta rénovation 🏗️\n\nEnvoie-moi une photo de la zone à rénover (obligatoire)." },
  { key: 'room', field: 'room', kind: 'single', prompt: 'Quelle pièce / zone ?', options: [
    { label: 'Salon', value: 'salon' }, { label: 'Chambre', value: 'chambre' }, { label: 'Cuisine', value: 'cuisine' },
    { label: 'Salle de bain', value: 'salle de bain' }, { label: 'Extérieur / Façade', value: 'extérieur' }, { label: 'Autre', value: 'pièce' },
  ] },
  { key: 'works', field: 'works', kind: 'multi', prompt: 'Quels travaux ? (plusieurs choix)', options: [
    { label: 'Carrelage', value: 'Carrelage' }, { label: 'Peinture', value: 'Peinture' }, { label: 'Plomberie', value: 'Plomberie' },
    { label: 'Électricité', value: 'Électricité' }, { label: 'Maçonnerie', value: 'Maçonnerie' }, { label: 'Menuiserie', value: 'Menuiserie' },
    { label: 'Toiture', value: 'Toiture' }, { label: 'Faux plafond', value: 'Faux plafond' },
  ] },
  { key: 'scale', field: 'scale', kind: 'single', prompt: 'Quelle ampleur de travaux ?', options: [
    { label: 'Petit rafraîchissement', value: 'petit rafraîchissement' }, { label: 'Rénovation moyenne', value: 'rénovation moyenne' }, { label: 'Gros œuvre', value: 'gros œuvre' },
  ] },
  { key: 'budget', field: 'budget', kind: 'single', prompt: 'Budget approximatif ?', options: [
    { label: 'Moins de 500 000 FCFA', value: 'moins de 500 000 FCFA' }, { label: '500 000 – 2 000 000 FCFA', value: '500 000 à 2 000 000 FCFA' },
    { label: '2 000 000 – 5 000 000 FCFA', value: '2 000 000 à 5 000 000 FCFA' }, { label: 'Plus de 5 000 000 FCFA', value: 'plus de 5 000 000 FCFA' },
  ] },
];

type Bubble = { id: string; role: 'ai' | 'user'; text?: string; image?: string; result?: any };

export default function GuidedChat() {
  const { serviceType, productId, productName } = useLocalSearchParams<{ serviceType: string; productId?: string; productName?: string }>();
  const isReno = serviceType === 'RENOVATION';
  const script = isReno ? RENO_SCRIPT : DECO_SCRIPT;
  const accent = isReno ? '#B45309' : '#6B3FA0';

  const firstBubbleText = productName
    ? `Super choix : « ${productName} » ! 🎨\nJe vais concevoir une décoration autour de ce produit.\n\nPour commencer, envoie-moi une photo de la pièce (obligatoire).`
    : script[0].prompt;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [bubbles, setBubbles] = useState<Bubble[]>([{ id: '0', role: 'ai', text: firstBubbleText }]);
  const [multi, setMulti] = useState<any[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => { setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120); }, [bubbles]);

  const step = script[idx];
  const push = (b: Omit<Bubble, 'id'>) => setBubbles(prev => [...prev, { ...b, id: `${prev.length}` }]);

  const advance = (nextAnswers: Record<string, any>, userBubble: Omit<Bubble, 'id'>) => {
    push(userBubble);
    setMulti([]);
    const next = idx + 1;
    if (next < script.length) {
      setIdx(next);
      setTimeout(() => push({ role: 'ai', text: script[next].prompt }), 250);
    } else {
      submit(nextAnswers);
    }
  };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.5, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (res.canceled || !res.assets?.length) return;
    const a = res.assets[0];
    const uri = a.base64 ? `data:${a.mimeType ?? 'image/jpeg'};base64,${a.base64}` : a.uri;
    setPhoto(uri);
    const na = { ...answers, [step.field]: uri };
    setAnswers(na);
    advance(na, { role: 'user', image: uri });
  };

  const chooseSingle = (o: Opt) => {
    const na = { ...answers, [step.field]: o.value };
    setAnswers(na);
    advance(na, { role: 'user', text: o.label });
  };

  const confirmMulti = () => {
    if (!multi.length) return;
    const labels = step.options!.filter(o => multi.includes(o.value)).map(o => o.label);
    const na = { ...answers, [step.field]: multi };
    setAnswers(na);
    advance(na, { role: 'user', text: labels.join(', ') });
  };

  const submit = async (finalAnswers: Record<string, any>) => {
    setLoading(true);
    push({ role: 'ai', text: isReno ? 'Merci ! J’analyse ton projet…' : 'Parfait ! Je génère ta visualisation…' });
    try {
      if (isReno) {
        const description =
          `Projet de rénovation — ${finalAnswers.room}. Travaux : ${(finalAnswers.works ?? []).join(', ')}. ` +
          `Ampleur : ${finalAnswers.scale}. Budget : ${finalAnswers.budget}.`;
        const res = await api.post('/ai/diagnose', {
          serviceType: 'RENOVATION', messages: [description],
          imageUrls: finalAnswers.photo ? [finalAnswers.photo] : [], clientTurns: 4,
        }, { timeout: 120000 });
        push({ role: 'ai', result: { type: 'reno', ...res.data, photo: finalAnswers.photo } });
      } else {
        const res = await api.post('/ai/decoration/visualize', {
          roomPhotoUrl: finalAnswers.roomPhotoUrl ?? '',
          roomType: finalAnswers.roomType,
          problems: finalAnswers.problems ?? [],
          style: finalAnswers.style,
          isTenant: false,          // question retirée du questionnaire
          occupants: 'COUPLE',      // valeur par défaut (question retirée)
          budget: finalAnswers.budget,
          productIds: productId ? [productId] : undefined,  // produit associé depuis l'accueil
        }, { timeout: 120000 });
        push({ role: 'ai', result: { type: 'deco', ...res.data } });
      }
      setDone(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Une erreur est survenue.';
      push({ role: 'ai', text: `❌ ${Array.isArray(msg) ? msg.join(' ') : msg}` });
    } finally {
      setLoading(false);
    }
  };

  const bookDiagnostic = async (r: any) => {
    await storage.setItem('fixai_diag_payload', JSON.stringify({
      artisanSummary: r.artisanSummary || 'Projet de rénovation', images: photo ? [photo] : [],
    }));
    router.push(`/tunnel/diagnostic-booking?serviceType=RENOVATION&fee=${r.diagnosticFeeXof ?? 5000}`);
  };

  const renderBubble = ({ item }: { item: Bubble }) => {
    if (item.result) return renderResult(item.result);
    const isUser = item.role === 'user';
    return (
      <View style={[st.row, isUser ? st.rowUser : st.rowAI]}>
        <View style={[st.bubble, isUser ? [st.bubbleUser, { backgroundColor: accent }] : st.bubbleAI]}>
          {item.image
            ? <Image source={{ uri: item.image }} style={st.bubbleImg} />
            : <Text style={[st.bubbleText, isUser ? st.textUser : st.textAI]}>{item.text}</Text>}
        </View>
      </View>
    );
  };

  const renderResult = (r: any) => {
    if (r.type === 'deco') {
      return (
        <View style={st.resultCard}>
          {r.imageUrl ? <Image source={{ uri: r.imageUrl }} style={st.resultImg} resizeMode="cover" /> : null}
          <Text style={st.resultTitle}>Estimation produits</Text>
          <Text style={[st.resultAmount, { color: accent }]}>{Number(r.totalEstimateXof ?? 0).toLocaleString('fr-FR')} FCFA</Text>
          {(r.selectedProducts ?? []).slice(0, 6).map((p: any, i: number) => (
            <View key={i} style={st.prodRow}>
              <Text style={st.prodName}>{p.name}</Text>
              <Text style={st.prodPrice}>{Number(p.priceXof).toLocaleString('fr-FR')} FCFA</Text>
            </View>
          ))}
          <TouchableOpacity style={[st.cta, { backgroundColor: accent }]} onPress={() => router.replace('/(tabs)/orders')}>
            <Text style={st.ctaText}>Voir mes projets</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // reno
    const min = Number(r.estimatedPriceMinXof ?? 0), max = Number(r.estimatedPriceMaxXof ?? 0);
    return (
      <View style={st.resultCard}>
        <Text style={st.resultTitle}>Analyse</Text>
        <Text style={st.resultText}>{r.summary}</Text>
        {(min > 0 || max > 0) && <Text style={[st.resultAmount, { color: accent }]}>{min.toLocaleString('fr-FR')} – {max.toLocaleString('fr-FR')} FCFA</Text>}
        {r.requiresDiagnostic
          ? <TouchableOpacity style={[st.cta, { backgroundColor: accent }]} onPress={() => bookDiagnostic(r)}>
              <Text style={st.ctaText}>Réserver la visite technique ({(r.diagnosticFeeXof ?? 5000).toLocaleString('fr-FR')} FCFA)</Text>
            </TouchableOpacity>
          : <TouchableOpacity style={[st.cta, { backgroundColor: accent }]} onPress={() => router.replace('/(tabs)/orders')}>
              <Text style={st.ctaText}>Demander un devis détaillé</Text>
            </TouchableOpacity>}
      </View>
    );
  };

  // ── Zone d'input dynamique selon l'étape courante ────────────────
  const renderInput = () => {
    if (done || loading) return loading ? (
      <View style={st.footerLoading}><ActivityIndicator color={accent} /><Text style={st.loadingText}>Un instant…</Text></View>
    ) : null;

    if (step.kind === 'photo') {
      return (
        <TouchableOpacity style={[st.photoBtn, { backgroundColor: accent }]} onPress={pickPhoto}>
          <Ionicons name="camera-outline" size={20} color="#fff" />
          <Text style={st.photoBtnText}>Ajouter une photo</Text>
        </TouchableOpacity>
      );
    }
    if (step.kind === 'style') {
      return (
        <View style={st.styleWrap}>
          {step.options!.map(o => (
            <TouchableOpacity key={o.value} style={st.styleCard} onPress={() => chooseSingle(o)} activeOpacity={0.85}>
              <Image source={{ uri: o.image }} style={st.styleImg} />
              <View style={st.stylePalette}>{o.palette!.map((c, i) => <View key={i} style={[st.sw, { backgroundColor: c }]} />)}</View>
              <Text style={st.styleLabel}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    if (step.kind === 'multi') {
      return (
        <View>
          <View style={st.chipWrap}>
            {step.options!.map(o => {
              const on = multi.includes(o.value);
              return (
                <TouchableOpacity key={String(o.value)} style={[st.chip, on && { backgroundColor: accent, borderColor: accent }]}
                  onPress={() => setMulti(m => on ? m.filter(x => x !== o.value) : [...m, o.value])}>
                  <Text style={[st.chipText, on && st.chipTextOn]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={[st.confirmBtn, { backgroundColor: multi.length ? accent : '#D1D5DB' }]} onPress={confirmMulti} disabled={!multi.length}>
            <Text style={st.confirmText}>Continuer</Text>
          </TouchableOpacity>
        </View>
      );
    }
    // single
    return (
      <View style={st.chipWrap}>
        {step.options!.map(o => (
          <TouchableOpacity key={String(o.value)} style={[st.chip, { borderColor: accent }]} onPress={() => chooseSingle(o)}>
            <Text style={[st.chipText, { color: accent }]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={st.safe}>
      <TunnelHeader title={getTunnelTitle(serviceType)} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={bubbles}
          keyExtractor={b => b.id}
          renderItem={renderBubble}
          contentContainerStyle={st.list}
        />
        <View style={st.footer}>{renderInput()}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16, paddingBottom: 8 },
  row: { marginBottom: 10 },
  rowAI: { alignItems: 'flex-start' },
  rowUser: { alignItems: 'flex-end' },
  bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAI: { backgroundColor: '#EEE', borderBottomLeftRadius: 4 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  textAI: { color: '#1F2937' },
  textUser: { color: '#fff' },
  bubbleImg: { width: 160, height: 120, borderRadius: 10 },
  footer: { borderTopWidth: 1, borderTopColor: '#EEE', padding: 12, backgroundColor: '#fff' },
  footerLoading: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  loadingText: { color: '#6B7280' },
  photoBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 14 },
  photoBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  chipText: { fontSize: 14, color: '#374151', fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  confirmBtn: { marginTop: 10, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  styleWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  styleCard: { width: '48%', borderRadius: 14, borderWidth: 1, borderColor: '#EEE', overflow: 'hidden', backgroundColor: '#fff' },
  styleImg: { width: '100%', height: 90, backgroundColor: '#EEE' },
  stylePalette: { flexDirection: 'row', height: 8 },
  sw: { flex: 1 },
  styleLabel: { fontSize: 13, fontWeight: '700', color: '#111827', padding: 8 },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EEE', padding: 14, marginBottom: 12, alignSelf: 'stretch' },
  resultImg: { width: '100%', height: 220, borderRadius: 12, marginBottom: 12 },
  resultTitle: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 4 },
  resultText: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 8 },
  resultAmount: { fontSize: 22, fontWeight: '900', marginBottom: 10 },
  prodRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  prodName: { fontSize: 13, color: '#374151', flex: 1 },
  prodPrice: { fontSize: 13, color: '#111827', fontWeight: '600' },
  cta: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
