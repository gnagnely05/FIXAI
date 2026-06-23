import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { OrderEntity } from '../../orders/entities/order.entity';

export enum ArtisanSpecialty {
  PLOMBERIE = 'PLOMBERIE',
  ELECTRICITE = 'ELECTRICITE',
  MACONNERIE = 'MACONNERIE',
  MENUISERIE = 'MENUISERIE',
  PEINTURE = 'PEINTURE',
  DECORATION = 'DECORATION',
  CARRELAGE = 'CARRELAGE',
  CLIMATISATION = 'CLIMATISATION',
  TOITURE = 'TOITURE',
  FERRONNERIE = 'FERRONNERIE',
}

@Entity('artisans')
export class ArtisanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.artisanProfile)
  @JoinColumn()
  user: UserEntity;

  @Column({ type: 'enum', enum: ArtisanSpecialty })
  specialty: ArtisanSpecialty;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  district: string;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: 0 })
  yearsOfExperience: number;

  @Column({ type: 'bigint', default: 0 })
  hourlyRate: number;

  @Column({ type: 'simple-array', nullable: true })
  portfolioImages: string[];

  @Column({ type: 'simple-array', nullable: true })
  availableDays: string[];

  @Column({ type: 'simple-array', nullable: true })
  availableSlots: string[];

  @OneToMany(() => OrderEntity, (order) => order.artisan)
  orders: OrderEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export { ArtisanEntity as Artisan };
