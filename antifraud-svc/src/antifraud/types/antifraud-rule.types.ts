export type ValidationResult = 'approved' | 'rejected';

export interface TransactionCreatedEvent {
	transactionId: string;
	value: number;
}

export interface TransactionValidatedEvent {
	transactionId: string;
	status: ValidationResult;
}

export function applyAntiFraudRules(value: number): ValidationResult {
	return Number(value) > 1000 ? 'rejected' : 'approved';
}
