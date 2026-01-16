import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm'
import { EventEntity } from './event.entity.ts'

@Entity('ticket_tiers')
@Unique(['eventId', 'name'])
export class TicketTierEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'integer' })
  eventId: number

  @ManyToOne(() => EventEntity)
  @JoinColumn({ name: 'eventId' })
  event: EventEntity

  @Column({ type: 'text' })
  name: string

  @Column({ type: 'integer' })
  priceCents: number

  @Column({ type: 'integer', default: 0 })
  displayOrder: number

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
