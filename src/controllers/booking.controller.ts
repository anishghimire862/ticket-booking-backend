import type { Request, Response } from 'express'
import { AppDataSource } from '../data-source.ts'
import { BookingEntity } from '../entities/booking.entity.ts'
import { TicketInventoryEntity } from '../entities/ticket-inventory.entity.ts'
import { TicketTierEntity } from '../entities/ticket-tier.entity.ts'
import { BookingItemEntity } from '../entities/booking-item.entity.ts'
import type { CreateBookingBody, PaymentCreateInput } from '../types.ts'
import { processPayment } from '../services/payment.js'

export const createBooking = async (
  req: Request<Record<string, never>, unknown, CreateBookingBody>,
  res: Response,
) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing' })
  }

  const { userId, tierId, quantity, idempotencyKey, payment } = req.body
  if (
    !userId ||
    !tierId ||
    !quantity ||
    !idempotencyKey ||
    !payment ||
    !payment.paymentMethod ||
    !payment.cardName ||
    !payment.cardNumber
  ) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  const queryRunner = AppDataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    const existingBooking = await queryRunner.manager.getRepository(BookingEntity).findOne({
      where: { idempotencyKey },
      relations: ['bookingItems'],
    })
    if (existingBooking) {
      return res.json(existingBooking)
    }

    const inventory = await queryRunner.manager
      .getRepository(TicketInventoryEntity)
      .createQueryBuilder('inventory')
      .where('inventory.tierId = :tierId', { tierId })
      .setLock('pessimistic_write')
      .getOne()

    if (!inventory) {
      throw new Error(`Inventory not found for tier ${tierId}`)
    }

    if (quantity > inventory.availableQuantity) {
      throw new Error(
        `Not enough tickets available. Requested: ${quantity}, Available: ${inventory.availableQuantity}`,
      )
    }

    inventory.availableQuantity -= quantity
    inventory.reservedQuantity += quantity
    await queryRunner.manager.save(inventory)

    const tier = await queryRunner.manager.findOne(TicketTierEntity, { where: { id: tierId } })
    if (!tier) {
      return res.status(404).json({ message: 'Ticket tier not found' })
    }
    const totalAmountCents = tier.priceCents * quantity

    const booking = queryRunner.manager.getRepository(BookingEntity).create({
      userId,
      eventId: tier.eventId,
      idempotencyKey,
      status: 'PENDING_PAYMENT',
      totalAmountCents,
    })
    await queryRunner.manager.save(booking)

    const bookingItem = queryRunner.manager.getRepository(BookingItemEntity).create({
      bookingId: booking.id,
      tierId,
      quantity,
      lineTotalCents: totalAmountCents,
    })
    await queryRunner.manager.save(bookingItem)

    const paymentDetails: PaymentCreateInput = {
      bookingId: booking.id,
      paymentMethod: payment.paymentMethod,
      cardName: payment.cardName,
      cardNumber: payment.cardNumber,
      amountCents: totalAmountCents,
    }
    const paymentEntity = await processPayment(queryRunner, paymentDetails)

    booking.status = paymentEntity.status === 'SUCCESS' ? 'CONFIRMED' : 'FAILED'
    await queryRunner.manager.save(booking)

    if (paymentEntity.status === 'FAILED') {
      inventory.availableQuantity += quantity
      inventory.reservedQuantity -= quantity
      await queryRunner.manager.save(inventory)
    }

    await queryRunner.commitTransaction()

    const fullBooking = await queryRunner.manager.findOne(BookingEntity, {
      where: { id: booking.id },
      relations: ['bookingItems'],
    })

    return res.status(201).json({ booking: fullBooking, payment: paymentEntity })
  } catch (error) {
    const e = error as Error
    await queryRunner.rollbackTransaction()
    console.error('Booking failed:', error)
    return res.status(400).json({ message: e.message || 'Booking failed' })
  } finally {
    await queryRunner.release()
  }
}
