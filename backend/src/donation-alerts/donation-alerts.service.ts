import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import Centrifuge from 'centrifuge';
import XHR2 from 'xhr2';
import { AuthService } from '../user/auth.service';
import { SpotifyApiService } from '../spotify/spotify-api.service';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class DonationAlertsService implements OnModuleInit {

    private _connections = new Map<string, Centrifuge>();
    private _logger = new Logger(DonationAlertsService.name);

    constructor(private _httpService: HttpService, private _configService: ConfigService, private _authService: AuthService, 
        private _spotifyApiService: SpotifyApiService, private _socketGateway: SocketGateway) {}

    async onModuleInit() {
        const users = await this._authService.getUsersWithDonationAlerts();

        await Promise.allSettled(users.filter((user) => user.donationAlertsAccessToken).map((user) => { 
            if (user.donationAlertsAccessToken) {
                this.connectUser(user.id, user.donationAlertsAccessToken)
            }            
        }));
    }

    async connectUser(userId: string, accessToken: string) {
        const { donationAlertsUserId, socketConnectionToken } = await this.getSocketConnectionInfo(accessToken);
        const centrifuge = await this.startListening(socketConnectionToken, accessToken, donationAlertsUserId, userId);
        this._connections.set(userId, centrifuge as Centrifuge);
    }


    async exchangeCode(authorizationCode: string) {
        const response = await lastValueFrom(this._httpService.post('https://www.donationalerts.com/oauth/token', new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: this._configService.getOrThrow('DONATIONALERTS_CLIENT_ID'),
            client_secret: this._configService.getOrThrow('DONATIONALERTS_CLIENT_SECRET'),
            redirect_uri: this._configService.getOrThrow('REDIRECT_URI_DONATIONALERTS'),
            code: authorizationCode,
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }));
        
        return {            
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in
        };
    }

    async getSocketConnectionInfo(accessToken: string) {
        const response = await lastValueFrom(this._httpService.get('https://www.donationalerts.com/api/v1/user/oauth',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        ));

        return {
            donationAlertsUserId: response.data.data.id,
            socketConnectionToken: response.data.data.socket_connection_token
        };
    }


    async startListening(socketConnectionToken: string, accessToken: string, donationAlertsUserId: string, userId: string) {
        const centrifuge = new Centrifuge('wss://centrifugo.donationalerts.com/connection/websocket', {
            subscribeEndpoint: 'https://www.donationalerts.com/api/v1/centrifuge/subscribe',
            subscribeHeaders: {
                Authorization: `Bearer ${accessToken}`
            },
            xmlhttprequest: XHR2
        });

        centrifuge.setToken(socketConnectionToken);

        return new Promise((resolve, reject) => {
            centrifuge.on('connect', () => {
                this._logger.log('Подключено к Centrifugo');
            });

            centrifuge.on('error', (err) => {
                this._logger.log('Ошибка Centrifugo:', err);
            });

            centrifuge.on('disconnected', (ctx) => {
                this._logger.log('Отключились:', ctx);
            });

            const sub = centrifuge.subscribe(`$alerts:donation_${donationAlertsUserId}`, async (message) => {                                

                // if (message.data.amount < 100) {
                //     this._logger.log(`Донат от ${message.data.username} слишком мал для заказа трека (${message.data.amount})`);
                //     return { success: true, message: 'Донат обработан без заказа трека' };
                // }

                const match = this.extractSpotifyTrackId(message.data.message);
                if (!match) {
                    this._logger.log('В сообщении доната нет валидной ссылки на Spotify');
                    return {
                        success: true,
                        message: 'Нет ссылки'
                    }
                }
                
                const trackId = match[1];
                this._logger.log(`Найден трек для заказа: ${trackId}`);

                try {
                    await this._spotifyApiService.addToQueue(userId, trackId);
                    this._logger.log(`Трек ${trackId} добавлен в очередь`);
                } catch(error) {
                    this._logger.warn('Не удалось добавить трек в очередь:', error);
                }
                
                const trackTitle = await this._spotifyApiService.getTrackInfo(userId, trackId);
                console.log(trackTitle);
                const trackData = {
                    subscriberName: message.data.username,
                    trackTitle,
                    amount: message.data.amount
                }

                const { spotifyUserId } = await this._authService.getUser(userId);

                this._socketGateway.broadcast('track_ordered', spotifyUserId, trackData)
            });

            sub.on('subscribe', () => {
                this._logger.log('Подписка на канал прошла успешно');
                resolve(centrifuge);
            });

            sub.on('error', (err) => {
                this._logger.log('Ошибка подписки:', err);
                reject(err);
            });

            centrifuge.connect();
        });
    }

    extractSpotifyTrackId(text: string) {
        const match = text.match(/open\.spotify\.com\/track\/([a-z0-9]+)/i)
       return match ? match : null;
    }
}