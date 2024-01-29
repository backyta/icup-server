import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SuperUserService } from './utils/create-super-user';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const superUserService = app.get(SuperUserService);
  await superUserService.createSuperUser();

  await app.listen(process.env.PORT);
  logger.log(`App running in port ${process.env.PORT}`);
}
bootstrap();
