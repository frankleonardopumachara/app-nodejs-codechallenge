import { IsInt, IsNumber, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  accountExternalIdDebit: string;

  @IsUUID()
  accountExternalIdCredit: string;

  @IsInt()
  transferTypeId: number;

  @IsNumber()
  value: number;
}
