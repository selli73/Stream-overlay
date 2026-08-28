import { Controller, Get, Query, Redirect, Req, Res, UnauthorizedException} from '@nestjs/common';
import { UserService } from './user.service';
import type { Request, Response } from 'express';
import { SpotifyAuthService } from '../spotify/spotify-auth.service';
import { SpotifyApiService } from '../spotify/spotify-api.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService, private readonly _spotifyApiService: SpotifyApiService, private readonly _spotifyAuthService: SpotifyAuthService) {}

  @Get('/login')
  @Redirect()
  login(@Res({ passthrough: true }) res: Response) {    
    const { url, state } = this._spotifyAuthService.getSpotifyAuthUrl();

    res.cookie('spotify_state', state, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000
    });

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

    res.clearCookie('spotify_state');

    const { spotifyAccessToken, spotifyRefreshToken, expiryDate } = await this._spotifyAuthService.exchangeCode(code);
    
    const { account_id, display_name } = await this._spotifyApiService.getProfile(spotifyAccessToken);
  
    const appToken = await this.userService.createUser(account_id, display_name, spotifyAccessToken, spotifyRefreshToken, expiryDate);

      
    res.cookie('access_token', appToken.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 14
    });

    return res.json({
      message: 'Created'
    });
  }
}
