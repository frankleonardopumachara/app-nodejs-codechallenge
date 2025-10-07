import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });
  const onSig = async () => {
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', onSig);
  process.on('SIGTERM', onSig);
}
bootstrap();
