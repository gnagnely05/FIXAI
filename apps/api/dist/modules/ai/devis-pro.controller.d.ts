import { DevisProService } from './devis-pro.service';
interface AnalyzeQuoteDto {
    files: Array<{
        base64: string;
        mimeType: string;
        name?: string;
    }>;
}
export declare class DevisProController {
    private readonly service;
    constructor(service: DevisProService);
    analyze(req: {
        user: {
            sub: string;
        };
    }, dto: AnalyzeQuoteDto): Promise<import("./devis-pro.service").DevisProResult>;
}
export {};
//# sourceMappingURL=devis-pro.controller.d.ts.map