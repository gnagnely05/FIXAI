import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Filtre global : renvoie le vrai message d'erreur (y compris SQL) dans la
 * réponse JSON au lieu d'un « Internal server error » opaque. Facilite le
 * diagnostic en production tant que les logs serveur ne sont pas accessibles.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any;
    if (exception instanceof HttpException) {
      const r = exception.getResponse();
      message = typeof r === 'string' ? r : (r as any)?.message ?? r;
    } else {
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
}
