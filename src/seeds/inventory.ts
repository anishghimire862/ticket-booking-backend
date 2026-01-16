import { AppDataSource } from '../data-source.ts'
import type { TicketTierEntity } from '../entities/ticket-tier.entity.ts'
import { TicketInventoryEntity } from '../entities/ticket-inventory.entity.ts'

export async function seedInventory(tiers: TicketTierEntity[]) {
  const repo = AppDataSource.getRepository(TicketInventoryEntity)

  for (const tier of tiers) {
    let inventory = await repo.findOne({
      where: { tierId: tier.id },
    })

    if (inventory) {
      console.log(`Inventory exists for ${tier.displayName}`)
      continue
    }

    const totalQuantity = tier.code === 'VIP' ? 50 : tier.code === 'FRONT_ROW' ? 200 : 1000

    inventory = repo.create({
      tierId: tier.id,
      totalQuantity,
      availableQuantity: totalQuantity,
      reservedQuantity: 0,
    })

    await repo.save(inventory)
    console.log(`Inventory created for ${tier.displayName}`)
  }
}
