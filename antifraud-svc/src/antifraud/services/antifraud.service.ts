import { Injectable, Logger } from '@nestjs/common'
import { applyAntiFraudRules, ValidationResult } from '../types/antifraud-rule.types'

@Injectable()
export class AntiFraudService {
	private readonly logger = new Logger(AntiFraudService.name)

	decide(value: number): ValidationResult {
		const result = applyAntiFraudRules(value)
		this.logger.log(`AntiFraud decision for value=${ value }: ${ result }`)
		return result
	}
}
