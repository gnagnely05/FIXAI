import { OrdersService, CreateOrderData, CreateDiagnosticData } from './orders.service';
import { UserEntity } from '../users/entities/user.entity';
interface AuthUser {
    sub: string;
    role: string;
}
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(req: {
        user: UserEntity & AuthUser;
    }, body: CreateOrderData): Promise<import("./entities/order.entity").OrderEntity>;
    /** Le client réserve un diagnostic sur place (problème complexe). */
    createDiagnostic(req: {
        user: UserEntity & AuthUser;
    }, body: CreateDiagnosticData): Promise<import("./entities/order.entity").OrderEntity>;
    /** Missions de diagnostic ouvertes, visibles par les artisans. */
    availableDiagnostics(city?: string): Promise<import("./entities/order.entity").OrderEntity[]>;
    /** Un artisan accepte une mission de diagnostic. */
    acceptDiagnostic(id: string, req: {
        user: AuthUser;
    }): Promise<import("./entities/order.entity").OrderEntity>;
    /** L'artisan saisit son constat → l'IA génère le devis final. */
    submitDiagnosticResult(id: string, body: {
        result: string;
    }, req: {
        user: AuthUser;
    }): Promise<import("./entities/order.entity").OrderEntity>;
    /** Le client accepte ou refuse le devis final. */
    respondToQuote(id: string, body: {
        accept: boolean;
    }, req: {
        user: AuthUser;
    }): Promise<import("./entities/order.entity").OrderEntity>;
    getMyOrders(req: {
        user: AuthUser;
    }): Promise<import("./entities/order.entity").OrderEntity[]>;
    /** Litiges dont l'agence/BTP connectée est gestionnaire */
    getMyDisputes(req: {
        user: AuthUser;
    }): Promise<import("./entities/order.entity").OrderEntity[]>;
    findOne(id: string): Promise<import("./entities/order.entity").OrderEntity>;
    /**
     * Règle 3 : AGENCE_HOTE bloquée — ForbiddenException renvoyée par le service.
     * Seuls ARTISAN et ENTREPRISE_BTP peuvent confirmer.
     */
    confirm(id: string, req: {
        user: AuthUser;
    }): Promise<import("./entities/order.entity").OrderEntity>;
    complete(id: string, req: {
        user: AuthUser;
    }): Promise<import("./entities/order.entity").OrderEntity>;
    cancel(id: string, req: {
        user: AuthUser;
    }): Promise<import("./entities/order.entity").OrderEntity>;
    updateStatus(id: string, body: {
        status: string;
    }, req: {
        user: AuthUser;
    }): Promise<import("./entities/order.entity").OrderEntity>;
    /**
     * Règle 3 : AGENCE_HOTE → assigne sans confirmer (artisan doit confirmer ensuite).
     * ENTREPRISE_BTP → assigne + confirme directement.
     */
    assign(id: string, body: {
        artisanId: string;
    }, req: {
        user: AuthUser;
    }): Promise<import("./entities/order.entity").OrderEntity>;
    /** Règle 2 : ouverture d'un litige — auto-assignation du gestionnaire */
    openDispute(id: string, body: {
        reason?: string;
    }, req: {
        user: AuthUser;
    }): Promise<import("./entities/order.entity").OrderEntity>;
    /** Règle 2 : résolution d'un litige par l'agence/BTP ou l'admin */
    resolveDispute(id: string, body: {
        outcome: 'CLIENT' | 'ARTISAN';
        resolution: string;
    }, req: {
        user: AuthUser;
    }): Promise<import("./entities/order.entity").OrderEntity>;
}
export {};
//# sourceMappingURL=orders.controller.d.ts.map