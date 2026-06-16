import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  getFlightOriginCode,
  ORIGIN_CITY_MAP,
  resolveOriginCity,
  TRAIN_DIRECT_ROUTES,
} from './origin-cities.data';
import {
  aviasalesUrl,
  findPathsToAirportHubs,
  getNodeById,
  INTERNATIONAL_FLIGHT_HUBS,
  resolveRouteNode,
  RouteNode,
  SegmentTemplate,
  tutuUrl,
} from './route-graph.data';
import {
  FlightOffer,
  RouteStage,
  TransportLeg,
  TransportRoute,
  TravelPreferences,
} from './travel.types';
import { TravelpayoutsService } from './travelpayouts.service';

interface ResolvedOrigin {
  name: string;
  nodeId?: string;
  hasAirport: boolean;
  airportCode?: string;
  isSettlement: boolean;
}

@Injectable()
export class MultimodalService {
  constructor(private readonly travelpayouts: TravelpayoutsService) {}

  resolveOrigin(preferences: TravelPreferences): ResolvedOrigin | null {
    const graphNode = resolveRouteNode(preferences.origin);
    if (graphNode) {
      return {
        name: graphNode.name,
        nodeId: graphNode.id,
        hasAirport: Boolean(graphNode.airportCode) && graphNode.kind !== 'settlement',
        airportCode: graphNode.airportCode,
        isSettlement: graphNode.kind === 'settlement',
      };
    }

    const cityInfo = resolveOriginCity(preferences.origin, preferences.originCode);
    if (cityInfo) {
      const graphMatch = ROUTE_NODES_BY_NAME.get(cityInfo.name.toLowerCase());
      return {
        name: cityInfo.name,
        nodeId: graphMatch?.id,
        hasAirport: cityInfo.hasAirport,
        airportCode: getFlightOriginCode(cityInfo),
        isSettlement: false,
      };
    }

    if (preferences.origin) {
      return {
        name: preferences.origin,
        hasAirport: Boolean(preferences.originCode),
        airportCode: preferences.originCode,
        isSettlement: /пос\.|поселок|посёлок|с\.|село/i.test(preferences.origin),
      };
    }

    return null;
  }

  async buildTransportRoutes(
    preferences: TravelPreferences,
    destinationCode: string,
    destinationName: string,
    dateFrom: string,
    dateTo: string,
    direction: 'outbound' | 'inbound',
  ): Promise<TransportRoute[]> {
    const origin = this.resolveOrigin(preferences);
    if (!origin) return [];

    const date = direction === 'outbound' ? dateFrom : dateTo;
    const isInternational = !this.isDomesticCode(destinationCode);

    if (origin.nodeId && (origin.isSettlement || !origin.hasAirport)) {
      return this.buildNavigatorRoutes(
        origin,
        destinationCode,
        destinationName,
        date,
        direction,
        isInternational,
      );
    }

    return this.buildSimpleRoutes(
      origin,
      preferences,
      destinationCode,
      destinationName,
      dateFrom,
      dateTo,
      direction,
    );
  }

  /** Полный навигатор: посёлок → хабы → перелёт */
  private async buildNavigatorRoutes(
    origin: ResolvedOrigin,
    destinationCode: string,
    destinationName: string,
    date: string,
    direction: 'outbound' | 'inbound',
    isInternational: boolean,
  ): Promise<TransportRoute[]> {
    const nodeId = origin.nodeId!;
    const flightHubCodes = isInternational
      ? INTERNATIONAL_FLIGHT_HUBS
      : [destinationCode, ...INTERNATIONAL_FLIGHT_HUBS];

    const paths = findPathsToAirportHubs(nodeId, flightHubCodes);

    if (!paths.length) {
      return this.buildFallbackHubRoutes(origin, destinationCode, destinationName, date, direction);
    }

    const routes: TransportRoute[] = [];

    for (const pathInfo of paths) {
      const hubCode = pathInfo.hubNode.airportCode!;

      const hubFlights = await this.travelpayouts.searchFlights(
        direction === 'outbound' ? hubCode : destinationCode,
        direction === 'outbound' ? destinationCode : hubCode,
        date,
        date,
      );

      if (!hubFlights.length) continue;

      for (const flight of hubFlights.slice(0, 2)) {
        const groundVariants = this.cartesianGroundVariants(pathInfo.segmentChoices);

        for (const groundSegments of groundVariants.slice(0, 4)) {
          const route = this.composeNavigatorRoute(
            origin,
            pathInfo,
            groundSegments,
            flight,
            destinationName,
            date,
            direction,
          );
          if (route) routes.push(route);
        }
      }
    }

    const tagged = this.tagRoutes(routes);
    return tagged.sort((a, b) => {
      const scoreA = (a.tag === 'recommended' ? 0 : 1) + a.totalPrice / 100000;
      const scoreB = (b.tag === 'recommended' ? 0 : 1) + b.totalPrice / 100000;
      return scoreA - scoreB;
    });
  }

