import { Repository } from 'typeorm';
import { OrderEntity, EscrowStatus } from './entities/order.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ArtisanEntity } from '../artisans/entities/artisan.entity';
export interface CreateOrderData {
    artisanId: string;
    description: string;
    scheduledAt: Date;
    address: string;
    city: string;
    notes?: string;
}
export interface CreateDiagnosticData {
    serviceType: string;
    description: string;
    address: string;
    city: string;
    scheduledAt?: Date;
    diagnosticFeeXof: number;
    imageUrls?: string[];
}
export declare class OrdersService {
    private readonly ordersRepo;
    private readonly artisansRepo;
    private readonly usersRepo;
    constructor(ordersRepo: Repository<OrderEntity>, artisansRepo: Repository<ArtisanEntity>, usersRepo: Repository<UserEntity>);
    create(client: UserEntity, data: CreateOrderData): Promise<OrderEntity>;
    /**
     * Crée une mission de DIAGNOSTIC (sans artisan assigné au départ).
     * Elle devient visible aux artisans disponibles qui peuvent l'accepter.
     */
    createDiagnostic(client: UserEntity, data: CreateDiagnosticData): Promise<OrderEntity>;
    /** Missions de diagnostic ouvertes (non encore acceptées par un artisan). */
    findAvailableDiagnostics(city?: string): Promise<OrderEntity[]>;
    /** Un artisan accepte une mission de diagnostic → il s'y assigne. */
    acceptDiagnostic(orderId: string, artisanUserId: string): Promise<OrderEntity>;
    findByClient(clientId: string): Promise<OrderEntity[]>;
    findByArtisan(artisanId: string): Promise<OrderEntity[]>;
    findByArtisanUserId(userId: string): Promise<OrderEntity[]>;
    findByAgency(agencyUserId: string): Promise<OrderEntity[]>;
    /**
     * Litiges dont l'agence/BTP est gestionnaire.
     * Si disputeHandlerId est null → visible uniquement dans l'interface admin.
     */
    findDisputesByHandler(handlerUserId: string): Promise<OrderEntity[]>;
    findById(id: string): Promise<OrderEntity>;
    /**
     * Règle 3 : seuls ARTISAN et ENTREPRISE_BTP peuvent confirmer.
     * AGENCE_HOTE est explicitement bloquée.
     */
    confirm(orderId: string, requesterUserId: string, requesterRole: string): Promise<OrderEntity>;
    /**
     * Règle 3 : AGENCE_HOTE assigne un artisan mais garde le statut PENDING
     * (l'artisan doit lui-même confirmer).
     * ENTREPRISE_BTP assigne ET confirme directement.
     */
    assignArtisan(orderId: string, artisanId: string, requesterUserId: string, requesterRole: string): Promise<OrderEntity>;
    updateStatus(orderId: string, status: string, userId: string): Promise<OrderEntity>;
    markInProgress(orderId: string): Promise<OrderEntity>;
    complete(orderId: string, clientId: string): Promise<OrderEntity>;
    cancel(orderId: string, userId: string): Promise<OrderEntity>;
    /**
     * Règle 2 : passage en DISPUTED → auto-assignation du gestionnaire.
     * Priority : agencyId de l'artisan → sinon null (géré par admin fixAI).
     */
    openDispute(orderId: string, requesterId: string, reason?: string): Promise<OrderEntity>;
    /**
     * Résolution d'un litige par l'agence/BTP ou l'admin.
     * outcome : 'CLIENT' (remboursement) | 'ARTISAN' (libération escrow)
     */
    resolveDispute(orderId: string, resolverId: string, resolverRole: string, outcome: 'CLIENT' | 'ARTISAN', resolution: string): Promise<OrderEntity>;
    updateEscrow(orderId: string, amount: number, status: EscrowStatus, transactionId: string): Promise<void>;
}
//# sourceMappingURL=orders.service.d.ts.map