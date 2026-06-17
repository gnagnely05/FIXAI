import { IsEmail, IsEnum, IsString, MinLength, Matches } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(\+225)?[0-9]{10}$/, { message: 'Invalid Ivory Coast phone number' })
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;
}
