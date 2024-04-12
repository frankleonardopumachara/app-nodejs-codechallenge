import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TransactionController } from './controllers/transaction.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServicesEnum } from '../shared/services.enum';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateTransactionHandler } from './handlers/create-transaction.handler';
import { GetTransactionHandler } from './handlers/get-transaction.handler';

@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    ClientsModule.register([
      {
        name: ServicesEnum.TRANSACTION_SERVICE,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'transaction',
            brokers: [process.env.BROKER_SERVER],
          },
          consumer: {
            groupId: 'transaction-consumer',
          },
          subscribe: {
            fromBeginning: true,
          },
        },
      },
    ]),
  ],
  controllers: [TransactionController],
  providers: [GetTransactionHandler, CreateTransactionHandler],
})
export class TransactionsModule {}
