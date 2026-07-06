"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Les documents (CNI, selfie, docs administratifs) sont envoyés en base64 :
    // on relève la limite du corps de requête (défaut Express : 100 kb).
    app.use((0, express_1.json)({ limit: '25mb' }));
    app.use((0, express_1.urlencoded)({ limit: '25mb', extended: true }));
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: '*',
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