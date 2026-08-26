import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), HttpModule.register({
    global: true
  }), UserModule]
})
export class AppModule {}
