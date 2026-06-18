import { Stack } from 'expo-router';

export default function DepannageLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#F97316' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }}>
      <Stack.Screen name="step1-description" options={{ title: 'Décrivez le problème' }} />
      <Stack.Screen name="step2-category" options={{ title: 'Catégorie' }} />
      <Stack.Screen name="step3-mode" options={{ title: 'Urgence ou planifié ?' }} />
      <Stack.Screen name="step4-location" options={{ title: 'Localisation' }} />
      <Stack.Screen name="step5-artisan" options={{ title: 'Choisir un artisan' }} />
      <Stack.Screen name="step6-payment" options={{ title: 'Paiement sécurisé' }} />
      <Stack.Screen name="step7-confirmation" options={{ title: 'Confirmation' }} />
    </Stack>
  );
}
