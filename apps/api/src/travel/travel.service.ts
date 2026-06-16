import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { getFlightOriginCode, resolveOriginCity } from './origin-cities.data';
import { MultimodalService } from './multimodal.service';
import {
  FlightOffer,
  LuckyQuestion,
  PlaceCategory,
  TransportRoute,
  TravelPreferences,
  TripPackage,
} from './travel.types';
import { TravelpayoutsService } from './travelpayouts.service';

const PLACE_CATEGORIES: Record<string, PlaceCategory[]> = {
  sea: [
    { id: 'beach', name: 'Пляжи', description: 'Лучшие пляжи и бухты', icon: '🏖️' },
    { id: 'water', name: 'Водные развлечения', description: 'Дайвинг, снорклинг, яхты', icon: '🤿' },
    { id: 'food', name: 'Гастрономия', description: 'Морепродукты и местная кухня', icon: '🦐' },
  ],
  city: [
    { id: 'sights', name: 'Достопримечательности', description: 'Музеи, архитектура, история', icon: '🏛️' },
    { id: 'cafes', name: 'Кафе и рестораны', description: 'Лучшие места для еды', icon: '☕' },
    { id: 'shopping', name: 'Шопинг', description: 'Рынки и бутики', icon: '🛍️' },
  ],
  mountains: [
    { id: 'hiking', name: 'Треккинг', description: 'Горные маршруты', icon: '🥾' },
    { id: 'spa', name: 'SPA и термы', description: 'Отдых после прогулок', icon: '♨️' },
    { id: 'nature', name: 'Природа', description: 'Водопады и смотровые площадки', icon: '🌲' },
  ],
  default: [
    { id: 'sights', name: 'Главное', description: 'Must-see места', icon: '⭐' },
    { id: 'food', name: 'Еда', description: 'Где поесть', icon: '🍽️' },
    { id: 'relax', name: 'Отдых', description: 'Спокойные места', icon: '🧘' },
  ],
};

const LUCKY_QUESTIONS: LuckyQuestion[] = [
  {
    id: 'origin',
    question: 'Из какого города выезжаете?',
    options: ['Москва', 'Санкт-Петербург', 'Казань', 'Другой'],
  },
  {
    id: 'vibe',
    question: 'Какой отдых вам ближе?',
    options: ['На море 🌊', 'Город и культура 🏙️', 'Природа и горы ⛰️', 'Сюрприз! 🎲'],
  },
  {
    id: 'company',
    question: 'С кем едете?',
    options: ['Один/одна', 'Пара', 'С семьёй', 'С друзьями'],
  },
  {
    id: 'pace',
    question: 'Какой темп отдыха?',
    options: ['Спокойный', 'Активный', 'Микс'],
  },
];

@Injectable()
export class TravelService {
  constructor(
    private readonly travelpayouts: TravelpayoutsService,
    private readonly multimodal: MultimodalService,
  ) {}

  getLuckyQuestions(): LuckyQuestion[] {
    return LUCKY_QUESTIONS;
  }

