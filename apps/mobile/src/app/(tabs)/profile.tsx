import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { storage } from '../../services/storage';
import { COLORS, SHADOW, RADIUS } from '../../theme';

const PRO_ROLE_LABEL: Record<string, string> = {
  ARTISAN: 'Artisan', AGENCE_HOTE: 'Agence', ENTREPRISE_BTP: 'Entreprise BTP',
  BOUTIQUE: 'Boutique', QUINCAILLERIE: 'Quincaillerie',
};

const ROLE_LABEL: Record<string, string> = {
  CLIENT: 'Client', ARTISAN: 'Artisan', AGENCE_HOTE: 'Agence Hôte',
  ENTREPRISE_BTP: 'Entreprise BTP', BOUTIQUE: 'Boutique',
  QUINCAILLERIE: 'Quincaillerie', ADMIN: 'Administrateur',
};
const ROLE_COLOR: Record<string, string> = {
  CLIENT: '#6B3FA0', ARTISAN: '#1B8A2E', AGENCE_HOTE: '#1565C0',
  ENTREPRISE_BTP: '#5D4037', BOUTIQUE: '#E65100', QUINCAILLERIE: '#E65100', ADMIN: '#B71C1C',
};
const ROLE_DARK: Record<string, string> = {
  CLIENT: '#4A2880', ARTISAN: '#145F20', AGENCE_HOTE: '#0D47A1',
  ENTREPRISE_BTP: '#3E2723', BOUTIQUE: '#BF360C', QUINCAILLERIE: '#BF360C', ADMIN: '#7F0000',
};

type IoniconName = keyof typeof Ionicons.glyphMap;

const GUEST_FEATURES = [
  { icon: 'receipt-outline', label: 'Suivi de vos projets', sub: "Consultez l'état de toutes vos demandes en temps réel", color: COLORS.client },
  { icon: 'wallet-outline', label: 'Portefeuille sécurisé', sub: 'Gérez vos paiements et retraits en toute sécurité', color: '#1B8A2E' },
  { icon: 'notifications-outline', label: 'Notifications', sub: 'Soyez alerté à chaque étape de votre prestation', color: '#D97706' },
  { icon: 'shield-checkmark-outline', label: 'Paiement escrow', sub: 'Votre argent libéré uniquement après validation', color: '#1565C0' },
  { icon: 'star-outline', label: 'Évaluations', sub: 'Notez vos artisans et consultez leurs avis', color: '#F59E0B' },
];

