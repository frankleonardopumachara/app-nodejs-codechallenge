import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, logLevel, Producer } from 'kafkajs'
import { TransactionValidatedEvent } from '../types/antifraud-rule.types'

@Injectable()
export class KafkaPublisher implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(KafkaPublisher.name);
	private kafka: Kafka;
	private producer: Producer;
	private readonly brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
	private readonly validatedTopic = process.env.TRANSACTIONS_VALIDATED_TOPIC || 'transactions.validated';

	constructor() {
		this.kafka = new Kafka({
			clientId: 'antifraud-svc',
			brokers: this.brokers,
			logLevel: logLevel.ERROR,
		});
		this.producer = this.kafka.producer();
	}

	async onModuleInit() {
		await this.producer.connect();
		this.logger.log(`Kafka producer connected → ${this.brokers.join(',')}`);
	}

	async onModuleDestroy() {
		await this.producer.disconnect();
	}

	async publishValidated(evt: TransactionValidatedEvent) {
		await this.producer.send({
			topic: this.validatedTopic,
			messages: [{ key: evt.transactionId, value: JSON.stringify(evt) }],
		});
		this.logger.log(`→ published ${this.validatedTopic}: ${evt.transactionId} = ${evt.status}`);
	}
}
