import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { ISpotifyAuthUrl } from './interface/user';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserService {

    constructor(private _configService: ConfigService, private readonly _httpService: HttpService) {}

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

    async getAccessToken(authorizationCode: string) {
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
        
        console.log(`Get access token`);
        console.log(response.data);
    }

    async accessTokenUpdate() {
        const refreshToken = 'my_fresh_token';
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
                }
            }
        ));

        console.log(response.data);
    }

    private getClientCredentials() {
        return {
            clientId: this._configService.getOrThrow('CLIENT_ID'),
            clientSecret: this._configService.getOrThrow('CLIENT_SECRET')
        };
    }
}
