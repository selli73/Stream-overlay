import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './user/auth.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './prisma/prisma.module';
import { SpotifyModule } from './spotify/spotify.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), HttpModule.register({
    global: true
  }), PrismaModule, AuthModule, SpotifyModule]
})
export class AppModule {}
