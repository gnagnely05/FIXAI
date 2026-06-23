import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useDepannage } from '../../hooks/useDepannage';

export default function Step1Description() {
  const [description, setDescription] = useState('');
  const { createRequest, loading } = useDepannage();
  const isValid = description.trim().length >= 10;

  const handleNext = async () => {
    if (!isValid || loading) return;
    router.push({ pathname: '/depannage/step2-category', params: { description } });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Étape 1 / 7</Text>
        </View>
        <Text style={styles.title}>Décrivez votre problème</Text>
        <Text style={styles.subtitle}>
          Soyez précis pour aider l'artisan à comprendre votre besoin.
        </Text>
        <TextInput
          style={[styles.textArea, !isValid && description.length > 0 && styles.textAreaError]}
          placeholder="Ex: Mon robinet de cuisine fuit depuis ce matin, l'eau coule en permanence..."
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{description.length}/500</Text>
        {description.length > 0 && !isValid && (
          <Text style={styles.errorText}>Minimum 10 caractères requis</Text>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 L'IA analysera votre description et générera un rapport de diagnostic avec une
            estimation de prix.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, (!isValid || loading) && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isValid || loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Chargement...' : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20, flexGrow: 1 },
  stepIndicator: { marginBottom: 8 },
  stepText: { color: '#FF6B00', fontWeight: '600', fontSize: 13 },
  title: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 16,
    fontSize: 15,
    color: '#111',
    minHeight: 140,
  },
  textAreaError: { borderColor: '#EF4444' },
  charCount: { textAlign: 'right', fontSize: 12, color: '#9CA3AF', marginTop: 6 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  infoBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  infoText: { fontSize: 13, color: '#92400E', lineHeight: 18 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#F9FAFB' },
  nextButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: { backgroundColor: '#FED7AA' },
  nextButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
