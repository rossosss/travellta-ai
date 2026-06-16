import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeocodeCache } from '../entities/geocode-cache.entity';
import { MultimodalService } from './multimodal.service';
import { GeocodingService } from './geocoding.service';
import { TravelController } from './travel.controller';
import { TravelpayoutsService } from './travelpayouts.service';
import { TravelService } from './travel.service';

@Module({
  imports: [TypeOrmModule.forFeature([GeocodeCache])],
  controllers: [TravelController],
  providers: [TravelpayoutsService, MultimodalService, GeocodingService, TravelService],
  exports: [TravelService, TravelpayoutsService, MultimodalService, GeocodingService],
})
export class TravelModule {}
