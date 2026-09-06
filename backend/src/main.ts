import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { frontendIp, frontendUrl } from './socket/frontend.constant';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: [frontendIp, frontendUrl]
  })

  const config = new DocumentBuilder()
    .setTitle('Stream-overlay')
    .setDescription('API documentation for the overlay')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalResponse({ status: 500, description: 'Internal server error' })
    .addGlobalResponse({ status: 400, description: 'Bad request' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
