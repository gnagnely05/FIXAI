import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function Step3Mode() {
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState<'URGENT' | 'PLANNED' | null>(null);

  const handleNext = () => {
    if (!selected) return;
    router.push({ pathname: '/depannage/step4-location', params: { ...params, mode: selected } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Quand avez-vous besoin d'aide ?</Text>

      <TouchableOpacity style={[styles.card, selected === 'URGENT' && styles.cardSelected]} onPress={() => setSelected('URGENT')}>
        <Text style={styles.badge}>🔴 URGENT</Text>
        <Text style={styles.cardTitle}>Dans les 2 heures</Text>
        <Text style={styles.cardDesc}>Un artisan intervient au plus vite. Supplément urgence : +2 000 FCFA</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.card, selected === 'PLANNED' && styles.cardSelected]} onPress={() => setSelected('PLANNED')}>
        <Text style={styles.badge}>🟢 PLANIFIÉ</Text>
        <Text style={styles.cardTitle}>Choisir une date</Text>
        <Text style={styles.cardDesc}>Planifiez l'intervention à votre convenance. Aucun supplément.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, !selected && styles.buttonDisabled]} onPress={handleNext} disabled={!selected}>
        <Text style={styles.buttonText}>Continuer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
  card: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardSelected: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  badge: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  cardDesc: { fontSize: 14, color: '#555' },
  button: { backgroundColor: '#F97316', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
