import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';

export enum Repos {
  TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY',
}

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_PORT,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [TransactionEntity],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
  {
    provide: Repos.TRANSACTION_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(TransactionEntity),
    inject: ['DATA_SOURCE'],
  },
];

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
