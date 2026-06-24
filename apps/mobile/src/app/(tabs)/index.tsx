import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW, RADIUS } from '../../theme';

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    badge: 'Tout en un',
    title: 'Réparation,\nDécoration',
    subtitle: 'Rénovation',
    body: 'Une plateforme complète pour tous vos besoins rénovation',
    bg: '#2A1850',
    accent: '#7C3AED',
  },
  {
    key: '2',
    badge: 'Certifiés fixAI',
    title: 'Artisans\nvérifiés',
    subtitle: 'Disponibles 24h/24',
    body: "Des professionnels certifiés partout en Côte d'Ivoire",
    bg: '#1B3A2F',
    accent: '#22C55E',
  },
  {
    key: '3',
    badge: 'Paiement sécurisé',
    title: 'Escrow\nMobile Money',
    subtitle: 'Libérez après validation',
    body: 'Libérez le paiement seulement quand le travail est fait',
    bg: '#5C1313',
    accent: '#F87171',
  },
];

const SERVICES = [
  {
    key: 'reparation',
    label: 'Réparation',
    subtitle: 'Urgente ou planifiée',
    icon: 'build' as const,
    color: '#2E7D32',
    route: '/tunnel/step1-chat?serviceType=DEPANNAGE',
  },
  {
    key: 'decoration',
    label: 'Décoration',
    subtitle: 'Transformez votre intérieur',
    icon: 'color-palette' as const,
    color: '#6B3FA0',
    route: '/tunnel/step1-chat?serviceType=DECORATION',
  },
  {
    key: 'renovation',
    label: 'Rénovation',
    subtitle: "Projets d'envergure",
    icon: 'home' as const,
    color: '#1565C0',
    route: '/tunnel/step1-chat?serviceType=RENOVATION',
  },
  {
    key: 'devis-pro',
    label: 'Devis Pro',
    subtitle: 'Solutions professionnelles',
    icon: 'briefcase' as const,
    color: '#795548',
    route: '/devis-pro',
  },
];

const HOW_STEPS = [
  { num: '1', label: 'Décrivez votre besoin' },
  { num: '2', label: 'Choisissez un artisan' },
  { num: '3', label: 'Validez & payez' },
];

const ARTISAN_AVATARS = [
  { initials: 'KD', color: '#2E7D32' },
  { initials: 'AA', color: '#1565C0' },
  { initials: 'MB', color: '#6B3FA0' },
  { initials: 'TC', color: '#E65100' },
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
          <View style={[hero.slide, { width: SCREEN_W, backgroundColor: item.bg }]}>
            {/* diagonal texture layer */}
            <View style={[hero.texture, { borderColor: item.accent }]} />
            <View style={hero.textBox}>
              <View style={[hero.badge, { backgroundColor: item.accent + '33', borderColor: item.accent + '66' }]}>
                <Text style={[hero.badgeText, { color: item.accent }]}>{item.badge}</Text>
              </View>
              <Text style={hero.title}>{item.title}</Text>
              <Text style={[hero.subtitle, { color: item.accent }]}>{item.subtitle}</Text>
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

      {/* Services grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Commencer un devis</Text>
        <Text style={styles.sectionSub}>Choisissez le type de projet qui correspond à vos besoins</Text>

        <View style={styles.serviceGrid}>
          {SERVICES.map(s => (
            <TouchableOpacity
              key={s.key}
              style={styles.serviceCard}
              activeOpacity={0.82}
              onPress={() => router.push(s.route as Parameters<typeof router.push>[0])}
            >
              <View style={[styles.serviceStrip, { backgroundColor: s.color }]} />
              <View style={styles.serviceCardInner}>
                <View style={[styles.serviceIconWrap, { backgroundColor: s.color + '18' }]}>
                  <Ionicons name={s.icon} size={22} color={s.color} />
                </View>
                <Text style={styles.serviceLabel}>{s.label}</Text>
                <Text style={styles.serviceSubtitle}>{s.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Comment ça marche */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comment ça marche</Text>
        <View style={styles.stepsRow}>
          {HOW_STEPS.map((step, i) => (
            <View key={i} style={styles.stepPill}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{step.num}</Text>
              </View>
              <Text style={styles.stepLabel}>{step.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Artisans disponibles teaser */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Artisans disponibles</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Voir plus →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarRow}>
          {ARTISAN_AVATARS.map((a, i) => (
            <View key={i} style={styles.avatarWrap}>
              <View style={[styles.avatarCircle, { backgroundColor: a.color }]}>
                <Text style={styles.avatarInitials}>{a.initials}</Text>
              </View>
              <View style={styles.avatarDot} />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const hero = StyleSheet.create({
  container: { height: 320, backgroundColor: '#2A1850' },
  slide: {
    height: 320,
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 48,
    overflow: 'hidden',
  },
  texture: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 40,
    borderWidth: 40,
    borderColor: 'rgba(255,255,255,0.06)',
    top: -80,
    right: -80,
    transform: [{ rotate: '22deg' }],
  },
  textBox: { gap: 6 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 30, fontWeight: '800', color: '#fff', lineHeight: 36 },
  subtitle: { fontSize: 15, fontWeight: '600' },
  body: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2, lineHeight: 18 },
  dots: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: '#fff', width: 24, borderRadius: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  sectionSub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 20 },
  seeAll: { fontSize: 13, color: COLORS.client, fontWeight: '600' },

  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    width: (SCREEN_W - 40 - 12) / 2,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  serviceStrip: { height: 6, width: '100%' },
  serviceCardInner: { padding: 16, alignItems: 'center', gap: 8 },
  serviceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  serviceSubtitle: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 16 },

  stepsRow: { flexDirection: 'row', gap: 8 },
  stepPill: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    ...SHADOW.sm,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.client,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  stepLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '600', lineHeight: 15 },

  avatarRow: { marginTop: 4 },
  avatarWrap: { marginRight: 16, alignItems: 'center' },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: '#fff', fontSize: 16, fontWeight: '800' },
  avatarDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: COLORS.bg,
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
});
