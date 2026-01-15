import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';
import { PASSWORD, USER } from '../../common/constants';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(PASSWORD.MIN_LENGTH)
  password: string;

  @IsString()
  @MinLength(USER.MIN_NAME_LENGTH)
  name: string;

  @IsEnum(UserRole)
  role: UserRole;
}
