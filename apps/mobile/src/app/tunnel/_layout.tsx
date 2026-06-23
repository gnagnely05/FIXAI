import { Stack } from 'expo-router';

export default function TunnelLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="step1-chat" />
      <Stack.Screen name="step2-diagnosis" />
      <Stack.Screen name="step3-location" />
      <Stack.Screen name="step4-schedule" />
      <Stack.Screen name="step5-quote" />
    </Stack>
  );
}
