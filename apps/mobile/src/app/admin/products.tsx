import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl, Alert, TextInput, Modal,
} from 'react-native';
import { api } from '../../services/api';

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  priceXof: number;
  merchantId: string;
  merchantName: string;
  merchantType: string;
  isAvailable: boolean;
  stock: number;
  unit?: string;
}

const CATEGORIES = [
  'CIMENT', 'FER_BETON', 'BRIQUE', 'CARRELAGE', 'PEINTURE',
  'PLOMBERIE', 'ELECTRICITE', 'MENUISERIE', 'QUINCAILLERIE_GENERALE',
  'DECORATION', 'OUTILLAGE', 'AUTRES',
];

const MERCHANT_TYPES = [
  { id: 'ALL', label: 'Tous' },
  { id: 'BOUTIQUE', label: '🛍️ Boutiques' },
  { id: 'QUINCAILLERIE', label: '🔩 Quincailleries' },
];

const EMPTY_FORM = { name: '', description: '', category: 'AUTRES', priceXof: '', merchantId: '', merchantName: '', merchantType: 'QUINCAILLERIE', stock: '0', unit: '', isAvailable: true };

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Record<string, any>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  // Merchant list for picker
  const [merchants, setMerchants] = useState<Array<{ id: string; name: string; type: string }>>([]);

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (typeFilter !== 'ALL') params.merchantType = typeFilter;
      if (search.trim()) params.q = search.trim();
      const [productsRes, merchantsRes] = await Promise.all([
        api.get('/admin/products', { params }),
        api.get('/admin/actors', { params: { role: typeFilter === 'BOUTIQUE' ? 'BOUTIQUE' : typeFilter === 'QUINCAILLERIE' ? 'QUINCAILLERIE' : undefined } }),
      ]);
      setProducts(productsRes.data ?? []);
      const actorList = (merchantsRes.data ?? [])
        .filter((a: any) => ['BOUTIQUE', 'QUINCAILLERIE'].includes(a.role))
        .map((a: any) => ({ id: a.id, name: a.shopName ?? `${a.firstName} ${a.lastName}`, type: a.role }));
      setMerchants(actorList);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les produits.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [typeFilter, search]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...EMPTY_FORM });
    setModalVisible(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description ?? '',
      category: product.category,
      priceXof: String(product.priceXof),
      merchantId: product.merchantId,
      merchantName: product.merchantName,
      merchantType: product.merchantType,
      stock: String(product.stock),
      unit: product.unit ?? '',
      isAvailable: product.isAvailable,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.priceXof) return Alert.alert('Erreur', 'Nom et prix obligatoires.');
    setSaving(true);
    try {
      const payload = { ...form, priceXof: parseInt(form.priceXof), stock: parseInt(form.stock) || 0 };
      if (editProduct) {
        await api.put(`/admin/products/${editProduct.id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      setModalVisible(false);
      load();
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Sauvegarde impossible.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert('Supprimer', `Supprimer "${product.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/products/${product.id}`);
            setProducts(prev => prev.filter(p => p.id !== product.id));
          } catch { Alert.alert('Erreur', 'Suppression impossible.'); }
        },
      },
    ]);
  };

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={load}
            placeholder="Rechercher un produit..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {MERCHANT_TYPES.map(t => (
          <TouchableOpacity key={t.id} style={[styles.filterChip, typeFilter === t.id && styles.filterChipActive]} onPress={() => setTypeFilter(t.id)}>
            <Text style={[styles.filterText, typeFilter === t.id && styles.filterTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <Text style={styles.countText}>{products.length} produit{products.length !== 1 ? 's' : ''}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1565C0" style={{ marginTop: 40 }} />
        ) : products.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>Aucun produit</Text>
          </View>
        ) : (
          products.map(p => (
            <View key={p.id} style={[styles.card, !p.isAvailable && styles.cardUnavailable]}>
              <View style={styles.cardLeft}>
                <Text style={styles.productName}>{p.name}</Text>
                <Text style={styles.productMerchant}>{p.merchantName} · {p.merchantType === 'BOUTIQUE' ? '🛍️' : '🔩'}</Text>
                <View style={styles.productMeta}>
                  <Text style={styles.productCategory}>{p.category.replace(/_/g, ' ')}</Text>
                  {p.unit && <Text style={styles.productUnit}>{p.unit}</Text>}
                  <Text style={[styles.productStock, p.stock === 0 && styles.productStockEmpty]}>
                    Stock: {p.stock}
                  </Text>
                </View>
                {!p.isAvailable && <Text style={styles.unavailableTag}>Indisponible</Text>}
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.productPrice}>{Number(p.priceXof).toLocaleString('fr-FR')}</Text>
                <Text style={styles.productPriceCurrency}>FCFA</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(p)}>
                    <Text style={styles.editBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(p)}>
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editProduct ? 'Modifier le produit' : 'Nouveau produit'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Text style={[styles.modalSave, saving && { opacity: 0.5 }]}>{saving ? '...' : 'Sauvegarder'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <MField label="Nom du produit *" value={form.name} onChangeText={v => set('name', v)} placeholder="Ex: Ciment CPA 42.5" />
            <MField label="Description" value={form.description} onChangeText={v => set('description', v)} placeholder="Optionnel" multiline style={{ height: 70, textAlignVertical: 'top' }} />
            <MField label="Prix (FCFA) *" value={form.priceXof} onChangeText={v => set('priceXof', v)} keyboardType="numeric" placeholder="Ex: 5000" />
            <MField label="Stock" value={form.stock} onChangeText={v => set('stock', v)} keyboardType="numeric" placeholder="Ex: 100" />
            <MField label="Unité" value={form.unit} onChangeText={v => set('unit', v)} placeholder="Ex: sac 50kg, m², pièce" />

            <Text style={styles.mLabel}>Catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, form.category === cat && styles.catChipSelected]}
                    onPress={() => set('category', cat)}
                  >
                    <Text style={[styles.catChipText, form.category === cat && styles.catChipTextSelected]}>
                      {cat.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.mLabel}>Type marchand</Text>
            <View style={styles.typeRow}>
              {['BOUTIQUE', 'QUINCAILLERIE'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, form.merchantType === t && styles.typeChipSelected]}
                  onPress={() => set('merchantType', t)}
                >
                  <Text style={[styles.typeChipText, form.merchantType === t && styles.typeChipTextSelected]}>
                    {t === 'BOUTIQUE' ? '🛍️ Boutique' : '🔩 Quincaillerie'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <MField label="ID Marchand" value={form.merchantId} onChangeText={v => set('merchantId', v)} placeholder="UUID du marchand" />
            <MField label="Nom Marchand" value={form.merchantName} onChangeText={v => set('merchantName', v)} placeholder="Nom affiché" />

            {merchants.length > 0 && (
              <>
                <Text style={styles.mLabel}>Ou choisir un marchand existant</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {merchants.map(m => (
                      <TouchableOpacity
                        key={m.id}
                        style={[styles.merchantChip, form.merchantId === m.id && styles.merchantChipSelected]}
                        onPress={() => { set('merchantId', m.id); set('merchantName', m.name); set('merchantType', m.type); }}
                      >
                        <Text style={[styles.merchantChipText, form.merchantId === m.id && styles.merchantChipTextSelected]}>{m.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            <Text style={styles.mLabel}>Disponibilité</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity style={[styles.typeChip, form.isAvailable && styles.typeChipSelected]} onPress={() => set('isAvailable', true)}>
                <Text style={[styles.typeChipText, form.isAvailable && styles.typeChipTextSelected]}>✅ Disponible</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeChip, !form.isAvailable && { borderColor: '#EF4444', backgroundColor: '#FFEBEE' }]} onPress={() => set('isAvailable', false)}>
                <Text style={[styles.typeChipText, !form.isAvailable && { color: '#B71C1C' }]}>❌ Indisponible</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function MField({ label, style, ...props }: { label: string; style?: any } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={mfStyles.label}>{label}</Text>
      <TextInput style={[mfStyles.input, style]} placeholderTextColor="#9CA3AF" {...props} />
    </View>
  );
}
const mfStyles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 5 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  toolbar: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F9FAFB', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  addBtn: { backgroundColor: '#1565C0', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', maxHeight: 52 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  filterText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  content: { padding: 14, paddingBottom: 40 },
  countText: { fontSize: 12, color: '#9CA3AF', marginBottom: 10 },
  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyIcon: { fontSize: 44 },
  emptyText: { fontSize: 15, color: '#6B7280' },
  card: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardUnavailable: { opacity: 0.6 },
  cardLeft: { flex: 1, marginRight: 10 },
  cardRight: { alignItems: 'flex-end' },
  productName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 3 },
  productMerchant: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  productMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  productCategory: { fontSize: 11, color: '#374151', backgroundColor: '#F3F4F6', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  productUnit: { fontSize: 11, color: '#6B7280' },
  productStock: { fontSize: 11, color: '#2E7D32' },
  productStockEmpty: { color: '#EF4444' },
  unavailableTag: { fontSize: 11, color: '#B71C1C', marginTop: 4, fontWeight: '600' },
  productPrice: { fontSize: 16, fontWeight: '900', color: '#111827' },
  productPriceCurrency: { fontSize: 10, color: '#9CA3AF', marginBottom: 8 },
  cardActions: { flexDirection: 'row', gap: 6 },
  editBtn: { backgroundColor: '#E3F2FD', padding: 8, borderRadius: 8 },
  editBtnText: { fontSize: 15 },
  deleteBtn: { backgroundColor: '#FFEBEE', padding: 8, borderRadius: 8 },
  deleteBtnText: { fontSize: 15 },
  // Modal
  modalSafe: { flex: 1, backgroundColor: '#F9FAFB' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalCancel: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  modalSave: { fontSize: 15, color: '#1565C0', fontWeight: '800' },
  modalContent: { padding: 16, paddingBottom: 40 },
  mLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  catChipSelected: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  catChipText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  catChipTextSelected: { color: '#fff' },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeChip: { flex: 1, paddingVertical: 11, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#fff' },
  typeChipSelected: { borderColor: '#1565C0', backgroundColor: '#E3F2FD' },
  typeChipText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  typeChipTextSelected: { color: '#1565C0', fontWeight: '700' },
  merchantChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  merchantChipSelected: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  merchantChipText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  merchantChipTextSelected: { color: '#2E7D32', fontWeight: '700' },
});
