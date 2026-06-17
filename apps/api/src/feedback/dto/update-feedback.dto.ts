import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { FeedbackStatus } from '../../entities/feedback.entity';

export class UpdateFeedbackDto {
  @IsOptional()
  @IsIn(['new', 'in_progress', 'done'])
  status?: FeedbackStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  adminNote?: string;
}
