"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DevisProService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevisProService = void 0;
const common_1 = require("@nestjs/common");
const catalog_service_1 = require("../catalog/catalog.service");
const openrouter_service_1 = require("./openrouter.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
let DevisProService = DevisProService_1 = class DevisProService {
    constructor(catalogService, openRouter, subscriptions) {
        this.catalogService = catalogService;
        this.openRouter = openRouter;
        this.subscriptions = subscriptions;
        this.logger = new common_1.Logger(DevisProService_1.name);
    }
    async analyzeQuoteFiles(userId, files) {
        if (!files.length || files.length > 3) {
            throw new common_1.BadRequestException('Fournissez 1 à 3 images de devis');
        }
        for (const f of files) {
            if (!ALLOWED_MIMES.includes(f.mimeType)) {
                throw new common_1.BadRequestException(`Type de fichier non supporté: ${f.mimeType}. Formats acceptés: JPEG, PNG, WEBP, GIF`);
            }
        }
        // Check and consume quota
        await this.subscriptions.assertAiAllowed(userId);
        // Build data URIs from base64 images and analyze the first image with vision
        // (Replicate vision models process one image at a time)
        const allLines = [];
        for (const file of files) {
            const dataUri = `data:${file.mimeType};base64,${file.base64}`;
            const prompt = `Tu es un assistant spécialisé dans la lecture de devis de construction en Côte d'Ivoire.
Analyse cette image de devis et extrait UNIQUEMENT les lignes de produits/matériaux.
Ignore les totaux, sous-totaux, TVA, conditions de paiement, en-têtes, pieds de page.
Pour chaque ligne produit, retourne un JSON array avec: {"originalText": "texte exact de la ligne", "quantity": nombre ou null}
Ne retourne QUE le JSON array brut, sans markdown ni explication.
Exemple: [{"originalText":"Ciment CPA 50 kg","quantity":20},{"originalText":"Sable de rivière","quantity":null}]`;
            try {
                const response = await this.openRouter.analyzeWithVision(prompt, dataUri);
                const jsonMatch = response.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    allLines.push(...parsed);
                }
            }
            catch (e) {
                this.logger.warn(`Vision analysis failed for file ${file.name ?? 'unknown'}`, e);
            }
        }
        await this.subscriptions.consumeAiRequest(userId);
        if (!allLines.length) {
            return { matched: [], unavailable: [], uninterpreted: [], totalEstimateXof: 0 };
        }
        const allProducts = await this.catalogService.search({});
        const results = allLines.map(line => this.matchLine(line, allProducts));
        const matched = results.filter(r => r.status === 'MATCHED');
        const unavailable = results.filter(r => r.status === 'UNAVAILABLE');
        const uninterpreted = results.filter(r => r.status === 'UNINTERPRETED');
        const totalEstimateXof = matched.reduce((sum, r) => sum + (r.totalXof ?? 0), 0);
        return { matched, unavailable, uninterpreted, totalEstimateXof };
    }
    /**
     * Anti-hallucination: only MATCHED when a real catalog product is found.
     * Unknown lines stay UNAVAILABLE (known material) or UNINTERPRETED (unknown).
     * No price is ever invented.
     */
    matchLine(line, catalog) {
        if (!line.originalText?.trim()) {
            return { originalText: line.originalText ?? '', status: 'UNINTERPRETED' };
        }
        const text = line.originalText.toLowerCase();
        const match = catalog.find(p => {
            const nameLower = p.name.toLowerCase();
            if (text.includes(nameLower))
                return true;
            return nameLower.split(' ').some(word => word.length > 3 && text.includes(word));
        });
        if (!match) {
            const knownMaterials = [
                'ciment', 'sable', 'gravier', 'fer', 'brique', 'parpaing',
                'carrelage', 'peinture', 'tuyau', 'câble', 'cable', 'bois',
                'planche', 'plâtre', 'platre', 'mortier', 'béton', 'beton',
                'agglo', 'chape', 'enduit', 'colle', 'joint', 'robinet', 'dalle',
            ];
            const isKnownMaterial = knownMaterials.some(m => text.includes(m));
            return {
                originalText: line.originalText,
                status: isKnownMaterial ? 'UNAVAILABLE' : 'UNINTERPRETED',
            };
        }
        const quantity = line.quantity ?? 1;
        return {
            originalText: line.originalText,
            status: 'MATCHED',
            product: {
                id: match.id,
                name: match.name,
                priceXof: match.priceXof,
                unit: match.unit,
                merchantName: match.merchantName,
            },
            quantity,
            totalXof: Number(match.priceXof) * quantity,
        };
    }
};
exports.DevisProService = DevisProService;
exports.DevisProService = DevisProService = DevisProService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService,
        openrouter_service_1.OpenRouterService,
        subscriptions_service_1.SubscriptionsService])
], DevisProService);
//# sourceMappingURL=devis-pro.service.js.map