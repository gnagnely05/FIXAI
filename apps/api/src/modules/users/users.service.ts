import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async updateProfile(id: string, updates: Partial<Pick<UserEntity, 'firstName' | 'lastName' | 'avatarUrl'>>) {
    await this.usersRepo.update(id, updates);
    return this.findById(id);
  }

  async verifyUser(id: string): Promise<void> {
    await this.usersRepo.update(id, { isVerified: true });
  }
}
