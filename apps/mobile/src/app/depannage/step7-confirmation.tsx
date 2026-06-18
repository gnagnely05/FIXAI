import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Step7Confirmation() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}><Text style={styles.icon}>✅</Text></View>
      <Text style={styles.title}>Demande confirmée !</Text>
      <Text style={styles.subtitle}>Votre paiement est en séquestre. L'artisan a été notifié et va vous contacter.</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Que se passe-t-il maintenant ?</Text>
        <Text style={styles.infoItem}>1. L'artisan confirme l'intervention</Text>
        <Text style={styles.infoItem}>2. Il se rend chez vous et effectue le travail</Text>
        <Text style={styles.infoItem}>3. Vous validez la prestation dans l'app</Text>
        <Text style={styles.infoItem}>4. Le paiement est libéré à l'artisan</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)/orders')}>
        <Text style={styles.buttonText}>Suivre ma demande</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/(tabs)/')}>
        <Text style={styles.secondaryText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', alignItems: 'center' },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: 40 },
  icon: { fontSize: 40 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  infoBox: { width: '100%', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 20, marginBottom: 32 },
  infoTitle: { fontWeight: '700', marginBottom: 12, fontSize: 15 },
  infoItem: { fontSize: 14, color: '#444', marginBottom: 8 },
  button: { width: '100%', backgroundColor: '#F97316', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryButton: { padding: 12 },
  secondaryText: { color: '#666', fontSize: 15 },
});
