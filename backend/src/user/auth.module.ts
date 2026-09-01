import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwt } from './user.constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { SpotifyModule } from '../spotify/spotify.module';

@Module({
  imports: [JwtModule.register({
    secret: jwt.secret,
    signOptions: {
      expiresIn: '14d'
    }
  }), SpotifyModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
