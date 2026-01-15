import { Controller, Get, Post, Body, UseGuards, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { RequestUser } from '../common/types';
import { ERROR_MESSAGES } from '../common/constants';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: RequestUser) {
    const fullUser = await this.usersService.findById(user.id);
    const { passwordHash, ...userWithoutPassword } = fullUser;
    return userWithoutPassword;
  }

  @Get('technicians')
  @UseGuards(JwtAuthGuard)
  async listTechnicians() {
    return this.usersService.findTechnicians();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    if (createUserDto.role === UserRole.CLIENT) {
      throw new ConflictException(ERROR_MESSAGES.CANNOT_CREATE_CLIENT);
    }

    return this.usersService.create(createUserDto);
  }
}
