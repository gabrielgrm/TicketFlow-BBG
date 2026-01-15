import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { DASHBOARD } from '../common/constants';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(UserRole.SUPERVISOR, UserRole.TECH)
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('charts/trends')
  @Roles(UserRole.SUPERVISOR, UserRole.TECH)
  async getChartTrends(@Query('days', new ParseIntPipe({ optional: true })) days?: number) {
    return this.dashboardService.getChartTrends(days || DASHBOARD.DEFAULT_TREND_DAYS);
  }

  @Get('charts/priority')
  @Roles(UserRole.SUPERVISOR, UserRole.TECH)
  async getChartPriority() {
    return this.dashboardService.getChartPriority();
  }

  @Get('technicians')
  @Roles(UserRole.SUPERVISOR)
  async getTechnicians() {
    return this.dashboardService.getTechnicians();
  }

  @Get('critical-tickets')
  @Roles(UserRole.SUPERVISOR, UserRole.TECH)
  async getCriticalTickets() {
    return this.dashboardService.getCriticalTickets();
  }

  @Get('recent-actions')
  @Roles(UserRole.SUPERVISOR)
  async getRecentActions(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.dashboardService.getRecentActions(limit || DASHBOARD.DEFAULT_RECENT_ACTIONS);
  }
}
