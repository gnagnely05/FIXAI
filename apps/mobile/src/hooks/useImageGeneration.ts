import { useState, useCallback } from 'react';
import { api } from '../services/api';

interface GenerationState {
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

export function useImageGeneration() {
  const [state, setState] = useState<GenerationState>({
    imageUrl: null,
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) =>
    setState(prev => ({ ...prev, loading, error: null }));

  const setError = (error: string) =>
    setState(prev => ({ ...prev, loading: false, error }));

  const setImageUrl = (imageUrl: string) =>
    setState({ imageUrl, loading: false, error: null });

  /**
   * Generate or transform an image using Replicate
   * @param prompt Text description of desired image (e.g., "Transform this living room in Scandinavian style")
   * @param baseImageUrl Optional base image URL for image-to-image transformation
   */
  const generateImage = useCallback(
    async (prompt: string, baseImageUrl?: string): Promise<string | null> => {
      setLoading(true);
      try {
        const { data } = await api.post<string>('/ai/generate', {
          prompt,
          imageUrl: baseImageUrl,
        });
        setImageUrl(data);
        return data;
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? 'Failed to generate image';
        setError(msg);
        return null;
      }
    },
    [],
  );

  /**
   * Analyze an image with vision capabilities
   * @param prompt Question or analysis request about the image
   * @param imageUrl Image to analyze
   */
  const analyzeImage = useCallback(
    async (prompt: string, imageUrl: string): Promise<string | null> => {
      setLoading(true);
      try {
        const { data } = await api.post<string>('/ai/analyze', {
          prompt,
          imageUrl,
        });
        return data;
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? 'Failed to analyze image';
        setError(msg);
        return null;
      }
    },
    [],
  );

  const clearError = useCallback(() =>
    setState(prev => ({ ...prev, error: null })),
    [],
  );

  const reset = useCallback(() =>
    setState({ imageUrl: null, loading: false, error: null }),
    [],
  );

  return {
    ...state,
    generateImage,
    analyzeImage,
    clearError,
    reset,
  };
}

export type UseImageGenerationReturn = ReturnType<typeof useImageGeneration>;
