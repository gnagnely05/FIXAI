import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../services/api';

interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  verificationStatus: string;
  city?: string;
  specialty?: string;
  agencyName?: string;
  shopName?: string;
  btpMode?: string;
  bio?: string;
  hourlyRate?: number;
  yearsOfExperience?: number;
  createdAt: string;
}

interface Document {
  id: string;
  type: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  REGISTERED:            { label: 'Inscrit', color: '#9CA3AF' },
  DOCS_SUBMITTED:        { label: 'Documents soumis', color: '#F59E0B' },
  PENDING_VERIFICATION:  { label: 'En vérification', color: '#3B82F6' },
  IDENTITY_VERIFIED:     { label: 'Identité vérifiée', color: '#8B5CF6' },
  AFFILIATION_REQUESTED: { label: 'Affiliation demandée', color: '#EC4899' },
  ACTIVE:                { label: 'Actif', color: '#2E7D32' },
  AGENCY_ACTIVE:         { label: 'Agence active', color: '#2E7D32' },
  SHOP_REGISTERED:       { label: 'Boutique enregistrée', color: '#E65100' },
  HARDWARE_REGISTERED:   { label: 'Quincaillerie enregistrée', color: '#4E342E' },
  DOCS_INCOMPLETE:       { label: 'Documents incomplets', color: '#EF4444' },
  REJECTED:              { label: 'Rejeté', color: '#B71C1C' },
};

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const load = async () => {
    try {
      const [veriRes] = await Promise.all([
        api.get('/admin/verifications'),
      ]);
      const found = veriRes.data.users?.find((u: UserDetail) => u.id === id);
      setUser(found ?? null);
      setDocuments(veriRes.data.documents?.filter((d: Document) => d.userId === id) ?? []);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const doAction = async (action: 'APPROVE' | 'REJECT' | 'INCOMPLETE') => {
    if (action === 'REJECT' && !rejectReason.trim())
      return Alert.alert('Erreur', 'Indiquez une raison de rejet.');

    try {
      await api.post('/admin/verify-step', {
        userId: id,
        action,
        reason: action === 'REJECT' ? rejectReason : undefined,
      });
      const msg = action === 'APPROVE' ? 'Approuvé ✓' : action === 'REJECT' ? 'Rejeté' : 'Marqué incomplet';
      Alert.alert('Succès', msg, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Action impossible.');
    }
  };

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator size="large" color="#1565C0" style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  if (!user) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.notFound}>Utilisateur introuvable</Text>
      </View>
    </SafeAreaView>
  );

  const statusInfo = STATUS_LABEL[user.verificationStatus] ?? { label: user.verificationStatus, color: '#9CA3AF' };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Identity */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.firstName[0]}{user.lastName[0]}</Text>
          </View>
          <Text style={styles.profileName}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          {user.phone && <Text style={styles.profilePhone}>📞 {user.phone}</Text>}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <InfoRow label="Rôle" value={user.role} />
          {user.city && <InfoRow label="Ville" value={user.city} />}
          {user.specialty && <InfoRow label="Spécialité" value={user.specialty} />}
          {user.agencyName && <InfoRow label="Agence" value={user.agencyName} />}
          {user.shopName && <InfoRow label="Établissement" value={user.shopName} />}
          {user.btpMode && <InfoRow label="Mode BTP" value={user.btpMode} />}
          {user.yearsOfExperience !== undefined && <InfoRow label="Expérience" value={`${user.yearsOfExperience} ans`} />}
          {user.hourlyRate !== undefined && <InfoRow label="Tarif horaire" value={`${user.hourlyRate} FCFA`} />}
          <InfoRow label="Inscrit le" value={new Date(user.createdAt).toLocaleDateString('fr-FR')} />
        </View>

        {/* Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents KYC ({documents.length})</Text>
          {documents.length === 0 ? (
            <Text style={styles.noDocs}>Aucun document soumis</Text>
          ) : (
            documents.map(doc => (
              <View key={doc.id} style={styles.docRow}>
                <View style={styles.docInfo}>
                  <Text style={styles.docType}>{doc.type.replace(/_/g, ' ')}</Text>
                  <Text style={styles.docDate}>{new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</Text>
                </View>
                <View style={[styles.docStatus, { backgroundColor: doc.status === 'APPROVED' ? '#E8F5E9' : doc.status === 'REJECTED' ? '#FFEBEE' : '#FFF8E1' }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: doc.status === 'APPROVED' ? '#2E7D32' : doc.status === 'REJECTED' ? '#B71C1C' : '#F57F17' }}>
                    {doc.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Bio */}
        {user.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biographie</Text>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity style={styles.approveBtn} onPress={() => doAction('APPROVE')}>
            <Text style={styles.approveBtnText}>✓ Approuver cette étape</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.incompleteBtn} onPress={() => doAction('INCOMPLETE')}>
            <Text style={styles.incompleteBtnText}>⚠️ Marquer documents incomplets</Text>
          </TouchableOpacity>

          {!showRejectInput ? (
            <TouchableOpacity style={styles.rejectBtn} onPress={() => setShowRejectInput(true)}>
              <Text style={styles.rejectBtnText}>✗ Rejeter l'inscription</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.rejectBox}>
              <Text style={styles.rejectLabel}>Raison du rejet *</Text>
              <TextInput
                style={styles.rejectInput}
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder="Ex: Documents illisibles, informations incohérentes..."
                multiline
                placeholderTextColor="#9CA3AF"
              />
              <View style={styles.rejectActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRejectInput(false)}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmRejectBtn} onPress={() => doAction('REJECT')}>
                  <Text style={styles.confirmRejectBtnText}>Confirmer le rejet</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16, color: '#6B7280' },
  profileCard: { backgroundColor: '#1565C0', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#ffffff30', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: '900', color: '#fff' },
  profileName: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  profileEmail: { fontSize: 13, color: '#BBDEFB', marginBottom: 4 },
  profilePhone: { fontSize: 13, color: '#90CAF9', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: '700' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  infoLabel: { fontSize: 13, color: '#6B7280' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  noDocs: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 8 },
  docRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  docInfo: { flex: 1 },
  docType: { fontSize: 13, fontWeight: '600', color: '#374151' },
  docDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  docStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bioText: { fontSize: 13, color: '#374151', lineHeight: 20 },
  approveBtn: { backgroundColor: '#2E7D32', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  approveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  incompleteBtn: { backgroundColor: '#FFF8E1', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8, borderWidth: 1.5, borderColor: '#F59E0B' },
  incompleteBtnText: { color: '#B45309', fontSize: 15, fontWeight: '700' },
  rejectBtn: { backgroundColor: '#FFEBEE', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#EF4444' },
  rejectBtnText: { color: '#B71C1C', fontSize: 15, fontWeight: '700' },
  rejectBox: { backgroundColor: '#FFEBEE', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#EF4444' },
  rejectLabel: { fontSize: 13, fontWeight: '600', color: '#B71C1C', marginBottom: 8 },
  rejectInput: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827',
    minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#FECACA',
  },
  rejectActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#fff' },
  cancelBtnText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  confirmRejectBtn: { flex: 2, paddingVertical: 10, borderRadius: 10, backgroundColor: '#B71C1C', alignItems: 'center' },
  confirmRejectBtnText: { fontSize: 13, color: '#fff', fontWeight: '700' },
});
