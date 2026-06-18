import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const MOCK_ARTISANS = [
  { id: 'a1', name: 'Konan Yves', specialty: 'Plomberie', rating: 4.8, reviewCount: 42, hourlyRate: 5000, isAvailable: true, distance: 1.2 },
  { id: 'a2', name: 'Kouassi Franck', specialty: 'Plomberie', rating: 4.6, reviewCount: 28, hourlyRate: 4500, isAvailable: true, distance: 2.5 },
  { id: 'a3', name: 'Bamba Ibrahim', specialty: 'Plomberie', rating: 4.9, reviewCount: 67, hourlyRate: 6000, isAvailable: true, distance: 3.1 },
];

export default function Step5Artisan() {
  const params = useLocalSearchParams();

  const handleSelect = (artisanId: string) => {
    router.push({ pathname: '/depannage/step6-payment', params: { ...params, artisanId } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Artisans disponibles près de vous</Text>
      <FlatList
        data={MOCK_ARTISANS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleSelect(item.id)}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.charAt(0)}</Text></View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.specialty}>{item.specialty}</Text>
              <View style={styles.row}>
                <Text style={styles.rating}>⭐ {item.rating} ({item.reviewCount})</Text>
                <Text style={styles.distance}>📍 {item.distance} km</Text>
              </View>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.price}>{item.hourlyRate.toLocaleString('fr-CI')}</Text>
              <Text style={styles.priceSuffix}>FCFA/h</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, backgroundColor: '#f9f9f9', marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  info: { flex: 1 },
  name: { fontWeight: '700', fontSize: 16 },
  specialty: { color: '#666', fontSize: 13, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 12 },
  rating: { fontSize: 13, color: '#333' },
  distance: { fontSize: 13, color: '#666' },
  priceBox: { alignItems: 'flex-end' },
  price: { fontWeight: '700', fontSize: 16, color: '#F97316' },
  priceSuffix: { fontSize: 11, color: '#999' },
});
