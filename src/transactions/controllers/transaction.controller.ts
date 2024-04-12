import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateTransactionDto } from '../dtos/create-transacion.dto';
import { CreateTransactionCommand } from '../commands/create-transaction.command';
import { EventPattern, Payload, Transport } from '@nestjs/microservices';
import { TopicsEnum } from '../../shared/topics.enum';
import { Repos } from '../../database/database.module';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../../database/entities/transaction.entity';
import { GetTransactionQuery } from '../queries/get-transaction.query';

@Controller('transaction')
export class TransactionController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    @Inject(Repos.TRANSACTION_REPOSITORY)
    private transactionRepo: Repository<TransactionEntity>,
  ) {}

  @Get(':transactionId')
  getTransaction(@Param('transactionId', ParseIntPipe) transactionId: number) {
    return this.queryBus.execute(new GetTransactionQuery(transactionId));
  }

  @Post()
  createTransaction(@Body() dto: CreateTransactionDto) {
    const command = new CreateTransactionCommand(
      dto.accountExternalIdDebit,
      dto.accountExternalIdCredit,
      dto.transferTypeId,
      dto.value,
    );
    return this.commandBus.execute(command);
  }

  @EventPattern(TopicsEnum.TRANSACTION_STATUS, Transport.KAFKA)
  async handleTransactionStatusChanged(
    @Payload() data: Record<string, any>,
  ): Promise<void> {
    const transaction = await this.transactionRepo.findOne({
      where: { id: data.transactionId },
    });

    transaction.status = data.status.name;

    await this.transactionRepo.save(transaction);
  }
}
