import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Step3Mode() {
  const params = useLocalSearchParams<{ description: string; category: string }>();
  const [mode, setMode] = useState<'URGENT' | 'PLANNED' | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Date>(new Date(Date.now() + 3600000));
  const [showPicker, setShowPicker] = useState(false);

  const handleNext = () => {
    if (!mode) return;
    router.push({
      pathname: '/depannage/step4-location',
      params: { ...params, mode, scheduledAt: mode === 'PLANNED' ? scheduledAt.toISOString() : '' },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepIndicator}><Text style={styles.stepText}>Étape 3 / 7</Text></View>
        <Text style={styles.title}>Quand avez-vous besoin de l'artisan ?</Text>

        <TouchableOpacity
          style={[styles.modeCard, mode === 'URGENT' && styles.modeCardSelectedRed]}
          onPress={() => setMode('URGENT')}
        >
          <View style={styles.modeCardHeader}>
            <View style={[styles.modeIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="flash" size={28} color="#EF4444" />
            </View>
            <View style={styles.urgentBadge}><Text style={styles.urgentBadgeText}>URGENT</Text></View>
          </View>
          <Text style={styles.modeTitle}>Intervention urgente</Text>
          <Text style={styles.modeSubtitle}>L'artisan arrive dans les 2 heures</Text>
          <Text style={styles.modeFee}>Frais d'urgence : +15%</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeCard, mode === 'PLANNED' && styles.modeCardSelectedBlue]}
          onPress={() => { setMode('PLANNED'); setShowPicker(true); }}
        >
          <View style={styles.modeCardHeader}>
            <View style={[styles.modeIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="calendar" size={28} color="#3B82F6" />
            </View>
          </View>
          <Text style={styles.modeTitle}>Planifier une intervention</Text>
          <Text style={styles.modeSubtitle}>Choisissez la date et l'heure</Text>
          {mode === 'PLANNED' && (
            <Text style={styles.scheduledDate}>
              {scheduledAt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </TouchableOpacity>

        {showPicker && mode === 'PLANNED' && (
          <DateTimePicker
            value={scheduledAt}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={new Date()}
            onChange={(_, date) => { if (date) setScheduledAt(date); if (Platform.OS !== 'ios') setShowPicker(false); }}
          />
        )}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !mode && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!mode}
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
  modeCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16,
    borderWidth: 2, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  modeCardSelectedRed: { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },
  modeCardSelectedBlue: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  modeCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modeIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  urgentBadge: { backgroundColor: '#EF4444', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  urgentBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  modeTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 4 },
  modeSubtitle: { fontSize: 14, color: '#6B7280' },
  modeFee: { fontSize: 13, color: '#EF4444', fontWeight: '600', marginTop: 8 },
  scheduledDate: { fontSize: 14, color: '#3B82F6', fontWeight: '600', marginTop: 8 },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  nextButton: { backgroundColor: '#FF6B00', borderRadius: 14, padding: 16, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: '#FCA97E' },
  nextButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
