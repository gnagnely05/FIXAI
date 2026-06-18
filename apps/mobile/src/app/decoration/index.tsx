import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';

const ROOM_TYPES = [
  { id: 'SALON', label: 'Salon', emoji: '🛋️' },
  { id: 'CHAMBRE', label: 'Chambre', emoji: '🛏️' },
  { id: 'CUISINE', label: 'Cuisine', emoji: '🍳' },
  { id: 'SALLE_DE_BAIN', label: 'Salle de bain', emoji: '🚿' },
  { id: 'BUREAU', label: 'Bureau', emoji: '💼' },
  { id: 'TERRASSE', label: 'Terrasse', emoji: '🌿' },
];

const STYLES = [
  { id: 'MODERNE', label: 'Moderne' },
  { id: 'AFRICAIN_CONTEMPORAIN', label: 'Africain Contemporain' },
  { id: 'MINIMALISTE', label: 'Minimaliste' },
  { id: 'TRADITIONNEL', label: 'Traditionnel' },
  { id: 'TROPICAL', label: 'Tropical' },
];

export default function DecorationScreen() {
  const [roomType, setRoomType] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const canGenerate = roomType && style;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setImageUrl(null);
    try {
      // TODO: call API POST /ai/visualize
      // const response = await api.post('/ai/visualize', { roomType, style });
      // setImageUrl(response.data.imageUrl);
      await new Promise((r) => setTimeout(r, 3000));
      setImageUrl('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✨ Décoration IA</Text>
        <Text style={styles.subtitle}>Visualisez votre intérieur en quelques secondes grâce à l'IA.</Text>
      </View>

      <Text style={styles.sectionLabel}>Type de pièce</Text>
      <View style={styles.grid}>
        {ROOM_TYPES.map((r) => (
          <TouchableOpacity key={r.id} style={[styles.roomCard, roomType === r.id && styles.cardSelected]} onPress={() => setRoomType(r.id)}>
            <Text style={styles.roomEmoji}>{r.emoji}</Text>
            <Text style={styles.roomLabel}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Style de décoration</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleRow}>
        {STYLES.map((s) => (
          <TouchableOpacity key={s.id} style={[styles.styleChip, style === s.id && styles.styleChipSelected]} onPress={() => setStyle(s.id)}>
            <Text style={[styles.styleLabel, style === s.id && styles.styleLabelSelected]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={[styles.generateButton, !canGenerate && styles.buttonDisabled]} onPress={handleGenerate} disabled={!canGenerate || loading}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.generateText}>Génération en cours...</Text>
          </View>
        ) : (
          <Text style={styles.generateText}>🎨 Générer la visualisation</Text>
        )}
      </TouchableOpacity>

      {imageUrl && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Votre visualisation</Text>
          <Image source={{ uri: imageUrl }} style={styles.resultImage} resizeMode="cover" />
          <Text style={styles.resultNote}>Les produits affichés sont disponibles chez nos boutiques partenaires.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', lineHeight: 20 },
  sectionLabel: { fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  roomCard: { width: '30%', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  cardSelected: { borderColor: '#8B5CF6', backgroundColor: '#F5F3FF', borderWidth: 2 },
  roomEmoji: { fontSize: 28, marginBottom: 6 },
  roomLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  styleRow: { marginBottom: 24 },
  styleChip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  styleChipSelected: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  styleLabel: { fontSize: 14, color: '#333' },
  styleLabelSelected: { color: '#fff', fontWeight: '600' },
  generateButton: { backgroundColor: '#8B5CF6', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 24 },
  buttonDisabled: { backgroundColor: '#ccc' },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  generateText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  resultBox: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 24 },
  resultTitle: { padding: 16, fontWeight: '700', fontSize: 16 },
  resultImage: { width: '100%', height: 280 },
  resultNote: { padding: 12, fontSize: 12, color: '#666', backgroundColor: '#F9FAFB' },
});
