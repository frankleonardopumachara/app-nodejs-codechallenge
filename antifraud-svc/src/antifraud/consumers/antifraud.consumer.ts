import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, EachMessagePayload, Kafka, logLevel } from 'kafkajs'
import { AntiFraudService } from '../services/antifraud.service'
import { KafkaPublisher } from '../messaging/kafka.publisher'
import { TransactionCreatedEvent } from '../types/antifraud-rule.types'

@Injectable()
export class AntiFraudConsumer implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(AntiFraudConsumer.name);
	private kafka: Kafka;
	private consumer: Consumer;

	private readonly brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
	private readonly createdTopic = process.env.TRANSACTIONS_CREATED_TOPIC || 'transactions.created';
	private readonly groupId = process.env.KAFKA_GROUP_ID || 'antifraud-svc';

	constructor(
		private readonly antiFraud: AntiFraudService,
		private readonly publisher: KafkaPublisher,
	) {
		this.kafka = new Kafka({
			clientId: 'antifraud-svc',
			brokers: this.brokers,
			logLevel: logLevel.ERROR,
		});
		this.consumer = this.kafka.consumer({ groupId: this.groupId });
	}

	async onModuleInit() {
		await this.consumer.connect();
		await this.consumer.subscribe({ topic: this.createdTopic, fromBeginning: false });
		this.logger.log(`Kafka consumer connected → ${this.brokers.join(',')}, topic=${this.createdTopic}, group=${this.groupId}`);

		await this.consumer.run({
			eachMessage: async (payload: EachMessagePayload) => this.processMessage(payload),
		});
	}

	async onModuleDestroy() {
		await this.consumer.disconnect();
	}

	private async processMessage({ message }: EachMessagePayload) {
		try {
			const raw = message.value?.toString();
			if (!raw) return;

			const evt = JSON.parse(raw) as TransactionCreatedEvent;
			const decision = this.antiFraud.decide(evt.value);

			await this.publisher.publishValidated({
				transactionId: evt.transactionId,
				status: decision,
			});

			this.logger.log(`Validated ${evt.transactionId} => ${decision}`);
		} catch (err: any) {
			this.logger.error(`Error processing message: ${err?.message || err}`);
		}
	}
}