  async buildTripPackages(
    preferences: TravelPreferences,
    count = 3,
  ): Promise<TripPackage[]> {
    const originInfo = resolveOriginCity(preferences.origin, preferences.originCode);
    const originCity = originInfo?.name ?? preferences.origin ?? '—';
    const originHasAirport = originInfo?.hasAirport ?? preferences.originHasAirport ?? true;
    const flightOrigin = originInfo
      ? getFlightOriginCode(originInfo)
      : (preferences.originCode ?? 'MOW');

    let destinations = this.travelpayouts.pickDestinations(preferences);

    if (preferences.destinationCode) {
      destinations = [
        {
          code: preferences.destinationCode,
          name: preferences.destination ?? preferences.destinationCode,
          country: '',
        },
        ...destinations.filter((d) => d.code !== preferences.destinationCode),
      ];
    }

    const dateFrom = preferences.dateFrom ?? this.defaultDateFrom();
    const dateTo = preferences.dateTo ?? this.defaultDateTo(dateFrom);
    const budget = preferences.budget ?? 100000;

    const selected = destinations.slice(0, count);
    const packages: TripPackage[] = [];

    for (const dest of selected) {
      const outboundRoutes = await this.multimodal.buildTransportRoutes(
        preferences,
        dest.code,
        dest.name,
        dateFrom,
        dateTo,
        'outbound',
      );
      const inboundRoutes = await this.multimodal.buildTransportRoutes(
        preferences,
        dest.code,
        dest.name,
        dateFrom,
        dateTo,
        'inbound',
      );

      if (!outboundRoutes.length) continue;

      const hotels = await this.travelpayouts.searchHotels(
        dest.name,
        dateFrom,
        dateTo,
        budget,
      );
      if (!hotels.length) continue;

      const bestOut = outboundRoutes[0];
      const bestIn = inboundRoutes[0] ?? bestOut;
      const hotel = hotels[0];
      const totalPrice = bestOut.totalPrice + bestIn.totalPrice + hotel.totalPrice;

      if (totalPrice > budget * 1.2) continue;

      const tripType = preferences.tripType ?? 'sea';
      const transportNote = this.buildTransportNote(originCity, originHasAirport, outboundRoutes);

      packages.push({
        id: uuidv4(),
        title: `${dest.name}${dest.country ? `, ${dest.country}` : ''}`,
        destination: dest.name,
        destinationCode: dest.code,
        originCity,
        originHasAirport,
        description: this.buildDescription(dest.name, tripType),
        imageUrl: this.getDestinationImage(dest.code),
        totalPrice,
        currency: 'RUB',
        dateFrom,
        dateTo,
        flights: {
          outbound: this.routeAsFlight(bestOut, flightOrigin, dest.code, dateFrom),
          inbound: this.routeAsFlight(bestIn, dest.code, flightOrigin, dateTo),
        },
        outboundRoutes,
        inboundRoutes: inboundRoutes.length ? inboundRoutes : outboundRoutes,
        hotel,
        categories: PLACE_CATEGORIES[tripType] ?? PLACE_CATEGORIES.default,
        highlights: this.buildHighlights(dest.name, tripType),
        transportNote,
      });
    }

    if (!packages.length) {
      return [await this.buildSettlementAwareFallback(preferences)];
    }

    return packages.sort((a, b) => a.totalPrice - b.totalPrice);
  }

  private buildTransportNote(
    originCity: string,
    hasAirport: boolean,
    routes: TransportRoute[],
  ): string {
    const isNavigator = routes.some((r) => r.legs.length > 2 || r.stages?.some((s) => s.id === 'local'));
    const variantCount = routes.length;

    if (isNavigator) {
      const vias = [...new Set(routes.map((r) => r.variantVia).filter(Boolean))];
      const viaText =
        vias.length > 1
          ? `через ${vias.length} разных хаба`
          : routes[0]?.summary.includes('Ростов')
            ? 'через Ростов или Мин. Воды'
            : 'с удобными стыковками';
      return `Навигатор отдыха: из ${originCity} ${viaText}. ${variantCount} вариант${variantCount > 4 ? 'ов' : variantCount > 1 ? 'а' : ''} — раскройте маршрут, чтобы сравнить цены, время и удобство`;
    }

    if (hasAirport) {
      const multimodal = routes.some((r) => r.legs.length > 1 || r.legs[0]?.mode !== 'flight');
      return multimodal
        ? `Из ${originCity}: перелёты и комбинированные маршруты`
        : `Из ${originCity}: прямые и выгодные перелёты`;
    }
    return `Из ${originCity} нет аэропорта — поезд/автобус + перелёт. Раскройте маршрут для всех вариантов`;
  }

