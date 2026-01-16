import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { BookingEntity } from './booking.entity.ts'

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'integer' })
  bookingId: number

  @ManyToOne(() => BookingEntity)
  @JoinColumn({ name: 'bookingId' })
  booking: BookingEntity

  @Column({ type: 'text' })
  paymentMethod: string

  @Column({ type: 'text' })
  cardName: string

  @Column({ type: 'text' })
  cardLast4: string

  @Column({ type: 'integer' })
  amountCents: number

  @Column({ type: 'text' })
  status: string

  @Column({ type: 'text', nullable: true })
  reference: string | null

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
