import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'trip_result' | 'question' | 'loading';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  session: ChatSession;

  @Column()
  sessionId: string;

  @Column({ type: 'varchar' })
  role: MessageRole;

  @Column({ type: 'varchar', default: 'text' })
  type: MessageType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
