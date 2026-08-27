import { Controller, Get, Post, Query, Redirect, Req, Res, UnauthorizedException} from '@nestjs/common';
import { UserService } from './user.service';
import type { Request, Response } from 'express';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/login')
  @Redirect()
  login(@Res({ passthrough: true }) res: Response) {    
    const { url, state } = this.userService.getSpotifyAuthUrl();
    
    res.cookie('spotify_state', state);
  
    return {
      url,
      statusCode: 302
    };
  }

  @Get('/callback')
  async callback(@Req() req: Request, @Query('code') code: string, @Query('state') state: string, @Query('error') error: string) {
    
    if (error) {
      throw new UnauthorizedException('Access denied');
    }
    
    const savedState = req.cookies['spotify_state'];
    
    if (savedState !== state) {
      throw new UnauthorizedException('Invalid state');
    }

    await this.userService.getAccessToken(code);
  }

  // @Get('update-access-token')
  // async accessTokenUpdate() {
  //   await this.userService.accessTokenUpdate();
  // }
}
