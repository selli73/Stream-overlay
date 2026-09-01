import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthService } from '../user/auth.service';
import { SpotifyApiService } from '../spotify/spotify-api.service';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class PollingService {    
    private _logger = new Logger(PollingService.name);
    private _lastTracksId = new Map<string, string | null>();
    
    constructor(private _authService: AuthService, private _spotifyApiService: SpotifyApiService, private _socketGateway: SocketGateway) {}

    @Cron("*/3 * * * * *")
    async pollAllUsers() {
        const users = await this._authService.getAllUsers();

        await Promise.allSettled(users.map(
            user => this.checkUserCurrentTrack(user.id, user.spotifyUserId)
        ));
    }

    async checkUserCurrentTrack(userId: string, spotifyUserId: string) {
        try {
            const track  = await this._spotifyApiService.getCurrentlyPlaying(userId);
            const currentTrackId = track?.item?.id ?? null;
            const lastTrackId = this._lastTracksId.get(spotifyUserId);

            if (currentTrackId !== lastTrackId) {
                this._socketGateway.broadcast(spotifyUserId, track)
                
                this._lastTracksId.set(spotifyUserId, currentTrackId);
                
                this._logger.log(`Трек сменился у пользователя с id ${spotifyUserId}: ${track?.item?.name ?? 'ничего не играет'}`);
            }
        } catch(error) {
            this._logger.warn(`Ошибка получения трека для юзера ${spotifyUserId}:`, error)
        }        
    }
}
