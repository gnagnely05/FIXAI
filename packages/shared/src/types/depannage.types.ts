export enum DepannageMode {
  URGENT  = 'URGENT',
  PLANNED = 'PLANNED',
}

/**
 * Machine à états complète du flux FixAI — 7 étapes.
 */
export enum DepannageStatus {
  // Étape 1 — Diagnostic IA
  DIAGNOSIS_PENDING   = 'DIAGNOSIS_PENDING',
  DIAGNOSIS_DONE      = 'DIAGNOSIS_DONE',
  QUOTE_CONFIRMED     = 'QUOTE_CONFIRMED',

  // Étape 2 — Appel d'offre
  TENDER_OPEN         = 'TENDER_OPEN',

  // Étape 3 — Réponses artisans
  PROPOSAL_SUBMITTED  = 'PROPOSAL_SUBMITTED',
  PROPOSALS_RECEIVED  = 'PROPOSALS_RECEIVED',

  // Étape 4 — Sélection & mise en relation
  CHAT_OPEN           = 'CHAT_OPEN',

  // Étape 5 — Planification
  URGENT_PENDING      = 'URGENT_PENDING',
  URGENT_CONFIRMED    = 'URGENT_CONFIRMED',
  SCHEDULED_CONFIRMED = 'SCHEDULED_CONFIRMED',

  // Étape 6 — Paiement & escrow
  AGREEMENT_REACHED     = 'AGREEMENT_REACHED',
  PAYMENT_PENDING       = 'PAYMENT_PENDING',
  ACCOUNT_TOPPED_UP     = 'ACCOUNT_TOPPED_UP',
  FUNDS_HELD            = 'FUNDS_HELD',
  INTERVENTION_LOCKED   = 'INTERVENTION_LOCKED',
  INTERVENTION_COMPLETED = 'INTERVENTION_COMPLETED',
  PAYMENT_RELEASED      = 'PAYMENT_RELEASED',

  // Étape 7 — Pièces boutique
  PARTS_REQUESTED  = 'PARTS_REQUESTED',
  PARTS_DISPATCHED = 'PARTS_DISPATCHED',

  // Terminaux
  CANCELLED = 'CANCELLED',
  DISPUTED  = 'DISPUTED',
}

export interface DiagnosisReport {
  summary: string;
  estimatedPriceMinXof: number;
  estimatedPriceMaxXof: number;
  recommendedCategory: string;
  generatedAt: string;
}

export interface ArtisanProposal {
  artisanId: string;
  artisanName: string;
  priceXof: number;
  estimatedDurationMin: number;
  submittedAt: string;
}

