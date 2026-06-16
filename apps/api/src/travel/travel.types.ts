export interface TravelPreferences {
  origin?: string;
  originCode?: string;
  originHasAirport?: boolean;
  destination?: string;
  destinationCode?: string;
  dateFrom?: string;
  dateTo?: string;
  budget?: number;
  currency?: string;
  preferences?: string[];
  tripType?: 'sea' | 'mountains' | 'city' | 'nature' | 'any';
  travelers?: number;
}

export type TransportMode = 'flight' | 'train' | 'bus' | 'suburban' | 'local';

export interface TransportLeg {
  id: string;
  mode: TransportMode;
  from: string;
  to: string;
  fromCode?: string;
  toCode?: string;
  departureAt?: string;
  arrivalAt?: string;
  duration: number;
  price: number;
  carrier: string;
  description: string;
  bookingUrl: string;
  transfers?: number;
  /** 1–5 удобство участка */
  convenience?: number;
  scheduleHint?: string;
  /** local | regional | hub | international */
  stage?: 'local' | 'regional' | 'hub' | 'international';
  note?: string;
}

export interface RouteStage {
  id: string;
  label: string;
  legIndexes: number[];
}

export interface TransportRoute {
  id: string;
  label: string;
  tag?: 'recommended' | 'cheapest' | 'fastest';
  summary: string;
  legs: TransportLeg[];
  totalPrice: number;
  totalDuration: number;
  currency: string;
  /** Средняя удобность маршрута 1–5 */
  convenienceScore?: number;
  stages?: RouteStage[];
  variantVia?: string;
}

export interface FlightOffer {
  id: string;
  origin: string;
  destination: string;
  originCode: string;
  destinationCode: string;
  departureAt: string;
  returnAt?: string;
  price: number;
  currency: string;
  airline: string;
  transfers: number;
  duration: number;
  bookingUrl: string;
}

export interface HotelOffer {
  id: string;
  name: string;
  location: string;
  stars: number;
  rating: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  imageUrl?: string;
  bookingUrl: string;
}

export interface PlaceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface TripPackage {
  id: string;
  title: string;
  destination: string;
  destinationCode: string;
  originCity: string;
  originHasAirport: boolean;
  description: string;
  imageUrl: string;
  totalPrice: number;
  currency: string;
  dateFrom: string;
  dateTo: string;
  /** @deprecated use outboundRoutes */
  flights: {
    outbound: FlightOffer;
    inbound: FlightOffer;
  };
  outboundRoutes: TransportRoute[];
  inboundRoutes: TransportRoute[];
  hotel: HotelOffer;
  categories: PlaceCategory[];
  highlights: string[];
  transportNote?: string;
}

export interface ParsedIntent {
  intent: 'search_trip' | 'clarify' | 'lucky_start' | 'lucky_answer' | 'unknown';
  preferences: TravelPreferences;
  missingFields: string[];
  clarifyingQuestion?: string;
  confidence: number;
}

export interface LuckyQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface PopularRoute {
  id: string;
  title: string;
  subtitle: string;
  destination: string;
  destinationCode: string;
  tripType: 'sea' | 'city' | 'mountains';
  imageUrl: string;
  priceFrom: number;
  prompt: string;
}
