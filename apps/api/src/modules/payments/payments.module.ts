import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CommissionConfigEntity } from '../admin/entities/commission-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, CommissionConfigEntity])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
