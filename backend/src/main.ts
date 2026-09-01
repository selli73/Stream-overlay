import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { frontendIp, frontendUrl } from './socket/frontend.constant';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: [frontendIp, frontendUrl]
  })

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
