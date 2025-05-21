import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Community {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  tags?: string;

  @Column()
  isFree: boolean;

  @Column({ nullable: true })
  price?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  externalLinks?: string;
}
