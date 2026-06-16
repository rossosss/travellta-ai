import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

export type SessionMode = 'chat' | 'lucky';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'varchar', default: 'chat' })
  mode: SessionMode;

  /** Заголовок чата (как в ChatGPT — из первого сообщения) */
  @Column({ type: 'varchar', length: 120, nullable: true })
  title?: string;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, unknown>;

  @OneToMany(() => Message, (message) => message.session)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
