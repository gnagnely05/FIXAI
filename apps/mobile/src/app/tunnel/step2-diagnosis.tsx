import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function Step2Diagnosis() {
  const params = useLocalSearchParams<{
    serviceType: string;
    diagnosisResult: string;
    images: string;
    messages: string;
  }>();
  const router = useRouter();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const diagnosisResult = params.diagnosisResult
    ? JSON.parse(decodeURIComponent(params.diagnosisResult))
    : null;

  const handleNext = () => {
    router.push(
      `/tunnel/step3-location?serviceType=${params.serviceType}&diagnosisResult=${params.diagnosisResult}&images=${params.images}&messages=${params.messages}&selectedAnswer=${encodeURIComponent(selectedAnswer || '')}`
    );
  };

  if (!diagnosisResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Aucun diagnostic disponible.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.diagnosisCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.robotIcon}>🤖</Text>
          <Text style={styles.cardTitle}>Diagnostic IA</Text>
        </View>

        <Text style={styles.summaryText}>{diagnosisResult.summary}</Text>
        <Text style={styles.issueText}>{diagnosisResult.detectedIssue}</Text>

        <View style={styles.questionBox}>
          <Text style={styles.questionLabel}>Question de précision :</Text>
          <Text style={styles.questionText}>{diagnosisResult.question}</Text>
        </View>

        {diagnosisResult.estimatedPriceMinXof && (
          <View style={styles.priceRange}>
            <Text style={styles.priceLabel}>Estimation :</Text>
            <Text style={styles.priceValue}>
              {diagnosisResult.estimatedPriceMinXof.toLocaleString()} – {diagnosisResult.estimatedPriceMaxXof.toLocaleString()} FCFA
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.optionsTitle}>Choisissez une réponse :</Text>
      {(diagnosisResult.options || []).map((option: string, index: number) => (
        <TouchableOpacity
          key={index}
          style={[styles.optionBtn, selectedAnswer === option && styles.optionBtnSelected]}
          onPress={() => setSelectedAnswer(option)}
        >
          <View style={[styles.optionRadio, selectedAnswer === option && styles.optionRadioSelected]} />
          <Text style={[styles.optionText, selectedAnswer === option && styles.optionTextSelected]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.nextBtn, !selectedAnswer && styles.nextBtnDisabled]}
        onPress={handleNext}
        disabled={!selectedAnswer}
      >
        <Text style={styles.nextBtnText}>Suivant →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 32 },
  errorText: { textAlign: 'center', marginTop: 40, color: '#6B7280', fontSize: 16 },
  diagnosisCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  robotIcon: { fontSize: 28, marginRight: 10 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#6B3FA0' },
  summaryText: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  issueText: { fontSize: 15, color: '#374151', marginBottom: 16, lineHeight: 22 },
  questionBox: {
    borderWidth: 2, borderColor: '#6B3FA0',
    borderRadius: 10, padding: 14, backgroundColor: '#F5F0FF',
  },
  questionLabel: { fontSize: 12, fontWeight: '600', color: '#6B3FA0', marginBottom: 4, textTransform: 'uppercase' },
  questionText: { fontSize: 15, color: '#1F2937', lineHeight: 22 },
  priceRange: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  priceLabel: { fontSize: 14, color: '#6B7280', marginRight: 8 },
  priceValue: { fontSize: 15, fontWeight: '600', color: '#6B3FA0' },
  optionsTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 14, marginBottom: 10,
  },
  optionBtnSelected: { borderColor: '#6B3FA0', backgroundColor: '#F5F0FF' },
  optionRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#D1D5DB', marginRight: 12,
  },
  optionRadioSelected: { borderColor: '#6B3FA0', backgroundColor: '#6B3FA0' },
  optionText: { fontSize: 15, color: '#374151', flex: 1 },
  optionTextSelected: { color: '#6B3FA0', fontWeight: '500' },
  nextBtn: {
    marginTop: 24, backgroundColor: '#6B3FA0',
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#D1D5DB' },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
