import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, FlatList, Image, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    title: 'Réparation, décoration',
    subtitle: 'Rénovation - Tout en un',
    body: 'Une plateforme complète pour tous vos besoins rénovation',
    bg: 'rgba(0,0,0,0.45)',
    image: null,
  },
  {
    key: '2',
    title: 'Artisans vérifiés',
    subtitle: 'Disponibles 24h/24',
    body: 'Des professionnels certifiés partout en Côte d\'Ivoire',
    bg: 'rgba(107,63,160,0.6)',
    image: null,
  },
  {
    key: '3',
    title: 'Paiement sécurisé',
    subtitle: 'Escrow Mobile Money',
    body: 'Libérez le paiement seulement quand le travail est fait',
    bg: 'rgba(176,22,21,0.5)',
    image: null,
  },
];

const SERVICES = [
  {
    key: 'reparation',
    label: 'Réparation',
    subtitle: 'Urgente ou planifiée',
    icon: 'build' as const,
    iconBg: '#2E7D32',
    cardBg: '#F0FBF0',
    route: '/depannage/step1-description',
  },
  {
    key: 'decoration',
    label: 'Décoration',
    subtitle: 'Transformez votre intérieur',
    icon: 'color-palette' as const,
    iconBg: '#6B3FA0',
    cardBg: '#F5EEFF',
    route: '/decoration',
  },
  {
    key: 'renovation',
    label: 'Rénovation',
    subtitle: "Projets d'envergure",
    icon: 'home' as const,
    iconBg: '#1565C0',
    cardBg: '#EFF4FF',
    route: '/renovation',
  },
  {
    key: 'devis-pro',
    label: 'Devis Pro',
    subtitle: 'Solutions professionnelles',
    icon: 'briefcase' as const,
    iconBg: '#795548',
    cardBg: '#FBF5F0',
    route: '/devis-pro',
  },
];

function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setActiveIndex(idx);
  };

  return (
    <View style={hero.container}>
      <FlatList
        ref={ref}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.key}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[hero.slide, { width: SCREEN_W }]}>
            <View style={[hero.overlay, { backgroundColor: item.bg }]} />
            <View style={hero.textBox}>
              <Text style={hero.title}>{item.title}</Text>
              <Text style={hero.subtitle}>{item.subtitle}</Text>
              <Text style={hero.body}>{item.body}</Text>
            </View>
          </View>
        )}
      />
      <View style={hero.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[hero.dot, i === activeIndex && hero.dotActive]} />
        ))}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <HeroCarousel />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Commencer un devis</Text>
        <Text style={styles.sectionSub}>Choisissez le type de projet qui correspond à vos besoins</Text>

        <View style={styles.serviceList}>
          {SERVICES.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.serviceCard, { backgroundColor: s.cardBg }]}
              activeOpacity={0.8}
              onPress={() => router.push(s.route as Parameters<typeof router.push>[0])}
            >
              <View style={[styles.serviceIconWrap, { backgroundColor: s.iconBg }]}>
                <Ionicons name={s.icon} size={22} color="#fff" />
              </View>
              <View style={styles.serviceText}>
                <Text style={styles.serviceLabel}>{s.label}</Text>
                <Text style={styles.serviceSubtitle}>{s.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const hero = StyleSheet.create({
  container: { height: 280, backgroundColor: '#3a2060' },
  slide: {
    height: 280,
    backgroundColor: '#3a2060',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  textBox: { gap: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#E9D5FF' },
  body: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  dots: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 22 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  sectionSub: { fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
  serviceList: { gap: 12 },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  serviceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceText: { flex: 1 },
  serviceLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  serviceSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
});
