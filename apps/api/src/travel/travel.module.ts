import { Module } from '@nestjs/common';
import { MultimodalService } from './multimodal.service';
import { TravelController } from './travel.controller';
import { TravelpayoutsService } from './travelpayouts.service';
import { TravelService } from './travel.service';

@Module({
  controllers: [TravelController],
  providers: [TravelpayoutsService, MultimodalService, TravelService],
  exports: [TravelService, TravelpayoutsService, MultimodalService],
})
export class TravelModule {}
