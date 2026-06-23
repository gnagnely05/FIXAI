import { VerificationStatus } from '../../../common/enums/verification-status.enum';
export declare enum VerifyAction {
    APPROVE = "APPROVE",
    INCOMPLETE = "INCOMPLETE",
    REJECT = "REJECT"
}
export declare class VerifyStepDto {
    userId: string;
    action: VerifyAction;
    reason?: string;
    /** Target status after APPROVE (optional override) */
    targetStatus?: VerificationStatus;
}
//# sourceMappingURL=verify-step.dto.d.ts.map