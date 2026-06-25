"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const ai_controller_1 = require("./ai.controller");
const devis_pro_service_1 = require("./devis-pro.service");
const devis_pro_controller_1 = require("./devis-pro.controller");
const openrouter_service_1 = require("./openrouter.service");
const catalog_module_1 = require("../catalog/catalog.module");
const subscriptions_module_1 = require("../subscriptions/subscriptions.module");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [catalog_module_1.CatalogModule, subscriptions_module_1.SubscriptionsModule],
        controllers: [ai_controller_1.AiController, devis_pro_controller_1.DevisProController],
        providers: [ai_service_1.AiService, devis_pro_service_1.DevisProService, openrouter_service_1.OpenRouterService],
        exports: [ai_service_1.AiService, devis_pro_service_1.DevisProService, openrouter_service_1.OpenRouterService],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map