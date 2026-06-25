import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterProviderDto } from './dto/register-provider.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: { phone: string }) {
    if (!body.phone) throw new BadRequestException('Numéro de téléphone requis');
    const code = this.otpService.generate(body.phone);
    await this.otpService.sendSms(body.phone, code);
    return { message: 'Code OTP envoyé' };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: { phone: string; code: string }) {
    const valid = this.otpService.verify(body.phone, body.code);
    if (!valid) throw new BadRequestException('Code invalide ou expiré');
    return { verified: true };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register-provider')
  async registerProvider(@Body() dto: RegisterProviderDto) {
    return this.authService.registerProvider(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req: { user: { sub: string } }) {
    await this.authService.logout(req.user.sub);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { userId: string; refreshToken: string }) {
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }
}
