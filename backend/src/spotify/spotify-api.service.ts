import { HttpService } from "@nestjs/axios";
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import { lastValueFrom } from "rxjs";
import { SpotifyTokenService } from "./spotify-token.service";

@Injectable()
export class SpotifyApiService {

    constructor(private _httpService: HttpService, private _spotifyTokenService: SpotifyTokenService) {}

    async getProfile(spotifyAccessToken: string) {            
        try {            
            const response = await lastValueFrom(this._httpService.get('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }));
            return {
                account_id: response.data.account_id,
                display_name: response.data.display_name
            };            
        } catch(error: unknown) {
            throw error;
        }
    }

    async getProfileById(userId: string){
        const spotifyAccessToken = await this._spotifyTokenService.getValidAccessToken(userId);

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
                const updatedToken = await this._spotifyTokenService.getValidAccessToken(userId, true);

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

    async getCurrentlyPlaying(userId: string) {
        const spotifyAccessToken = await this._spotifyTokenService.getValidAccessToken(userId);   

        try {
            const response = await lastValueFrom(this._httpService.get('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: {
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }));

            if (response.status === 204) {
                return null;
            }

            return response.data;
        } catch(error) {            
            if (axios.isAxiosError(error) && error.response?.status === 401) {

                const updatedToken = await this._spotifyTokenService.getValidAccessToken(userId, true);

                const retryResponse = await lastValueFrom(this._httpService.get('https://api.spotify.com/v1/me/player/currently-playing', {
                    headers: {
                        'Authorization': 'Bearer ' + updatedToken
                    }
                }));

                if (retryResponse.status === 204) {
                    return null;
                }

                return retryResponse.data;
            }

            if (axios.isAxiosError(error) && error.response?.status === 403) {
                throw new ForbiddenException('Контент недоступен в регионе аккаунта');                
            }

            throw error;
        }
    }

    async getTrackInfo(userId: string, spotifyTrackId: string) {
        const spotifyAccessToken = await this._spotifyTokenService.getValidAccessToken(userId);

        try {
            const response = await lastValueFrom(this._httpService.get(`https://api.spotify.com/v1/tracks/${spotifyTrackId}`, {
                headers: {
                    'Authorization': `Bearer ${spotifyAccessToken}`
                }
            }));

            return response.data.name;
        } catch(error) {
           throw new InternalServerErrorException('Неизвестная ошибка');
        }
    }

    async addToQueue(userId: string, spotifyTrackId: string) {        
        const spotifyAccessToken = await this._spotifyTokenService.getValidAccessToken(userId);

        try {
            await lastValueFrom(
                this._httpService.post(`https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${spotifyTrackId}`, null,
                { headers: { 'Authorization': `Bearer ${spotifyAccessToken}` } }
            ));
        } catch(error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                throw new BadRequestException('Spotify сейчас не воспроизводится у стримера');
            }
            throw error;
        }
    }
}