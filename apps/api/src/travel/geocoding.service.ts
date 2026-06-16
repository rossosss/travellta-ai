import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { GeocodeCache } from '../entities/geocode-cache.entity';
import {
  findNearestHubs,
  TransportHub,
} from './transport-hubs.data';
import { SegmentTemplate } from './route-graph.data';

export interface GeocodedPlace {
  query: string;
  displayName: string;
  lat: number;
  lon: number;
  region?: string;
  nearestHubs: Array<TransportHub & { distanceKm: number }>;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private lastRequestAt = 0;

  constructor(
    @InjectRepository(GeocodeCache)
    private readonly cacheRepo: Repository<GeocodeCache>,
  ) {}

  normalizeQuery(query: string): string {
    return query.toLowerCase().replace(/ё/g, 'е').trim();
  }

  async resolvePlace(query: string): Promise<GeocodedPlace | null> {
    const normalized = this.normalizeQuery(query);
    if (!normalized || normalized.length < 2) return null;

    const cached = await this.cacheRepo.findOne({ where: { query: normalized } });
    if (cached) {
      return this.toGeocodedPlace(cached);
    }

    const result = await this.fetchFromNominatim(query);
    if (!result) return null;

    await this.cacheRepo.save(
      this.cacheRepo.create({
        query: normalized,
        displayName: result.displayName,
        lat: result.lat,
        lon: result.lon,
        region: result.region,
        source: 'nominatim',
      }),
    );

    return result;
  }

  /** Последняя миля: settlement → hub (оценка по расстоянию) */
  buildLastMileSegments(
    fromName: string,
    hub: TransportHub & { distanceKm: number },
  ): SegmentTemplate[] {
    const km = hub.distanceKm;
    const busDuration = Math.max(45, Math.round((km / 55) * 60));
    const busPrice = Math.max(400, Math.round(km * 4));

    return [
      {
        id: `lastmile-bus-${hub.id}`,
        mode: 'bus',
        label: `Автобус до ${hub.name}`,
        durationMin: busDuration,
        priceFrom: busPrice,
        carrier: 'Междугородний автобус',
        description: `Из ${fromName} до ${hub.name} · ~${km} км (OSM)`,
        scheduleHint: 'Расписание уточняйте на Tutu / Авито',
        convenience: km < 80 ? 4 : 3,
      },
      {
        id: `lastmile-local-${hub.id}`,
        mode: 'local',
        label: `Добраться до ${hub.name}`,
        durationMin: Math.max(40, Math.round((km / 70) * 60)),
        priceFrom: Math.max(1500, Math.round(km * 18)),
        carrier: 'Такси / попутка',
        description: `~${km} км до транспортного хаба ${hub.name}`,
        scheduleHint: 'По договорённости',
        convenience: 5,
      },
    ];
  }

  private toGeocodedPlace(cached: GeocodeCache): GeocodedPlace {
    return {
      query: cached.query,
      displayName: cached.displayName,
      lat: cached.lat,
      lon: cached.lon,
      region: cached.region,
      nearestHubs: findNearestHubs(cached.lat, cached.lon),
    };
  }

  private async fetchFromNominatim(query: string): Promise<GeocodedPlace | null> {
    await this.rateLimit();

    try {
      const { data } = await axios.get<
        Array<{
          lat: string;
          lon: string;
          display_name: string;
          address?: { state?: string; region?: string; county?: string };
        }>
      >(NOMINATIM_URL, {
        params: {
          q: query,
          format: 'json',
          limit: 1,
          countrycodes: 'ru',
          'accept-language': 'ru',
        },
        headers: {
          'User-Agent': 'Travellta/1.0 (travel mini app; contact: support@travellta.app)',
        },
        timeout: 10000,
      });

      const hit = data[0];
      if (!hit) {
        this.logger.warn(`Nominatim: no results for "${query}"`);
        return null;
      }

      const lat = parseFloat(hit.lat);
      const lon = parseFloat(hit.lon);
      const region =
        hit.address?.state ?? hit.address?.region ?? hit.address?.county;

      return {
        query: this.normalizeQuery(query),
        displayName: hit.display_name.split(',').slice(0, 2).join(', '),
        lat,
        lon,
        region,
        nearestHubs: findNearestHubs(lat, lon),
      };
    } catch (error) {
      this.logger.warn(`Nominatim failed for "${query}": ${error}`);
      return null;
    }
  }

  /** Nominatim: не чаще 1 req/sec */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const wait = 1100 - (now - this.lastRequestAt);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastRequestAt = Date.now();
  }
}
