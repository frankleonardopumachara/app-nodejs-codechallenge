import { GetTransactionQuery } from '../queries/get-transaction.query';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { Inject } from '@nestjs/common';
import { Repos } from '../../database/database.module';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(GetTransactionQuery)
export class GetTransactionHandler
  implements IQueryHandler<GetTransactionQuery>
{
  constructor(
    @Inject(Repos.TRANSACTION_REPOSITORY)
    private transactionRepo: Repository<TransactionEntity>,
  ) {}

  async execute(query: GetTransactionQuery): Promise<any> {
    const transaction = await this.transactionRepo.findOne({
      where: { id: query.transactionId },
    });

    return {
      transactionExternalId: transaction.id,
      transactionType: {
        name: transaction.transferTypeId,
      },
      transactionStatus: {
        name: transaction.status,
      },
      value: transaction.value,
      createdAt: transaction.createdAt,
    };
  }
}
