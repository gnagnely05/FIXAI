import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TunnelHeader, { getTunnelTitle } from '../../components/TunnelHeader';

export default function Step2Location() {
  const params = useLocalSearchParams<Record<string, string>>();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const canNext = address.trim().length >= 5 || confirmed;

  const handleConfirm = () => {
    if (!address.trim()) setAddress('Position GPS actuelle');
    setConfirmed(true);
  };

  const handleNext = () => {
    const locationParam = encodeURIComponent(
      JSON.stringify({ address: address.trim() || 'Position GPS actuelle' })
    );
    router.push(
      `/tunnel/step3-location?serviceType=${params.serviceType}` +
      `&diagnosisResult=${params.diagnosisResult}` +
      `&images=${params.images}` +
      `&messages=${params.messages}` +
      `&location=${locationParam}`
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TunnelHeader title={getTunnelTitle(params.serviceType)} />

      {/* Address search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.pinIcon}>📍</Text>
        <TextInput
          style={styles.searchInput}
          value={address}
          onChangeText={v => { setAddress(v); setConfirmed(false); }}
          placeholder="Rechercher une adresse..."
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleConfirm}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Map placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          {/* Grid lines to simulate map */}
          {[0,1,2,3,4].map(i => (
            <View key={`h${i}`} style={[styles.gridLineH, { top: `${i * 25}%` as any }]} />
          ))}
          {[0,1,2,3,4].map(i => (
            <View key={`v${i}`} style={[styles.gridLineV, { left: `${i * 25}%` as any }]} />
          ))}
          {/* Center pin */}
          <View style={styles.centerPin}>
            <Text style={styles.centerPinText}>📍</Text>
          </View>
          {/* GPS button */}
          <TouchableOpacity style={styles.gpsBtn} onPress={handleConfirm}>
            <Text style={styles.gpsBtnText}>◎</Text>
          </TouchableOpacity>
          {/* Google label */}
          <Text style={styles.googleLabel}>Google</Text>
        </View>

        <Text style={styles.hint}>
          Vous pouvez confirmer avec l'adresse seule si la carte n'est pas disponible.
        </Text>

        <TouchableOpacity
          style={[styles.confirmBtn, !address.trim() && styles.confirmBtnOutline]}
          onPress={handleConfirm}
        >
          <Text style={[styles.confirmBtnText, !address.trim() && styles.confirmBtnTextOutline]}>
            {confirmed ? '✓  Localisation confirmée' : '✓  Confirmer la localisation'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.prevBtn} onPress={() => router.back()}>
          <Text style={styles.prevBtnText}>← Précédent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canNext}
        >
          <Text style={styles.nextBtnText}>→ Suivant</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, borderWidth: 1.5, borderColor: '#6B3FA0',
    borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#fff',
  },
  pinIcon: { fontSize: 18, marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#111' },
  searchIcon: { fontSize: 20, padding: 4 },
  mapContainer: { flex: 1, paddingHorizontal: 12 },
  mapPlaceholder: {
    flex: 1, backgroundColor: '#E8E8E8', borderRadius: 12,
    overflow: 'hidden', position: 'relative',
    minHeight: 280,
  },
  gridLineH: {
    position: 'absolute', left: 0, right: 0,
    height: 1, backgroundColor: '#D0D0D0',
  },
  gridLineV: {
    position: 'absolute', top: 0, bottom: 0,
    width: 1, backgroundColor: '#D0D0D0',
  },
  centerPin: {
    position: 'absolute', top: '50%', left: '50%',
    marginLeft: -14, marginTop: -28,
  },
  centerPinText: { fontSize: 28 },
  gpsBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6B3FA0',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  gpsBtnText: { color: '#fff', fontSize: 22 },
  googleLabel: {
    position: 'absolute', bottom: 8, left: 12,
    fontSize: 13, color: '#666', fontStyle: 'italic',
  },
  hint: { fontSize: 13, color: '#6B7280', marginTop: 10, marginBottom: 10 },
  confirmBtn: {
    backgroundColor: '#6B3FA0', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 4,
  },
  confirmBtnOutline: {
    backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#6B3FA0',
  },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  confirmBtnTextOutline: { color: '#6B3FA0' },
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
  nextBtnDisabled: { backgroundColor: '#D1D5DB' },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
