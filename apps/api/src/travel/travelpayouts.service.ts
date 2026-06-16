import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  FlightOffer,
  HotelOffer,
  TravelPreferences,
  TripPackage,
} from './travel.types';

const SEA_DESTINATIONS = [
  { code: 'AER', name: 'Сочи', country: 'Россия' },
  { code: 'SIP', name: 'Симферополь', country: 'Россия' },
  { code: 'AYT', name: 'Анталия', country: 'Турция' },
  { code: 'HRG', name: 'Хургада', country: 'Египет' },
  { code: 'DXB', name: 'Дубай', country: 'ОАЭ' },
  { code: 'BKK', name: 'Бангкок', country: 'Таиланд' },
  { code: 'HKT', name: 'Пхукет', country: 'Таиланд' },
  { code: 'BCN', name: 'Барселона', country: 'Испания' },
];

const MOUNTAIN_DESTINATIONS = [
  { code: 'TBS', name: 'Тбилиси', country: 'Грузия' },
  { code: 'EVN', name: 'Ереван', country: 'Армения' },
  { code: 'INN', name: 'Инсбрук', country: 'Австрия' },
];

const CITY_DESTINATIONS = [
  { code: 'PAR', name: 'Париж', country: 'Франция' },
  { code: 'ROM', name: 'Рим', country: 'Италия' },
  { code: 'PRG', name: 'Прага', country: 'Чехия' },
  { code: 'IST', name: 'Стамбул', country: 'Турция' },
];

@Injectable()
export class TravelpayoutsService {
  private readonly logger = new Logger(TravelpayoutsService.name);
  private readonly token: string;
  private readonly marker: string;
  private readonly trs: string;

  constructor(private readonly config: ConfigService) {
    this.token = this.config.get<string>('TRAVELPAYOUTS_TOKEN', '');
    this.marker = this.config.get<string>('TRAVELPAYOUTS_MARKER', '');
    this.trs = this.config.get<string>('TRAVELPAYOUTS_TRS', '');
  }

