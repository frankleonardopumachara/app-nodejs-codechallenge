import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTransactionCommand } from './create-transaction.command';
import { TransactionWriteRepository } from '../repositories/transaction-write.repository';
import { KafkaPublisher } from '../messaging/kafka.publisher';
import { randomUUID } from 'crypto';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand> {
	constructor(
		private readonly repo: TransactionWriteRepository,
		private readonly publisher: KafkaPublisher,
	) {}

	async execute(command: CreateTransactionCommand) {
		const id = randomUUID();

		const tx = await this.repo.save({
			transactionExternalId: id,
			accountExternalIdDebit: command.accountExternalIdDebit,
			accountExternalIdCredit: command.accountExternalIdCredit,
			tranferTypeId: command.tranferTypeId,
			value: command.value,
			status: 'pending',
			createdAt: new Date().toISOString(),
		});

		await this.publisher.publishCreated({
			transactionId: id,
			value: command.value,
		});

		return tx;
	}
}
