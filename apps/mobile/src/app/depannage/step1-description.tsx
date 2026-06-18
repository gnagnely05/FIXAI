import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function Step1Description() {
  const [description, setDescription] = useState('');
  const isValid = description.trim().length >= 10;

  const handleNext = () => {
    if (!isValid) return;
    router.push({ pathname: '/depannage/step2-category', params: { description } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Étape 1 / 7</Text>
        </View>
        <Text style={styles.title}>Décrivez votre problème</Text>
        <Text style={styles.subtitle}>Soyez précis pour aider l'artisan à comprendre votre besoin.</Text>
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
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={styles.nextButtonText}>Suivant</Text>
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
    padding: 14,
    fontSize: 15,
    color: '#111',
    minHeight: 150,
  },
  textAreaError: { borderColor: '#EF4444' },
  charCount: { alignSelf: 'flex-end', color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  nextButton: { backgroundColor: '#FF6B00', borderRadius: 14, padding: 16, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: '#FCA97E' },
  nextButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
