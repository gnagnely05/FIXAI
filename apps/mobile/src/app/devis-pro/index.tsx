import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = ['application/pdf'];

interface QuoteFile {
  base64: string;
  mimeType: string;
  name: string;
  isImage: boolean;
}

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

function FileChip({ file, onRemove }: { file: QuoteFile; onRemove: () => void }) {
  return (
    <View style={styles.fileChip}>
      <Text style={styles.fileChipIcon}>{file.isImage ? '🖼️' : '📄'}</Text>
      <Text style={styles.fileChipName} numberOfLines={1}>{file.name}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.fileChipRemove}>
        <Text style={styles.fileChipRemoveText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
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
            <Text style={styles.productMatch}>
              → {item.product.name} — {formatPrice(item.product.priceXof)}{item.product.unit ? `/${item.product.unit}` : ''}
            </Text>
          )}
          {item.totalXof != null && item.quantity != null && item.product && (
            <Text style={styles.totalLine}>
              Qté {item.quantity} × {formatPrice(item.product.priceXof)} = {formatPrice(item.totalXof)}
            </Text>
          )}
          {item.status !== 'MATCHED' && (
            <Text style={[styles.statusNote, { color }]}>
              {item.status === 'UNAVAILABLE' ? 'Matériau reconnu, non disponible au catalogue' : 'Ligne non interprétée'}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

export default function DevisProScreen() {
  const [files, setFiles] = useState<QuoteFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DevisResult | null>(null);

  async function pickImage() {
    if (files.length >= 3) {
      Alert.alert('Maximum 3 fichiers');
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la galerie.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.7,
    });
    if (!picked.canceled && picked.assets[0]?.base64) {
      const asset = picked.assets[0];
      const mimeType = asset.mimeType ?? 'image/jpeg';
      if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
        Alert.alert('Format non supporté', 'Utilisez JPEG, PNG ou WEBP.');
        return;
      }
      const name = asset.fileName ?? `image_${files.length + 1}.jpg`;
      setFiles(prev => [...prev, { base64: asset.base64!, mimeType, name, isImage: true }]);
      setResult(null);
    }
  }

  async function pickDocument() {
    if (files.length >= 3) {
      Alert.alert('Maximum 3 fichiers');
      return;
    }
    const picked = await DocumentPicker.getDocumentAsync({
      type: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (picked.canceled) return;

    const asset = picked.assets[0];
    if (!asset) return;

    const mimeType = asset.mimeType ?? 'application/octet-stream';
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType) && !ALLOWED_DOC_TYPES.includes(mimeType)) {
      Alert.alert('Format non supporté', 'Utilisez une image (JPEG, PNG) ou un PDF.');
      return;
    }

    try {
      const b64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
      const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
      setFiles(prev => [...prev, { base64: b64, mimeType, name: asset.name, isImage }]);
      setResult(null);
    } catch {
      Alert.alert('Erreur', 'Impossible de lire le fichier.');
    }
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResult(null);
  }

  async function analyze() {
    if (!files.length) {
      Alert.alert('Aucun fichier', 'Ajoutez au moins une image ou un PDF de devis.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/devis-pro/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map(f => ({ base64: f.base64, mimeType: f.mimeType, name: f.name })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DevisResult = await res.json();
      setResult(data);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'analyser le devis. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Devis Pro</Text>
      <Text style={styles.subtitle}>Analysez vos devis avec l'IA — images et PDF acceptés</Text>

      <View style={styles.fileSection}>
        <Text style={styles.label}>Fichiers du devis ({files.length}/3)</Text>
        {files.map((f, i) => (
          <FileChip key={i} file={f} onRemove={() => removeFile(i)} />
        ))}

        {files.length < 3 && (
          <View style={styles.addButtons}>
            <TouchableOpacity style={styles.addBtn} onPress={pickImage}>
              <Text style={styles.addBtnIcon}>🖼️</Text>
              <Text style={styles.addBtnText}>Photo / Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, styles.addBtnPdf]} onPress={pickDocument}>
              <Text style={styles.addBtnIcon}>📄</Text>
              <Text style={styles.addBtnText}>PDF / Fichier</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.hint}>Formats acceptés : JPEG, PNG, WEBP, PDF (max 3 fichiers)</Text>
      </View>

      <TouchableOpacity
        style={[styles.analyzeBtn, (loading || !files.length) && styles.analyzeBtnDisabled]}
        onPress={analyze}
        disabled={loading || !files.length}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.analyzeBtnText}>Analyser le devis</Text>}
      </TouchableOpacity>

      {result && (
        <View style={styles.results}>
          <ResultSection title="Produits trouvés" items={result.matched} color="#2E7D32" />
          <ResultSection title="Non disponibles au catalogue" items={result.unavailable} color="#E65100" />
          <ResultSection title="Lignes non interprétées" items={result.uninterpreted} color="#757575" />
          {result.totalEstimateXof > 0 && (
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Estimation totale (produits trouvés)</Text>
              <Text style={styles.totalValue}>{formatPrice(result.totalEstimateXof)}</Text>
            </View>
          )}
          <Text style={styles.disclaimer}>
            Les prix proviennent uniquement du catalogue réel FixAI. Aucun prix n'est inventé par l'IA.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FC' },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#6B3FA0', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#B89CC8', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 10 },
  fileSection: { marginBottom: 20, gap: 8 },
  fileChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EDE7F6', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#B89CC8',
  },
  fileChipIcon: { fontSize: 20 },
  fileChipName: { flex: 1, fontSize: 13, color: '#333', fontWeight: '500' },
  fileChipRemove: { padding: 4 },
  fileChipRemoveText: { fontSize: 14, color: '#B61615', fontWeight: '700' },
  addButtons: { flexDirection: 'row', gap: 10 },
  addBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 10, padding: 12,
    borderWidth: 2, borderColor: '#6B3FA0', borderStyle: 'dashed',
  },
  addBtnPdf: { borderColor: '#C08B00' },
  addBtnIcon: { fontSize: 18 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#6B3FA0' },
  hint: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: 4 },
  analyzeBtn: {
    backgroundColor: '#6B3FA0', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 24,
  },
  analyzeBtnDisabled: { opacity: 0.5 },
  analyzeBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  results: { gap: 16 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  resultItem: { borderLeftWidth: 3, paddingLeft: 10, gap: 3 },
  originalText: { fontSize: 13, color: '#333', fontStyle: 'italic' },
  productMatch: { fontSize: 13, color: '#444' },
  totalLine: { fontSize: 13, fontWeight: '600', color: '#222' },
  statusNote: { fontSize: 11, marginTop: 2 },
  totalBox: {
    backgroundColor: '#6B3FA0', borderRadius: 12, padding: 16, alignItems: 'center',
  },
  totalLabel: { color: '#EDE7F6', fontSize: 13, fontWeight: '600' },
  totalValue: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 },
  disclaimer: { fontSize: 11, color: '#999', textAlign: 'center', fontStyle: 'italic' },
});
