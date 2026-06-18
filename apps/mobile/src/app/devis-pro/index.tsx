import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

interface QuoteLineResult {
  originalText: string;
  status: 'MATCHED' | 'UNAVAILABLE' | 'UNINTERPRETED';
  product?: { id: string; name: string; priceXof: number; unit?: string; merchantName: string };
  quantity?: number;
  totalXof?: number;
}

interface DevisResult {
  matched: QuoteLineResult[];
  unavailable: QuoteLineResult[];
  uninterpreted: QuoteLineResult[];
  totalEstimateXof: number;
}

function formatPrice(xof: number): string {
  return Number(xof).toLocaleString('fr-FR') + ' FCFA';
}

function ResultSection({ title, items, color }: { title: string; items: QuoteLineResult[]; color: string }) {
  if (!items.length) return null;
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color }]}>{title} ({items.length})</Text>
      {items.map((item, i) => (
        <View key={i} style={[styles.resultItem, { borderLeftColor: color }]}>
          <Text style={styles.originalText}>{item.originalText}</Text>
          {item.product && (
            <Text style={styles.productMatch}>→ {item.product.name} — {formatPrice(item.product.priceXof)}{item.product.unit ? `/${item.product.unit}` : ''}</Text>
          )}
          {item.totalXof != null && (
            <Text style={styles.totalLine}>Qté {item.quantity} × {formatPrice(item.product!.priceXof)} = {formatPrice(item.totalXof)}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

export default function DevisProScreen() {
  const [images, setImages] = useState<Array<{ base64: string; mimeType: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DevisResult | null>(null);

  async function pickImage() {
    if (images.length >= 3) {
      Alert.alert('Maximum 3 images');
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la galerie.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (!picked.canceled && picked.assets[0]?.base64) {
      const asset = picked.assets[0];
      const mimeType = asset.mimeType ?? 'image/jpeg';
      setImages(prev => [...prev, { base64: asset.base64!, mimeType }]);
    }
  }

  async function analyze() {
    if (!images.length) {
      Alert.alert('Ajoutez au moins une image de devis');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/devis-pro/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      const data: DevisResult = await res.json();
      setResult(data);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'analyser le devis.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Devis Pro</Text>
      <Text style={styles.subtitle}>Analysez vos devis avec l'IA</Text>

      <View style={styles.imageSection}>
        <Text style={styles.label}>Images du devis ({images.length}/3)</Text>
        <View style={styles.imageRow}>
          {images.map((_, i) => (
            <View key={i} style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>📄 {i + 1}</Text>
              <TouchableOpacity onPress={() => setImages(prev => prev.filter((_, j) => j !== i))}>
                <Text style={styles.removeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 3 && (
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
              <Text style={styles.addImageText}>+ Ajouter</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity style={[styles.analyzeBtn, loading && styles.analyzeBtnDisabled]} onPress={analyze} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.analyzeBtnText}>Analyser le devis</Text>}
      </TouchableOpacity>

      {result && (
        <View style={styles.results}>
          <ResultSection title="Produits trouvés" items={result.matched} color="#2E7D32" />
          <ResultSection title="Non disponibles" items={result.unavailable} color="#E65100" />
          <ResultSection title="Non interprétés" items={result.uninterpreted} color="#757575" />
          {result.totalEstimateXof > 0 && (
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Estimation totale</Text>
              <Text style={styles.totalValue}>{formatPrice(result.totalEstimateXof)}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FC' },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#6B3FA0', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#B89CC8', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 10 },
  imageSection: { marginBottom: 20 },
  imageRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  imagePlaceholder: {
    width: 80, height: 80, backgroundColor: '#EDE7F6',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#B89CC8',
  },
  imagePlaceholderText: { fontSize: 22 },
  removeBtn: { fontSize: 12, color: '#B61615', marginTop: 4, fontWeight: '700' },
  addImageBtn: {
    width: 80, height: 80, backgroundColor: '#fff',
    borderRadius: 10, borderWidth: 2, borderColor: '#6B3FA0',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  addImageText: { color: '#6B3FA0', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  analyzeBtn: {
    backgroundColor: '#6B3FA0', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 24,
  },
  analyzeBtnDisabled: { opacity: 0.6 },
  analyzeBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  results: { gap: 16 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  resultItem: { borderLeftWidth: 3, paddingLeft: 10, gap: 2 },
  originalText: { fontSize: 13, color: '#333' },
  productMatch: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  totalLine: { fontSize: 13, fontWeight: '600', color: '#222' },
  totalBox: {
    backgroundColor: '#6B3FA0', borderRadius: 12, padding: 16,
    alignItems: 'center',
  },
  totalLabel: { color: '#EDE7F6', fontSize: 14, fontWeight: '600' },
  totalValue: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 },
});
