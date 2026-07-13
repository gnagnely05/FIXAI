import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SHADOW } from '../../theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, focused, color }: { name: IoniconName; focused: boolean; color: string }) {
  return (
    <View style={focused ? [tabIcon.wrap, { backgroundColor: color + '18' }] : tabIcon.wrapInactive}>
      <Ionicons name={name} size={24} color={focused ? color : '#9BA8B4'} />
    </View>
  );
}

function FixAIHeader({ accentColor = '#6B3FA0' }: { accentColor?: string }) {
  return (
    <View style={[header.container, { backgroundColor: accentColor }]}>
      <View style={header.logo}>
        <View style={header.logoBox}>
          <Text style={[header.logoBoxText, { color: accentColor }]}>fx</Text>
        </View>
        <Text style={header.logoText}>fixAI</Text>
      </View>
      <View style={header.actions}>
        <TouchableOpacity style={header.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={header.iconBtn}>
          <Ionicons name="person-circle-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const tabIcon = StyleSheet.create({
  wrap: { width: 40, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  wrapInactive: { width: 40, height: 28, alignItems: 'center', justifyContent: 'center' },
});

const header = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    ...SHADOW.sm,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { backgroundColor: '#fff', borderRadius: 10, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  logoBoxText: { fontSize: 14, fontWeight: '900' },
  logoText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 4 },
});

