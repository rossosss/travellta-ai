import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type FeedbackStatus = 'new' | 'in_progress' | 'done';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  /** Кто вы / целевая аудитория */
  @Column()
  audienceType: string;

  /** Как часто путешествуете */
  @Column({ nullable: true })
  travelFrequency: string;

  /** Что сложнее всего при планировании */
  @Column({ type: 'text', nullable: true })
  painPoint: string;

  /** Что хотите от Travellta */
  @Column({ type: 'text', nullable: true })
  wish: string;

  @Column({ default: false })
  contactOk: boolean;

  @Column({ nullable: true })
  source: string;

  @Column({ type: 'varchar', length: 20, default: 'new' })
  status: FeedbackStatus;

  @Column({ type: 'text', nullable: true })
  adminNote?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
