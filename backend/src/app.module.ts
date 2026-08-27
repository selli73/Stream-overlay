import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './prisma/prisma.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), HttpModule.register({
    global: true
  }), PrismaModule, UserModule, ApiModule]
})
export class AppModule {}
