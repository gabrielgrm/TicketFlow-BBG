import { Controller, Get, Post, Body, UseGuards, Request, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Get('technicians')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TECH)
  async listTechnicians() {
    return this.usersService.findTechnicians();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  async createUser(@Body() createUserDto: CreateUserDto) {
    // Verificar se o email já existe
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Validar que apenas TECH ou SUPERVISOR podem ser criados
    if (createUserDto.role === UserRole.CLIENT) {
      throw new ConflictException('Cannot create CLIENT users through this endpoint');
    }

    return this.usersService.create(createUserDto);
  }
}
