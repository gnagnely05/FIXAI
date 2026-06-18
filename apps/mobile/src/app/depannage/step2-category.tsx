import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  { id: 'PLOMBERIE', label: 'Plomberie', icon: 'water-outline' as const, color: '#3B82F6' },
  { id: 'ELECTRICITE', label: 'Électricité', icon: 'flash-outline' as const, color: '#F59E0B' },
  { id: 'MENUISERIE', label: 'Menuiserie', icon: 'construct-outline' as const, color: '#10B981' },
  { id: 'PEINTURE', label: 'Peinture', icon: 'color-palette-outline' as const, color: '#EC4899' },
  { id: 'MACONNERIE', label: 'Maçonnerie', icon: 'home-outline' as const, color: '#8B5CF6' },
  { id: 'CLIMATISATION', label: 'Climatisation', icon: 'snow-outline' as const, color: '#06B6D4' },
  { id: 'ELECTROMENAGER', label: 'Électroménager', icon: 'tv-outline' as const, color: '#F97316' },
  { id: 'SERRURERIE', label: 'Serrurerie', icon: 'key-outline' as const, color: '#6366F1' },
  { id: 'CARRELAGE', label: 'Carrelage', icon: 'grid-outline' as const, color: '#84CC16' },
  { id: 'TOITURE', label: 'Toiture', icon: 'umbrella-outline' as const, color: '#EF4444' },
];

export default function Step2Category() {
  const params = useLocalSearchParams<{ description: string }>();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (!selected) return;
    router.push({ pathname: '/depannage/step3-mode', params: { ...params, category: selected } });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepIndicator}><Text style={styles.stepText}>Étape 2 / 7</Text></View>
        <Text style={styles.title}>De quel service avez-vous besoin ?</Text>
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.card, selected === cat.id && styles.cardSelected]}
              onPress={() => setSelected(cat.id)}
            >
              <View style={[styles.iconBg, { backgroundColor: `${cat.color}20` }, selected === cat.id && { backgroundColor: cat.color }]}>
                <Ionicons name={cat.icon} size={28} color={selected === cat.id ? '#fff' : cat.color} />
              </View>
              <Text style={[styles.cardLabel, selected === cat.id && styles.cardLabelSelected]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selected}
        >
          <Text style={styles.nextButtonText}>Suivant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  stepIndicator: { marginBottom: 8 },
  stepText: { color: '#FF6B00', fontWeight: '600', fontSize: 13 },
  title: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: { borderColor: '#FF6B00', backgroundColor: '#FFF7ED' },
  iconBg: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  cardLabel: { fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center' },
  cardLabelSelected: { color: '#FF6B00' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  nextButton: { backgroundColor: '#FF6B00', borderRadius: 14, padding: 16, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: '#FCA97E' },
  nextButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
