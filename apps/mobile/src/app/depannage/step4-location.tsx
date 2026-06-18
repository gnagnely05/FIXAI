import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CITIES = ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man', 'Divo'];

export default function Step4Location() {
  const params = useLocalSearchParams();
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Abidjan');
  const isValid = address.trim().length >= 5;

  const handleNext = () => {
    if (!isValid) return;
    router.push({ pathname: '/depannage/step5-artisan', params: { ...params, address, city } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepIndicator}><Text style={styles.stepText}>Étape 4 / 7</Text></View>
        <Text style={styles.title}>Où se situe le problème ?</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adresse complète</Text>
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: Cocody, Rue des Jardins, Villa 12"
              placeholderTextColor="#9CA3AF"
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ville</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.cityRow}>
              {CITIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.cityChip, city === c && styles.cityChipSelected]}
                  onPress={() => setCity(c)}
                >
                  <Text style={[styles.cityChipText, city === c && styles.cityChipTextSelected]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.gpsNote}>
          <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
          <Text style={styles.gpsNoteText}>Le GPS est utilisé pour trouver les artisans les plus proches de vous.</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={styles.nextButtonText}>Trouver des artisans</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  stepIndicator: { marginBottom: 8 },
  stepText: { color: '#FF6B00', fontWeight: '600', fontSize: 13 },
  title: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 24 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#111' },
  cityRow: { flexDirection: 'row', gap: 8 },
  cityChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  cityChipSelected: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  cityChipText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  cityChipTextSelected: { color: '#fff' },
  gpsNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12 },
  gpsNoteText: { flex: 1, fontSize: 13, color: '#6B7280', lineHeight: 18 },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  nextButton: { backgroundColor: '#FF6B00', borderRadius: 14, padding: 16, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: '#FCA97E' },
  nextButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
