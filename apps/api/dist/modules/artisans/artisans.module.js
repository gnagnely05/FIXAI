"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtisansModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const artisans_service_1 = require("./artisans.service");
const artisans_controller_1 = require("./artisans.controller");
const artisan_entity_1 = require("./entities/artisan.entity");
let ArtisansModule = class ArtisansModule {
};
exports.ArtisansModule = ArtisansModule;
exports.ArtisansModule = ArtisansModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([artisan_entity_1.ArtisanEntity])],
        providers: [artisans_service_1.ArtisansService],
        controllers: [artisans_controller_1.ArtisansController],
        exports: [artisans_service_1.ArtisansService],
    })
], ArtisansModule);
//# sourceMappingURL=artisans.module.js.map