import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Platform,
  ActivityIndicator, SafeAreaView, TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function VerifyOtpScreen() {
  const { phone, firstName, password } = useLocalSearchParams<{
    phone: string; firstName: string; password: string;
  }>();
  const { register } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigit = (v: string, idx: number) => {
    if (!/^[0-9]?$/.test(v)) return;
    const next = [...code];
    next[idx] = v;
    setCode(next);
    if (v && idx < 5) inputs.current[idx + 1]?.focus();
    if (!v && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const fullCode = code.join('');

  const handleVerify = async () => {
    if (fullCode.length < 6) { setError('Entrez les 6 chiffres du code.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { phone, code: fullCode });
      await register({
        firstName: firstName ?? '',
        lastName: '',
        phone: phone ?? '',
        password: password ?? '',
        role: 'CLIENT' as any,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Une erreur est survenue.';
      setError(Array.isArray(msg) ? msg.join('\n') : msg);
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError('');
    try {
      await api.post('/auth/send-otp', { phone });
      setCountdown(60);
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      showAlert('Code renvoyé', 'Un nouveau code a été envoyé par SMS.');
    } catch {
      setError('Impossible de renvoyer le code. Réessayez.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#6B3FA0" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="phone-portrait-outline" size={32} color="#6B3FA0" />
          </View>
          <Text style={styles.title}>Vérification SMS</Text>
          <Text style={styles.subtitle}>
            Code envoyé au{'\n'}
            <Text style={styles.phone}>{phone}</Text>
          </Text>
        </View>

        {/* OTP Inputs */}
        <View style={styles.otpRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={r => { inputs.current[i] = r; }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={v => handleDigit(v.slice(-1), i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={i === 0}
            />
          ))}
        </View>

        {/* Countdown */}
        <View style={styles.resendRow}>
          {countdown > 0
            ? <Text style={styles.countdownText}>Renvoyer dans <Text style={styles.countdownNum}>{countdown}s</Text></Text>
            : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending
                  ? <ActivityIndicator size="small" color="#6B3FA0" />
                  : <Text style={styles.resendBtn}>Renvoyer le code</Text>
                }
              </TouchableOpacity>
            )
          }
        </View>

        {/* Inline error */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Verify button */}
        <TouchableOpacity
          style={[styles.btn, (loading || fullCode.length < 6) && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={loading || fullCode.length < 6}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.btnText}>Vérifier et créer mon compte</Text>
              </>
          }
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Vérifiez votre boîte SMS. Le code expire dans 5 minutes.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F5F7' },
  content: { flex: 1, padding: 24 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 32 },
  backText: { color: '#6B3FA0', fontSize: 15, fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#EDE9F8', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  phone: { color: '#111827', fontWeight: '700' },
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 24 },
  otpBox: {
    width: 48, height: 58, borderRadius: 14,
    borderWidth: 2, borderColor: '#E5E7EB',
    backgroundColor: '#fff', textAlign: 'center',
    fontSize: 22, fontWeight: '800', color: '#111827',
  },
  otpBoxFilled: { borderColor: '#6B3FA0', backgroundColor: '#F5F0FF' },
  resendRow: { alignItems: 'center', marginBottom: 32 },
  countdownText: { fontSize: 14, color: '#9CA3AF' },
  countdownNum: { color: '#6B3FA0', fontWeight: '700' },
  resendBtn: { color: '#6B3FA0', fontSize: 15, fontWeight: '700', textDecorationLine: 'underline' },
  btn: {
    backgroundColor: '#6B3FA0', borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginBottom: 16,
  },
  btnDisabled: { backgroundColor: '#C4B5E8' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  helpText: { textAlign: 'center', fontSize: 13, color: '#9CA3AF', lineHeight: 19 },
  errorBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626', lineHeight: 19 },
});
