import { AppDataSource } from '../data-source.ts'
import { EventEntity } from '../entities/event.entity.ts'

export async function seedEvent() {
  const repo = AppDataSource.getRepository(EventEntity)

  let event = await repo.findOne({
    where: { name: 'Black Sabbath Concert in Kathmandu' },
  })

  if (event) {
    console.log('Event already exists')
    return event
  }

  event = repo.create({
    userId: 1,
    name: 'Black Sabbath Concert in Kathmandu',
    startsAt: new Date('2026-06-01T18:00:00Z'),
    status: 'ACTIVE',
  })

  await repo.save(event)
  console.log('Event created')

  return event
}
