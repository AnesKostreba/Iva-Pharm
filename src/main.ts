import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { StorageConfig } from 'config/storage.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(StorageConfig.photo.destination, {
    prefix: StorageConfig.photo.urlPrefix,
    maxAge: StorageConfig.photo.maxAge,
    index: false,
  })

  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000);
}
bootstrap();
