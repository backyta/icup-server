import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SuperUserService } from './utils/create-super-user';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  //* Config SuperUser
  const superUserService = app.get(SuperUserService);
  await superUserService.createSuperUser();

  //* Config Documentation
  const config = new DocumentBuilder()
    .setTitle('ICUP Restful API')
    .setDescription('Icup sever endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
  logger.log(`App running in port ${process.env.PORT}`);
}
bootstrap();
