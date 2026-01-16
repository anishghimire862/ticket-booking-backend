import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'integer' })
  userId: number

  @Column({ type: 'text' })
  name: string

  @Column({ type: 'timestamptz' })
  startsAt: Date

  @Column({ type: 'text', default: 'ACTIVE' })
  status: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
