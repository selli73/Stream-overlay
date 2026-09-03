import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthService } from '../user/auth.service';
import { SpotifyApiService } from '../spotify/spotify-api.service';
import { SocketGateway } from '../socket/socket.gateway';
import { IPlaybackData } from './typings';
import { SessionService } from '../session/session.service';
import { TrackHistoryService } from '../track-history/track-history.service';

@Injectable()
export class PollingService {    
    private _logger = new Logger(PollingService.name);
    private _lastTracksId = new Map<string, string | null>();
    
    constructor(private _authService: AuthService, private _spotifyApiService: SpotifyApiService, private _socketGateway: SocketGateway, 
        private _sessionService: SessionService, private _trackHistoryService: TrackHistoryService) {}

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
            const trackData = this.mapTrackData(track);           
            if (currentTrackId !== lastTrackId) {
                this._socketGateway.broadcast(spotifyUserId, trackData);
                
                const session = await this._sessionService.getStatusSession(userId);
                if (session.sessionId && trackData) {
                    try {
                        await this._trackHistoryService.recordTrack(session.sessionId, trackData);
                    } catch(error) {
                        this._logger.warn(`Не удалось записать трек в историю для ${spotifyUserId}:`, error)
                    }                    
                }                                                                
                
                this._lastTracksId.set(spotifyUserId, currentTrackId);                
                this._logger.log(`Трек сменился у пользователя с id ${spotifyUserId}: ${track?.item?.name ?? 'ничего не играет'}`);
            }
        } catch(error) {
            this._logger.warn(`Ошибка получения трека для юзера ${spotifyUserId}:`, error)
        }        
    }

    mapTrackData(track: any): IPlaybackData | null {
        if (!track?.item) {
            return null
        }

        return {
            idTrack: track.item.id,
            is_playing: track.is_playing,
            progress_ms: track.progress_ms,
            image: track.item.album.images[1]?.url ?? track.item.album.images[0]?.url ?? '',
            artists: track.item.artists.map(art => art.name),
            duration_ms: track.item.duration_ms,
            trackTitle: track.item.name
        };
    }
}