  private composeNavigatorRoute(
    origin: ResolvedOrigin,
    pathInfo: {
      hubNode: RouteNode;
      path: { from: string; to: string }[];
      segmentChoices: SegmentTemplate[][];
    },
    groundSegments: SegmentTemplate[],
    flight: FlightOffer,
    destinationName: string,
    date: string,
    direction: 'outbound' | 'inbound',
  ): TransportRoute | null {
    const legs: TransportLeg[] = [];
    let cursorTime = this.parseDate(date);
    let groundPrice = 0;
    let groundDuration = 0;

    pathInfo.path.forEach((edge, idx) => {
      const seg = groundSegments[idx];
      if (!seg) return;

      const fromNode = getNodeById(edge.from);
      const toNode = getNodeById(edge.to);
      const fromName = fromNode?.name ?? edge.from;
      const toName = toNode?.name ?? edge.to;

      const departureAt = cursorTime.toISOString();
      cursorTime = new Date(cursorTime.getTime() + seg.durationMin * 60_000);
      const arrivalAt = cursorTime.toISOString();

      const stage: TransportLeg['stage'] =
        idx === 0 && origin.isSettlement ? 'local' : idx < pathInfo.path.length - 1 ? 'regional' : 'hub';

      legs.push({
        id: uuidv4(),
        mode: seg.mode === 'suburban' || seg.mode === 'local' ? seg.mode : seg.mode,
        from: direction === 'outbound' ? fromName : toName,
        to: direction === 'outbound' ? toName : fromName,
        departureAt: direction === 'outbound' ? departureAt : undefined,
        arrivalAt: direction === 'outbound' ? arrivalAt : undefined,
        duration: seg.durationMin,
        price: seg.priceFrom,
        carrier: seg.carrier,
        description: seg.description,
        scheduleHint: seg.scheduleHint,
        convenience: seg.convenience,
        stage,
        bookingUrl:
          seg.mode === 'flight' && toNode?.airportCode
            ? aviasalesUrl(fromNode?.airportCode ?? 'ROV', toNode.airportCode, date)
            : tutuUrl(fromName, toName),
        note: seg.mode === 'local' ? 'Нужно добраться до транспортного узла' : undefined,
      });

      groundPrice += seg.priceFrom;
      groundDuration += seg.durationMin;
    });

    const flightLeg = this.flightLeg(flight, direction, 'international');
    legs.push(flightLeg);

    const totalPrice = Math.round(groundPrice + flight.price);
    const totalDuration = groundDuration + flight.duration;
    const convenienceScore = this.avgConvenience(legs);

    const viaHub = pathInfo.hubNode.name;
    const groundSummary = groundSegments.map((s) => s.label).join(' → ');
    const summary =
      direction === 'outbound'
        ? `${origin.name} → ${groundSummary} → ${viaHub} → ${destinationName}`
        : `${destinationName} → ${viaHub} → ${origin.name}`;

    const stages = this.buildStages(legs, origin.isSettlement);

    return {
      id: uuidv4(),
      label: this.buildRouteLabel(groundSegments, viaHub),
      summary,
      totalPrice,
      totalDuration,
      currency: 'RUB',
      legs,
      stages,
      convenienceScore,
      variantVia: pathInfo.hubNode.id,
    };
  }

  private buildStages(legs: TransportLeg[], isSettlement: boolean): RouteStage[] {
    const stages: RouteStage[] = [];
    const localIdx: number[] = [];
    const regionalIdx: number[] = [];
    const hubIdx: number[] = [];
    const intlIdx: number[] = [];

    legs.forEach((leg, i) => {
      switch (leg.stage) {
        case 'local':
          localIdx.push(i);
          break;
        case 'regional':
          regionalIdx.push(i);
          break;
        case 'hub':
          hubIdx.push(i);
          break;
        case 'international':
          intlIdx.push(i);
          break;
        default:
          if (leg.mode === 'flight' && i === legs.length - 1) intlIdx.push(i);
          else regionalIdx.push(i);
      }
    });

    if (localIdx.length) {
      stages.push({
        id: 'local',
        label: isSettlement ? 'До регионального центра' : 'До транспортного узла',
        legIndexes: localIdx,
      });
    }
    if (regionalIdx.length) {
      stages.push({ id: 'regional', label: 'До города вылета', legIndexes: regionalIdx });
    }
    if (hubIdx.length) {
      stages.push({ id: 'hub', label: 'До аэропорта вылета', legIndexes: hubIdx });
    }
    if (intlIdx.length) {
      stages.push({ id: 'international', label: 'Перелёт', legIndexes: intlIdx });
    }

    return stages;
  }

