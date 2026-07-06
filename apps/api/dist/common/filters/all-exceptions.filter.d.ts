import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
/**
 * Filtre global : renvoie le vrai message d'erreur (y compris SQL) dans la
 * réponse JSON au lieu d'un « Internal server error » opaque. Facilite le
 * diagnostic en production tant que les logs serveur ne sont pas accessibles.
 */
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: any, host: ArgumentsHost): void;
}
//# sourceMappingURL=all-exceptions.filter.d.ts.map