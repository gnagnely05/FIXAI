import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RenovationProject } from './entities/renovation-project.entity';
import { RenovationService } from './renovation.service';
import { RenovationController } from './renovation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RenovationProject])],
  controllers: [RenovationController],
  providers: [RenovationService],
  exports: [RenovationService],
})
export class RenovationModule {}
