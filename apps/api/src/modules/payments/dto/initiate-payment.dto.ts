import { IsEnum, IsString, IsNumber, IsPositive, Matches } from 'class-validator';

export enum PaymentProvider {
  ORANGE_MONEY = 'ORANGE_MONEY',
  MTN_MONEY = 'MTN_MONEY',
  WAVE = 'WAVE',
  MOOV_MONEY = 'MOOV_MONEY',
}

export class InitiatePaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsString()
  @Matches(/^(\+225|00225)?[0-9]{10}$/, { message: 'Invalid phone number' })
  phoneNumber: string;
}
