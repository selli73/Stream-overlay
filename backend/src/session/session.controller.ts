import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import type { IJwtUserRequest } from '../user/typings/user';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get streamer broadcast status' })
  @ApiResponse({ status: 200, description: 'Stream status received successfully' }) @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStatusSession(@Req() req: IJwtUserRequest) {
    return this.sessionService.getStatusSession(req.user.userId);
  }

  @Post('start')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Start broadcast' })
  @ApiResponse({ status: 200, description: 'The broadcast has started successfully' }) @ApiResponse({ status: 401, description: 'Unauthorized' })
  startSession(@Req() req: IJwtUserRequest) {
    return this.sessionService.startSession(req.user.userId);
  }

  @Post('end')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'End broadcast' })
  @ApiResponse({ status: 200, description: 'The broadcast has successfully ended' }) @ApiResponse({ status: 401, description: 'Unauthorized' })
  endSession(@Req() req: IJwtUserRequest) {
    return this.sessionService.endSession(req.user.userId);
  }
}
