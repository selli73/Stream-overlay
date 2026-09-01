import { Controller, Get, Query, Redirect, Req, Res, UnauthorizedException, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { SpotifyAuthService } from '../spotify/spotify-auth.service';
import { SpotifyApiService } from '../spotify/spotify-api.service';
import type { IJwtUserRequest } from './typings/user';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService, private readonly _spotifyApiService: SpotifyApiService, private readonly _spotifyAuthService: SpotifyAuthService, 
    private _configService: ConfigService) {}

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
  @Redirect()
  async callback(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Query('code') code: string, @Query('state') state: string, @Query('error') error: string) {    
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
  
    const appToken = await this._authService.createUser(account_id, display_name, spotifyAccessToken, spotifyRefreshToken, expiryDate);

      
    res.cookie('access_token', appToken.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 14
    });
    const url = `${this._configService.getOrThrow('FRONTEND_URL')}/dashboard`;

    return {
      url,
      statusCode: 302
    }
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: IJwtUserRequest) {
    return this._authService.getUser(req.user.userId);
  }
}