  private routeAsFlight(
    route: TransportRoute,
    fromCode: string,
    toCode: string,
    date: string,
  ): FlightOffer {
    const flightLeg = route.legs.find((l) => l.mode === 'flight') ?? route.legs[0];
    return {
      id: route.id,
      origin: flightLeg.from,
      destination: flightLeg.to,
      originCode: flightLeg.fromCode ?? fromCode,
      destinationCode: flightLeg.toCode ?? toCode,
      departureAt: flightLeg.departureAt ?? date,
      price: route.totalPrice,
      currency: route.currency,
      airline: flightLeg.carrier,
      transfers: flightLeg.transfers ?? route.legs.length - 1,
      duration: route.totalDuration,
      bookingUrl: flightLeg.bookingUrl,
    };
  }

  private async buildSettlementAwareFallback(
    preferences: TravelPreferences,
  ): Promise<TripPackage> {
    const staticPkg = this.buildStaticFallbackPackage(preferences);
    const destCode = preferences.destinationCode ?? staticPkg.destinationCode;
    const destName = preferences.destination ?? staticPkg.destination;
    const dateFrom = preferences.dateFrom ?? staticPkg.dateFrom;
    const dateTo = preferences.dateTo ?? staticPkg.dateTo;

    const outboundRoutes = await this.multimodal.buildTransportRoutes(
      preferences,
      destCode,
      destName,
      dateFrom,
      dateTo,
      'outbound',
    );
    const inboundRoutes = await this.multimodal.buildTransportRoutes(
      preferences,
      destCode,
      destName,
      dateFrom,
      dateTo,
      'inbound',
    );

    if (!outboundRoutes.length) {
      return staticPkg;
    }

    const originInfo = resolveOriginCity(preferences.origin, preferences.originCode);
    const originCity = preferences.origin ?? originInfo?.name ?? staticPkg.originCity;
    const originHasAirport = preferences.originHasAirport ?? originInfo?.hasAirport ?? false;

    const bestOut = outboundRoutes[0];
    const bestIn = inboundRoutes[0] ?? bestOut;

    return {
      ...staticPkg,
      originCity,
      originHasAirport,
      outboundRoutes,
      inboundRoutes: inboundRoutes.length ? inboundRoutes : outboundRoutes,
      totalPrice: bestOut.totalPrice + bestIn.totalPrice + staticPkg.hotel.totalPrice,
      transportNote: this.buildTransportNote(originCity, originHasAirport, outboundRoutes),
      flights: {
        outbound: this.routeAsFlight(bestOut, 'MOW', destCode, dateFrom),
        inbound: this.routeAsFlight(bestIn, destCode, 'MOW', dateTo),
      },
    };
  }

