import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, focused, color }: { name: IoniconName; focused: boolean; color: string }) {
  return <Ionicons name={name} size={22} color={focused ? color : '#9CA3AF'} />;
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

const header = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { backgroundColor: '#fff', borderRadius: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  logoBoxText: { fontSize: 14, fontWeight: '900' },
  logoText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 4 },
});

export default function TabsLayout() {
  const { user } = useAuth();
  const role = user?.role ?? 'CLIENT';

  // ── ARTISAN ──────────────────────────────────────────────────────────
  if (role === 'ARTISAN') {
    return (
      <Tabs screenOptions={{ tabBarActiveTintColor: '#2E7D32', tabBarInactiveTintColor: '#9CA3AF', tabBarStyle: styles.tabBar, tabBarLabelStyle: styles.tabLabel, header: () => <FixAIHeader accentColor="#2E7D32" /> }}>
        <Tabs.Screen name="artisan-home" options={{ title: 'Tableau de bord', tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} color="#2E7D32" /> }} />
        <Tabs.Screen name="artisan-missions" options={{ title: 'Missions', tabBarIcon: ({ focused }) => <TabIcon name="briefcase" focused={focused} color="#2E7D32" /> }} />
        <Tabs.Screen name="artisan-availability" options={{ title: 'Disponibilité', tabBarIcon: ({ focused }) => <TabIcon name="toggle" focused={focused} color="#2E7D32" /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} color="#2E7D32" /> }} />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="search" options={{ href: null }} />
        <Tabs.Screen name="decouvrir" options={{ href: null }} />
        <Tabs.Screen name="orders" options={{ href: null }} />
        <Tabs.Screen name="agency-home" options={{ href: null }} />
        <Tabs.Screen name="agency-artisans" options={{ href: null }} />
        <Tabs.Screen name="agency-requests" options={{ href: null }} />
      </Tabs>
    );
  }

  // ── AGENCE / ENTREPRISE BTP ──────────────────────────────────────────
  if (role === 'AGENCE_HOTE' || role === 'ENTREPRISE_BTP') {
    return (
      <Tabs screenOptions={{ tabBarActiveTintColor: '#1565C0', tabBarInactiveTintColor: '#9CA3AF', tabBarStyle: styles.tabBar, tabBarLabelStyle: styles.tabLabel, header: () => <FixAIHeader accentColor="#1565C0" /> }}>
        <Tabs.Screen name="agency-home" options={{ title: 'Tableau de bord', tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} color="#1565C0" /> }} />
        <Tabs.Screen name="agency-artisans" options={{ title: 'Mes Artisans', tabBarIcon: ({ focused }) => <TabIcon name="people" focused={focused} color="#1565C0" /> }} />
        <Tabs.Screen name="agency-requests" options={{ title: 'Demandes', tabBarIcon: ({ focused }) => <TabIcon name="document-text" focused={focused} color="#1565C0" /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Agence', tabBarIcon: ({ focused }) => <TabIcon name="business" focused={focused} color="#1565C0" /> }} />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="search" options={{ href: null }} />
        <Tabs.Screen name="decouvrir" options={{ href: null }} />
        <Tabs.Screen name="orders" options={{ href: null }} />
        <Tabs.Screen name="artisan-home" options={{ href: null }} />
        <Tabs.Screen name="artisan-missions" options={{ href: null }} />
        <Tabs.Screen name="artisan-availability" options={{ href: null }} />
      </Tabs>
    );
  }

  // ── CLIENT (défaut) ──────────────────────────────────────────────────
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#6B3FA0', tabBarInactiveTintColor: '#9CA3AF', tabBarStyle: styles.tabBar, tabBarLabelStyle: styles.tabLabel, header: () => <FixAIHeader accentColor="#6B3FA0" /> }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} color="#6B3FA0" /> }} />
      <Tabs.Screen name="search" options={{ title: 'Réparation', tabBarIcon: ({ focused }) => <TabIcon name="build" focused={focused} color="#6B3FA0" /> }} />
      <Tabs.Screen name="decouvrir" options={{ title: 'Décoration', tabBarIcon: ({ focused }) => <TabIcon name="color-palette" focused={focused} color="#6B3FA0" /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Mes Projets', tabBarIcon: ({ focused }) => <TabIcon name="receipt" focused={focused} color="#6B3FA0" /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} color="#6B3FA0" /> }} />
      <Tabs.Screen name="artisan-home" options={{ href: null }} />
      <Tabs.Screen name="artisan-missions" options={{ href: null }} />
      <Tabs.Screen name="artisan-availability" options={{ href: null }} />
      <Tabs.Screen name="agency-home" options={{ href: null }} />
      <Tabs.Screen name="agency-artisans" options={{ href: null }} />
      <Tabs.Screen name="agency-requests" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingBottom: 4, height: 60 },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
