import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type {
  DepannageRequest,
  DepannageStatus,
  DepannageMode,
  CreateDepannageDto,
  SubmitProposalDto,
} from '@fixai/shared';

interface DepannageState {
  request: DepannageRequest | null;
  loading: boolean;
  error: string | null;
}

export function useDepannage() {
  const [state, setState] = useState<DepannageState>({
    request: null,
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean) =>
    setState(prev => ({ ...prev, loading, error: null }));

  const setError = (error: string) =>
    setState(prev => ({ ...prev, loading: false, error }));

  const setRequest = (request: DepannageRequest) =>
    setState({ request, loading: false, error: null });

  // Étape 1 — Crée la demande et lance le diagnostic IA
  const createRequest = useCallback(async (dto: CreateDepannageDto): Promise<DepannageRequest | null> => {
    setLoading(true);
    try {
      const { data } = await api.post<DepannageRequest>('/depannage', dto);
      setRequest(data);
      return data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur lors de la création';
      setError(msg);
      return null;
    }
  }, []);

  // Étape 1 — Confirme le devis IA → ouvre l'appel d'offre
  const confirmQuote = useCallback(async (requestId: string, category?: string): Promise<DepannageRequest | null> => {
    setLoading(true);
    try {
      const { data } = await api.patch<DepannageRequest>(
        `/depannage/${requestId}/confirm-quote`,
        category ? { category } : {},
      );
      setRequest(data);
      return data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur confirmation devis';
      setError(msg);
      return null;
    }
  }, []);

  // Étape 3 — Artisan soumet une proposition
  const submitProposal = useCallback(async (
    requestId: string,
    dto: SubmitProposalDto,
  ): Promise<DepannageRequest | null> => {
    setLoading(true);
    try {
      const { data } = await api.post<DepannageRequest>(`/depannage/${requestId}/proposals`, dto);
      setRequest(data);
      return data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur soumission proposition';
      setError(msg);
      return null;
    }
  }, []);

  // Étape 4 — Client sélectionne un artisan → chat ouvert
  const selectArtisan = useCallback(async (
    requestId: string,
    artisanId: string,
  ): Promise<DepannageRequest | null> => {
    setLoading(true);
    try {
      const { data } = await api.patch<DepannageRequest>(
        `/depannage/${requestId}/select-artisan`,
        { artisanId },
      );
      setRequest(data);
      return data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur sélection artisan';
      setError(msg);
      return null;
    }
  }, []);

  // Étape 5 — Client choisit le mode (urgent / planifié)
  const chooseMode = useCallback(async (
    requestId: string,
    mode: DepannageMode,
    scheduledAt?: string,
  ): Promise<DepannageRequest | null> => {
    setLoading(true);
    try {
      const { data } = await api.patch<DepannageRequest>(
        `/depannage/${requestId}/choose-mode`,
        { mode, scheduledAt },
      );
      setRequest(data);
      return data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur choix mode';
      setError(msg);
      return null;
    }
  }, []);

  // Étape 5 — Artisan confirme son intervention urgente
  const artisanConfirmUrgent = useCallback(async (requestId: string): Promise<DepannageRequest | null> => {
    setLoading(true);
    try {
      const { data } = await api.patch<DepannageRequest>(`/depannage/${requestId}/artisan-confirm-urgent`);
      setRequest(data);
      return data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur confirmation urgence';
      setError(msg);
      return null;
    }
  }, []);

  // Étape 6a — Accord de prix → calcule montant escrow
  const reachAgreement = useCallback(async (requestId: string): Promise<DepannageRequest | null> => {
    setLoading(true);
    try {
      const { data } = await api.patch<DepannageRequest>(`/depannage/${requestId}/reach-agreement`);
      setRequest(data);
      return data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur accord';
      setError(msg);
      return null;
    }
  }, []);

  // Étape 6b/c — Client recharge et bloque les fonds en escrow
  const fundEscrow = useCallback(async (
    requestId: string,
    transactionRef: string,
  ): Promise<DepannageRequest | null> => {
    setLoading(true);
    try {
      const { data } = await api.patch<DepannageRequest>(
        `/depannage/${requestId}/fund-escrow`,
        { transactionRef },
      );
      setRequest(data);
      return data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur paiement escrow';
      setError(msg);
      return null;
    }
  }, []);

  // Étape 6d — Client valide et libère le paiement
  const releasePayment = useCallback(async (requestId: string): Promise<DepannageRequest | null> => {
    setLoading(true);
    try {
      const { data } = await api.patch<DepannageRequest>(`/depannage/${requestId}/release-payment`);
      setRequest(data);
      return data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur libération paiement';
      setError(msg);
      return null;
    }
  }, []);

  // Lecture — Récupère une demande par son id
  const fetchRequest = useCallback(async (requestId: string): Promise<DepannageRequest | null> => {
    setLoading(true);
    try {
      const { data } = await api.get<DepannageRequest>(`/depannage/${requestId}`);
      setRequest(data);
      return data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur récupération';
      setError(msg);
      return null;
    }
  }, []);

  // Lecture — Toutes les demandes du client connecté
  const fetchMyRequests = useCallback(async (): Promise<DepannageRequest[]> => {
    try {
      const { data } = await api.get<DepannageRequest[]>('/depannage/my-requests');
      return data;
    } catch {
      return [];
    }
  }, []);

  const clearError = useCallback(() =>
    setState(prev => ({ ...prev, error: null })),
  []);

  return {
    ...state,
    createRequest,
    confirmQuote,
    submitProposal,
    selectArtisan,
    chooseMode,
    artisanConfirmUrgent,
    reachAgreement,
    fundEscrow,
    releasePayment,
    fetchRequest,
    fetchMyRequests,
    clearError,
  };
}

export type UseDepannageReturn = ReturnType<typeof useDepannage>;

/** Label lisible pour un statut donné */
export function labelForStatus(status: DepannageStatus): string {
  const labels: Record<string, string> = {
    DIAGNOSIS_PENDING:    'Diagnostic en cours...',
    DIAGNOSIS_DONE:       'Diagnostic terminé',
    QUOTE_CONFIRMED:      'Devis confirmé',
    TENDER_OPEN:          'Appel d\'offre ouvert',
    PROPOSAL_SUBMITTED:   'Proposition soumise',
    PROPOSALS_RECEIVED:   'Propositions reçues',
    CHAT_OPEN:            'En discussion',
    URGENT_PENDING:       'En attente de confirmation urgente',
    URGENT_CONFIRMED:     'Urgence confirmée',
    SCHEDULED_CONFIRMED:  'Rendez-vous planifié',
    AGREEMENT_REACHED:    'Accord trouvé',
    PAYMENT_PENDING:      'Paiement en attente',
    ACCOUNT_TOPPED_UP:    'Compte rechargé',
    FUNDS_HELD:           'Fonds bloqués (escrow)',
    INTERVENTION_LOCKED:  'Intervention verrouillée',
    INTERVENTION_COMPLETED: 'Intervention terminée',
    PAYMENT_RELEASED:     'Paiement libéré',
    PARTS_REQUESTED:      'Pièces commandées',
    PARTS_DISPATCHED:     'Pièces expédiées',
    CANCELLED:            'Annulée',
    DISPUTED:             'Litige ouvert',
  };
  return labels[status] ?? status;
}
