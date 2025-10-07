import { Module } from '@nestjs/common';
import { AntiFraudModule } from './antifraud/antifraud.module';

@Module({
  imports: [AntiFraudModule],
})
export class AppModule {}
