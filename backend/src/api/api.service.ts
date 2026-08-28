import { HttpService } from '@nestjs/axios';
import { ForbiddenException, HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ApiService {

    constructor(private _configService: ConfigService, private readonly _httpService: HttpService, private _prismaService: PrismaService) {}

    async getMyProfileById(userId: string) {
        const spotifyAccessToken = await this.getValidAccessToken(userId);            

        try {
            const response = await lastValueFrom(this._httpService.get('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }));

            return response.data;
        } catch(error: unknown) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                // токен оказался невалидным раньше срока
                
                const updatedToken = await this.getValidAccessToken(userId, true);

                const retryResponse  = await lastValueFrom(this._httpService.get('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': 'Bearer ' + updatedToken
                    }
                }));

                return retryResponse.data;
            }

            if (axios.isAxiosError(error) && error.response?.status === 403) {
                throw new ForbiddenException('Контент недоступен в регионе аккаунта');                
            }

            throw error;
        }
    } 

    async getMyProfile(accessToken: string) {
        try {
            const response = await lastValueFrom(this._httpService.get('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            }));
    
            return {
                accountId: response.data['account_id'],
                accountName: response.data['display_name']
            }
        } catch(error) {
            if (error instanceof HttpException) {
                throw new InternalServerErrorException(error.message);
            }
            throw new InternalServerErrorException('Server-side error');
        }            
    } 

    async getValidAccessToken(userId: string, forceRefresh = false): Promise<string> {
        const user = await this._prismaService.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user || !user.spotifyAccessToken) {
            throw new UnauthorizedException('Вы не авторизованы')
        }

        const isExpired = new Date() >= new Date(user.expiryDate.getTime() - 60000)
        if (!isExpired && !forceRefresh) {
            return user.spotifyAccessToken                
        }

        const { spotifyAccessToken, expiryDate } = await this.accessTokenUpdate(user.spotifyRefreshToken);

        await this._prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                spotifyAccessToken,
                expiryDate
            }
        });

        return spotifyAccessToken;
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

    private getClientCredentials() {
        return {
            clientId: this._configService.getOrThrow('CLIENT_ID'),
            clientSecret: this._configService.getOrThrow('CLIENT_SECRET')
        };
    }
}
