import { Module } from '@nestjs/common';
import { IntentParserService } from './intent-parser.service';
import { LlmService } from './llm.service';

@Module({
  providers: [LlmService, IntentParserService],
  exports: [IntentParserService, LlmService],
})
export class AiModule {}
