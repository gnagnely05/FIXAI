import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const CATEGORY_LABELS: Record<string, string> = {
  CIMENT: 'Ciment',
  FER_BETON: 'Fer à béton',
  BRIQUE: 'Brique',
  CARRELAGE: 'Carrelage',
  PEINTURE: 'Peinture',
  PLOMBERIE: 'Plomberie',
  ELECTRICITE: 'Électricité',
  MENUISERIE: 'Menuiserie',
  QUINCAILLERIE_GENERALE: 'Quincaillerie',
  DECORATION: 'Décoration',
  OUTILLAGE: 'Outillage',
  AUTRES: 'Autres',
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
  return xof.toLocaleString('fr-FR') + ' FCFA';
}

function ProductCard({ product }: { product: Product }) {
  const merchantColor = product.merchantType === 'BOUTIQUE' ? '#6B3FA0' : '#C08B00';
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={[styles.merchantBadge, { backgroundColor: merchantColor }]}>
          <Text style={styles.merchantBadgeText}>{product.merchantType}</Text>
        </View>
      </View>
      <Text style={styles.categoryLabel}>{CATEGORY_LABELS[product.category] ?? product.category}</Text>
      <Text style={styles.price}>{formatPrice(Number(product.priceXof))}{product.unit ? ` / ${product.unit}` : ''}</Text>
      <Text style={styles.merchantName}>{product.merchantName}</Text>
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
      const url = `${API_BASE}/catalog?${params.toString()}`;
      const res = await fetch(url);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Découvrir</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un produit..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={styles.chipsContent}>
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
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucun produit trouvé</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B3FA0']} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4FC' },
  title: { fontSize: 24, fontWeight: '700', color: '#6B3FA0', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  searchBar: {
    marginHorizontal: 16, marginBottom: 8, padding: 10, backgroundColor: '#fff',
    borderRadius: 8, borderWidth: 1, borderColor: '#B89CC8', fontSize: 15, color: '#222',
  },
  chips: { maxHeight: 48, marginBottom: 8 },
  chipsContent: { paddingHorizontal: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#B89CC8',
  },
  chipActive: { backgroundColor: '#6B3FA0', borderColor: '#6B3FA0' },
  chipText: { color: '#6B3FA0', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  loader: { flex: 1, alignSelf: 'center', marginTop: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    shadowColor: '#6B3FA0', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  productName: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1, marginRight: 8 },
  merchantBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  merchantBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  categoryLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  price: { fontSize: 17, fontWeight: '800', color: '#6B3FA0', marginBottom: 2 },
  merchantName: { fontSize: 13, color: '#555' },
});
