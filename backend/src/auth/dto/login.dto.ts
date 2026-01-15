import { IsEmail, IsString, MinLength } from 'class-validator';
import { PASSWORD } from '../../common/constants';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(PASSWORD.MIN_LENGTH)
  password: string;
}
