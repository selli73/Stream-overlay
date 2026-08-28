import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiService } from './api.service';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import type { IJwtUserRequest } from '../user/typings/user';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('/myProfile')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@Req() req: IJwtUserRequest) {
    return this.apiService.getMyProfileById(req.user.userId)
  }
}
