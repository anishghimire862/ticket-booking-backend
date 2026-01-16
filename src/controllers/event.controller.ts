import type { Request, Response } from 'express'
import { AppDataSource } from '../data-source.ts'
import { EventEntity } from '../entities/event.entity.ts'
import { TicketTierEntity } from '../entities/ticket-tier.entity.ts'
import { TicketInventoryEntity } from '../entities/ticket-inventory.entity.ts'
import { In } from 'typeorm'

export const getEvents = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(EventEntity)

    const events = await eventRepo.find({
      where: { status: 'ACTIVE' },
      order: { startsAt: 'ASC' },
    })

    const result = events.map((event) => ({
      id: event.id,
      name: event.name,
      startsAt: event.startsAt,
    }))

    return res.json(result)
  } catch (error) {
    console.error('Error fetching events:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getEventById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid event id' })
    }
    const eventId = parseInt(id)

    const eventRepo = AppDataSource.getRepository(EventEntity)
    const event = await eventRepo.findOne({ where: { id: eventId, status: 'ACTIVE' } })

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const tierRepo = AppDataSource.getRepository(TicketTierEntity)
    const tiers = await tierRepo.find({
      where: { eventId: event.id, isActive: true },
      order: { displayOrder: 'ASC' },
    })

    const inventoryRepo = AppDataSource.getRepository(TicketInventoryEntity)
    const inventoryList = await inventoryRepo.findBy({
      tierId: In(tiers.map((t) => t.id)),
    })

    const tiersWithAvailability = tiers.map((tier) => {
      const inventory = inventoryList.find((inv) => inv.tierId === tier.id)
      return {
        id: tier.id,
        code: tier.code,
        displayName: tier.displayName,
        priceCents: tier.priceCents,
        availableQuantity: inventory ? inventory.availableQuantity : 0,
      }
    })

    return res.json({
      id: event.id,
      name: event.name,
      startsAt: event.startsAt,
      tiers: tiersWithAvailability,
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
