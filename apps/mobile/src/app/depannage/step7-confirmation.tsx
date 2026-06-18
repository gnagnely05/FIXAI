import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Step7Confirmation() {
  const params = useLocalSearchParams<{ description: string; category: string; mode: string; city: string; address: string; total: string }>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={72} color="#10B981" />
      </View>
      <Text style={styles.title}>Demande envoyée !</Text>
      <Text style={styles.subtitle}>Votre paiement est sécurisé en escrow. L'artisan vous contactera très bientôt.</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Récapitulatif</Text>
        <View style={styles.summaryRow}>
          <Ionicons name="construct-outline" size={16} color="#6B7280" />
          <Text style={styles.summaryLabel}>Service</Text>
          <Text style={styles.summaryValue}>{params.category}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="document-text-outline" size={16} color="#6B7280" />
          <Text style={styles.summaryLabel}>Description</Text>
          <Text style={styles.summaryValue} numberOfLines={2}>{params.description}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="flash-outline" size={16} color="#6B7280" />
          <Text style={styles.summaryLabel}>Mode</Text>
          <View style={[styles.badge, params.mode === 'URGENT' ? styles.badgeRed : styles.badgeBlue]}>
            <Text style={styles.badgeText}>{params.mode === 'URGENT' ? 'URGENT' : 'PLANIFIÉ'}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.summaryLabel}>Adresse</Text>
          <Text style={styles.summaryValue}>{params.address}, {params.city}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Ionicons name="card-outline" size={16} color="#FF6B00" />
          <Text style={[styles.summaryLabel, { color: '#FF6B00' }]}>Montant escrow</Text>
          <Text style={styles.totalAmount}>{Number(params.total || 0).toLocaleString()} FCFA</Text>
        </View>
      </View>

      <View style={styles.trackingCard}>
        <Ionicons name="time-outline" size={20} color="#3B82F6" />
        <View style={styles.trackingText}>
          <Text style={styles.trackingTitle}>{params.mode === 'URGENT' ? 'Arrivée estimée : 2 heures' : 'Rendez-vous planifié'}</Text>
          <Text style={styles.trackingSubtitle}>Vous serez notifié lorsque l'artisan accepte votre demande.</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.ordersButton} onPress={() => router.push('/(tabs)/orders')}>
        <Text style={styles.ordersButtonText}>Voir mes demandes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 24, alignItems: 'center' },
  successIcon: { marginTop: 24, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#111', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  summaryLabel: { fontSize: 13, color: '#6B7280', width: 90 },
  summaryValue: { flex: 1, fontSize: 13, fontWeight: '500', color: '#111' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeBlue: { backgroundColor: '#DBEAFE' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 4 },
  totalAmount: { fontSize: 16, fontWeight: '800', color: '#FF6B00', flex: 1, textAlign: 'right' },
  trackingCard: { backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, width: '100%', flexDirection: 'row', gap: 12, marginBottom: 28 },
  trackingText: { flex: 1 },
  trackingTitle: { fontSize: 14, fontWeight: '700', color: '#1D4ED8', marginBottom: 4 },
  trackingSubtitle: { fontSize: 13, color: '#3B82F6', lineHeight: 18 },
  homeButton: { backgroundColor: '#FF6B00', borderRadius: 14, padding: 16, alignItems: 'center', width: '100%', marginBottom: 12 },
  homeButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  ordersButton: { borderWidth: 1.5, borderColor: '#FF6B00', borderRadius: 14, padding: 16, alignItems: 'center', width: '100%' },
  ordersButtonText: { color: '#FF6B00', fontWeight: '700', fontSize: 16 },
});
