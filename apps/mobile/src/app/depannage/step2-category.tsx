import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const CATEGORIES = [
  { id: 'PLOMBERIE', label: 'Plomberie', emoji: '🔧' },
  { id: 'ELECTRICITE', label: 'Électricité', emoji: '⚡' },
  { id: 'MACONNERIE', label: 'Maçonnerie', emoji: '🧱' },
  { id: 'MENUISERIE', label: 'Menuiserie', emoji: '🪚' },
  { id: 'PEINTURE', label: 'Peinture', emoji: '🎨' },
  { id: 'CLIMATISATION', label: 'Climatisation', emoji: '❄️' },
  { id: 'CARRELAGE', label: 'Carrelage', emoji: '🔲' },
  { id: 'FERRONNERIE', label: 'Ferronnerie', emoji: '⚙️' },
];

export default function Step2Category() {
  const params = useLocalSearchParams();

  const handleSelect = (categoryId: string) => {
    router.push({ pathname: '/depannage/step3-mode', params: { ...params, category: categoryId } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Quel type de prestation ?</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.id} style={styles.card} onPress={() => handleSelect(cat.id)}>
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text style={styles.label}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', backgroundColor: '#FFF7ED', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FED7AA' },
  emoji: { fontSize: 32, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', textAlign: 'center' },
});
