import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useServiceTunnel, ServiceType, Message } from '../../hooks/useServiceTunnel';

export default function Step1Chat() {
  const { serviceType } = useLocalSearchParams<{ serviceType: string }>();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    images,
    diagnosisResult,
    isLoading,
    sendMessage,
    addImage,
    removeImage,
  } = useServiceTunnel((serviceType as ServiceType) || 'DEPANNAGE');

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    await sendMessage(text);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      result.assets.forEach(asset => addImage(asset.uri));
    }
  };

  const handleCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      addImage(result.assets[0].uri);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  const handleNext = () => {
    router.push(`/tunnel/step2-diagnosis?serviceType=${serviceType}&diagnosisResult=${encodeURIComponent(JSON.stringify(diagnosisResult))}&images=${encodeURIComponent(JSON.stringify(images))}&messages=${encodeURIComponent(JSON.stringify(messages.map(m => m.content)))}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#6B3FA0" />
              <Text style={styles.typingText}>FixAI analyse...</Text>
            </View>
          ) : null
        }
      />

      {images.length > 0 && (
        <ScrollView horizontal style={styles.imagePreviewRow} contentContainerStyle={styles.imagePreviewContent}>
          {images.map((uri) => (
            <View key={uri} style={styles.imagePreviewWrapper}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(uri)}>
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Décrivez votre problème..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={styles.iconBtn} onPress={handleCamera}>
          <Text style={styles.iconText}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={handlePickImage}>
          <Text style={styles.iconText}>🖼️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, !diagnosisResult && styles.nextBtnDisabled]}
        onPress={handleNext}
        disabled={!diagnosisResult}
      >
        <Text style={styles.nextBtnText}>Suivant →</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  aiBubble: { backgroundColor: '#6B3FA0', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#FF6B00', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  aiText: { color: '#FFFFFF' },
  userText: { color: '#FFFFFF' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  typingText: { marginLeft: 8, color: '#6B3FA0', fontSize: 14 },
  imagePreviewRow: { maxHeight: 90, backgroundColor: '#FFF' },
  imagePreviewContent: { padding: 8, gap: 8 },
  imagePreviewWrapper: { position: 'relative' },
  imagePreview: { width: 70, height: 70, borderRadius: 8 },
  removeImageBtn: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#FF0000', borderRadius: 10,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  removeImageText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 8, backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1, borderWidth: 1, borderColor: '#D1D5DB',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 15, maxHeight: 100, color: '#111827',
  },
  iconBtn: { padding: 8 },
  iconText: { fontSize: 22 },
  sendBtn: {
    backgroundColor: '#6B3FA0', width: 40, height: 40,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 4,
  },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' },
  sendBtnText: { color: '#FFF', fontSize: 18 },
  nextBtn: {
    margin: 16, backgroundColor: '#6B3FA0',
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#D1D5DB' },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
