import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';

const ROLES = [
  {
    id: 'client',
    label: 'Client',
    icon: '👤',
    desc: 'Je cherche des services de réparation, rénovation ou décoration',
    route: '/(auth)/register-client',
    color: '#6B3FA0',
    params: {},
  },
  {
    id: 'artisan',
    label: 'Artisan',
    icon: '🔧',
    desc: 'Je propose mes services de réparation ou de construction',
    route: '/(auth)/register-artisan',
    color: '#2E7D32',
    params: {},
  },
  {
    id: 'agence',
    label: 'Agence',
    icon: '🏢',
    desc: 'Je gère une agence avec plusieurs artisans',
    route: '/(auth)/register-agence',
    color: '#1565C0',
    params: {},
  },
  {
    id: 'boutique',
    label: 'Boutique',
    icon: '🛍️',
    desc: 'Je vends des produits de décoration et d\'ameublement',
    route: '/(auth)/register-commerce',
    color: '#E65100',
    params: { type: 'BOUTIQUE' },
  },
  {
    id: 'quincaillerie',
    label: 'Quincaillerie',
    icon: '🏗️',
    desc: 'Je vends des matériaux et fournitures de construction',
    route: '/(auth)/register-commerce',
    color: '#4E342E',
    params: { type: 'QUINCAILLERIE' },
  },
];

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>fixAI</Text>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Choisissez votre profil pour commencer</Text>
        </View>

        {ROLES.map(role => (
          <TouchableOpacity
            key={role.id}
            style={styles.card}
            onPress={() => router.push({ pathname: role.route as any, params: role.params })}
            activeOpacity={0.85}
          >
            <View style={[styles.iconBox, { backgroundColor: role.color + '18' }]}>
              <Text style={styles.icon}>{role.icon}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardLabel, { color: role.color }]}>{role.label}</Text>
              <Text style={styles.cardDesc}>{role.desc}</Text>
            </View>
            <Text style={[styles.arrow, { color: role.color }]}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <Link href="/(auth)/login" style={styles.link}>Se connecter</Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 28, paddingTop: 12 },
  logo: { fontSize: 28, fontWeight: '900', color: '#6B3FA0', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  icon: { fontSize: 26 },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  cardDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  arrow: { fontSize: 28, fontWeight: '300' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#6B7280', fontSize: 15 },
  link: { color: '#6B3FA0', fontWeight: '700', fontSize: 15 },
});
