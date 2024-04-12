import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { runFraudMicroservice } from './antifraud-microservice';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {},
  });

  await app.startAllMicroservices();
  await app.listen(process.env.SERVER_PORT);

  // iniciar el microserivios de fraudes
  runFraudMicroservice().catch(console.log);
}

bootstrap();
