import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { ISpotifyAuthUrl } from './interface/user';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { ApiService } from '../api/api.service';

@Injectable()
export class UserService {

    constructor(private _configService: ConfigService, private _prismaService: PrismaService,
        private readonly _httpService: HttpService, private _apiService: ApiService) {}

    async getAccessToken(authorizationCode: string) {
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

            const { accountId, accountName } = await this._apiService.getMyProfile(response.data['access_token']);

            await this.createUser(accountId, accountName, response.data['access_token'], response.data['refresh_token'], expiryDate);
        } catch(error) {
            console.log(error);
        }
    }

    private async createUser(accountId: string, accountName: string, accessToken: string, refreshToken: string, expiryDate: Date) {
        try {
            await this._prismaService.user.upsert({
                where: {
                    spotifyUserId: accountId
                },
                create: {
                    spotifyUserId: accountId,
                    accountName,
                    spotifyAccessToken: accessToken,
                    spotifyRefreshToken: refreshToken,
                    expiryDate
                },
                update: {
                    accountName,
                    spotifyAccessToken: accessToken,
                    spotifyRefreshToken: refreshToken,
                    expiryDate
                }
            });
        } catch(error) {
            console.log(error);
        }        
    }

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

    // async accessTokenUpdate() {
    //     const refreshToken = 'my_fresh_token';
    //     const { clientId, clientSecret } = this.getClientCredentials();

    //     const response = await lastValueFrom(this._httpService.post('https://accounts.spotify.com/api/token', 
    //         new URLSearchParams({
    //             grant_type: 'refresh_token',
    //             refresh_token: refreshToken
    //         }),
    //         {
    //             headers: {
    //                 'Content-Type': 'application/x-www-form-urlencoded',
    //                 'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    //             }
    //         }
    //     ));

    //     console.log(response.data);
    // }

       
}
