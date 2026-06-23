import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import TunnelHeader, { getTunnelTitle } from '../../components/TunnelHeader';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fixaici.net/api/v1';

const STEPS_CHECKLIST = [
  { id: 'diagnostic', label: 'Diagnostic' },
  { id: 'products', label: 'Recherche de produits' },
  { id: 'quote', label: 'Génération du devis estimatif' },
];

export default function Step4Devis() {
  const params = useLocalSearchParams<Record<string, string>>();
  const router = useRouter();

  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const diagnosisResult = params.diagnosisResult
    ? JSON.parse(decodeURIComponent(params.diagnosisResult))
    : null;
  const location = params.location
    ? JSON.parse(decodeURIComponent(params.location))
    : { address: '' };
  const messages: string[] = params.messages
    ? JSON.parse(decodeURIComponent(params.messages))
    : [];

  useEffect(() => {
    simulateChecklist();
  }, []);

  const simulateChecklist = async () => {
    setLoading(true);
    // Step 1: diagnostic
    await delay(800);
    setCompletedSteps(['diagnostic']);
    // Step 2: products search
    await delay(900);
    setCompletedSteps(prev => [...prev, 'products']);
    // Step 3: quote generation
    await delay(700);
    setCompletedSteps(prev => [...prev, 'quote']);
    setLoading(false);
  };

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const handleLaunch = async () => {
    setSubmitting(true);
    try {
      // Create the service request
      await axios.post(`${API_BASE_URL}/depannage`, {
        messages,
        location,
        urgency: params.urgency,
        diagnosisResult,
        serviceType: params.serviceType,
      });
      Alert.alert(
        'Appel d\'offres lancé !',
        'Les artisans disponibles dans votre zone vont recevoir votre demande.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/orders') }]
      );
    } catch (err: any) {
      Alert.alert('Erreur', 'Impossible de lancer l\'appel d\'offres. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  const allDone = completedSteps.length === STEPS_CHECKLIST.length;

  return (
    <SafeAreaView style={styles.safe}>
      <TunnelHeader title={getTunnelTitle(params.serviceType)} />
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.pageTitle}>Devis estimatif</Text>
        <Text style={styles.pageSubtitle}>
          Nous analysons la demande et cherchons les produits utiles avant l'envoi aux professionnels.
        </Text>

        {/* Checklist */}
        <View style={styles.checklist}>
          {STEPS_CHECKLIST.map(step => {
            const done = completedSteps.includes(step.id);
            return (
              <View key={step.id} style={styles.checkRow}>
                <View style={[styles.checkCircle, done && styles.checkCircleDone]}>
                  {done
                    ? <Text style={styles.checkMark}>✓</Text>
                    : <ActivityIndicator size="small" color="#D1D5DB" />
                  }
                </View>
                <Text style={[styles.checkLabel, done && styles.checkLabelDone]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Result card */}
        {allDone && (
          <View style={styles.resultCard}>
            <View style={styles.resultIcon}>
              <Text style={styles.resultIconText}>✓</Text>
            </View>
            <View style={{ flex: 1 }}>
              {products.length > 0 ? (
                <>
                  <Text style={styles.resultTitle}>{products.length} produit(s) trouvé(s)</Text>
                  <Text style={styles.resultSub}>Des produits adaptés ont été sélectionnés.</Text>
                </>
              ) : (
                <>
                  <Text style={styles.resultTitle}>Aucun produit trouvé</Text>
                  <Text style={styles.resultSub}>
                    Aucun produit catalogue fiable n'a été trouvé. Vous pouvez lancer l'appel d'offres pour envoyer la demande aux professionnels.
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        {/* Price estimate */}
        {diagnosisResult?.estimatedPriceMinXof && allDone && (
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Estimation indicative</Text>
            <Text style={styles.priceValue}>
              {diagnosisResult.estimatedPriceMinXof.toLocaleString()} – {diagnosisResult.estimatedPriceMaxXof.toLocaleString()} FCFA
            </Text>
          </View>
        )}

      </ScrollView>

      {/* CTA */}
      {allDone && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.launchBtn, submitting && styles.launchBtnDisabled]}
            onPress={handleLaunch}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.launchBtnText}>📢  Lancer l'appel d'offres</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 16 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 28 },
  checklist: { marginBottom: 24 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  checkCircleDone: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkLabel: { fontSize: 15, color: '#9CA3AF' },
  checkLabelDone: { color: '#111827', fontWeight: '600' },
  resultCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#F0FFF4', borderRadius: 14,
    padding: 16, marginBottom: 16, gap: 12,
    borderWidth: 1, borderColor: '#D1FAE5',
  },
  resultIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center',
  },
  resultIconText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  resultTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  resultSub: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  priceCard: {
    backgroundColor: '#F5F0FF', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  priceLabel: { fontSize: 13, color: '#6B3FA0', fontWeight: '600' },
  priceValue: { fontSize: 15, color: '#6B3FA0', fontWeight: '800' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  launchBtn: {
    backgroundColor: '#6B3FA0', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  launchBtnDisabled: { backgroundColor: '#D1D5DB' },
  launchBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
