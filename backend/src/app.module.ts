import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './user/auth.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './prisma/prisma.module';
import { SpotifyModule } from './spotify/spotify.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PollingModule } from './polling/polling.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), HttpModule.register({
    global: true
  }), ScheduleModule.forRoot(),
  PrismaModule, AuthModule, SpotifyModule, PollingModule]
})
export class AppModule {}
