import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { CreateTransactionCommand } from './commands/create-transaction.command';
import { GetTransactionQuery } from './queries/get-transaction.query';

@Controller('transactions')
export class TransactionsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
	) {}

	@Post()
	async create(@Body() dto: CreateTransactionDto) {
		return this.commandBus.execute(
			new CreateTransactionCommand(
				dto.accountExternalIdDebit,
				dto.accountExternalIdCredit,
				dto.tranferTypeId,
				dto.value,
			),
		);
	}

	@Get(':id')
	async get(@Param('id') id: string) {
		return this.queryBus.execute(new GetTransactionQuery(id));
	}
}
