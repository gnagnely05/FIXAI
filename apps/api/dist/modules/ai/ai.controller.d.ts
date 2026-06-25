import { AiService } from './ai.service';
import { GenerateDecorationDto } from './dto/decoration.dto';
import { GenerateImageDto } from './dto/generate-image.dto';
import { DiagnoseDto } from './dto/diagnose.dto';
export declare class AiController {
    private readonly service;
    constructor(service: AiService);
    visualize(req: {
        user: {
            sub: string;
        };
    }, dto: GenerateDecorationDto): Promise<import("./ai.service").DecorationResult>;
    generateImage(req: {
        user: {
            sub: string;
        };
    }, dto: GenerateImageDto): Promise<string>;
    analyzeImage(req: {
        user: {
            sub: string;
        };
    }, dto: {
        prompt: string;
        imageUrl?: string;
    }): Promise<string>;
    health(): {
        status: string;
        timestamp: string;
    };
    diagnose(dto: DiagnoseDto): Promise<{
        summary: string;
        detectedIssue: string;
        question: string;
        options: string[];
        estimatedPriceMinXof: number;
        estimatedPriceMaxXof: number;
    }>;
    generateByProvider(req: {
        user: {
            sub: string;
        };
    }, body: {
        prompt: string;
        provider?: 'flux';
    }): Promise<string>;
}
//# sourceMappingURL=ai.controller.d.ts.map