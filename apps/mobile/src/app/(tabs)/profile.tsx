import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

const ROLE_LABEL: Record<string, string> = {
  CLIENT: 'Client',
  ARTISAN: 'Artisan',
  AGENCE_HOTE: 'Agence Hôte',
  ENTREPRISE_BTP: 'Entreprise BTP',
  BOUTIQUE: 'Boutique',
  QUINCAILLERIE: 'Quincaillerie',
  ADMIN: 'Administrateur',
};

const ROLE_COLOR: Record<string, string> = {
  CLIENT: '#6B3FA0',
  ARTISAN: '#2E7D32',
  AGENCE_HOTE: '#1565C0',
  ENTREPRISE_BTP: '#5D4037',
  BOUTIQUE: '#7B1FA2',
  QUINCAILLERIE: '#E65100',
  ADMIN: '#B71C1C',
};

type IoniconName = keyof typeof Ionicons.glyphMap;

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion', style: 'destructive',
        onPress: async () => { await logout(); router.replace('/(auth)/login'); },
      },
    ]);
  };

  if (!user) return null;

  const role = user.role ?? 'CLIENT';
  const accentColor = ROLE_COLOR[role] ?? '#6B3FA0';
  const roleLabel = ROLE_LABEL[role] ?? role;

  const menuItems: { icon: IoniconName; label: string; onPress?: () => void }[] = [
    { icon: 'person-outline', label: 'Modifier le profil' },
    { icon: 'notifications-outline', label: 'Notifications' },
    { icon: 'wallet-outline', label: 'Mon portefeuille' },
    { icon: 'shield-outline', label: 'Sécurité & Confidentialité' },
    { icon: 'help-circle-outline', label: 'Aide & Support' },
    { icon: 'document-text-outline', label: 'Conditions d\'utilisation' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: accentColor }]}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{user.firstName?.[0]}{user.lastName?.[0]}</Text>
        </View>
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={[styles.roleText, { color: accentColor }]}>{roleLabel}</Text>
        </View>
        {user.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={styles.verifiedText}>Compte vérifié</Text>
          </View>
        )}
      </View>

      {/* Role-specific info */}
      {role === 'ARTISAN' && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Mon profil artisan</Text>
          <InfoRow icon="build" label="Spécialité" value={(user as any)?.specialty?.replace(/_/g, ' ') ?? '—'} color={accentColor} />
          <InfoRow icon="star" label="Note" value={`${((user as any)?.artisanProfile?.rating ?? 0).toFixed(1)} / 5`} color={accentColor} />
          <InfoRow icon="wallet" label="Solde" value={`${(user.walletBalance ?? 0).toLocaleString('fr-FR')} FCFA`} color={accentColor} />
          <InfoRow icon="time" label="Statut" value={(user as any)?.verificationStatus ?? '—'} color={accentColor} />
        </View>
      )}

      {(role === 'AGENCE_HOTE' || role === 'ENTREPRISE_BTP') && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Mon agence</Text>
          <InfoRow icon="business" label="Nom" value={(user as any)?.agencyName ?? (user as any)?.agencyProfile?.name ?? '—'} color={accentColor} />
          <InfoRow icon="location" label="Ville" value={(user as any)?.city ?? '—'} color={accentColor} />
          <InfoRow icon="wallet" label="Solde" value={`${(user.walletBalance ?? 0).toLocaleString('fr-FR')} FCFA`} color={accentColor} />
          <InfoRow icon="time" label="Statut" value={(user as any)?.verificationStatus ?? '—'} color={accentColor} />
        </View>
      )}

      {(role === 'BOUTIQUE' || role === 'QUINCAILLERIE') && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Mon établissement</Text>
          <InfoRow icon="storefront" label="Nom" value={(user as any)?.shopName ?? '—'} color={accentColor} />
          <InfoRow icon="location" label="Adresse" value={(user as any)?.address ?? '—'} color={accentColor} />
          <InfoRow icon="wallet" label="Solde" value={`${(user.walletBalance ?? 0).toLocaleString('fr-FR')} FCFA`} color={accentColor} />
        </View>
      )}

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map(item => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
            <View style={[styles.menuIconBox, { backgroundColor: accentColor + '15' }]}>
              <Ionicons name={item.icon} size={20} color={accentColor} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout} activeOpacity={0.7}>
          <View style={[styles.menuIconBox, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </View>
          <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>fixAI v1.0</Text>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, color }: { icon: IoniconName; label: string; value: string; color: string }) {
  return (
    <View style={infoRow.row}>
      <Ionicons name={icon} size={16} color={color} style={{ marginRight: 8 }} />
      <Text style={infoRow.label}>{label}</Text>
      <Text style={infoRow.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const infoRow = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  label: { fontSize: 13, color: '#6B7280', flex: 1 },
  value: { fontSize: 13, fontWeight: '700', color: '#111827', maxWidth: '55%', textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 28, alignItems: 'center', paddingBottom: 32 },
  avatarBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ffffff30', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  name: { fontSize: 20, fontWeight: '800', color: '#fff' },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  roleBadge: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 10 },
  roleText: { fontSize: 12, fontWeight: '700' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { color: '#10B981', fontWeight: '600', fontSize: 12 },
  infoCard: { margin: 16, marginBottom: 0, backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10 },
  menu: { margin: 16, backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },
  logoutItem: { borderBottomWidth: 0 },
  version: { textAlign: 'center', color: '#D1D5DB', fontSize: 12, marginTop: 8 },
});
