import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  mode?: 'chat' | 'lucky';
}

export class StartLuckyDto {
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class LuckyAnswerDto {
  @IsString()
  sessionId: string;

  @IsString()
  questionId: string;

  @IsString()
  answer: string;
}
