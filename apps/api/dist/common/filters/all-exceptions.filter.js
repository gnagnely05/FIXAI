"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
/**
 * Filtre global : renvoie le vrai message d'erreur (y compris SQL) dans la
 * réponse JSON au lieu d'un « Internal server error » opaque. Facilite le
 * diagnostic en production tant que les logs serveur ne sont pas accessibles.
 */
let AllExceptionsFilter = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger('Exception');
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message;
        if (exception instanceof common_1.HttpException) {
            const r = exception.getResponse();
            message = typeof r === 'string' ? r : r?.message ?? r;
        }
        else {
            // Erreur non-HTTP (ex: erreur TypeORM/SQL) — on expose le message brut
            message = exception?.sqlMessage ?? exception?.message ?? 'Erreur inconnue';
        }
        this.logger.error(`${status} — ${JSON.stringify(message)}`, exception?.stack);
        res.status(status).json({
            statusCode: status,
            message,
            error: exception?.name ?? 'Error',
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map