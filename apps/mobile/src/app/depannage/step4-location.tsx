import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const CITIES = ['Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Man', 'Gagnoa'];

export default function Step4Location() {
  const params = useLocalSearchParams();
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Abidjan');
  const isValid = address.trim().length > 5;

  const handleNext = () => {
    if (!isValid) return;
    router.push({ pathname: '/depannage/step5-artisan', params: { ...params, address, city } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Où se trouve le problème ?</Text>

      <Text style={styles.label}>Adresse exacte</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Cocody, Riviera 2, Rue des Jardins"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Ville</Text>
      <View style={styles.cityGrid}>
        {CITIES.map((c) => (
          <TouchableOpacity key={c} style={[styles.cityChip, city === c && styles.cityChipSelected]} onPress={() => setCity(c)}>
            <Text style={[styles.cityText, city === c && styles.cityTextSelected]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.button, !isValid && styles.buttonDisabled]} onPress={handleNext} disabled={!isValid}>
        <Text style={styles.buttonText}>Trouver des artisans</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 20, backgroundColor: '#f9f9f9' },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  cityChip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  cityChipSelected: { backgroundColor: '#F97316', borderColor: '#F97316' },
  cityText: { fontSize: 14, color: '#333' },
  cityTextSelected: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#F97316', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