function GuestProfile() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={guest.hero}>
        <View style={guest.heroBg1} />
        <View style={guest.heroBg2} />
        <View style={guest.avatarBox}>
          <Ionicons name="person" size={44} color="#C4CAD4" />
        </View>
        <Text style={guest.heroTitle}>Mon Profil</Text>
        <Text style={guest.heroSub}>Connectez-vous pour accéder à votre espace personnel</Text>
      </View>

      <View style={guest.ctaBox}>
        <TouchableOpacity style={guest.loginBtn} onPress={() => router.push('/(auth)/login' as any)}>
          <Ionicons name="log-in-outline" size={20} color="#fff" />
          <Text style={guest.loginBtnText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={guest.registerBtn} onPress={() => router.push('/(auth)/register' as any)}>
          <Text style={guest.registerBtnText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>

      <Text style={guest.sectionTitle}>Ce qui vous attend</Text>
      {GUEST_FEATURES.map((f, i) => (
        <View key={i} style={guest.featureRow}>
          <View style={[guest.featureIcon, { backgroundColor: f.color + '18' }]}>
            <Ionicons name={f.icon as IoniconName} size={20} color={f.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={guest.featureLabel}>{f.label}</Text>
            <Text style={guest.featureSub}>{f.sub}</Text>
          </View>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default function ProfileScreen() {
  const { user, logout, switchRole, isLoading } = useAuth();
  const [lastProRole, setLastProRole] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    storage.getItem('fixai_last_pro_role').then(setLastProRole);
  }, [user?.role]);

  if (isLoading) return null;
  if (!user) return <GuestProfile />;

  const handleLogout = async () => {
    // Sur web, Alert.alert ne déclenche pas les callbacks → on utilise window.confirm
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' ? window.confirm('Voulez-vous vous déconnecter ?') : true;
      if (ok) { await logout(); router.replace('/(tabs)'); }
      return;
    }
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: async () => { await logout(); router.replace('/(tabs)'); } },
    ]);
  };

  const doSwitch = async (target: string) => {
    if (switching) return;
    setSwitching(true);
    try {
      await switchRole(target);
      router.replace('/(tabs)');
    } catch {
      // silencieux — l'état ne change pas
    } finally {
      setSwitching(false);
    }
  };

  const role = user.role ?? 'CLIENT';
  const accent = ROLE_COLOR[role] ?? '#6B3FA0';
  const dark = ROLE_DARK[role] ?? '#4A2880';
  const roleLabel = ROLE_LABEL[role] ?? role;
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  const menuSections: Array<{ title: string; items: Array<{ icon: IoniconName; label: string; danger?: boolean; badge?: string; onPress?: () => void }> }> = [
    ...(role === 'CLIENT' ? [{
      // Vue identique à un client normal : une seule option pro.
      // S'il a déjà un profil pro activé, on le réactive directement ;
      // sinon on ouvre la configuration.
      title: 'Espace Pro',
      items: [{
        icon: 'briefcase-outline' as IoniconName,
        label: lastProRole && PRO_ROLE_LABEL[lastProRole]
          ? `Repasser en profil ${PRO_ROLE_LABEL[lastProRole]}`
          : 'Activer un profil professionnel',
        badge: lastProRole ? undefined : 'Nouveau',
        onPress: lastProRole && PRO_ROLE_LABEL[lastProRole]
          ? () => doSwitch(lastProRole)
          : () => router.push('/pro-setup' as any),
      }],
    }] : [{
      title: 'Espace Pro',
      items: [{
        icon: 'swap-horizontal-outline' as IoniconName,
        label: 'Passer en compte standard',
        onPress: () => doSwitch('CLIENT'),
      }],
    }]),
    {
      title: 'Mon compte',
      items: [
        { icon: 'person-outline', label: 'Modifier le profil', onPress: () => router.push('/profile/edit' as any) },
        { icon: 'notifications-outline', label: 'Notifications' },
        { icon: 'wallet-outline', label: 'Mon portefeuille', onPress: () => router.push('/profile/wallet' as any) },
      ],
    },
    {
      title: 'Sécurité',
      items: [
        { icon: 'shield-checkmark-outline', label: 'Sécurité & Confidentialité' },
        { icon: 'finger-print-outline', label: 'Authentification biométrique' },
      ],
    },
    {
      title: 'Assistance',
      items: [
        { icon: 'help-circle-outline', label: "Centre d'aide" },
        { icon: 'chatbubble-ellipses-outline', label: 'Contacter le support' },
        { icon: 'document-text-outline', label: "Conditions d'utilisation" },
      ],
    },
    {
      title: '',
      items: [{ icon: 'log-out-outline', label: 'Déconnexion', danger: true, onPress: handleLogout }],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { backgroundColor: dark }]}>
        <View style={[styles.heroBg1, { backgroundColor: accent + '40' }]} />
        <View style={[styles.heroBg2, { backgroundColor: accent + '25' }]} />
        <View style={styles.heroContent}>
          <View style={[styles.avatar, { borderColor: accent }]}>
            <View style={[styles.avatarInner, { backgroundColor: accent }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.heroEmail}>{user.email}</Text>
          <View style={styles.heroMeta}>
            <View style={[styles.rolePill, { backgroundColor: accent }]}>
              <Text style={styles.rolePillText}>{roleLabel}</Text>
            </View>
            {user.isVerified && (
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                <Text style={styles.verifiedText}>Vérifié</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Wallet */}
      <View style={[styles.walletBanner, { borderLeftColor: accent }]}>
        <Ionicons name="wallet-outline" size={20} color={accent} />
        <Text style={styles.walletLabel}>Solde portefeuille</Text>
        <Text style={[styles.walletAmount, { color: accent }]}>
          {(user.walletBalance ?? 0).toLocaleString('fr-FR')} FCFA
        </Text>
      </View>

      {/* Infos rôle */}
      {role === 'ARTISAN' && (
        <View style={[styles.infoCard, { borderTopColor: accent }]}>
          <View style={styles.infoHeader}>
            <View style={[styles.infoIconBox, { backgroundColor: accent + '15' }]}>
              <Ionicons name="construct" size={18} color={accent} />
            </View>
            <Text style={styles.infoTitle}>Profil Artisan</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoTile icon="build" label="Spécialité" value={(user as any)?.specialty?.replace(/_/g, ' ') ?? '—'} color={accent} />
            <InfoTile icon="star" label="Note" value={`${((user as any)?.artisanProfile?.rating ?? 0).toFixed(1)} ★`} color="#F59E0B" />
            <InfoTile icon="shield-checkmark" label="Statut" value={(user as any)?.verificationStatus ?? '—'} color={accent} wide />
          </View>
        </View>
      )}
      {(role === 'AGENCE_HOTE' || role === 'ENTREPRISE_BTP') && (
        <View style={[styles.infoCard, { borderTopColor: accent }]}>
          <View style={styles.infoHeader}>
            <View style={[styles.infoIconBox, { backgroundColor: accent + '15' }]}>
              <Ionicons name="business" size={18} color={accent} />
            </View>
            <Text style={styles.infoTitle}>Mon Agence</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoTile icon="business" label="Nom" value={(user as any)?.agencyName ?? '—'} color={accent} wide />
            <InfoTile icon="location" label="Ville" value={(user as any)?.city ?? '—'} color={accent} />
            <InfoTile icon="shield-checkmark" label="Statut" value={(user as any)?.verificationStatus ?? '—'} color={accent} />
          </View>
        </View>
      )}
      {(role === 'BOUTIQUE' || role === 'QUINCAILLERIE') && (
        <View style={[styles.infoCard, { borderTopColor: accent }]}>
          <View style={styles.infoHeader}>
            <View style={[styles.infoIconBox, { backgroundColor: accent + '15' }]}>
              <Ionicons name="storefront" size={18} color={accent} />
            </View>
            <Text style={styles.infoTitle}>Mon Établissement</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoTile icon="storefront" label="Nom" value={(user as any)?.shopName ?? '—'} color={accent} wide />
            <InfoTile icon="location" label="Adresse" value={(user as any)?.address ?? '—'} color={accent} wide />
          </View>
        </View>
      )}

      {menuSections.map((section, si) => (
        <View key={si} style={styles.menuSection}>
          {section.title ? <Text style={styles.menuSectionTitle}>{section.title}</Text> : null}
          <View style={styles.menuCard}>
            {section.items.map((item, ii) => (
              <TouchableOpacity
                key={ii}
                style={[styles.menuItem, ii < section.items.length - 1 && styles.menuItemBorder]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconBox, { backgroundColor: item.danger ? '#FEF2F2' : accent + '12' }]}>
                  <Ionicons name={item.icon} size={19} color={item.danger ? '#EF4444' : accent} />
                </View>
                <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>{item.label}</Text>
                {(item as any).badge && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{(item as any).badge}</Text>
                  </View>
                )}
                {!item.danger && <Ionicons name="chevron-forward" size={16} color="#C4CAD4" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <Text style={styles.version}>fixAI · Version 1.0.0</Text>
    </ScrollView>
  );
}

function InfoTile({ icon, label, value, color, wide }: { icon: IoniconName; label: string; value: string; color: string; wide?: boolean }) {
  return (
    <View style={[tile.box, wide && tile.wide]}>
      <View style={[tile.iconBox, { backgroundColor: color + '12' }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <Text style={tile.label}>{label}</Text>
      <Text style={tile.value} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const tile = StyleSheet.create({
  box: { width: '47%', backgroundColor: '#F8F9FC', borderRadius: 12, padding: 12, gap: 4 },
  wide: { width: '100%' },
  iconBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  label: { fontSize: 11, color: '#9BA8B4', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 13, fontWeight: '700', color: '#0D1117', lineHeight: 18 },
});

const guest = StyleSheet.create({
  hero: {
    backgroundColor: '#1A1A2E', paddingTop: 60, paddingBottom: 40,
    alignItems: 'center', overflow: 'hidden', position: 'relative',
  },
  heroBg1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#6B3FA018', top: -60, right: -40 },
  heroBg2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#6B3FA010', bottom: -30, left: -30 },
  avatarBox: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#2A2A3E',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    borderWidth: 2, borderColor: '#3A3A5E',
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
  ctaBox: { padding: 20, gap: 12 },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.client, borderRadius: RADIUS.md, paddingVertical: 16,
    ...SHADOW.md,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerBtn: {
    alignItems: 'center', borderRadius: RADIUS.md, paddingVertical: 14,
    borderWidth: 2, borderColor: COLORS.client,
  },
  registerBtnText: { color: COLORS.client, fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginHorizontal: 20, marginTop: 8, marginBottom: 12 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 14,
    ...SHADOW.sm,
  },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  featureSub: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  hero: { paddingTop: 40, paddingBottom: 36, overflow: 'hidden', position: 'relative' },
  heroBg1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -60, right: -60 },
  heroBg2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, bottom: -40, left: -40 },
  heroContent: { alignItems: 'center', zIndex: 1 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, padding: 3, marginBottom: 14 },
  avatarInner: { flex: 1, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  heroName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 14 },
  heroMeta: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rolePill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  rolePillText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  verifiedText: { color: '#059669', fontWeight: '700', fontSize: 12 },
  walletBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    padding: 14, borderLeftWidth: 4, ...SHADOW.sm,
  },
  walletLabel: { flex: 1, fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  walletAmount: { fontSize: 16, fontWeight: '900' },
  infoCard: { margin: 16, marginBottom: 4, backgroundColor: '#fff', borderRadius: 20, padding: 16, borderTopWidth: 3, ...SHADOW.sm },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  infoIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#0D1117' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  menuSection: { paddingHorizontal: 16, marginTop: 16 },
  menuSectionTitle: { fontSize: 12, fontWeight: '700', color: '#9BA8B4', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4 },
  menuCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', ...SHADOW.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  menuIconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: '#0D1117', fontWeight: '500' },
  menuLabelDanger: { color: '#EF4444' },
  version: { textAlign: 'center', color: '#C4CAD4', fontSize: 12, marginTop: 24, marginBottom: 32 },
  menuBadge: { backgroundColor: '#6B3FA0', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 4 },
  menuBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
