import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ApiModule } from '../api/api.module';
import { JwtModule } from '@nestjs/jwt';
import { jwt } from './user.constants';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [JwtModule.register({
    secret: jwt.secret,
    signOptions: {
      expiresIn: '14d'
    }
  }), ApiModule],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [UserService]
})
export class UserModule {}
