import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#9CA3AF',
  QUOTE_REQUESTED: '#F59E0B',
  QUOTE_RECEIVED: '#3B82F6',
  ACCEPTED: '#8B5CF6',
  IN_PROGRESS: '#F97316',
  COMPLETED: '#10B981',
  CANCELLED: '#EF4444',
  DISPUTED: '#DC2626',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  QUOTE_REQUESTED: 'Devis demandé',
  QUOTE_RECEIVED: 'Devis reçu',
  ACCEPTED: 'Accepté',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  DISPUTED: 'Litige',
};

const MOCK_PROJECTS = [
  { id: 'r1', title: 'Rénovation cuisine', projectType: 'RENOVATION', city: 'Abidjan', status: 'IN_PROGRESS', quotedAmount: 850000 },
  { id: 'r2', title: 'Extension salon', projectType: 'EXTENSION', city: 'Cocody', status: 'QUOTE_RECEIVED', quotedAmount: 1200000 },
];

export default function RenovationScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Projets</Text>
        <TouchableOpacity style={styles.newButton} onPress={() => {}}>
          <Text style={styles.newButtonText}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      {MOCK_PROJECTS.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>🏗️</Text>
          <Text style={styles.emptyTitle}>Aucun projet</Text>
          <Text style={styles.emptySubtitle}>Démarrez votre premier projet de rénovation</Text>
        </View>
      ) : (
        <FlatList
          data={MOCK_PROJECTS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20', borderColor: STATUS_COLORS[item.status] }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{STATUS_LABELS[item.status]}</Text>
                </View>
              </View>
              <Text style={styles.cardCity}>📍 {item.city}</Text>
              {item.quotedAmount && (
                <Text style={styles.cardAmount}>💰 {item.quotedAmount.toLocaleString('fr-CI')} FCFA</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800' },
  newButton: { backgroundColor: '#F97316', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  newButtonText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontWeight: '700', fontSize: 16, flex: 1 },
  statusBadge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardCity: { fontSize: 13, color: '#666', marginBottom: 4 },
  cardAmount: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center' },
});
