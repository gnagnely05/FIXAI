import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Serve Expo web build — process.cwd() = project root on Hostinger
  const webDist = join(process.cwd(), 'apps', 'mobile', 'dist');
  app.use(express.static(webDist));
  // SPA fallback: routes non-API → index.html
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get(/^(?!\/api\/).*/, (_req: any, res: any) => {
    res.sendFile(join(webDist, 'index.html'));
  });
  console.log(`[Static] Serving web from: ${webDist}`);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`FixAI API running on port ${port}`);
  console.log(`[DB] host=${process.env.DB_HOST} port=${process.env.DB_PORT} user=${process.env.DB_USER} db=${process.env.DB_NAME} NODE_ENV=${process.env.NODE_ENV}`);
}

bootstrap();
