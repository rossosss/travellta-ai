import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('geocode_cache')
export class GeocodeCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Нормализованный запрос (lowercase, trim) */
  @Index({ unique: true })
  @Column()
  query: string;

  @Column()
  displayName: string;

  @Column({ type: 'double precision' })
  lat: number;

  @Column({ type: 'double precision' })
  lon: number;

  @Column({ nullable: true })
  region?: string;

  @Column({ default: 'nominatim' })
  source: string;

  @CreateDateColumn()
  createdAt: Date;
}
