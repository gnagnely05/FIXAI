import { Stack } from 'expo-router';

export default function DevisProLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#6B3FA0' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Devis Pro' }} />
    </Stack>
  );
}
