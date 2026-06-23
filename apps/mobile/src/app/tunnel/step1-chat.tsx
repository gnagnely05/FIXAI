import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Image, StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useServiceTunnel, ServiceType, Message } from '../../hooks/useServiceTunnel';
import TunnelHeader, { getTunnelTitle } from '../../components/TunnelHeader';

export default function Step1Chat() {
  const { serviceType } = useLocalSearchParams<{ serviceType: string }>();
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const svcType = (serviceType as ServiceType) || 'DEPANNAGE';

  const {
    messages, images, diagnosisResult, isLoading,
    sendMessage, addImage, removeImage,
  } = useServiceTunnel(svcType);

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
    if (!result.canceled) result.assets.forEach(a => addImage(a.uri));
  };

  const handleRefresh = () => {
    router.replace(`/tunnel/step1-chat?serviceType=${svcType}`);
  };

  const handleNext = () => {
    router.push(
      `/tunnel/step2-diagnosis?serviceType=${svcType}` +
      `&diagnosisResult=${encodeURIComponent(JSON.stringify(diagnosisResult))}` +
      `&images=${encodeURIComponent(JSON.stringify(images))}` +
      `&messages=${encodeURIComponent(JSON.stringify(messages.map(m => m.content)))}`
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.row, isUser ? styles.rowUser : styles.rowAI]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, isUser ? styles.textUser : styles.textAI]}>
            {item.content}
          </Text>
          {isUser && images.length > 0 && item === messages[messages.length - 1] && (
            <View style={styles.imageGrid}>
              {images.map(uri => (
                <TouchableOpacity key={uri} onPress={() => removeImage(uri)}>
                  <Image source={{ uri }} style={styles.thumbImg} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const placeholder =
    svcType === 'DEPANNAGE' ? 'Décrivez le problème de réparation...' :
    svcType === 'RENOVATION' ? 'Décrivez votre projet de rénovation...' :
    'Décrivez votre projet de décoration...';

  return (
    <SafeAreaView style={styles.safe}>
      <TunnelHeader title={getTunnelTitle(svcType)} onRefresh={handleRefresh} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.typing}>
                <ActivityIndicator size="small" color="#2E7D32" />
                <Text style={styles.typingText}>FixAI analyse...</Text>
              </View>
            ) : null
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.iconBtn} onPress={handlePickImage}>
            <Text style={styles.iconGreen}>🎤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handlePickImage}>
            <Text style={styles.iconGreen}>🖼</Text>
          </TouchableOpacity>
        </View>

        {/* Suivant */}
        <TouchableOpacity
          style={[styles.nextBtn, (!diagnosisResult || isLoading) && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!diagnosisResult || isLoading}
        >
          <Text style={styles.nextBtnText}>→  Suivant</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const GREEN_BUBBLE = '#2E7D32';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16, paddingBottom: 8 },
  row: { marginBottom: 10 },
  rowAI: { alignItems: 'flex-start' },
  rowUser: { alignItems: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAI: { backgroundColor: '#EBEBEB', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: GREEN_BUBBLE, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  textAI: { color: '#1F2937' },
  textUser: { color: '#FFFFFF' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  thumbImg: { width: 70, height: 70, borderRadius: 8 },
  typing: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  typingText: { marginLeft: 8, color: '#2E7D32', fontSize: 14 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1, borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, maxHeight: 100, color: '#111827', backgroundColor: '#F9FAFB',
  },
  iconBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  iconGreen: { fontSize: 24, color: '#2E7D32' },
  nextBtn: {
    margin: 12, backgroundColor: '#6B3FA0',
    paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: '#D1D5DB' },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
