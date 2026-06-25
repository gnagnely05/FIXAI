import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { AuthController } from './auth.controller';
import { UserEntity } from '../users/entities/user.entity';
import { DocumentEntity } from '../documents/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, DocumentEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'fixai-secret-change-in-production'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [AuthService, OtpService],
  controllers: [AuthController],
  exports: [AuthService, OtpService, JwtModule],
})
export class AuthModule {}
