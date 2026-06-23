import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Step4Schedule() {
  const router = useRouter();
  const params = useLocalSearchParams<{ serviceType: string; diagnosis: string; userAnswer: string; address: string; city: string; images: string }>();
  const [mode, setMode] = useState<'URGENT' | 'PLANNED' | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Date>(new Date(Date.now() + 3600 * 1000));
  const [showPicker, setShowPicker] = useState(false);

  const canNext = mode !== null && (mode === 'URGENT' || scheduledAt != null);

  const handleNext = () => {
    router.push({
      pathname: '/tunnel/step5-quote',
      params: {
        ...params,
        mode,
        scheduledAt: scheduledAt.toISOString(),
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Choisissez votre formule</Text>
      <Text style={styles.subtitle}>Quand souhaitez-vous l'intervention ?</Text>

      {/* URGENT */}
      <TouchableOpacity
        style={[styles.card, mode === 'URGENT' && styles.cardUrgent]}
        onPress={() => { setMode('URGENT'); setShowPicker(false); }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🔴</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Mode Urgent</Text>
            <Text style={styles.cardSub}>Intervention en moins de 2 heures</Text>
          </View>
          {mode === 'URGENT' && <Text style={styles.check}>✓</Text>}
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+15% supplément urgence</Text>
        </View>
      </TouchableOpacity>

      {/* PLANNED */}
      <TouchableOpacity
        style={[styles.card, mode === 'PLANNED' && styles.cardPlanned]}
        onPress={() => { setMode('PLANNED'); setShowPicker(true); }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🕐</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Mode Planifié</Text>
            <Text style={styles.cardSub}>Choisissez votre créneau</Text>
          </View>
          {mode === 'PLANNED' && <Text style={styles.check}>✓</Text>}
        </View>
        {mode === 'PLANNED' && (
          <Text style={styles.dateText}>
            📅 {scheduledAt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            {'  '}🕐 {scheduledAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={scheduledAt}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(_, date) => { if (date) setScheduledAt(date); }}
        />
      )}

      <TouchableOpacity style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]} onPress={handleNext} disabled={!canNext}>
        <Text style={styles.nextBtnText}>Suivant →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 16,
    borderWidth: 2, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardUrgent: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  cardPlanned: { borderColor: '#6B3FA0', backgroundColor: '#F3F0FF' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  cardSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  check: { fontSize: 20, color: '#6B3FA0', fontWeight: '800' },
  badge: { marginTop: 10, backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, color: '#B91C1C', fontWeight: '600' },
  dateText: { marginTop: 10, fontSize: 14, color: '#6B3FA0', fontWeight: '600' },
  nextBtn: { backgroundColor: '#6B3FA0', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  nextBtnDisabled: { backgroundColor: '#D1D5DB' },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
