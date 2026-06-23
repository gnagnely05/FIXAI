import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1565C0' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerBackTitle: 'Retour',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Dashboard Admin', headerBackVisible: false }} />
      <Stack.Screen name="verifications" options={{ title: 'Vérifications' }} />
      <Stack.Screen name="user-detail" options={{ title: 'Détail utilisateur' }} />
      <Stack.Screen name="commission" options={{ title: 'Commissions' }} />
      <Stack.Screen name="escrow" options={{ title: 'Escrow & Paiements' }} />
      <Stack.Screen name="disputes" options={{ title: 'Litiges' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
});
