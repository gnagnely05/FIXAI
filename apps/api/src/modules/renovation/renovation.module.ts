import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RenovationService } from './renovation.service';
import { RenovationController } from './renovation.controller';
import { RenovationProjectEntity } from './entities/renovation-project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RenovationProjectEntity])],
  providers: [RenovationService],
  controllers: [RenovationController],
  exports: [RenovationService],
})
export class RenovationModule {}
