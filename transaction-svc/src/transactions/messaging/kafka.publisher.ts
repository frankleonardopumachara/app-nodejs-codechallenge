import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, logLevel } from 'kafkajs';

@Injectable()
export class KafkaPublisher implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(KafkaPublisher.name);
	private kafka: Kafka;
	private producer: Producer;

	private readonly brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
	private readonly createdTopic = process.env.TRANSACTIONS_CREATED_TOPIC || 'transactions.created';

	constructor() {
		this.kafka = new Kafka({
			clientId: 'transaction-svc',
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

	async publishCreated(evt: { transactionId: string; value: number }) {
		await this.producer.send({
			topic: this.createdTopic,
			messages: [{ key: evt.transactionId, value: JSON.stringify(evt) }],
		});
		this.logger.log(`→ published ${this.createdTopic}: ${evt.transactionId}`);
	}
}
