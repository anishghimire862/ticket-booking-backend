import type { Request, Response } from 'express'
import { AppDataSource } from '../data-source.ts'
import { BookingEntity } from '../entities/booking.entity.ts'
import { TicketInventoryEntity } from '../entities/ticket-inventory.entity.ts'
import { TicketTierEntity } from '../entities/ticket-tier.entity.ts'
import { BookingItemEntity } from '../entities/booking-item.entity.ts'
import type { CreateBookingBody, PaymentCreateInput } from '../types.ts'
import { processPayment } from '../services/payment.js'
import { In } from 'typeorm'

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

  if (quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' })
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

    const tier = await queryRunner.manager.findOne(TicketTierEntity, { where: { id: tierId } })
    if (!tier) {
      return res.status(404).json({ message: 'Ticket tier not found' })
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

    const tiers = await queryRunner.manager.find(TicketTierEntity, {
      where: { eventId: tier.eventId },
    })
    const inventoryRepo = AppDataSource.getRepository(TicketInventoryEntity)
    const inventoryList = await inventoryRepo.findBy({
      tierId: In(tiers.map((t) => t.id)),
    })
    const tiersWithAvailability = tiers.map((t) => {
      const inv = inventoryList.find((i) => i.tierId === t.id)
      return {
        id: t.id,
        code: t.code,
        displayName: t.displayName,
        priceCents: t.priceCents,
        availableQuantity: inv ? inv.availableQuantity : 0,
      }
    })

    return res.status(201).json({
      booking: fullBooking,
      payment: paymentEntity,
      tiers: tiersWithAvailability,
    })
  } catch (error) {
    const e = error as Error
    await queryRunner.rollbackTransaction()
    console.error('Booking failed:', error)
    return res.status(400).json({ message: e.message || 'Booking failed' })
  } finally {
    await queryRunner.release()
  }
}
