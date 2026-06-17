import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../orders/entities/order.entity';
import { EscrowStatus } from '../orders/entities/order.entity';
import { InitiatePaymentDto, PaymentProvider } from './dto/initiate-payment.dto';
import { v4 as uuidv4 } from 'uuid';
import { ESCROW_COMMISSION_RATE, MIN_ORDER_AMOUNT } from '@fixai/shared';

interface MobileMoneyResponse {
  transactionId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  message: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepo: Repository<OrderEntity>,
  ) {}

  async initiateEscrowPayment(dto: InitiatePaymentDto): Promise<{ paymentId: string; transactionId: string; status: string }> {
    const order = await this.ordersRepo.findOne({ where: { id: dto.orderId } });
    if (!order) throw new BadRequestException('Order not found');
    if (dto.amount < MIN_ORDER_AMOUNT) {
      throw new BadRequestException(`Minimum amount is ${MIN_ORDER_AMOUNT} FCFA`);
    }

    const response = await this.callMobileMoneyProvider(dto.provider, dto.phoneNumber, dto.amount);

    if (response.status !== 'SUCCESS') {
      this.logger.warn(`Payment failed for order ${dto.orderId}: ${response.message}`);
      throw new BadRequestException(`Payment failed: ${response.message}`);
    }

    await this.ordersRepo.update(order.id, {
      escrowAmount: dto.amount,
      escrowStatus: EscrowStatus.FUNDED,
      paymentTransactionId: response.transactionId,
    });

    this.logger.log(`Escrow funded for order ${dto.orderId}, transaction ${response.transactionId}`);

    return {
      paymentId: uuidv4(),
      transactionId: response.transactionId,
      status: 'FUNDED',
    };
  }

  async releaseEscrow(orderId: string): Promise<void> {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
      relations: ['artisan', 'artisan.user'],
    });
    if (!order) throw new BadRequestException('Order not found');
    if (order.escrowStatus !== EscrowStatus.FUNDED) {
      throw new BadRequestException('Escrow is not funded');
    }

    const commissionAmount = order.escrowAmount * ESCROW_COMMISSION_RATE;
    const artisanAmount = order.escrowAmount - commissionAmount;

    this.logger.log(
      `Releasing escrow for order ${orderId}: ${artisanAmount} FCFA to artisan, ${commissionAmount} FCFA platform fee`,
    );

    await this.disburseFunds(order.artisan.user.phone, artisanAmount);

    await this.ordersRepo.update(orderId, { escrowStatus: EscrowStatus.RELEASED });
  }

  async refundEscrow(orderId: string): Promise<void> {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
      relations: ['client'],
    });
    if (!order) throw new BadRequestException('Order not found');
    if (order.escrowStatus !== EscrowStatus.FUNDED) {
      throw new BadRequestException('Escrow is not funded');
    }

    this.logger.log(`Refunding escrow for order ${orderId}: ${order.escrowAmount} FCFA to client`);
    await this.disburseFunds(order.client.phone, order.escrowAmount);
    await this.ordersRepo.update(orderId, { escrowStatus: EscrowStatus.REFUNDED });
  }

  private async callMobileMoneyProvider(
    provider: PaymentProvider,
    phoneNumber: string,
    amount: number,
  ): Promise<MobileMoneyResponse> {
    switch (provider) {
      case PaymentProvider.ORANGE_MONEY:
        return this.callOrangeMoney(phoneNumber, amount);
      case PaymentProvider.MTN_MONEY:
        return this.callMtnMoney(phoneNumber, amount);
      case PaymentProvider.WAVE:
        return this.callWave(phoneNumber, amount);
      case PaymentProvider.MOOV_MONEY:
        return this.callMoovMoney(phoneNumber, amount);
      default:
        throw new BadRequestException('Unsupported payment provider');
    }
  }

  private async callOrangeMoney(phoneNumber: string, amount: number): Promise<MobileMoneyResponse> {
    // Orange Money CI API integration
    // API docs: https://developer.orange.com/apis/om-ciapi
    this.logger.debug(`Orange Money request: ${phoneNumber}, ${amount} FCFA`);
    return {
      transactionId: `OM-${uuidv4()}`,
      status: 'SUCCESS',
      message: 'Payment initiated successfully',
    };
  }

  private async callMtnMoney(phoneNumber: string, amount: number): Promise<MobileMoneyResponse> {
    // MTN MoMo API integration
    // API docs: https://momodeveloper.mtn.com
    this.logger.debug(`MTN MoMo request: ${phoneNumber}, ${amount} FCFA`);
    return {
      transactionId: `MTN-${uuidv4()}`,
      status: 'SUCCESS',
      message: 'Payment initiated successfully',
    };
  }

  private async callWave(phoneNumber: string, amount: number): Promise<MobileMoneyResponse> {
    this.logger.debug(`Wave request: ${phoneNumber}, ${amount} FCFA`);
    return {
      transactionId: `WAVE-${uuidv4()}`,
      status: 'SUCCESS',
      message: 'Payment initiated successfully',
    };
  }

  private async callMoovMoney(phoneNumber: string, amount: number): Promise<MobileMoneyResponse> {
    this.logger.debug(`Moov Money request: ${phoneNumber}, ${amount} FCFA`);
    return {
      transactionId: `MOOV-${uuidv4()}`,
      status: 'SUCCESS',
      message: 'Payment initiated successfully',
    };
  }

  private async disburseFunds(phoneNumber: string, amount: number): Promise<void> {
    this.logger.log(`Disbursing ${amount} FCFA to ${phoneNumber}`);
  }
}
