import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service'

@Injectable()
export class TransactionReadRepository {
	constructor(private readonly prisma: PrismaService) {
	}

	async findById(id: string) {
		return this.prisma.transaction.findUnique({
			where: { transactionExternalId: id },
		});
	}

	async saveProjection(tx: any) {
		return this.prisma.transaction.upsert({
			where: { transactionExternalId: tx.transactionExternalId },
			update: {
				status: tx.status,
				value: tx.value,
				tranferTypeId: tx.tranferTypeId,
				accountExternalIdDebit: tx.accountExternalIdDebit,
				accountExternalIdCredit: tx.accountExternalIdCredit,
			},
			create: tx,
		});
	}
}
