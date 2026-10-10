import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get aggregated dashboard statistics for authenticated user' })
  @ApiResponse({ status: 200, description: 'Live aggregated dashboard metrics' })
  @Get('stats')
  async getDashboardStats(@GetUser('id') userId: number) {
    return this.dashboardService.getDashboardStats(userId);
  }
}
