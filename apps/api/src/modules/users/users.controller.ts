import { Controller, Get, Patch, Body, UseGuards, Request, Logger, BadRequestException, HttpException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserEntity } from './entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req: { user: { sub: string } }): Promise<UserEntity> {
    return this.usersService.findById(req.user.sub);
  }

  @Patch('me')
  async updateProfile(
    @Request() req: { user: { sub: string } },
    @Body() body: Partial<Pick<UserEntity,
      'firstName' | 'lastName' | 'avatarUrl' | 'phone' | 'city' | 'address'
      | 'agencyName' | 'shopName' | 'specialty' | 'description'
      | 'payoutMethod' | 'payoutNumber'
    >>,
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
      description?: string;
      btpMode?: string;
      radiusKm?: number;
      documents?: Array<{ type: string; url: string }>;
    },
  ) {
    try {
      return await this.usersService.upgradeToPro(req.user.sub, body);
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      const detail = err?.sqlMessage ?? err?.message ?? 'Erreur inconnue';
      this.logger.error(`[upgrade-pro] ${detail}`, err?.stack);
      throw new BadRequestException(`Activation impossible : ${detail}`);
    }
  }

  @Patch('me/switch-role')
  async switchRole(
    @Request() req: { user: { sub: string } },
    @Body() body: { role: UserRole },
  ) {
    try {
      return await this.usersService.switchRole(req.user.sub, body.role);
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      const detail = err?.sqlMessage ?? err?.message ?? 'Erreur inconnue';
      this.logger.error(`[switch-role] ${detail}`, err?.stack);
      throw new BadRequestException(`Changement de compte impossible : ${detail}`);
    }
  }
}
