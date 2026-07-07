import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
  Modal, TextInput, ActivityIndicator, RefreshControl, Switch, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

const ACCENT = '#E65100';

const CATEGORIES = [
  'CIMENT', 'FER_BETON', 'BRIQUE', 'CARRELAGE', 'PEINTURE',
  'PLOMBERIE', 'ELECTRICITE', 'MENUISERIE', 'QUINCAILLERIE_GENERALE', 'DECORATION', 'OUTILLAGE', 'AUTRES',
];

const CATEGORY_LABELS: Record<string, string> = {
  CIMENT: 'Ciment', FER_BETON: 'Fer à béton', BRIQUE: 'Brique', CARRELAGE: 'Carrelage',
  PEINTURE: 'Peinture', PLOMBERIE: 'Plomberie', ELECTRICITE: 'Électricité',
  MENUISERIE: 'Menuiserie', QUINCAILLERIE_GENERALE: 'Quincaillerie', DECORATION: 'Décoration',
  OUTILLAGE: 'Outillage', AUTRES: 'Autres',
};

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  priceXof: number;
  stock: number;
  unit?: string;
  isAvailable: boolean;
  isPromoted: boolean;
  imageUrl?: string;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  weightKg?: number;
}

interface FormState {
  name: string;
  description: string;
  category: string;
  priceXof: string;
  stock: string;
  unit: string;
  isAvailable: boolean;
  imageUrl: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  weightKg: string;
}

const EMPTY_FORM: FormState = {
  name: '', description: '', category: CATEGORIES[0], priceXof: '', stock: '', unit: '', isAvailable: true,
  imageUrl: '', lengthCm: '', widthCm: '', heightCm: '', weightKg: '',
};

