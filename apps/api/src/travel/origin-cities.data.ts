export interface OriginCityInfo {
  name: string;
  airportCode?: string;
  hasAirport: boolean;
  nearestAirport?: {
    code: string;
    name: string;
    city: string;
  };
  /** Примерное время до ближайшего аэропорта (мин) */
  groundToAirportMin?: number;
  /** Хорошо связан ж/д */
  trainHub?: boolean;
}

export const ORIGIN_CITY_MAP: Record<string, OriginCityInfo> = {
  москв: { name: 'Москва', airportCode: 'MOW', hasAirport: true, trainHub: true },
  'санкт-петербург': { name: 'Санкт-Петербург', airportCode: 'LED', hasAirport: true, trainHub: true },
  'санкт петербург': { name: 'Санкт-Петербург', airportCode: 'LED', hasAirport: true, trainHub: true },
  питер: { name: 'Санкт-Петербург', airportCode: 'LED', hasAirport: true, trainHub: true },
  спб: { name: 'Санкт-Петербург', airportCode: 'LED', hasAirport: true, trainHub: true },
  казан: { name: 'Казань', airportCode: 'KZN', hasAirport: true, trainHub: true },
  новосиб: { name: 'Новосибирск', airportCode: 'OVB', hasAirport: true, trainHub: true },
  екат: { name: 'Екатеринбург', airportCode: 'SVX', hasAirport: true, trainHub: true },
  'нижний': { name: 'Нижний Новгород', airportCode: 'GOJ', hasAirport: true, trainHub: true },
  самар: { name: 'Самара', airportCode: 'KUF', hasAirport: true },
  ростов: { name: 'Ростов-на-Дону', airportCode: 'ROV', hasAirport: true },
  краснодар: { name: 'Краснодар', airportCode: 'KRR', hasAirport: true },
  сочи: { name: 'Сочи', airportCode: 'AER', hasAirport: true },
  воронеж: { name: 'Воронеж', airportCode: 'VOZ', hasAirport: true },
  уф: { name: 'Уфа', airportCode: 'UFA', hasAirport: true },
  перм: { name: 'Пермь', airportCode: 'PEE', hasAirport: true },
  калининград: { name: 'Калининград', airportCode: 'KGD', hasAirport: true },
  // Города без аэропорта — ближайший хаб
  ярослав: {
    name: 'Ярославль',
    hasAirport: false,
    nearestAirport: { code: 'MOW', name: 'Шереметьево', city: 'Москва' },
    groundToAirportMin: 270,
    trainHub: true,
  },
  владимир: {
    name: 'Владимир',
    hasAirport: false,
    nearestAirport: { code: 'MOW', name: 'Шереметьево', city: 'Москва' },
    groundToAirportMin: 180,
    trainHub: true,
  },
  тул: {
    name: 'Тула',
    hasAirport: false,
    nearestAirport: { code: 'MOW', name: 'Домодедово', city: 'Москва' },
    groundToAirportMin: 200,
  },
  рязан: {
    name: 'Рязань',
    hasAirport: false,
    nearestAirport: { code: 'MOW', name: 'Домодедово', city: 'Москва' },
    groundToAirportMin: 210,
  },
  иваново: {
    name: 'Иваново',
    hasAirport: false,
    nearestAirport: { code: 'GOJ', name: 'Стригино', city: 'Нижний Новгород' },
    groundToAirportMin: 240,
    trainHub: true,
  },
  костром: {
    name: 'Кострома',
    hasAirport: false,
    nearestAirport: { code: 'MOW', name: 'Шереметьево', city: 'Москва' },
    groundToAirportMin: 330,
  },
  твер: {
    name: 'Тверь',
    hasAirport: false,
    nearestAirport: { code: 'MOW', name: 'Шереметьево', city: 'Москва' },
    groundToAirportMin: 180,
    trainHub: true,
  },
  смоленск: {
    name: 'Смоленск',
    hasAirport: false,
    nearestAirport: { code: 'MOW', name: 'Шереметьево', city: 'Москва' },
    groundToAirportMin: 360,
    trainHub: true,
  },
};

/** Ж/д маршруты без перелёта (origin key → destination IATA) */
export const TRAIN_DIRECT_ROUTES: Record<string, string[]> = {
  москв: ['LED', 'KZN', 'AER', 'KGD'],
  'санкт-петербург': ['MOW', 'KZN'],
  питер: ['MOW', 'KZN'],
  спб: ['MOW', 'KZN'],
  ярослав: ['LED', 'MOW'],
  владимир: ['LED', 'MOW'],
  твер: ['LED', 'MOW'],
};

export function resolveOriginCity(query?: string, code?: string): OriginCityInfo | null {
  if (query) {
    const lower = query.toLowerCase();
    for (const [key, info] of Object.entries(ORIGIN_CITY_MAP)) {
      if (lower.includes(key)) return info;
    }
  }
  if (code) {
    for (const info of Object.values(ORIGIN_CITY_MAP)) {
      if (info.airportCode === code) return info;
    }
  }
  return null;
}

export function getFlightOriginCode(info: OriginCityInfo): string {
  if (info.hasAirport && info.airportCode) return info.airportCode;
  return info.nearestAirport?.code ?? 'MOW';
}
