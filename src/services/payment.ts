import type { QueryRunner } from 'typeorm'
import { PaymentEntity } from '../entities/payment.entity.ts'
import type { PaymentCreateInput } from '../types.ts'

export const processPayment = async (
  queryRunner: QueryRunner,
  paymentInput: PaymentCreateInput,
): Promise<PaymentEntity> => {
  const { bookingId, paymentMethod, cardName, cardNumber, amountCents } = paymentInput

  const last4 = cardNumber.slice(-4)
  const isSuccess = cardNumber === '4242424242424242'

  const paymentStatus = isSuccess ? 'SUCCESS' : 'FAILED'

  const paymentRepo = queryRunner.manager.getRepository(PaymentEntity)
  const paymentEntity = paymentRepo.create({
    bookingId,
    paymentMethod,
    cardName,
    cardLast4: last4,
    amountCents,
    status: paymentStatus,
    reference: isSuccess ? 'SIMULATED_REF_123' : null,
    errorMessage: isSuccess ? null : 'Payment declined (simulated)',
  })

  await paymentRepo.save(paymentEntity)
  return paymentEntity
}
