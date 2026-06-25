import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.outer, isDesktop && styles.outerDesktop]}>
        <View style={[styles.inner, isDesktop && styles.innerDesktop]}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#F4F5F7' },
  outerDesktop: {
    backgroundColor: '#1A0A3E',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  inner: { flex: 1 },
  innerDesktop: {
    width: 430,
    flex: 1,
    backgroundColor: '#F4F5F7',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 0 },
    overflow: 'hidden',
  },
});
