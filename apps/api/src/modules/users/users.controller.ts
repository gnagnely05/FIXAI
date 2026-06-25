import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req: { user: { sub: string } }): Promise<UserEntity> {
    return this.usersService.findById(req.user.sub);
  }

  @Patch('me')
  async updateProfile(
    @Request() req: { user: { sub: string } },
    @Body() body: Partial<Pick<UserEntity, 'firstName' | 'lastName' | 'avatarUrl'>>,
  ) {
    return this.usersService.updateProfile(req.user.sub, body);
  }

  @Patch('me/upgrade-pro')
  async upgradeToPro(
    @Request() req: { user: { sub: string } },
    @Body() body: {
      role: UserRole;
      specialty?: string;
      city?: string;
      agencyName?: string;
      shopName?: string;
      address?: string;
      btpMode?: string;
      radiusKm?: number;
    },
  ) {
    return this.usersService.upgradeToPro(req.user.sub, body);
  }
}
