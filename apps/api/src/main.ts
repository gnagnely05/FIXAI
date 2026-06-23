import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
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

  // SPA fallback: toutes les routes non-API renvoient index.html
  const distPath = join(__dirname, '..', '..', '..', 'apps', 'mobile', 'dist');
  app.useStaticAssets(distPath);
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('*', (req: any, res: any) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(join(distPath, 'index.html'));
    }
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`FixAI API running on port ${port}`);
  console.log(`[DB] host=${process.env.DB_HOST} port=${process.env.DB_PORT} user=${process.env.DB_USER} db=${process.env.DB_NAME} NODE_ENV=${process.env.NODE_ENV}`);
}

bootstrap();
