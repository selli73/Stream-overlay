import { Module } from '@nestjs/common';
import { UserService } from './user.service';
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
  providers: [UserService, JwtStrategy],
  exports: [UserService]
})
export class AuthModule {}