export default function ShopCatalogScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/catalog/shop/my-products');
      setProducts(res.data ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description ?? '',
      category: p.category,
      priceXof: String(p.priceXof),
      stock: String(p.stock),
      unit: p.unit ?? '',
      isAvailable: p.isAvailable,
      imageUrl: p.imageUrl ?? '',
      lengthCm: p.lengthCm != null ? String(p.lengthCm) : '',
      widthCm: p.widthCm != null ? String(p.widthCm) : '',
      heightCm: p.heightCm != null ? String(p.heightCm) : '',
      weightKg: p.weightKg != null ? String(p.weightKg) : '',
    });
    setModalVisible(true);
  }

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.5, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (res.canceled || !res.assets?.length) return;
    const a = res.assets[0];
    const uri = a.base64 ? `data:${a.mimeType ?? 'image/jpeg'};base64,${a.base64}` : a.uri;
    setForm(f => ({ ...f, imageUrl: uri }));
  }

  async function save() {
    if (!form.name.trim() || !form.priceXof) {
      Alert.alert('Erreur', 'Nom et prix requis');
      return;
    }
    setSaving(true);
    try {
      const u = user as any;
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        priceXof: parseInt(form.priceXof, 10),
        stock: parseInt(form.stock || '0', 10),
        unit: form.unit.trim() || undefined,
        isAvailable: form.isAvailable,
        imageUrl: form.imageUrl || undefined,
        lengthCm: form.lengthCm ? parseFloat(form.lengthCm) : undefined,
        widthCm: form.widthCm ? parseFloat(form.widthCm) : undefined,
        heightCm: form.heightCm ? parseFloat(form.heightCm) : undefined,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
        merchantId: u?.sub ?? u?.id,
        merchantName: u?.shopName ?? u?.merchantName ?? '',
        merchantType: u?.role === 'BOUTIQUE' ? 'BOUTIQUE' : 'QUINCAILLERIE',
      };
      if (editProduct) {
        await api.patch(`/catalog/shop/${editProduct.id}`, payload);
      } else {
        await api.post('/catalog', payload);
      }
      setModalVisible(false);
      load();
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Impossible de sauvegarder');
    } finally {
      setSaving(false);
    }
  }

  async function togglePromote(p: Product) {
    try {
      await api.patch(`/catalog/shop/${p.id}/promote`, { isPromoted: !p.isPromoted });
      load();
    } catch {
      Alert.alert('Erreur', 'Impossible de modifier la promotion');
    }
  }

  async function deleteProduct(p: Product) {
    Alert.alert('Supprimer', `Supprimer "${p.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/catalog/shop/${p.id}`);
            load();
          } catch {
            Alert.alert('Erreur', 'Suppression impossible');
          }
        },
      },
    ]);
  }

  function renderProduct({ item }: { item: Product }) {
    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.cardThumb} /> : null}
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.productName}>{item.name}</Text>
              {item.isPromoted && (
                <View style={styles.promoteBadge}>
                  <Ionicons name="star" size={10} color="#fff" />
                  <Text style={styles.promoteBadgeText}>IA</Text>
                </View>
              )}
            </View>
            <Text style={styles.productCategory}>{CATEGORY_LABELS[item.category] ?? item.category}</Text>
          </View>
          <View style={styles.productActions}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
              <Ionicons name="pencil-outline" size={18} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteProduct(item)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>{Number(item.priceXof).toLocaleString('fr-FR')} XOF</Text>
          {item.unit && <Text style={styles.productUnit}>/ {item.unit}</Text>}
          <Text style={[styles.stockBadge, { backgroundColor: item.stock > 0 ? '#E8F5E9' : '#FFEBEE', color: item.stock > 0 ? '#2E7D32' : '#C62828' }]}>
            Stock: {item.stock}
          </Text>
          <Text style={[styles.availBadge, { backgroundColor: item.isAvailable ? '#E8F5E9' : '#F3F4F6', color: item.isAvailable ? '#2E7D32' : '#9CA3AF' }]}>
            {item.isAvailable ? 'Disponible' : 'Désactivé'}
          </Text>
        </View>

        <View style={styles.promoteRow}>
          <Ionicons name="star-outline" size={14} color="#6B3FA0" />
          <Text style={styles.promoteLabel}>Promouvoir par l'IA</Text>
          <Switch
            value={item.isPromoted}
            onValueChange={() => togglePromote(item)}
            trackColor={{ false: '#D1D5DB', true: '#6B3FA0' }}
            thumbColor="#fff"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Mon Catalogue</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={ACCENT} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={p => p.id}
          renderItem={renderProduct}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aucun produit dans votre catalogue</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={openCreate}>
                <Text style={styles.emptyBtnText}>Ajouter le premier produit</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editProduct ? 'Modifier le produit' : 'Nouveau produit'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={[]}
            renderItem={null}
            ListHeaderComponent={
              <View style={{ padding: 16, gap: 14 }}>
                <View>
                  <Text style={styles.fieldLabel}>Photo du produit</Text>
                  <TouchableOpacity style={styles.imageBox} onPress={pickImage} activeOpacity={0.8}>
                    {form.imageUrl
                      ? <Image source={{ uri: form.imageUrl }} style={styles.imagePreview} resizeMode="cover" />
                      : <View style={styles.imagePlaceholder}>
                          <Ionicons name="camera-outline" size={28} color={ACCENT} />
                          <Text style={styles.imageHint}>Ajouter une photo</Text>
                        </View>}
                  </TouchableOpacity>
                </View>
                <View>
                  <Text style={styles.fieldLabel}>Nom du produit *</Text>
                  <TextInput style={styles.input} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="Ex: Ciment Portland 50kg" />
                </View>
                <View>
                  <Text style={styles.fieldLabel}>Description</Text>
                  <TextInput style={[styles.input, { height: 80 }]} value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} placeholder="Détails du produit..." multiline />
                </View>
                <View>
                  <Text style={styles.fieldLabel}>Catégorie *</Text>
                  <View style={styles.categoryGrid}>
                    {CATEGORIES.map(c => (
                      <TouchableOpacity key={c} style={[styles.catChip, form.category === c && styles.catChipActive]} onPress={() => setForm(f => ({ ...f, category: c }))}>
                        <Text style={[styles.catChipText, form.category === c && styles.catChipTextActive]}>{CATEGORY_LABELS[c]}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Prix XOF *</Text>
                    <TextInput style={styles.input} value={form.priceXof} onChangeText={v => setForm(f => ({ ...f, priceXof: v }))} keyboardType="numeric" placeholder="Ex: 15000" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Unité</Text>
                    <TextInput style={styles.input} value={form.unit} onChangeText={v => setForm(f => ({ ...f, unit: v }))} placeholder="Ex: sac, m², pièce" />
                  </View>
                </View>
                <View>
                  <Text style={styles.fieldLabel}>Stock</Text>
                  <TextInput style={styles.input} value={form.stock} onChangeText={v => setForm(f => ({ ...f, stock: v }))} keyboardType="numeric" placeholder="0 = illimité" />
                </View>

                <Text style={styles.sectionTitle}>Format du produit</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Longueur (cm)</Text>
                    <TextInput style={styles.input} value={form.lengthCm} onChangeText={v => setForm(f => ({ ...f, lengthCm: v }))} keyboardType="numeric" placeholder="Ex: 120" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Largeur (cm)</Text>
                    <TextInput style={styles.input} value={form.widthCm} onChangeText={v => setForm(f => ({ ...f, widthCm: v }))} keyboardType="numeric" placeholder="Ex: 60" />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Hauteur / Taille (cm)</Text>
                    <TextInput style={styles.input} value={form.heightCm} onChangeText={v => setForm(f => ({ ...f, heightCm: v }))} keyboardType="numeric" placeholder="Ex: 75" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Poids (kg)</Text>
                    <TextInput style={styles.input} value={form.weightKg} onChangeText={v => setForm(f => ({ ...f, weightKg: v }))} keyboardType="numeric" placeholder="Ex: 50" />
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.fieldLabel}>Disponible à la vente</Text>
                  <Switch value={form.isAvailable} onValueChange={v => setForm(f => ({ ...f, isAvailable: v }))} trackColor={{ false: '#D1D5DB', true: ACCENT }} thumbColor="#fff" />
                </View>
                <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editProduct ? 'Enregistrer' : 'Ajouter le produit'}</Text>}
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  imageBox: { height: 160, borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#FED7AA', borderRadius: 12, backgroundColor: '#FFFBF5' },
  imageHint: { color: '#E65100', fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#E65100', marginTop: 4 },
  cardThumb: { width: 48, height: 48, borderRadius: 10, marginRight: 10, backgroundColor: '#EEE' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  topTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: ACCENT, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  productCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  productName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  promoteBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#6B3FA0', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  promoteBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  productCategory: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  productActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
  productMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  productPrice: { fontSize: 15, fontWeight: '800', color: ACCENT },
  productUnit: { fontSize: 12, color: '#6B7280' },
  stockBadge: { fontSize: 11, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  availBadge: { fontSize: 11, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  promoteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  promoteLabel: { flex: 1, fontSize: 13, color: '#4B5563' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
  emptyBtn: { backgroundColor: ACCENT, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  modalContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#fff' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#fff' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  catChipActive: { borderColor: ACCENT, backgroundColor: '#FFF3E0' },
  catChipText: { fontSize: 12, color: '#6B7280' },
  catChipTextActive: { color: ACCENT, fontWeight: '700' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  saveBtn: { backgroundColor: ACCENT, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