export interface DepannageRequest {
  id: string;
  clientId: string;
  artisanId?: string;
  description: string;
  photoUrls: string[];
  category?: string;
  mode?: DepannageMode;
  status: DepannageStatus;
  scheduledAt?: Date;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  diagnosisReport?: DiagnosisReport;
  proposals: ArtisanProposal[];
  agreedPriceXof: number;
  urgencyFeeXof: number;
  escrowAmountXof: number;
  requiredPartIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDepannageDto {
  description: string;
  photoUrls?: string[];
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface SubmitProposalDto {
  priceXof: number;
  estimatedDurationMin: number;
  artisanName: string;
}

/** Transitions valides depuis un statut donné */
export const DEPANNAGE_TRANSITIONS: Record<DepannageStatus, DepannageStatus[]> = {
  [DepannageStatus.DIAGNOSIS_PENDING]:    [DepannageStatus.DIAGNOSIS_DONE, DepannageStatus.CANCELLED],
  [DepannageStatus.DIAGNOSIS_DONE]:       [DepannageStatus.QUOTE_CONFIRMED, DepannageStatus.CANCELLED],
  [DepannageStatus.QUOTE_CONFIRMED]:      [DepannageStatus.TENDER_OPEN],
  [DepannageStatus.TENDER_OPEN]:          [DepannageStatus.PROPOSALS_RECEIVED, DepannageStatus.CANCELLED],
  [DepannageStatus.PROPOSAL_SUBMITTED]:   [DepannageStatus.PROPOSALS_RECEIVED],
  [DepannageStatus.PROPOSALS_RECEIVED]:   [DepannageStatus.CHAT_OPEN, DepannageStatus.CANCELLED],
  [DepannageStatus.CHAT_OPEN]:            [DepannageStatus.URGENT_PENDING, DepannageStatus.SCHEDULED_CONFIRMED, DepannageStatus.CANCELLED],
  [DepannageStatus.URGENT_PENDING]:       [DepannageStatus.URGENT_CONFIRMED, DepannageStatus.CANCELLED],
  [DepannageStatus.URGENT_CONFIRMED]:     [DepannageStatus.AGREEMENT_REACHED],
  [DepannageStatus.SCHEDULED_CONFIRMED]:  [DepannageStatus.AGREEMENT_REACHED, DepannageStatus.CANCELLED],
  [DepannageStatus.AGREEMENT_REACHED]:    [DepannageStatus.PAYMENT_PENDING],
  [DepannageStatus.PAYMENT_PENDING]:      [DepannageStatus.ACCOUNT_TOPPED_UP, DepannageStatus.CANCELLED],
  [DepannageStatus.ACCOUNT_TOPPED_UP]:    [DepannageStatus.FUNDS_HELD],
  [DepannageStatus.FUNDS_HELD]:           [DepannageStatus.INTERVENTION_LOCKED],
  [DepannageStatus.INTERVENTION_LOCKED]:  [DepannageStatus.PARTS_REQUESTED, DepannageStatus.INTERVENTION_COMPLETED],
  [DepannageStatus.PARTS_REQUESTED]:      [DepannageStatus.PARTS_DISPATCHED],
  [DepannageStatus.PARTS_DISPATCHED]:     [DepannageStatus.INTERVENTION_COMPLETED],
  [DepannageStatus.INTERVENTION_COMPLETED]: [DepannageStatus.PAYMENT_RELEASED, DepannageStatus.DISPUTED],
  [DepannageStatus.PAYMENT_RELEASED]:     [],
  [DepannageStatus.CANCELLED]:            [],
  [DepannageStatus.DISPUTED]:             [DepannageStatus.PAYMENT_RELEASED, DepannageStatus.CANCELLED],
};

/** Retourne true si la transition from→to est autorisée */
export function isValidTransition(from: DepannageStatus, to: DepannageStatus): boolean {
  return DEPANNAGE_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Numéro d'étape (1–7) depuis un statut */
export function stepFromStatus(status: DepannageStatus): number {
  const map: Partial<Record<DepannageStatus, number>> = {
    [DepannageStatus.DIAGNOSIS_PENDING]:    1,
    [DepannageStatus.DIAGNOSIS_DONE]:       1,
    [DepannageStatus.QUOTE_CONFIRMED]:      1,
    [DepannageStatus.TENDER_OPEN]:          2,
    [DepannageStatus.PROPOSAL_SUBMITTED]:   3,
    [DepannageStatus.PROPOSALS_RECEIVED]:   3,
    [DepannageStatus.CHAT_OPEN]:            4,
    [DepannageStatus.URGENT_PENDING]:       5,
    [DepannageStatus.URGENT_CONFIRMED]:     5,
    [DepannageStatus.SCHEDULED_CONFIRMED]:  5,
    [DepannageStatus.AGREEMENT_REACHED]:    6,
    [DepannageStatus.PAYMENT_PENDING]:      6,
    [DepannageStatus.ACCOUNT_TOPPED_UP]:    6,
    [DepannageStatus.FUNDS_HELD]:           6,
    [DepannageStatus.INTERVENTION_LOCKED]:  6,
    [DepannageStatus.INTERVENTION_COMPLETED]: 6,
    [DepannageStatus.PAYMENT_RELEASED]:     6,
    [DepannageStatus.PARTS_REQUESTED]:      7,
    [DepannageStatus.PARTS_DISPATCHED]:     7,
  };
  return map[status] ?? 0;
}
