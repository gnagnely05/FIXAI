import { IsString, IsEnum, IsOptional } from 'class-validator';
import { VerificationStatus } from '../../../common/enums/verification-status.enum';

export enum VerifyAction {
  APPROVE    = 'APPROVE',
  INCOMPLETE = 'INCOMPLETE',
  REJECT     = 'REJECT',
}

export class VerifyStepDto {
  @IsString()
  userId: string;

  @IsEnum(VerifyAction)
  action: VerifyAction;

  @IsString()
  @IsOptional()
  reason?: string;

  /** Target status after APPROVE (optional override) */
  @IsEnum(VerificationStatus)
  @IsOptional()
  targetStatus?: VerificationStatus;
}