  private buildRouteLabel(segments: SegmentTemplate[], viaHub: string): string {
    const modes = segments.map((s) => s.label).join(' + ');
    return `${modes} · через ${viaHub}`;
  }

  /** Все комбинации наземных сегментов по пути */
  private cartesianGroundVariants(choices: SegmentTemplate[][]): SegmentTemplate[][] {
    if (!choices.length) return [[]];
    return choices.reduce<SegmentTemplate[][]>(
      (acc, options) => acc.flatMap((prefix) => options.map((opt) => [...prefix, opt])),
      [[]],
    );
  }

  private async buildFallbackHubRoutes(
    origin: ResolvedOrigin,
    destinationCode: string,
    destinationName: string,
    date: string,
    direction: 'outbound' | 'inbound',
  ): Promise<TransportRoute[]> {
    const hubCode = 'MOW';
    const flights = await this.travelpayouts.searchFlights(
      direction === 'outbound' ? hubCode : destinationCode,
      direction === 'outbound' ? destinationCode : hubCode,
      date,
      date,
    );
    if (!flights.length) return [];

    return flights.slice(0, 3).map((flight) => ({
      id: uuidv4(),
      label: `Через Москву · ${flight.airline}`,
      summary: `${origin.name} → добраться до Москвы → ${destinationName}`,
      totalPrice: Math.round(flight.price + 5000),
      totalDuration: flight.duration + 720,
      currency: 'RUB',
      convenienceScore: 3,
      legs: [
        {
          id: uuidv4(),
          mode: 'local',
          from: origin.name,
          to: 'Ближайший транспортный узел',
          duration: 120,
          price: 2000,
          carrier: 'Такси / автобус',
          description: `Из ${origin.name} нужно добраться до ближайшего города с транспортом`,
          convenience: 3,
          stage: 'local',
          note: 'Уточните местный маршрут — мы подберём стыковку',
          bookingUrl: tutuUrl(origin.name, 'Москва'),
        },
        {
          id: uuidv4(),
          mode: 'train',
          from: 'Региональный центр',
          to: 'Москва',
          duration: 720,
          price: 3000,
          carrier: 'РЖД',
          description: 'Поезд до Москвы',
          convenience: 4,
          stage: 'regional',
          bookingUrl: tutuUrl(origin.name, 'Москва'),
        },
        this.flightLeg(flight, direction, 'international'),
      ],
      stages: [
        { id: 'local', label: 'До транспортного узла', legIndexes: [0] },
        { id: 'regional', label: 'До Москвы', legIndexes: [1] },
        { id: 'international', label: 'Перелёт', legIndexes: [2] },
      ],
    }));
  }

