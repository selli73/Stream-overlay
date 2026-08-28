import { HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { IResponseUpdateAccessToken, ISpotifyAuthUrl } from './typings/user';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { ApiService } from '../api/api.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {

    constructor(private _configService: ConfigService, private _prismaService: PrismaService,
        private readonly _httpService: HttpService, private _apiService: ApiService, private _jwtService: JwtService) {}    

    async getAccessRefreshTokenSpotify(authorizationCode: string) {
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
            
            return {
                accountId,
                accountName,
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

    async createUser(accountId: string, accountName: string, spotifyAccessToken: string, spotifyRefreshToken: string, expiryDate: Date) {
        try {
            const user = await this._prismaService.user.upsert({
                where: {
                    spotifyUserId: accountId
                },
                create: {
                    spotifyUserId: accountId,
                    accountName,
                    spotifyAccessToken,
                    spotifyRefreshToken: spotifyRefreshToken,
                    expiryDate
                },
                update: {
                    accountName,
                    spotifyAccessToken,
                    spotifyRefreshToken: spotifyRefreshToken,
                    expiryDate
                }
            });

            return this.generateToken(user.id);
        } catch(error: any) {
            if (error instanceof HttpException) {
                throw new InternalServerErrorException(error.message);
            }
            throw new InternalServerErrorException('Server-side error');
        }        
    }

    async getValidAccessToken(userId: string) {
        try {
            const user = await this._prismaService.user.findUnique({
                where: {
                    id: userId
                }
            });

            if (!user || !user.spotifyAccessToken) {
                throw new UnauthorizedException('Вы не авторизованы')
            }

            const now = new Date();
            now.setSeconds(now.getSeconds() + 45);

            if (now >= user.expiryDate) {
                // истек access_token
                await this.accessTokenUpdate(user.spotifyRefreshToken);
            } else {
                // не истек
            }
        } catch(error) {
            // if (error instanceof HttpException) {
            //     throw new InternalServerErrorException(error.message);
            // }
            // throw new InternalServerErrorException('Server-side error');
        }
        
    }

    private generateToken(userId: string) {
        const payload = {
            sub: userId
        };

        return {
            access_token: this._jwtService.sign(payload)
        };
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

    async accessTokenUpdate(refreshToken: string): Promise<IResponseUpdateAccessToken | undefined> {
        try {

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


            console.log(response);

            return response.data;
        } catch(error) {
            console.log(error);
        }
    }

       
}
