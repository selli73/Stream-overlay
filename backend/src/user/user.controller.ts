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
  async callback(@Req() req: Request, @Res() res: Response, @Query('code') code: string, @Query('state') state: string, @Query('error') error: string) {
    
    if (error) {
      throw new UnauthorizedException('Access denied');
    }
    
    const savedState = req.cookies['spotify_state'];
    
    if (savedState !== state) {
      throw new UnauthorizedException('Invalid state');
    }

    const userData = await this.userService.getAccessRefreshTokenSpotify(code);
    
    const result = await this.userService.createUser(userData.accountId, userData.accountName, 
      userData.spotifyAccessToken, userData.spotifyRefreshToken, userData.expiryDate);
      
    res.cookie('access_token', result?.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 14
    });
    res.clearCookie('spotify_state');

    return res.json({
      message: 'Created'
    });
  }

  // @Get('update-access-token')
  // async accessTokenUpdate() {
  //   await this.userService.accessTokenUpdate();
  // }
}