  private async buildSimpleRoutes(
    origin: ResolvedOrigin,
    preferences: TravelPreferences,
    destinationCode: string,
    destinationName: string,
    dateFrom: string,
    dateTo: string,
    direction: 'outbound' | 'inbound',
  ): Promise<TransportRoute[]> {
    const originInfo = resolveOriginCity(preferences.origin, preferences.originCode) ?? {
      name: origin.name,
      hasAirport: origin.hasAirport,
      airportCode: origin.airportCode,
    };

    const flightOrigin = origin.hasAirport && origin.airportCode
      ? origin.airportCode
      : getFlightOriginCode(originInfo as Parameters<typeof getFlightOriginCode>[0]);

    const flightFrom = direction === 'outbound' ? flightOrigin : destinationCode;
    const flightTo = direction === 'outbound' ? destinationCode : flightOrigin;
    const date = direction === 'outbound' ? dateFrom : dateTo;

    const routes: TransportRoute[] = [];
    const flights = await this.travelpayouts.searchFlights(flightFrom, flightTo, date, date);

    if (origin.hasAirport) {
      if (flights[0]) {
        routes.push(this.flightRoute(flights[0], direction, 'Прямой перелёт', 'fastest'));
      }
      if (flights[1]) {
        routes.push(
          this.flightRoute(
            flights[1],
            direction,
            flights[1].transfers > 0 ? 'Перелёт с пересадкой' : 'Альтернативный рейс',
            flights[1].price < (flights[0]?.price ?? Infinity) ? 'cheapest' : undefined,
          ),
        );
      }
    } else if (origin.nodeId) {
      return this.buildNavigatorRoutes(
        origin,
        destinationCode,
        destinationName,
        date,
        direction,
        !this.isDomesticCode(destinationCode),
      );
    } else {
      const hubCity = 'Москва';
      const groundMin = 240;

      if (flights[0]) {
        routes.push({
          id: uuidv4(),
          label: 'Поезд + самолёт',
          tag: 'recommended',
          summary: `${origin.name} → ${hubCity} (поезд) · перелёт до ${destinationName}`,
          totalPrice: Math.round(flights[0].price + this.trainPrice(groundMin)),
          totalDuration: flights[0].duration + groundMin,
          currency: 'RUB',
          convenienceScore: 4,
          legs: [
            this.trainLeg(origin.name, hubCity, groundMin, 'regional'),
            this.flightLeg(flights[0], direction, 'international'),
          ],
          stages: [
            { id: 'regional', label: 'До города вылета', legIndexes: [0] },
            { id: 'international', label: 'Перелёт', legIndexes: [1] },
          ],
        });

        routes.push({
          id: uuidv4(),
          label: 'Автобус + самолёт',
          tag: 'cheapest',
          summary: `${origin.name} → ${hubCity} (автобус) · ${destinationName}`,
          totalPrice: Math.round(flights[0].price + this.busPrice(groundMin)),
          totalDuration: flights[0].duration + Math.round(groundMin * 1.2),
          currency: 'RUB',
          convenienceScore: 3,
          legs: [
            this.busLeg(origin.name, hubCity, groundMin, 'regional'),
            this.flightLeg(flights[0], direction, 'international'),
          ],
          stages: [
            { id: 'regional', label: 'До города вылета', legIndexes: [0] },
            { id: 'international', label: 'Перелёт', legIndexes: [1] },
          ],
        });
      }
    }

    const trainDirect = this.buildTrainDirectRoute(
      { name: origin.name },
      destinationCode,
      destinationName,
      direction,
      date,
    );
    if (trainDirect) routes.push(trainDirect);

    return this.tagRoutes(routes.sort((a, b) => a.totalPrice - b.totalPrice));
  }

  private tagRoutes(routes: TransportRoute[]): TransportRoute[] {
    if (!routes.length) return routes;

    const cheapest = [...routes].sort((a, b) => a.totalPrice - b.totalPrice)[0];
    const fastest = [...routes].sort((a, b) => a.totalDuration - b.totalDuration)[0];
    const bestComfort = [...routes].sort(
      (a, b) => (b.convenienceScore ?? 0) - (a.convenienceScore ?? 0),
    )[0];

    return routes.map((r) => {
      if (r.id === cheapest.id && r.id !== fastest.id) return { ...r, tag: 'cheapest' as const };
      if (r.id === fastest.id) return { ...r, tag: 'fastest' as const };
      if (r.id === bestComfort.id && !r.tag) return { ...r, tag: 'recommended' as const };
      return r;
    });
  }

  private buildTrainDirectRoute(
    originInfo: { name: string },
    destCode: string,
    destName: string,
    direction: 'outbound' | 'inbound',
    date: string,
  ): TransportRoute | null {
    const originKey = Object.entries(ORIGIN_CITY_MAP).find(
      ([, v]) => v.name === originInfo.name,
    )?.[0];
    if (!originKey) return null;

    const available = TRAIN_DIRECT_ROUTES[originKey];
    if (!available?.includes(destCode)) return null;

    const duration = destCode === 'LED' ? 240 : destCode === 'KZN' ? 720 : 480;
    const price = destCode === 'LED' ? 4500 : destCode === 'KZN' ? 5500 : 6000;
    const from = direction === 'outbound' ? originInfo.name : destName;
    const to = direction === 'outbound' ? destName : originInfo.name;

    return {
      id: uuidv4(),
      label: 'Поезд (напрямую)',
      tag: 'recommended',
      summary: `${from} → ${to} на поезде, без перелётов`,
      totalPrice: price,
      totalDuration: duration,
      currency: 'RUB',
      convenienceScore: 5,
      legs: [
        {
          id: uuidv4(),
          mode: 'train',
          from,
          to,
          departureAt: date,
          duration,
          price,
          carrier: 'РЖД / ФПК',
          description: 'Скоростной или фирменный поезд',
          convenience: 5,
          stage: 'regional',
          bookingUrl: tutuUrl(from, to),
        },
      ],
      stages: [{ id: 'regional', label: 'На поезде', legIndexes: [0] }],
    };
  }

