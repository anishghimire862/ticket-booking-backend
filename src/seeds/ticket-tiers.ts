import { AppDataSource } from '../data-source.ts'
import { TicketTierEntity } from '../entities/ticket-tier.entity.ts'

export async function seedTicketTiers(eventId: number) {
  const repo = AppDataSource.getRepository(TicketTierEntity)

  const tiers = [
    { code: 'VIP', displayName: 'VIP', priceCents: 10000, displayOrder: 1 },
    { code: 'FRONT_ROW', displayName: 'Front Row', priceCents: 5000, displayOrder: 2 },
    { code: 'GA', displayName: 'General Admission', priceCents: 1000, displayOrder: 3 },
  ]

  const result: TicketTierEntity[] = []

  for (const tier of tiers) {
    let existing = await repo.findOne({
      where: { eventId, code: tier.code },
    })

    if (!existing) {
      existing = repo.create({
        eventId,
        ...tier,
        isActive: true,
      })
      await repo.save(existing)
      console.log(`Tier created: ${tier.displayName}`)
    }

    result.push(existing)
  }

  return result
}
