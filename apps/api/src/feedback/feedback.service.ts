import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

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
    });
    const saved = await this.feedbackRepo.save(row);
    return { ok: true, id: saved.id };
  }
}
