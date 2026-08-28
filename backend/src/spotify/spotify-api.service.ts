// import { Injectable } from "@nestjs/common";

// @Injectable()
// export class SpotifyApiService {
//     async getMyProfileById(accessToken: string) {
//         const spotifyAccessToken = await this.getValidAccessToken(userId);            

//         try {
//             const response = await lastValueFrom(this._httpService.get('https://api.spotify.com/v1/me', {
//                 headers: {
//                     'Authorization': 'Bearer ' + spotifyAccessToken
//                 }
//             }));

//             return response.data;
//         } catch(error: unknown) {
//             if (axios.isAxiosError(error) && error.response?.status === 401) {
//                 // токен оказался невалидным раньше срока
                
//                 const updatedToken = await this.getValidAccessToken(userId, true);

//                 const retryResponse  = await lastValueFrom(this._httpService.get('https://api.spotify.com/v1/me', {
//                     headers: {
//                         'Authorization': 'Bearer ' + updatedToken
//                     }
//                 }));

//                 return retryResponse.data;
//             }

//             if (axios.isAxiosError(error) && error.response?.status === 403) {
//                 throw new ForbiddenException('Контент недоступен в регионе аккаунта');                
//             }

//             throw error;
//         }
//     } 
// }