  private buildStaticFallbackPackage(preferences: TravelPreferences): TripPackage {
    const dateFrom = preferences.dateFrom ?? this.defaultDateFrom();
    const dateTo = preferences.dateTo ?? this.defaultDateTo(dateFrom);
    const originInfo = resolveOriginCity(preferences.origin, preferences.originCode);
    const originCity = originInfo?.name ?? preferences.origin ?? '—';
    const originHasAirport = originInfo?.hasAirport ?? true;
    const flightOrigin = originInfo
      ? getFlightOriginCode(originInfo)
      : (preferences.originCode ?? 'MOW');
    const destCode = preferences.destinationCode ?? 'AYT';
    const destName = preferences.destination ?? 'Анталия';
    const tripType = preferences.tripType ?? 'sea';

    const outboundFlight: FlightOffer = {
      id: 'fb-out',
      origin: originCity,
      destination: destCode,
      originCode: flightOrigin,
      destinationCode: destCode,
      departureAt: dateFrom,
      returnAt: dateTo,
      price: 35000,
      currency: 'RUB',
      airline: 'Aeroflot',
      transfers: 0,
      duration: 240,
      bookingUrl: `https://www.aviasales.ru/search/${flightOrigin}${dateFrom.replace(/-/g, '')}${destCode}1`,
    };

    const inboundFlight: FlightOffer = {
      id: 'fb-in',
      origin: destCode,
      destination: originCity,
      originCode: destCode,
      destinationCode: flightOrigin,
      departureAt: dateTo,
      price: 32000,
      currency: 'RUB',
      airline: 'Aeroflot',
      transfers: 0,
      duration: 240,
      bookingUrl: `https://www.aviasales.ru/search/${destCode}${dateTo.replace(/-/g, '')}${flightOrigin}1`,
    };

    const outboundRoutes: TransportRoute[] = [
      {
        id: 'fb-route-out',
        label: 'Прямой перелёт',
        tag: 'recommended',
        summary: `${originCity} → ${destName}`,
        totalPrice: outboundFlight.price,
        totalDuration: outboundFlight.duration,
        currency: 'RUB',
        legs: [
          {
            id: 'fb-leg-out',
            mode: 'flight',
            from: originCity,
            to: destName,
            fromCode: flightOrigin,
            toCode: destCode,
            departureAt: dateFrom,
            duration: outboundFlight.duration,
            price: outboundFlight.price,
            carrier: outboundFlight.airline,
            description: 'Прямой рейс',
            bookingUrl: outboundFlight.bookingUrl,
          },
        ],
      },
    ];

    return {
      id: uuidv4(),
      title: destName,
      destination: destName,
      destinationCode: destCode,
      originCity,
      originHasAirport,
      description: this.buildDescription(destName, tripType),
      imageUrl: this.getDestinationImage(destCode),
      totalPrice: 85000,
      currency: 'RUB',
      dateFrom,
      dateTo,
      flights: { outbound: outboundFlight, inbound: inboundFlight },
      outboundRoutes,
      inboundRoutes: outboundRoutes,
      hotel: {
        id: 'fb-hotel',
        name: 'City Comfort Hotel',
        location: destName,
        stars: 4,
        rating: 8.5,
        pricePerNight: 6000,
        totalPrice: 6000 * this.getNightCount(dateFrom, dateTo),
        currency: 'RUB',
        bookingUrl: `https://hotellook.com/hotels/${destName.toLowerCase()}`,
      },
      categories: PLACE_CATEGORIES[tripType] ?? PLACE_CATEGORIES.default,
      highlights: this.buildHighlights(destName, tripType),
      transportNote: this.buildTransportNote(originCity, originHasAirport, outboundRoutes),
    };
  }

  private getNightCount(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  }

  private buildDescription(city: string, tripType: string): string {
    const templates: Record<string, string> = {
      sea: `Идеальный пляжный отдых в ${city}: тёплое море, комфортный отель и удобные перелёты.`,
      city: `Культурное путешествие в ${city}: архитектура, гастрономия и атмосферные прогулки.`,
      mountains: `Горный отдых в ${city}: свежий воздух, природа и уютные отели.`,
    };
    return templates[tripType] ?? `Отличный вариант для отдыха в ${city}.`;
  }

  private buildHighlights(city: string, tripType: string): string[] {
    const map: Record<string, string[]> = {
      sea: [`Пляжи ${city}`, 'Морские экскурсии', 'Местная кухня'],
      city: [`Центр ${city}`, 'Музеи и галереи', 'Вечерние прогулки'],
      mountains: ['Горные тропы', 'Панорамные виды', 'SPA-отдых'],
    };
    return map[tripType] ?? [`Лучшее в ${city}`];
  }

  private getDestinationImage(code: string): string {
    const images: Record<string, string> = {
      AER: 'https://images.unsplash.com/photo-1596484552834-6a58f856e0fd?w=800&q=80',
      LED: 'https://images.unsplash.com/photo-1556610961-2fecc5927173?w=800&q=80',
      IST: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
      KGD: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      AYT: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
      HRG: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      DXB: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
      HKT: 'https://images.unsplash.com/photo-1552465011-b4f21c397db8?w=800&q=80',
      PAR: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
      BCN: 'https://images.unsplash.com/photo-1583422409516-2895a4aa4e9f?w=800&q=80',
    };
    return (
      images[code] ??
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
    );
  }

  private defaultDateFrom(): string {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  }

  private defaultDateTo(from: string): string {
    const d = new Date(from);
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  }
}
