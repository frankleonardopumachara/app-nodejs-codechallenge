import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload, logLevel } from 'kafkajs';
import { TransactionReadRepository } from '../repositories/transaction-read.repository';
import { TransactionWriteRepository } from '../repositories/transaction-write.repository';

@Injectable()
export class ProjectorConsumer implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(ProjectorConsumer.name);
	private kafka: Kafka;
	private consumer: Consumer;

	private readonly brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
	private readonly validatedTopic = process.env.TRANSACTIONS_VALIDATED_TOPIC || 'transactions.validated';
	private readonly groupId = process.env.KAFKA_GROUP_ID || 'transaction-svc';

	constructor(
		private readonly readRepo: TransactionReadRepository,
		private readonly writeRepo: TransactionWriteRepository,
	) {
		this.kafka = new Kafka({
			clientId: 'transaction-svc',
			brokers: this.brokers,
			logLevel: logLevel.ERROR,
		});
		this.consumer = this.kafka.consumer({ groupId: this.groupId });
	}

	async onModuleInit() {
		await this.consumer.connect();
		await this.consumer.subscribe({ topic: this.validatedTopic, fromBeginning: false });
		this.logger.log(`Kafka consumer connected, topic=${this.validatedTopic}`);

		await this.consumer.run({
			eachMessage: async ({ message }: EachMessagePayload) => this.processMessage(message.value?.toString()),
		});
	}

	async onModuleDestroy() {
		await this.consumer.disconnect();
	}

	private async processMessage(raw?: string) {
		if (!raw) return;
		try {
			const evt = JSON.parse(raw) as { transactionId: string; status: string };
			await this.writeRepo.updateStatus(evt.transactionId, evt.status);
			const updated = await this.writeRepo.updateStatus(evt.transactionId, evt.status);
			if (updated) await this.readRepo.saveProjection(updated);
			this.logger.log(`Projected transaction ${evt.transactionId} => ${evt.status}`);
		} catch (err: any) {
			this.logger.error(`Error processing message: ${err.message}`);
		}
	}
}
