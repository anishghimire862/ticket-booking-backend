import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { EventEntity } from './event.entity.ts'
import { BookingItemEntity } from './booking-item.entity.ts'

@Entity('bookings')
@Unique(['idempotencyKey'])
export class BookingEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'integer' })
  eventId: number

  @ManyToOne(() => EventEntity)
  @JoinColumn({ name: 'eventId' })
  event: EventEntity

  @Column({ type: 'integer' })
  userId: number

  @Column({ type: 'text' })
  status: string

  @Column({ type: 'integer' })
  totalAmountCents: number

  @Column({ type: 'text' })
  idempotencyKey: string

  @OneToMany(() => BookingItemEntity, (bookingItem) => bookingItem.booking)
  bookingItems: BookingItemEntity[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
