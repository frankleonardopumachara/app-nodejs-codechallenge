import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TransactionsController } from './transactions.controller';
import { CreateTransactionHandler } from './commands/create-transaction.handler';
import { GetTransactionHandler } from './queries/get-transaction.handler';
import { KafkaPublisher } from './messaging/kafka.publisher';
import { ProjectorConsumer } from './messaging/projector.consumer';
import { TransactionWriteRepository } from './repositories/transaction-write.repository';
import { TransactionReadRepository } from './repositories/transaction-read.repository';
import { PrismaService } from '../prisma.service'

@Module({
	imports: [CqrsModule],
	controllers: [TransactionsController],
	providers: [
		CreateTransactionHandler,
		GetTransactionHandler,
		KafkaPublisher,
		ProjectorConsumer,
		TransactionWriteRepository,
		TransactionReadRepository,
		PrismaService,
	],
})
export class TransactionsModule {}
