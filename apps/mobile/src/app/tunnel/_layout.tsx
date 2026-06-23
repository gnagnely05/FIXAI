import { Stack } from 'expo-router';

const SERVICE_LABELS: Record<string, string> = {
  DEPANNAGE: 'Réparation & Dépannage',
  RENOVATION: 'Rénovation',
  DECORATION: "Décoration d'intérieur",
};

export default function TunnelLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#6B3FA0' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Retour',
      }}
    >
      <Stack.Screen name="step1-chat" options={{ title: 'Conversation & Analyse' }} />
      <Stack.Screen name="step2-diagnosis" options={{ title: 'Diagnostic IA' }} />
      <Stack.Screen name="step3-location" options={{ title: 'Localisation' }} />
      <Stack.Screen name="step4-schedule" options={{ title: 'Formule / Créneau' }} />
      <Stack.Screen name="step5-quote" options={{ title: 'Récapitulatif & Paiement' }} />
    </Stack>
  );
}