  async searchFlights(
    origin: string,
    destination: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<FlightOffer[]> {
    if (!this.token) {
      return this.getMockFlights(origin, destination, dateFrom, dateTo);
    }

    try {
      const response = await axios.get(
        'https://api.travelpayouts.com/aviasales/v3/prices_for_dates',
        {
          params: {
            origin,
            destination,
            departure_at: dateFrom,
            return_at: dateTo,
            currency: 'rub',
            limit: 5,
            sorting: 'price',
            token: this.token,
          },
          headers: { 'X-Access-Token': this.token },
        },
      );

      const data = response.data?.data ?? [];
      return Promise.all(
        data.map(async (item: Record<string, unknown>, index: number) => {
          const bookingUrl = await this.createPartnerLink(
            `https://www.aviasales.ru/search/${origin}${dateFrom.replace(/-/g, '')}${destination}1`,
          );
          return {
            id: `flight-${index}`,
            origin: String(item.origin ?? origin),
            destination: String(item.destination ?? destination),
            originCode: origin,
            destinationCode: destination,
            departureAt: String(item.departure_at ?? dateFrom),
            returnAt: String(item.return_at ?? dateTo),
            price: Number(item.price ?? 0),
            currency: 'RUB',
            airline: String(item.airline ?? '—'),
            transfers: Number(item.number_of_changes ?? 0),
            duration: Number(item.duration ?? 0),
            bookingUrl,
          };
        }),
      );
    } catch (error) {
      this.logger.warn('Travelpayouts flights API failed, using mock data');
      return this.getMockFlights(origin, destination, dateFrom, dateTo);
    }
  }

  async searchHotels(
    destination: string,
    checkIn: string,
    checkOut: string,
    budget?: number,
  ): Promise<HotelOffer[]> {
    if (!this.token) {
      return this.getMockHotels(destination, checkIn, checkOut, budget);
    }

    try {
      const response = await axios.get(
        'https://engine.hotellook.com/api/v2/cache.json',
        {
          params: {
            location: destination,
            checkIn,
            checkOut,
            currency: 'rub',
            limit: 5,
            token: this.token,
          },
        },
      );

      const data = Array.isArray(response.data) ? response.data : [];
      const nights = this.getNightCount(checkIn, checkOut);

      return Promise.all(
        data.slice(0, 5).map(async (item: Record<string, unknown>, index: number) => {
          const pricePerNight = Number(item.priceFrom ?? item.price ?? 5000);
          const bookingUrl = await this.createPartnerLink(
            `https://hotellook.com/hotels/${destination}?checkIn=${checkIn}&checkOut=${checkOut}`,
          );
          return {
            id: `hotel-${index}`,
            name: String(item.hotelName ?? item.name ?? 'Отель'),
            location: destination,
            stars: Number(item.stars ?? 3),
            rating: Number(item.rating ?? 8),
            pricePerNight,
            totalPrice: pricePerNight * nights,
            currency: 'RUB',
            imageUrl: item.photo ? String(item.photo) : undefined,
            bookingUrl,
          };
        }),
      );
    } catch (error) {
      this.logger.warn('Hotellook API failed, using mock data');
      return this.getMockHotels(destination, checkIn, checkOut, budget);
    }
  }

  async createPartnerLink(originalUrl: string): Promise<string> {
    if (!this.token || !this.marker || !this.trs) {
      return originalUrl;
    }

    try {
      const response = await axios.post(
        'https://api.travelpayouts.com/links/v1/create',
        {
          trs: Number(this.trs),
          marker: Number(this.marker),
          shorten: true,
          links: [{ url: originalUrl }],
        },
        {
          headers: {
            'X-Access-Token': this.token,
            'Content-Type': 'application/json',
          },
        },
      );

      return (
        response.data?.links?.[0]?.partner_url ??
        response.data?.links?.[0]?.url ??
        originalUrl
      );
    } catch {
      return originalUrl;
    }
  }

  pickDestinations(preferences: TravelPreferences): typeof SEA_DESTINATIONS {
    switch (preferences.tripType) {
      case 'mountains':
        return MOUNTAIN_DESTINATIONS;
      case 'city':
        return CITY_DESTINATIONS;
      case 'sea':
        return SEA_DESTINATIONS;
      default:
        return [...SEA_DESTINATIONS, ...CITY_DESTINATIONS];
    }
  }

  private getMockFlights(
    origin: string,
    destination: string,
    dateFrom: string,
    dateTo: string,
  ): FlightOffer[] {
    const basePrice = 12000 + Math.floor(Math.random() * 15000);
    return [
      {
        id: 'mock-flight-1',
        origin,
        destination,
        originCode: origin,
        destinationCode: destination,
        departureAt: dateFrom,
        returnAt: dateTo,
        price: basePrice,
        currency: 'RUB',
        airline: 'Aeroflot',
        transfers: 0,
        duration: 240,
        bookingUrl: `https://www.aviasales.ru/search/${origin}${dateFrom.replace(/-/g, '')}${destination}1`,
      },
      {
        id: 'mock-flight-2',
        origin,
        destination,
        originCode: origin,
        destinationCode: destination,
        departureAt: dateFrom,
        returnAt: dateTo,
        price: basePrice - 3000,
        currency: 'RUB',
        airline: 'Pobeda',
        transfers: 1,
        duration: 360,
        bookingUrl: `https://www.aviasales.ru/search/${origin}${dateFrom.replace(/-/g, '')}${destination}1`,
      },
    ];
  }

  private getMockHotels(
    destination: string,
    checkIn: string,
    checkOut: string,
    budget?: number,
  ): HotelOffer[] {
    const nights = this.getNightCount(checkIn, checkOut);
    const maxPerNight = budget ? Math.floor(budget * 0.4 / nights) : 8000;

    return [
      {
        id: 'mock-hotel-1',
        name: 'Sea Breeze Resort',
        location: destination,
        stars: 4,
        rating: 8.7,
        pricePerNight: Math.min(maxPerNight, 7500),
        totalPrice: Math.min(maxPerNight, 7500) * nights,
        currency: 'RUB',
        bookingUrl: `https://hotellook.com/hotels/${destination}`,
      },
      {
        id: 'mock-hotel-2',
        name: 'Grand Marina Hotel',
        location: destination,
        stars: 5,
        rating: 9.1,
        pricePerNight: Math.min(maxPerNight, 12000),
        totalPrice: Math.min(maxPerNight, 12000) * nights,
        currency: 'RUB',
        bookingUrl: `https://hotellook.com/hotels/${destination}`,
      },
    ];
  }

  private getNightCount(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  }
}

export { SEA_DESTINATIONS, MOUNTAIN_DESTINATIONS, CITY_DESTINATIONS };
