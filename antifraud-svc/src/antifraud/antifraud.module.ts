import { Module } from '@nestjs/common';
import { AntiFraudService } from './services/antifraud.service';
import { AntiFraudConsumer } from './consumers/antifraud.consumer';
import { KafkaPublisher } from './messaging/kafka.publisher';

@Module({
	providers: [
		AntiFraudService,
		KafkaPublisher,
		AntiFraudConsumer,
	],
})
export class AntiFraudModule {}
