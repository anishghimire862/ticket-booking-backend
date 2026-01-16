export interface PaymentInput {
  paymentMethod: string
  cardName: string
  cardNumber: string
  amountCents: number
}

export interface CreateBookingBody {
  userId: number
  tierId: number
  quantity: number
  idempotencyKey: string
  payment: PaymentInput
}

export interface PaymentCreateInput extends PaymentInput {
  bookingId: number
}
