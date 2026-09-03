import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './user/auth.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './prisma/prisma.module';
import { SpotifyModule } from './spotify/spotify.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PollingModule } from './polling/polling.module';
import { SessionModule } from './session/session.module';
import { TrackHistoryModule } from './track-history/track-history.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), HttpModule.register({
    global: true
  }), ScheduleModule.forRoot(),
  PrismaModule, AuthModule, SpotifyModule, PollingModule, SessionModule, TrackHistoryModule]
})
export class AppModule {}
