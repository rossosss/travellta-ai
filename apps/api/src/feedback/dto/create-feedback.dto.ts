import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsString()
  @MaxLength(120)
  audienceType: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  travelFrequency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  painPoint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  wish?: string;

  @IsOptional()
  @IsBoolean()
  contactOk?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;
}
