import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TunnelHeader, { getTunnelTitle } from '../../components/TunnelHeader';

const URGENCY_LEVELS = [
  { id: 'FAIBLE', label: 'Faible', color: '#2E7D32', bg: '#E8F5E9' },
  { id: 'NORMALE', label: 'Normale', color: '#F57C00', bg: '#FFF3E0' },
  { id: 'URGENTE', label: 'Urgente', color: '#C62828', bg: '#FFEBEE' },
];

export default function Step3Summary() {
  const params = useLocalSearchParams<Record<string, string>>();
  const router = useRouter();
  const [urgency, setUrgency] = useState('FAIBLE');

  const diagnosisResult = params.diagnosisResult
    ? JSON.parse(decodeURIComponent(params.diagnosisResult))
    : null;
  const images: string[] = params.images
    ? JSON.parse(decodeURIComponent(params.images))
    : [];
  const messages: string[] = params.messages
    ? JSON.parse(decodeURIComponent(params.messages))
    : [];
  const location = params.location
    ? JSON.parse(decodeURIComponent(params.location))
    : { address: '' };

  const userDescription = messages.find(m => m && m.trim().length > 3) ?? '';
  const aiReport = diagnosisResult?.summary ?? diagnosisResult?.detectedIssue ?? '';

  const handleNext = () => {
    router.push(
      `/tunnel/step4-schedule?serviceType=${params.serviceType}` +
      `&diagnosisResult=${params.diagnosisResult}` +
      `&images=${params.images}` +
      `&messages=${params.messages}` +
      `&location=${params.location}` +
      `&urgency=${urgency}`
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TunnelHeader title={getTunnelTitle(params.serviceType)} />
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.pageTitle}>Récapitulatif de votre demande</Text>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <View style={styles.sectionBox}>
            <Text style={styles.sectionText}>{userDescription || '—'}</Text>
          </View>
        </View>

        {/* Rapport IA */}
        {aiReport ? (
          <View style={styles.section}>
            <View style={styles.sectionLabelRow}>
              <Text style={styles.sparkle}>✦</Text>
              <Text style={styles.sectionLabel}>Rapport IA</Text>
            </View>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionText}>{aiReport}</Text>
            </View>
          </View>
        ) : null}

        {/* Photos */}
        {images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Photos</Text>
            <Text style={styles.photoCount}>{images.length} image(s)</Text>
            <View style={styles.photoGrid}>
              {images.map(uri => (
                <Image key={uri} source={{ uri }} style={styles.photo} />
              ))}
            </View>
          </View>
        )}

        {/* Localisation */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={styles.sectionLabel}>Localisation</Text>
          </View>
          <View style={styles.sectionBox}>
            <Text style={styles.sectionText}>{location.address || '—'}</Text>
          </View>
        </View>

        {/* Urgence */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <Text style={styles.pinIcon}>🕐</Text>
            <Text style={styles.sectionLabel}>Urgence</Text>
          </View>
          <View style={styles.urgencyRow}>
            {URGENCY_LEVELS.map(u => (
              <TouchableOpacity
                key={u.id}
                style={[
                  styles.urgencyChip,
                  urgency === u.id && { backgroundColor: u.bg, borderColor: u.color },
                ]}
                onPress={() => setUrgency(u.id)}
              >
                <Text style={[
                  styles.urgencyText,
                  urgency === u.id && { color: u.color, fontWeight: '700' },
                ]}>
                  {u.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.prevBtn} onPress={() => router.back()}>
          <Text style={styles.prevBtnText}>← Précédent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>→ Suivant</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 16 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 },
  sparkle: { fontSize: 14, color: '#6B3FA0', marginRight: 6, marginBottom: 6 },
  pinIcon: { fontSize: 16, marginRight: 4, marginBottom: 6 },
  sectionBox: {
    backgroundColor: '#F9FAFB', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  sectionText: { fontSize: 15, color: '#1F2937', lineHeight: 22 },
  photoCount: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: 100, height: 100, borderRadius: 10 },
  urgencyRow: { flexDirection: 'row', gap: 10 },
  urgencyChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    alignItems: 'center', backgroundColor: '#F9FAFB',
  },
  urgencyText: { fontSize: 14, color: '#6B7280' },
  navRow: {
    flexDirection: 'row', padding: 12, gap: 10,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  prevBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#6B3FA0',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  prevBtnText: { color: '#6B3FA0', fontSize: 15, fontWeight: '600' },
  nextBtn: {
    flex: 1, backgroundColor: '#6B3FA0',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
