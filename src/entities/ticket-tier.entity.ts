import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm'
import { EventEntity } from './event.entity.ts'

@Entity('ticket_tiers')
@Unique(['eventId', 'code'])
export class TicketTierEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Index()
  @Column({ type: 'integer' })
  eventId: number

  @ManyToOne(() => EventEntity)
  @JoinColumn({ name: 'eventId' })
  event: EventEntity

  @Column({ type: 'text' })
  code: string

  @Column({ type: 'text' })
  displayName: string

  @Column({ type: 'integer' })
  priceCents: number

  @Column({ type: 'integer', default: 0 })
  displayOrder: number

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
