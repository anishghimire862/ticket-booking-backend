import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  VersionColumn,
  Check,
} from 'typeorm'
import { TicketTierEntity } from './ticket-tier.entity.ts'

@Entity('ticket_inventory')
@Check(`"availableQuantity" >= 0`)
@Check(`"availableQuantity" <= "totalQuantity"`)
@Check(`"reservedQuantity" + "availableQuantity" <= "totalQuantity"`)
export class TicketInventoryEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'integer' })
  tierId: number

  @OneToOne(() => TicketTierEntity)
  @JoinColumn({ name: 'tierId' })
  tier: TicketTierEntity

  @Column({ type: 'integer' })
  totalQuantity: number

  @Column({ type: 'integer' })
  availableQuantity: number

  @Column({ type: 'integer', default: 0 })
  reservedQuantity: number

  @VersionColumn()
  version: number

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
