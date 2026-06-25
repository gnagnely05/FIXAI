import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, TextInput, ActivityIndicator, Platform, Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ firstName: '', phone: '', password: '', confirm: '' });
  const set = (k: keyof typeof form, v: string) => { setError(''); setForm(p => ({ ...p, [k]: v })); };

  const handleSubmit = async () => {
    setError('');
    if (!form.firstName.trim()) { setError('Veuillez entrer votre prénom.'); return; }
    if (!form.phone.trim()) { setError('Veuillez entrer votre numéro de téléphone.'); return; }
    if (!form.password) { setError('Veuillez choisir un mot de passe.'); return; }
    if (form.password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return; }
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }

    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone: form.phone.trim() });
      router.push({
        pathname: '/(auth)/verify-otp' as any,
        params: {
          phone: form.phone.trim(),
          firstName: form.firstName.trim(),
          password: form.password,
        },
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Impossible d\'envoyer le code. Vérifiez votre numéro.';
      setError(Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.hero}>
          <View style={styles.heroBg} />
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>fx</Text>
          </View>
          <Text style={styles.heroTitle}>Créer un compte</Text>
          <Text style={styles.heroSub}>Rapide, gratuit, sans engagement</Text>
        </View>

        <View style={styles.formBox}>
          <Field
            label="Prénom"
            icon="person-outline"
            placeholder="Ex: Kouamé"
            value={form.firstName}
            onChangeText={v => set('firstName', v)}
            autoCapitalize="words"
          />
          <Field
            label="Numéro de téléphone"
            icon="call-outline"
            placeholder="0701234567"
            value={form.phone}
            onChangeText={v => set('phone', v)}
            keyboardType="phone-pad"
          />
          <Field
            label="Mot de passe"
            icon="lock-closed-outline"
            placeholder="Minimum 8 caractères"
            value={form.password}
            onChangeText={v => set('password', v)}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(p => !p)}
          />
          <Field
            label="Confirmer le mot de passe"
            icon="lock-closed-outline"
            placeholder="Répétez le mot de passe"
            value={form.confirm}
            onChangeText={v => set('confirm', v)}
            secureTextEntry={!showPassword}
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.otpInfo}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#1565C0" />
            <Text style={styles.otpInfoText}>
              Un code de vérification sera envoyé par SMS pour confirmer votre numéro.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={styles.btnText}>Recevoir le code SMS</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <Link href="/(auth)/login" style={styles.link}>Se connecter</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label, icon, rightIcon, onRightIconPress, ...props
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <View style={f.row}>
        <Ionicons name={icon} size={18} color="#9CA3AF" style={f.iconLeft} />
        <TextInput style={f.input} placeholderTextColor="#9CA3AF" {...props} />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={f.iconRight}>
            <Ionicons name={rightIcon} size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 14, paddingHorizontal: 12,
  },
  iconLeft: { marginRight: 8 },
  iconRight: { padding: 4 },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: '#111827' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F5F7' },
  content: { paddingBottom: 40 },
  hero: {
    backgroundColor: '#1A0A3E', paddingTop: 56, paddingBottom: 36,
    alignItems: 'center', overflow: 'hidden', position: 'relative',
  },
  heroBg: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: '#6B3FA020', top: -100, right: -60,
  },
  logoWrap: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: '#6B3FA0', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoText: { color: '#fff', fontSize: 26, fontWeight: '900' },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.55)' },
  formBox: { padding: 24 },
  errorBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626', lineHeight: 19 },
  otpInfo: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  otpInfoText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 19 },
  btn: {
    backgroundColor: '#6B3FA0', borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  btnDisabled: { backgroundColor: '#C4B5E8' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#6B7280', fontSize: 15 },
  link: { color: '#6B3FA0', fontWeight: '700', fontSize: 15 },
});
