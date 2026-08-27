import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ApiService {

    constructor(private readonly _httpService: HttpService) {}

    async getMyProfile(accessToken: string) {
        const response = await lastValueFrom(this._httpService.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        }));
    
        return {
            accountId: response.data['account_id'],
            accountName: response.data['display_name']
        }    
    } 
}
