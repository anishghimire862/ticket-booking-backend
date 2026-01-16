import { AppDataSource } from '../data-source.js'
import { seedEvent } from './event.js'
import { seedTicketTiers } from './ticket-tiers.js'
import { seedInventory } from './inventory.js'

async function seed() {
  await AppDataSource.initialize()

  console.log('Seeding database...')

  const event = await seedEvent()
  const tiers = await seedTicketTiers(event.id)
  await seedInventory(tiers)

  console.log('Seeding completed')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed', err)
  process.exit(1)
})
