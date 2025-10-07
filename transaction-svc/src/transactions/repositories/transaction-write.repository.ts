import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service'

@Injectable()
export class TransactionWriteRepository {
	constructor(private readonly prisma: PrismaService) {
	}

	async save(tx: any) {
		return this.prisma.transaction.create({ data: tx });
	}

	async updateStatus(id: string, status: string) {
		return this.prisma.transaction.update({
			where: { transactionExternalId: id },
			data: { status },
		});
	}
}
