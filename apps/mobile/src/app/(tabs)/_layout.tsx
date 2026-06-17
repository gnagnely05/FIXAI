import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, focused }: { name: IoniconName; focused: boolean }) {
  return <Ionicons name={name} size={24} color={focused ? '#FF6B00' : '#9CA3AF'} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingBottom: 4,
        },
        headerStyle: { backgroundColor: '#FF6B00' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
          headerTitle: 'FixAI',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Recherche',
          tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} />,
          headerTitle: 'Trouver un artisan',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Commandes',
          tabBarIcon: ({ focused }) => <TabIcon name="receipt" focused={focused} />,
          headerTitle: 'Mes commandes',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
          headerTitle: 'Mon profil',
        }}
      />
    </Tabs>
  );
}
