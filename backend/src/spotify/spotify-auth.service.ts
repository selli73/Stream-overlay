import { HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ISpotifyAuthUrl } from "../user/typings/user";
import { randomUUID } from "node:crypto";
import { lastValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class SpotifyAuthService {
    constructor(private _configService: ConfigService, private _httpService: HttpService) {}

    getSpotifyAuthUrl(): ISpotifyAuthUrl {        
        const state = randomUUID();
        const { clientId } = this.getClientCredentials();
        return {
            url: 'https://accounts.spotify.com/authorize?' + new URLSearchParams({ 
                response_type: 'code', 
                client_id: clientId, 
                scope: this._configService.getOrThrow('SCOPES'), 
                redirect_uri: this._configService.getOrThrow('REDIRECT_URI'), 
                state
            }),
            state
        };
    }

    private getClientCredentials() {
        return {
            clientId: this._configService.getOrThrow('CLIENT_ID'),
            clientSecret: this._configService.getOrThrow('CLIENT_SECRET')
        };
    }

    async exchangeCode(authorizationCode: string) {
        try {
            const { clientId, clientSecret } = this.getClientCredentials();

            const response = await lastValueFrom(this._httpService.post('https://accounts.spotify.com/api/token', 
                new URLSearchParams({            
                    code: authorizationCode,
                    redirect_uri: this._configService.getOrThrow('REDIRECT_URI'),
                    grant_type: 'authorization_code',
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64'))
                    }
                }
            ));

            const expiryDate = new Date();
            expiryDate.setSeconds(expiryDate.getSeconds() + response.data['expires_in']); 
            
            return {
                spotifyAccessToken: response.data['access_token'],
                spotifyRefreshToken: response.data['refresh_token'],
                expiryDate
            };           
        } catch(error) {
            if (error instanceof HttpException) {
                throw new InternalServerErrorException(error.message);
            }
            throw new InternalServerErrorException('Server-side error');
        }
    }

    async accessTokenUpdate(refreshToken: string) {
        const { clientId, clientSecret } = this.getClientCredentials();
        
        const response = await lastValueFrom(this._httpService.post('https://accounts.spotify.com/api/token', 
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
                },
                validateStatus: (status) => status === 200 || status === 400
            }
        ));

        if (response.status === 400) {
            throw new UnauthorizedException('Spotify отклонил refresh token');
        }
        
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + response.data['expires_in']);

        return {
            spotifyAccessToken: response.data['access_token'],
            expiryDate
        };        
    }
}