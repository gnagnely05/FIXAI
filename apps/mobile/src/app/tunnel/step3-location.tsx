import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const CITIES = ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man', 'Divo'];

export default function Step3Location() {
  const params = useLocalSearchParams<Record<string, string>>();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const canProceed = address.trim().length >= 5 && selectedCity !== '';

  const handleNext = () => {
    const locationParam = encodeURIComponent(JSON.stringify({ address: address.trim(), city: selectedCity }));
    router.push(
      `/tunnel/step4-schedule?serviceType=${params.serviceType}&diagnosisResult=${params.diagnosisResult}&images=${params.images}&messages=${params.messages}&selectedAnswer=${params.selectedAnswer}&location=${locationParam}`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Votre adresse</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>📌</Text>
          <TextInput
            style={styles.textInput}
            value={address}
            onChangeText={setAddress}
            placeholder="Ex: Rue des Jardins, Cocody..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏙️ Votre ville</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.citiesRow}>
          {CITIES.map(city => (
            <TouchableOpacity
              key={city}
              style={[styles.cityChip, selectedCity === city && styles.cityChipSelected]}
              onPress={() => setSelectedCity(city)}
            >
              <Text style={[styles.cityChipText, selectedCity === city && styles.cityChipTextSelected]}>
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Votre localisation permet à nos techniciens de vous trouver rapidement.
          Vous pouvez aussi activer le GPS pour une précision maximale.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
        onPress={handleNext}
        disabled={!canProceed}
      >
        <Text style={styles.nextBtnText}>Suivant →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#111827', marginBottom: 12 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 12,
  },
  inputIcon: { fontSize: 20, marginRight: 8 },
  textInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#111827' },
  citiesRow: { paddingVertical: 4, gap: 8 },
  cityChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#FFF', marginRight: 8,
  },
  cityChipSelected: { borderColor: '#6B3FA0', backgroundColor: '#6B3FA0' },
  cityChipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  cityChipTextSelected: { color: '#FFF' },
  infoBox: {
    flexDirection: 'row', backgroundColor: '#EFF6FF',
    borderRadius: 10, padding: 14, marginBottom: 24,
  },
  infoIcon: { fontSize: 18, marginRight: 10 },
  infoText: { flex: 1, fontSize: 14, color: '#1D4ED8', lineHeight: 20 },
  nextBtn: {
    backgroundColor: '#6B3FA0', paddingVertical: 14,
    borderRadius: 12, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#D1D5DB' },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
