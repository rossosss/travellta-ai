import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ListFeedbackDto } from './dto/list-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
  ) {}

  async create(dto: CreateFeedbackDto): Promise<{ ok: true; id: string }> {
    const row = this.feedbackRepo.create({
      name: dto.name?.trim() || undefined,
      email: dto.email?.trim() || undefined,
      audienceType: dto.audienceType.trim(),
      travelFrequency: dto.travelFrequency?.trim(),
      painPoint: dto.painPoint?.trim(),
      wish: dto.wish?.trim(),
      contactOk: dto.contactOk ?? false,
      source: dto.source?.trim() || 'landing',
      status: 'new',
    });
    const saved = await this.feedbackRepo.save(row);
    return { ok: true, id: saved.id };
  }

  async list(query: ListFeedbackDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.feedbackRepo
      .createQueryBuilder('f')
      .orderBy('f.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.status) {
      qb.andWhere('f.status = :status', { status: query.status });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  async update(id: string, dto: UpdateFeedbackDto) {
    const row = await this.feedbackRepo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('Отзыв не найден');
    }

    if (dto.status !== undefined) row.status = dto.status;
    if (dto.adminNote !== undefined) {
      row.adminNote = dto.adminNote.trim() || null;
    }

    const saved = await this.feedbackRepo.save(row);
    return { ok: true, item: saved };
  }
}
