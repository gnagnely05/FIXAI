"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });
    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`FixAI API running on port ${port}`);
    console.log(`[DB] host=${process.env.DB_HOST} port=${process.env.DB_PORT} user=${process.env.DB_USER} db=${process.env.DB_NAME} NODE_ENV=${process.env.NODE_ENV}`);
}
bootstrap();
//# sourceMappingURL=main.js.map