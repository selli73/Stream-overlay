import { Module } from '@nestjs/common';
import { PollingService } from './polling.service';
import { AuthModule } from '../user/auth.module';
import { SpotifyModule } from '../spotify/spotify.module';
import { SocketGateway } from '../socket/socket.gateway';

@Module({
  imports: [AuthModule, SpotifyModule],
  providers: [PollingService, SocketGateway],
})
export class PollingModule {}
