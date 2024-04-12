import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTransactionCommand } from '../commands/create-transaction.command';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { ServicesEnum } from '../../shared/services.enum';
import { TopicsEnum } from '../../shared/topics.enum';
import { Repos } from '../../database/database.module';
import { TransactionStatusEnum } from '../../shared/transaction-status.enum';

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionHandler
  implements ICommandHandler<CreateTransactionCommand>
{
  constructor(
    @Inject(Repos.TRANSACTION_REPOSITORY)
    private transactionRepo: Repository<TransactionEntity>,
    @Inject(ServicesEnum.TRANSACTION_SERVICE)
    private client: ClientKafka,
  ) {}

  async execute(command: CreateTransactionCommand): Promise<TransactionEntity> {
    const transaction = this.transactionRepo.create({
      transferTypeId: command.transferTypeId,
      accountExternalIdCredit: command.accountExternalIdCredit,
      accountExternalIdDebit: command.accountExternalIdDebit,
      value: command.value,
      status: TransactionStatusEnum.PENDING,
    });

    await this.transactionRepo.save(transaction);

    const payload = JSON.stringify({
      transactionId: transaction.id,
      value: transaction.value,
    });

    this.client.emit(TopicsEnum.TRANSACTION_CREATED, payload);

    return transaction;
  }
}
