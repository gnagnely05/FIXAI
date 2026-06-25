import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from '../../../common/enums/user-role.enum';
import { VerificationStatus } from '../../../common/enums/verification-status.enum';
import { BtpMode } from '../../../common/enums/btp-mode.enum';
import { ArtisanEntity } from '../../artisans/entities/artisan.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone?: string;

  @Column()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column({ nullable: true, default: '' })
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.REGISTERED,
  })
  verificationStatus: VerificationStatus;

  /** For ENTREPRISE_BTP: operating mode */
  @Column({ type: 'enum', enum: BtpMode, nullable: true })
  btpMode?: BtpMode;

  /** For ARTISAN: the agency they are affiliated with */
  @Column({ nullable: true })
  agencyId?: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agencyId' })
  agency?: UserEntity;

  /** Wallet balance in XOF (used for escrow top-up) */
  @Column({ type: 'bigint', default: 0 })
  walletBalance: number;

  @Column({ nullable: true })
  city?: string;

  /** Service radius in km (for artisans/agencies) */
  @Column({ nullable: true })
  radiusKm?: number;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @OneToOne(() => ArtisanEntity, (artisan) => artisan.user, { nullable: true })
  artisanProfile?: ArtisanEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export { UserEntity as User };
