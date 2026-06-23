import { DepannageService } from './depannage.service';
import { ArtisanSpecialty } from '../artisans/entities/artisan.entity';
import { DepannageMode } from './entities/depannage-request.entity';
export declare class DepannageController {
    private readonly service;
    constructor(service: DepannageService);
    create(req: {
        user: {
            sub: string;
        };
    }, dto: {
        description: string;
        photoUrls?: string[];
        address: string;
        city: string;
        latitude?: number;
        longitude?: number;
    }): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
    confirmQuote(id: string, req: {
        user: {
            sub: string;
        };
    }, category?: ArtisanSpecialty): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
    submitProposal(id: string, req: {
        user: {
            sub: string;
        };
    }, dto: {
        priceXof: number;
        estimatedDurationMin: number;
        artisanName: string;
    }): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
    selectArtisan(id: string, req: {
        user: {
            sub: string;
        };
    }, artisanId: string): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
    chooseMode(id: string, req: {
        user: {
            sub: string;
        };
    }, dto: {
        mode: DepannageMode;
        scheduledAt?: string;
    }): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
    artisanConfirmUrgent(id: string, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
    reachAgreement(id: string, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
    fundEscrow(id: string, req: {
        user: {
            sub: string;
        };
    }, transactionRef: string): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
    lockIntervention(id: string, requiredPartIds?: string[]): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
    completeIntervention(id: string, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
    releasePayment(id: string, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
    dispatchParts(id: string): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
    findNearby(category: ArtisanSpecialty, lat: string, lng: string, radius?: string): Promise<any>;
    findMyRequests(req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity[]>;
    findArtisanRequests(req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity[]>;
    findOne(id: string): Promise<import("./entities/depannage-request.entity").DepannageRequestEntity>;
}
//# sourceMappingURL=depannage.controller.d.ts.map