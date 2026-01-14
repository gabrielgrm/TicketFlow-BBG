import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TECH, UserRole.SUPERVISOR)
  async getMyMetrics(@Request() req: any) {
    return this.profileService.getMyMetrics(req.user.id);
  }

  @Get(':techId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  async getTechProfile(@Param('techId') techId: string) {
    return this.profileService.getTechProfile(techId);
  }
}