  private flightRoute(
    flight: FlightOffer,
    direction: 'outbound' | 'inbound',
    label: string,
    tag?: TransportRoute['tag'],
  ): TransportRoute {
    return {
      id: uuidv4(),
      label,
      tag,
      summary:
        flight.transfers > 0
          ? `Перелёт с ${flight.transfers} пересадкой · ${flight.airline}`
          : `Прямой рейс · ${flight.airline}`,
      totalPrice: flight.price,
      totalDuration: flight.duration,
      currency: flight.currency,
      convenienceScore: flight.transfers === 0 ? 5 : 3,
      legs: [this.flightLeg(flight, direction, 'international')],
      stages: [{ id: 'international', label: 'Перелёт', legIndexes: [0] }],
    };
  }

  private flightLeg(
    flight: FlightOffer,
    direction: 'outbound' | 'inbound',
    stage: TransportLeg['stage'] = 'international',
  ): TransportLeg {
    return {
      id: flight.id,
      mode: 'flight',
      from: flight.originCode,
      to: flight.destinationCode,
      fromCode: flight.originCode,
      toCode: flight.destinationCode,
      departureAt: flight.departureAt,
      duration: flight.duration,
      price: flight.price,
      carrier: flight.airline,
      description:
        flight.transfers > 0
          ? `${flight.transfers} пересадка · ${flight.duration} мин`
          : `Прямой рейс · ${flight.duration} мин`,
      bookingUrl: flight.bookingUrl,
      transfers: flight.transfers,
      convenience: flight.transfers === 0 ? 5 : 3,
      stage,
    };
  }

  private trainLeg(
    from: string,
    to: string,
    durationMin: number,
    stage: TransportLeg['stage'] = 'regional',
  ): TransportLeg {
    const price = this.trainPrice(durationMin);
    return {
      id: uuidv4(),
      mode: 'train',
      from,
      to,
      duration: durationMin,
      price,
      carrier: 'РЖД',
      description: `Поезд · ~${Math.round(durationMin / 60)} ч`,
      convenience: durationMin < 300 ? 5 : 3,
      stage,
      bookingUrl: tutuUrl(from, to),
    };
  }

  private busLeg(
    from: string,
    to: string,
    durationMin: number,
    stage: TransportLeg['stage'] = 'regional',
  ): TransportLeg {
    const price = this.busPrice(durationMin);
    return {
      id: uuidv4(),
      mode: 'bus',
      from,
      to,
      duration: Math.round(durationMin * 1.2),
      price,
      carrier: 'FlixBus / АВ',
      description: `Автобус · ~${Math.round((durationMin * 1.2) / 60)} ч`,
      convenience: 3,
      stage,
      bookingUrl: `https://www.aviasales.ru/autobus/${from}-${to}`,
    };
  }

  private trainPrice(durationMin: number): number {
    return Math.max(800, Math.round(durationMin * 3.5));
  }

  private busPrice(durationMin: number): number {
    return Math.max(500, Math.round(durationMin * 2));
  }

  private avgConvenience(legs: TransportLeg[]): number {
    const scored = legs.filter((l) => l.convenience);
    if (!scored.length) return 3;
    return Math.round((scored.reduce((s, l) => s + (l.convenience ?? 0), 0) / scored.length) * 10) / 10;
  }

  private parseDate(date: string): Date {
    const d = new Date(date);
    d.setHours(8, 0, 0, 0);
    return d;
  }

  private isDomesticCode(code: string): boolean {
    const domestic = ['MOW', 'LED', 'AER', 'KRR', 'ROV', 'KZN', 'GOJ', 'SVX', 'OVB', 'KGD', 'VOZ'];
    return domestic.includes(code);
  }
}

const ROUTE_NODES_BY_NAME = new Map<string, { id: string }>([
  ['москва', { id: 'moscow' }],
  ['ростов-на-дону', { id: 'rostov' }],
  ['ярославль', { id: 'yaroslavl' }],
  ['владимир', { id: 'vladimir' }],
  ['санкт-петербург', { id: 'spb' }],
  ['казань', { id: 'kazan' }],
  ['нижний новгород', { id: 'nn' }],
]);
