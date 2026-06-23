import { Repository, DataSource } from 'typeorm';
import { DepannageRequestEntity, DepannageMode } from './entities/depannage-request.entity';
import { ArtisanSpecialty } from '../artisans/entities/artisan.entity';
export declare class DepannageService {
    private readonly repo;
    private readonly dataSource;
    private readonly logger;
    constructor(repo: Repository<DepannageRequestEntity>, dataSource: DataSource);
    create(clientId: string, dto: {
        description: string;
        photoUrls?: string[];
        address: string;
        city: string;
        latitude?: number;
        longitude?: number;
    }): Promise<DepannageRequestEntity>;
    private runAiDiagnosis;
    confirmQuote(requestId: string, clientId: string, category?: ArtisanSpecialty): Promise<DepannageRequestEntity>;
    submitProposal(requestId: string, artisanId: string, artisanName: string, priceXof: number, estimatedDurationMin: number): Promise<DepannageRequestEntity>;
    selectArtisan(requestId: string, clientId: string, artisanId: string): Promise<DepannageRequestEntity>;
    chooseMode(requestId: string, clientId: string, mode: DepannageMode, scheduledAt?: Date): Promise<DepannageRequestEntity>;
    artisanConfirmUrgent(requestId: string, artisanId: string): Promise<DepannageRequestEntity>;
    reachAgreement(requestId: string, clientId: string): Promise<DepannageRequestEntity>;
    fundEscrow(requestId: string, clientId: string, transactionRef: string): Promise<DepannageRequestEntity>;
    lockIntervention(requestId: string, requiredPartIds?: string[]): Promise<DepannageRequestEntity>;
    dispatchParts(requestId: string): Promise<DepannageRequestEntity>;
    completeIntervention(requestId: string, artisanId: string): Promise<DepannageRequestEntity>;
    releasePayment(requestId: string, clientId: string): Promise<DepannageRequestEntity>;
    findByClient(clientId: string): Promise<DepannageRequestEntity[]>;
    findByArtisan(artisanId: string): Promise<DepannageRequestEntity[]>;
    findOne(id: string): Promise<DepannageRequestEntity>;
    findNearbyArtisans(category: ArtisanSpecialty, lat: number, lng: number, radiusKm?: number): Promise<any>;
    cancel(requestId: string, clientId: string): Promise<DepannageRequestEntity>;
    private findAndCheck;
}
//# sourceMappingURL=depannage.service.d.ts.map