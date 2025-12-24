import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('team')
  @ApiOperation({
    summary: 'Get team members',
    description: 'Returns list of team members for user organization',
  })
  @ApiResponse({
    status: 200,
    description: 'List of team members',
  })
  async getTeamMembers(@Request() req: AuthenticatedRequest) {
    return this.usersService.getTeamMembers(req.user.id);
  }
}
