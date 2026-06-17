import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { UserRole } from '../../../common/enums/user-role.enum';
import { ArtisanEntity } from '../../artisans/entities/artisan.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

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
