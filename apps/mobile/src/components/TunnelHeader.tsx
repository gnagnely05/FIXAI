import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';

interface Props {
  title: string;
  onRefresh?: () => void;
}

const SERVICE_TITLES: Record<string, string> = {
  DEPANNAGE:  'Demande de réparation',
  RENOVATION: 'Demande de rénovation',
  DECORATION: 'Demande de décoration',
};

export function getTunnelTitle(serviceType: string): string {
  return SERVICE_TITLES[serviceType] ?? 'Demande de service';
}

export default function TunnelHeader({ title, onRefresh }: Props) {
  const router = useRouter();
  const top = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
        <Text style={styles.icon}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <TouchableOpacity style={styles.iconBtn} onPress={onRefresh}>
        <Text style={styles.icon}>↻</Text>
      </TouchableOpacity>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 20, color: '#2E7D32', fontWeight: '600' },
  title: {
    flex: 1, textAlign: 'center',
    fontSize: 16, fontWeight: '700', color: '#2E7D32',
  },
  line: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: '#2E7D32',
  },
});
