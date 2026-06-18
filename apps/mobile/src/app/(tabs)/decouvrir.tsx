import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, RefreshControl, ScrollView, Image, Dimensions,
} from 'react-native';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const COL_GAP = 12;
const PADDING = 16;
const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - PADDING * 2 - COL_GAP) / 2;

const CATEGORY_LABELS: Record<string, string> = {
  CIMENT: 'ciment',
  FER_BETON: 'fer-béton',
  BRIQUE: 'brique',
  CARRELAGE: 'carrelage',
  PEINTURE: 'peinture',
  PLOMBERIE: 'sanitaire-plomberie',
  ELECTRICITE: 'électricité',
  MENUISERIE: 'menuiserie',
  QUINCAILLERIE_GENERALE: 'quincaillerie',
  DECORATION: 'décoration',
  OUTILLAGE: 'outillage',
  AUTRES: 'autres',
};

const CATEGORIES = Object.keys(CATEGORY_LABELS);

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  priceXof: number;
  merchantName: string;
  merchantType: 'BOUTIQUE' | 'QUINCAILLERIE';
  unit?: string;
  imageUrls?: string[];
}

function formatPrice(xof: number): string {
  return Number(xof).toLocaleString('fr-FR') + ' XOF';
}

function ProductCard({ product }: { product: Product }) {
  const hasImage = product.imageUrls?.length;
  return (
    <View style={[card.container, { width: CARD_W }]}>
      <View style={card.imageWrap}>
        {hasImage ? (
          <Image source={{ uri: product.imageUrls![0] }} style={card.image} resizeMode="cover" />
        ) : (
          <View style={card.imagePlaceholder}>
            <Text style={card.imagePlaceholderIcon}>📦</Text>
          </View>
        )}
        <View style={card.badge}>
          <Text style={card.badgeText}>Produit</Text>
        </View>
      </View>
      <View style={card.body}>
        <View style={card.categoryChip}>
          <Text style={card.categoryText}>{CATEGORY_LABELS[product.category] ?? product.category}</Text>
        </View>
        <Text style={card.name} numberOfLines={2}>{product.name}</Text>
        <Text style={card.price}>{formatPrice(product.priceXof)}</Text>
        <View style={card.merchantRow}>
          <Text style={card.merchantIcon}>🏪</Text>
          <Text style={card.merchantName} numberOfLines={1}>{product.merchantName}</Text>
        </View>
      </View>
    </View>
  );
}

export default function DecouvrirScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const fetchProducts = useCallback(async (q?: string, category?: string) => {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (category) params.set('category', category);
      const res = await fetch(`${API_BASE}/catalog?${params.toString()}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(search, activeCategory ?? undefined);
  }, [search, activeCategory, fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(search, activeCategory ?? undefined);
  };

  const renderItem = ({ item }: { item: Product }) => <ProductCard product={item} />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un produit..."
        placeholderTextColor="#9CA3AF"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={styles.chipsContent}
      >
        <TouchableOpacity
          style={[styles.chip, !activeCategory && styles.chipActive]}
          onPress={() => setActiveCategory(null)}
        >
          <Text style={[styles.chipText, !activeCategory && styles.chipTextActive]}>Tous</Text>
        </TouchableOpacity>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, activeCategory === cat && styles.chipActive]}
            onPress={() => setActiveCategory(activeCategory === cat ? null : cat)}
          >
            <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
              {CATEGORY_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#6B3FA0" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B3FA0']} />}
          ListHeaderComponent={<Text style={styles.pageTitle}>Découvrir</Text>}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun produit trouvé</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const card = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 130 },
  imagePlaceholder: {
    width: '100%', height: 130, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  imagePlaceholderIcon: { fontSize: 36 },
  badge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(30,30,30,0.7)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  body: { padding: 10, gap: 4 },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDE7F6', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 2,
    marginBottom: 2,
  },
  categoryText: { fontSize: 11, color: '#6B3FA0', fontWeight: '600' },
  name: { fontSize: 13, fontWeight: '700', color: '#111827', lineHeight: 18 },
  price: { fontSize: 15, fontWeight: '800', color: '#6B3FA0' },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  merchantIcon: { fontSize: 11 },
  merchantName: { fontSize: 11, color: '#6B7280', flex: 1 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  pageTitle: {
    fontSize: 26, fontWeight: '800', color: '#111827',
    paddingHorizontal: PADDING, paddingTop: 16, paddingBottom: 8,
  },
  searchBar: {
    marginHorizontal: PADDING, marginTop: 12, marginBottom: 6,
    padding: 11, backgroundColor: '#fff',
    borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
    fontSize: 14, color: '#111827',
  },
  chips: { maxHeight: 44, marginBottom: 8 },
  chipsContent: { paddingHorizontal: PADDING, gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#6B3FA0', borderColor: '#6B3FA0' },
  chipText: { color: '#6B7280', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  loader: { marginTop: 60 },
  grid: { paddingHorizontal: PADDING, paddingBottom: 24 },
  row: { gap: COL_GAP, marginBottom: COL_GAP },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9CA3AF', fontSize: 15 },
});
