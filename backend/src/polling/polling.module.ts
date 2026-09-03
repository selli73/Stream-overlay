import { Module } from '@nestjs/common';
import { PollingService } from './polling.service';
import { AuthModule } from '../user/auth.module';
import { SpotifyModule } from '../spotify/spotify.module';
import { SocketGateway } from '../socket/socket.gateway';
import { TrackHistoryModule } from '../track-history/track-history.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [AuthModule, SpotifyModule, SessionModule, TrackHistoryModule],
  providers: [PollingService, SocketGateway],
})
export class PollingModule {}
