import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, focused }: { name: IoniconName; focused: boolean }) {
  return <Ionicons name={name} size={22} color={focused ? '#6B3FA0' : '#9CA3AF'} />;
}

function FixAIHeader() {
  return (
    <View style={header.container}>
      <View style={header.logo}>
        <View style={header.logoBox}>
          <Text style={header.logoBoxText}>fx</Text>
        </View>
        <Text style={header.logoText}>fixAI</Text>
      </View>
      <View style={header.actions}>
        <TouchableOpacity style={header.iconBtn}>
          <Ionicons name="chatbubble-outline" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={header.iconBtn}>
          <Ionicons name="person-circle-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const header = StyleSheet.create({
  container: {
    backgroundColor: '#6B3FA0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBoxText: { fontSize: 14, fontWeight: '900', color: '#6B3FA0' },
  logoText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 4 },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6B3FA0',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        header: () => <FixAIHeader />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Réparation',
          tabBarIcon: ({ focused }) => <TabIcon name="build" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="decouvrir"
        options={{
          title: 'Décoration',
          tabBarIcon: ({ focused }) => <TabIcon name="color-palette" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Rénovation',
          tabBarIcon: ({ focused }) => <TabIcon name="home-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Devis Pro',
          tabBarIcon: ({ focused }) => <TabIcon name="briefcase" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
