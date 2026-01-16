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
import { BookingEntity } from './booking.entity.ts'
import { TicketTierEntity } from './ticket-tier.entity.ts'

@Entity('booking_items')
@Unique(['bookingId', 'tierId'])
export class BookingItemEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'integer' })
  bookingId: number

  @ManyToOne(() => BookingEntity, (booking) => booking.bookingItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: BookingEntity

  @Column({ type: 'integer' })
  tierId: number

  @ManyToOne(() => TicketTierEntity)
  @JoinColumn({ name: 'tierId' })
  tier: TicketTierEntity

  @Column({ type: 'integer' })
  quantity: number

  @Column({ type: 'integer' })
  lineTotalCents: number

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