export default function TabsLayout() {
  const { user } = useAuth();
  const role = user?.role ?? 'CLIENT';
  const btpMode = (user as any)?.btpMode ?? 'AGENCE';
  // Une entreprise BTP en mode ARTISAN se comporte comme un artisan (pas d'agence)
  const btpAsArtisan = role === 'ENTREPRISE_BTP' && btpMode === 'ARTISAN';
  const btpMixte = role === 'ENTREPRISE_BTP' && btpMode === 'MIXTE';

  const tabBarStyle = styles.tabBar;
  const tabLabelStyle = styles.tabLabel;

  // ── ARTISAN (ou Entreprise BTP en mode ARTISAN) ──────────────────────
  if (role === 'ARTISAN' || btpAsArtisan) {
    return (
      <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.artisan, tabBarInactiveTintColor: '#9BA8B4', tabBarStyle, tabBarLabelStyle: tabLabelStyle, tabBarShowLabel: true, header: () => <FixAIHeader accentColor={COLORS.artisan} /> }}>
        <Tabs.Screen name="artisan-home" options={{ title: 'Tableau de bord', tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} color={COLORS.artisan} /> }} />
        <Tabs.Screen name="artisan-missions" options={{ title: 'Missions', tabBarIcon: ({ focused }) => <TabIcon name="briefcase" focused={focused} color={COLORS.artisan} /> }} />
        <Tabs.Screen name="artisan-availability" options={{ title: 'Disponibilité', tabBarIcon: ({ focused }) => <TabIcon name="toggle" focused={focused} color={COLORS.artisan} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} color={COLORS.artisan} /> }} />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="search" options={{ href: null }} />
        <Tabs.Screen name="decouvrir" options={{ href: null }} />
        <Tabs.Screen name="orders" options={{ href: null }} />
        <Tabs.Screen name="agency-home" options={{ href: null }} />
        <Tabs.Screen name="agency-artisans" options={{ href: null }} />
        <Tabs.Screen name="agency-requests" options={{ href: null }} />
        <Tabs.Screen name="agency-disputes" options={{ href: null }} />
        <Tabs.Screen name="shop-home" options={{ href: null }} />
        <Tabs.Screen name="shop-catalog" options={{ href: null }} />
        <Tabs.Screen name="shop-orders" options={{ href: null }} />
      </Tabs>
    );
  }

  // ── ENTREPRISE BTP en mode MIXTE (agence + missions artisan) ─────────
  if (btpMixte) {
    return (
      <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.agency, tabBarInactiveTintColor: '#9BA8B4', tabBarStyle, tabBarLabelStyle: tabLabelStyle, tabBarShowLabel: true, header: () => <FixAIHeader accentColor={COLORS.agency} /> }}>
        <Tabs.Screen name="agency-home" options={{ title: 'Tableau de bord', tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} color={COLORS.agency} /> }} />
        <Tabs.Screen name="agency-artisans" options={{ title: 'Artisans', tabBarIcon: ({ focused }) => <TabIcon name="people" focused={focused} color={COLORS.agency} /> }} />
        <Tabs.Screen name="artisan-missions" options={{ title: 'Missions', tabBarIcon: ({ focused }) => <TabIcon name="briefcase" focused={focused} color={COLORS.agency} /> }} />
        <Tabs.Screen name="agency-requests" options={{ title: 'Demandes', tabBarIcon: ({ focused }) => <TabIcon name="document-text" focused={focused} color={COLORS.agency} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ focused }) => <TabIcon name="business" focused={focused} color={COLORS.agency} /> }} />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="search" options={{ href: null }} />
        <Tabs.Screen name="decouvrir" options={{ href: null }} />
        <Tabs.Screen name="orders" options={{ href: null }} />
        <Tabs.Screen name="artisan-home" options={{ href: null }} />
        <Tabs.Screen name="artisan-availability" options={{ href: null }} />
        <Tabs.Screen name="agency-disputes" options={{ href: null }} />
        <Tabs.Screen name="shop-home" options={{ href: null }} />
        <Tabs.Screen name="shop-catalog" options={{ href: null }} />
        <Tabs.Screen name="shop-orders" options={{ href: null }} />
      </Tabs>
    );
  }

  // ── AGENCE / ENTREPRISE BTP (mode AGENCE) ────────────────────────────
  if (role === 'AGENCE_HOTE' || role === 'ENTREPRISE_BTP') {
    return (
      <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.agency, tabBarInactiveTintColor: '#9BA8B4', tabBarStyle, tabBarLabelStyle: tabLabelStyle, tabBarShowLabel: true, header: () => <FixAIHeader accentColor={COLORS.agency} /> }}>
        <Tabs.Screen name="agency-home" options={{ title: 'Tableau de bord', tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} color={COLORS.agency} /> }} />
        <Tabs.Screen name="agency-artisans" options={{ title: 'Artisans', tabBarIcon: ({ focused }) => <TabIcon name="people" focused={focused} color={COLORS.agency} /> }} />
        <Tabs.Screen name="agency-requests" options={{ title: 'Demandes', tabBarIcon: ({ focused }) => <TabIcon name="document-text" focused={focused} color={COLORS.agency} /> }} />
        <Tabs.Screen name="agency-disputes" options={{ title: 'Litiges', tabBarIcon: ({ focused }) => <TabIcon name="warning" focused={focused} color={COLORS.admin} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Agence', tabBarIcon: ({ focused }) => <TabIcon name="business" focused={focused} color={COLORS.agency} /> }} />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="search" options={{ href: null }} />
        <Tabs.Screen name="decouvrir" options={{ href: null }} />
        <Tabs.Screen name="orders" options={{ href: null }} />
        <Tabs.Screen name="artisan-home" options={{ href: null }} />
        <Tabs.Screen name="artisan-missions" options={{ href: null }} />
        <Tabs.Screen name="artisan-availability" options={{ href: null }} />
        <Tabs.Screen name="shop-home" options={{ href: null }} />
        <Tabs.Screen name="shop-catalog" options={{ href: null }} />
        <Tabs.Screen name="shop-orders" options={{ href: null }} />
      </Tabs>
    );
  }

  // ── BOUTIQUE / QUINCAILLERIE ─────────────────────────────────────────
  if (role === 'BOUTIQUE' || role === 'QUINCAILLERIE') {
    return (
      <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.shop, tabBarInactiveTintColor: '#9BA8B4', tabBarStyle, tabBarLabelStyle: tabLabelStyle, tabBarShowLabel: true, header: () => <FixAIHeader accentColor={COLORS.shop} /> }}>
        <Tabs.Screen name="shop-home" options={{ title: 'Tableau de bord', tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} color={COLORS.shop} /> }} />
        <Tabs.Screen name="shop-catalog" options={{ title: 'Catalogue', tabBarIcon: ({ focused }) => <TabIcon name="cube" focused={focused} color={COLORS.shop} /> }} />
        <Tabs.Screen name="shop-orders" options={{ title: 'Commandes', tabBarIcon: ({ focused }) => <TabIcon name="receipt" focused={focused} color={COLORS.shop} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} color={COLORS.shop} /> }} />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="search" options={{ href: null }} />
        <Tabs.Screen name="decouvrir" options={{ href: null }} />
        <Tabs.Screen name="orders" options={{ href: null }} />
        <Tabs.Screen name="artisan-home" options={{ href: null }} />
        <Tabs.Screen name="artisan-missions" options={{ href: null }} />
        <Tabs.Screen name="artisan-availability" options={{ href: null }} />
        <Tabs.Screen name="agency-home" options={{ href: null }} />
        <Tabs.Screen name="agency-artisans" options={{ href: null }} />
        <Tabs.Screen name="agency-requests" options={{ href: null }} />
        <Tabs.Screen name="agency-disputes" options={{ href: null }} />
      </Tabs>
    );
  }

  // ── CLIENT (défaut) ──────────────────────────────────────────────────
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.client, tabBarInactiveTintColor: '#9BA8B4', tabBarStyle, tabBarLabelStyle: tabLabelStyle, tabBarShowLabel: true, header: () => <FixAIHeader accentColor={COLORS.client} /> }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} color={COLORS.client} /> }} />
      <Tabs.Screen name="search" options={{ title: 'Réparation', tabBarIcon: ({ focused }) => <TabIcon name="build" focused={focused} color={COLORS.client} /> }} />
      <Tabs.Screen name="decouvrir" options={{ title: 'Décoration', tabBarIcon: ({ focused }) => <TabIcon name="color-palette" focused={focused} color={COLORS.client} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Mes Projets', tabBarIcon: ({ focused }) => <TabIcon name="receipt" focused={focused} color={COLORS.client} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} color={COLORS.client} /> }} />
      <Tabs.Screen name="artisan-home" options={{ href: null }} />
      <Tabs.Screen name="artisan-missions" options={{ href: null }} />
      <Tabs.Screen name="artisan-availability" options={{ href: null }} />
      <Tabs.Screen name="agency-home" options={{ href: null }} />
      <Tabs.Screen name="agency-artisans" options={{ href: null }} />
      <Tabs.Screen name="agency-requests" options={{ href: null }} />
      <Tabs.Screen name="agency-disputes" options={{ href: null }} />
      <Tabs.Screen name="shop-home" options={{ href: null }} />
      <Tabs.Screen name="shop-catalog" options={{ href: null }} />
      <Tabs.Screen name="shop-orders" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    backgroundColor: '#FFFFFF',
    height: 65,
    paddingBottom: 8,
    paddingTop: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
