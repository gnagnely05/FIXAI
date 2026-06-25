import { useState, useCallback } from 'react';
import axios from 'axios';

export type ServiceType = 'DEPANNAGE' | 'RENOVATION' | 'DECORATION';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DiagnosisResult {
  summary: string;
  detectedIssue: string;
  question: string;
  options: string[];
  estimatedPriceMinXof: number;
  estimatedPriceMaxXof: number;
}

export interface Quote {
  interventionPrice: number;
  travelFee: number;
  fixaiCommission: number;
  fixaiCommissionPercent: number;
  urgencyFee: number;
  total: number;
}

const SERVICE_CONFIGS = {
  DEPANNAGE: {
    welcomeMessage: "Bonjour ! Je suis votre assistant FixAI. Décrivez-moi votre problème avec des photos si possible.",
    systemLabel: "Réparation & Dépannage",
    apiEndpoint: '/depannage',
  },
  RENOVATION: {
    welcomeMessage: "Bonjour ! Décrivez votre projet de rénovation. Ajoutez des photos pour un devis plus précis.",
    systemLabel: "Rénovation",
    apiEndpoint: '/renovation',
  },
  DECORATION: {
    welcomeMessage: "Bonjour ! Décrivez votre projet de décoration. Partagez des photos de votre espace.",
    systemLabel: "Décoration d'intérieur",
    apiEndpoint: '/decoration',
  },
};

import Constants from 'expo-constants';
const API_BASE_URL = (Constants.expoConfig?.extra?.apiUrl as string) ?? 'http://localhost:3001/api/v1';

export function useServiceTunnel(serviceType: ServiceType) {
  const serviceConfig = SERVICE_CONFIGS[serviceType];

  const [step, setStep] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: serviceConfig.welcomeMessage,
      timestamp: new Date(),
    },
  ]);
  const [images, setImages] = useState<string[]>([]);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [location, setLocation] = useState({ address: '', city: '' });
  const [mode, setMode] = useState<'URGENT' | 'PLANIFIE' | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const messageTexts = [...messages, userMessage].map(m => m.content);
      const response = await axios.post(`${API_BASE_URL}/ai/diagnose`, {
        serviceType,
        messages: messageTexts,
        imageUrls: images,
      });
      const result: DiagnosisResult = response.data;
      setDiagnosisResult(result);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.summary,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const status = error?.response?.status;
      const detail = error?.response?.data?.message ?? error?.message ?? 'Erreur inconnue';
      console.error('Diagnosis error:', status, detail, error?.response?.data);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Désolé, une erreur s'est produite (${status ?? 'réseau'}: ${detail}). Veuillez réessayer.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, images, serviceType]);

  const addImage = useCallback((uri: string) => {
    setImages(prev => [...prev, uri]);
  }, []);

  const removeImage = useCallback((uri: string) => {
    setImages(prev => prev.filter(img => img !== uri));
  }, []);

  const selectAnswer = useCallback((answer: string) => {
    setSelectedAnswer(answer);
  }, []);

  const updateLocation = useCallback((address: string, city: string) => {
    setLocation({ address, city });
  }, []);

  const selectMode = useCallback((selectedMode: 'URGENT' | 'PLANIFIE', date?: Date) => {
    setMode(selectedMode);
    if (date) setScheduledAt(date);
  }, []);

  const computeQuote = useCallback(() => {
    if (!diagnosisResult) return;
    const base = diagnosisResult.estimatedPriceMinXof || 15000;
    const travelFee = 2000;
    const commissionRate = 0.10;
    const commission = Math.round(base * commissionRate);
    const urgencyFee = mode === 'URGENT' ? Math.round(base * 0.15) : 0;
    const total = base + travelFee + commission + urgencyFee;
    setQuote({
      interventionPrice: base,
      travelFee,
      fixaiCommission: commission,
      fixaiCommissionPercent: 10,
      urgencyFee,
      total,
    });
  }, [diagnosisResult, mode]);

  const createServiceRequest = useCallback(async (token: string) => {
    const payload = {
      serviceType,
      messages: messages.map(m => m.content),
      imageUrls: images,
      diagnosisResult,
      selectedAnswer,
      location,
      mode,
      scheduledAt,
      quote,
    };
    const response = await axios.post(
      `${API_BASE_URL}${serviceConfig.apiEndpoint}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }, [serviceType, messages, images, diagnosisResult, selectedAnswer, location, mode, scheduledAt, quote, serviceConfig.apiEndpoint]);

  return {
    serviceConfig,
    step,
    setStep,
    messages,
    images,
    diagnosisResult,
    selectedAnswer,
    location,
    mode,
    scheduledAt,
    quote,
    isLoading,
    sendMessage,
    addImage,
    removeImage,
    selectAnswer,
    updateLocation,
    selectMode,
    computeQuote,
    createServiceRequest,
  };
}
