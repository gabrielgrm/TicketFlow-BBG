import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

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
}
