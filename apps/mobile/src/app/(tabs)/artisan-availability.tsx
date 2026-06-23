import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

const DAYS = [
  { key: 'MON', label: 'Lun' },
  { key: 'TUE', label: 'Mar' },
  { key: 'WED', label: 'Mer' },
  { key: 'THU', label: 'Jeu' },
  { key: 'FRI', label: 'Ven' },
  { key: 'SAT', label: 'Sam' },
  { key: 'SUN', label: 'Dim' },
];

const SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export default function ArtisanAvailabilityScreen() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/artisans/availability/me')
      .then(res => {
        const d = res.data;
        setIsAvailable(d.isAvailable ?? false);
        setSelectedDays(d.availableDays ?? []);
        setSelectedSlots(d.availableSlots ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (key: string) =>
    setSelectedDays(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]);

  const toggleSlot = (slot: string) =>
    setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/artisans/availability/me', {
        isAvailable,
        availableDays: selectedDays,
        availableSlots: selectedSlots,
      });
      Alert.alert('Succès', 'Disponibilités mises à jour.');
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator color="#2E7D32" style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Availability toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIcon, { backgroundColor: isAvailable ? '#E8F5E9' : '#F3F4F6' }]}>
              <Ionicons name={isAvailable ? 'checkmark-circle' : 'close-circle'} size={26} color={isAvailable ? '#2E7D32' : '#9CA3AF'} />
            </View>
            <View>
              <Text style={styles.toggleTitle}>Statut de disponibilité</Text>
              <Text style={[styles.toggleStatus, { color: isAvailable ? '#2E7D32' : '#9CA3AF' }]}>
                {isAvailable ? '● Disponible' : '○ Indisponible'}
              </Text>
            </View>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ true: '#2E7D32', false: '#D1D5DB' }}
            thumbColor="#fff"
          />
        </View>

        {isAvailable && (
          <>
            {/* Days */}
            <Text style={styles.sectionTitle}>Jours de travail</Text>
            <View style={styles.daysRow}>
              {DAYS.map(d => (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.dayBtn, selectedDays.includes(d.key) && styles.dayBtnActive]}
                  onPress={() => toggleDay(d.key)}
                >
                  <Text style={[styles.dayText, selectedDays.includes(d.key) && styles.dayTextActive]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time slots */}
            <Text style={styles.sectionTitle}>Créneaux horaires</Text>
            <View style={styles.slotsGrid}>
              {SLOTS.map(slot => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotBtn, selectedSlots.includes(slot) && styles.slotBtnActive]}
                  onPress={() => toggleSlot(slot)}
                >
                  <Text style={[styles.slotText, selectedSlots.includes(slot) && styles.slotTextActive]}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {!isAvailable && (
          <View style={styles.unavailBox}>
            <Text style={styles.unavailEmoji}>😴</Text>
            <Text style={styles.unavailTitle}>Mode indisponible activé</Text>
            <Text style={styles.unavailText}>
              Vous ne recevrez aucune nouvelle demande de mission tant que vous êtes indisponible.
            </Text>
          </View>
        )}

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer les disponibilités</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 40 },
  toggleCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  toggleIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  toggleTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  toggleStatus: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 12 },
  daysRow: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  dayBtn: {
    width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent',
  },
  dayBtnActive: { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' },
  dayText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  dayTextActive: { color: '#2E7D32' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  slotBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: 'transparent',
  },
  slotBtnActive: { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' },
  slotText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  slotTextActive: { color: '#2E7D32' },
  unavailBox: { alignItems: 'center', paddingVertical: 40, gap: 10, marginBottom: 24 },
  unavailEmoji: { fontSize: 48 },
  unavailTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  unavailText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  saveBtn: {
    backgroundColor: '#2E7D32', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
