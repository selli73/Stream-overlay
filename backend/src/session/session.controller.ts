import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import type { IJwtUserRequest } from '../user/typings/user';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('/status')
  @UseGuards(JwtAuthGuard)
  getStatusSession(@Req() req: IJwtUserRequest) {
    return this.sessionService.getStatusSession(req.user.userId);
  }

  @Post('start')
  @UseGuards(JwtAuthGuard)
  startSession(@Req() req: IJwtUserRequest) {
    return this.sessionService.startSession(req.user.userId);
  }

  @Post('end')
  @UseGuards(JwtAuthGuard)
  endSession(@Req() req: IJwtUserRequest) {
    return this.sessionService.endSession(req.user.userId);
  }
}
