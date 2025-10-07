import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTransactionQuery } from './get-transaction.query';
import { TransactionReadRepository } from '../repositories/transaction-read.repository';

@QueryHandler(GetTransactionQuery)
export class GetTransactionHandler implements IQueryHandler<GetTransactionQuery> {
	constructor(private readonly repo: TransactionReadRepository) {}

	async execute(query: GetTransactionQuery) {
		return this.repo.findById(query.id);
	}
}
