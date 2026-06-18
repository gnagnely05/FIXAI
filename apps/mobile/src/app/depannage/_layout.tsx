import { Stack } from 'expo-router';

export default function DepannageLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FF6B00' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="step1-description" options={{ title: 'Décrivez votre problème' }} />
      <Stack.Screen name="step2-category" options={{ title: 'Catégorie de service' }} />
      <Stack.Screen name="step3-mode" options={{ title: "Mode d'intervention" }} />
      <Stack.Screen name="step4-location" options={{ title: 'Localisation' }} />
      <Stack.Screen name="step5-artisan" options={{ title: 'Choisir un artisan' }} />
      <Stack.Screen name="step6-payment" options={{ title: 'Paiement sécurisé' }} />
      <Stack.Screen name="step7-confirmation" options={{ title: 'Confirmation' }} />
    </Stack>
  );
}
