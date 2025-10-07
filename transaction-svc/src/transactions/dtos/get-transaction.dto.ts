export class GetTransactionDto {
	transactionExternalId: string;
	value: number;
	status: 'pending' | 'approved' | 'rejected';
	createdAt: string;
}
