import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from './entities/user.entity';
import { DocumentEntity } from '../documents/entities/document.entity';
import { ArtisanEntity } from '../artisans/entities/artisan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, DocumentEntity, ArtisanEntity])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
