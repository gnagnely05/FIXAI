import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Step1Description() {
  const [description, setDescription] = useState('');
  const isValid = description.trim().length >= 20;

  const handleNext = () => {
    if (!isValid) return;
    router.push({ pathname: '/depannage/step2-category', params: { description } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Décrivez votre problème</Text>
      <Text style={styles.hint}>Soyez précis pour aider l'artisan à se préparer</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={6}
        placeholder="Ex: Ma plomberie fuit sous l'évier de la cuisine depuis ce matin..."
        value={description}
        onChangeText={setDescription}
        textAlignVertical="top"
      />
      <Text style={styles.counter}>{description.length} / min. 20 caractères</Text>
      <TouchableOpacity style={[styles.button, !isValid && styles.buttonDisabled]} onPress={handleNext} disabled={!isValid}>
        <Text style={styles.buttonText}>Continuer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  hint: { fontSize: 14, color: '#666', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, fontSize: 16, minHeight: 140, backgroundColor: '#f9f9f9' },
  counter: { textAlign: 'right', color: '#999', marginTop: 8, marginBottom: 24 },
  button: { backgroundColor: '#F97316', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
