import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useImageGeneration } from '../../hooks/useImageGeneration';

export default function GenerateImageScreen() {
  const { generateImage, analyzeImage, imageUrl, loading, error } = useImageGeneration();
  const [prompt, setPrompt] = useState('');
  const [baseImageUrl, setBaseImageUrl] = useState('');
  const [analysis, setAnalysis] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }
    const result = await generateImage(prompt, baseImageUrl || undefined);
    if (result) {
      Alert.alert('Success', 'Image generated successfully!');
    }
  };

  const handleAnalyze = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Generate an image first');
      return;
    }
    const result = await analyzeImage('Describe this image in detail', imageUrl);
    if (result) {
      setAnalysis(result);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="wand" size={32} color="#FF6B00" />
          <Text style={styles.title}>Image Generation</Text>
          <Text style={styles.subtitle}>Transform rooms with AI</Text>
        </View>

        {/* Prompt Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Transformation Prompt</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., Transform this living room in Scandinavian modern style with warm tones"
            placeholderTextColor="#9CA3AF"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Base Image URL */}
        <View style={styles.section}>
          <Text style={styles.label}>Base Image URL (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Paste image URL here for image-to-image transformation"
            placeholderTextColor="#9CA3AF"
            value={baseImageUrl}
            onChangeText={setBaseImageUrl}
          />
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Generate Image</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Error Display */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Generated Image Display */}
        {imageUrl ? (
          <View style={styles.section}>
            <Text style={styles.label}>Generated Image</Text>
            <Image
              source={{ uri: imageUrl }}
              style={styles.generatedImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={handleAnalyze}
              disabled={loading}
            >
              <Ionicons name="eye" size={16} color="#3B82F6" style={{ marginRight: 6 }} />
              <Text style={styles.analyzeButtonText}>Analyze This Image</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Analysis Display */}
        {analysis ? (
          <View style={styles.section}>
            <Text style={styles.label}>AI Analysis</Text>
            <View style={styles.analysisBox}>
              <Text style={styles.analysisText}>{analysis}</Text>
            </View>
          </View>
        ) : null}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#0EA5E9" />
          <Text style={styles.infoText}>
            Powered by Replicate AI. Transformations typically complete in 30-60 seconds.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  section: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 14,
    color: '#111',
  },
  button: {
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { backgroundColor: '#FED7AA' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: { color: '#DC2626', fontSize: 13, flex: 1 },
  generatedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  analyzeButtonText: { color: '#3B82F6', fontWeight: '600', fontSize: 14 },
  analysisBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  analysisText: { fontSize: 13, color: '#065F46', lineHeight: 20 },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
  },
  infoText: { fontSize: 12, color: '#0369A1', flex: 1, lineHeight: 16 },
});
