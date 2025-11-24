/* eslint-disable */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RefundEntity } from '../refund/refund.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;
  
  @Column({ default: 'user' })
  role: string;

  // Adicione isso:
  @OneToMany(() => RefundEntity, (refund) => refund.user)
  refunds: RefundEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
