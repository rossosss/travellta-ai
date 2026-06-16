import { PopularRoute } from './travel.types';

export const POPULAR_ROUTES: PopularRoute[] = [
  {
    id: 'spb-weekend',
    title: 'Питер на выходные',
    subtitle: 'Культура и прогулки',
    destination: 'Санкт-Петербург',
    destinationCode: 'LED',
    tripType: 'city',
    imageUrl:
      'https://images.unsplash.com/photo-1556610961-2fecc5927173?w=600&q=80',
    priceFrom: 15000,
    prompt: 'Из Москвы на выходные в Питер, бюджет 30 000 ₽',
  },
  {
    id: 'sochi-sea',
    title: 'Сочи, море',
    subtitle: 'Пляж и солнце',
    destination: 'Сочи',
    destinationCode: 'AER',
    tripType: 'sea',
    imageUrl:
      'https://images.unsplash.com/photo-1596484552834-6a58f856e0fd?w=600&q=80',
    priceFrom: 25000,
    prompt: 'Из Москвы, хочу на море в Сочи, бюджет 80 000 ₽',
  },
  {
    id: 'antalya-all',
    title: 'Анталия',
    subtitle: 'All inclusive у моря',
    destination: 'Анталия',
    destinationCode: 'AYT',
    tripType: 'sea',
    imageUrl:
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80',
    priceFrom: 45000,
    prompt: 'Из Москвы, отпуск в Анталии на 10 дней, бюджет 120 000 ₽',
  },
  {
    id: 'istanbul-city',
    title: 'Стамбул',
    subtitle: 'Город контрастов',
    destination: 'Стамбул',
    destinationCode: 'IST',
    tripType: 'city',
    imageUrl:
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80',
    priceFrom: 35000,
    prompt: 'Из Москвы, поездка в Стамбул на 5 дней, бюджет 70 000 ₽',
  },
  {
    id: 'dubai-lux',
    title: 'Дубай',
    subtitle: 'Небоскрёбы и пустыня',
    destination: 'Дубай',
    destinationCode: 'DXB',
    tripType: 'city',
    imageUrl:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
    priceFrom: 80000,
    prompt: 'Из Москвы, отдых в Дубае на неделю, бюджет 200 000 ₽',
  },
  {
    id: 'kaliningrad',
    title: 'Калининград',
    subtitle: 'Ближнее зарубежье',
    destination: 'Калининград',
    destinationCode: 'KGD',
    tripType: 'city',
    imageUrl:
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80',
    priceFrom: 20000,
    prompt: 'Из Москвы на выходные в Калининград, бюджет 40 000 ₽',
  },
];

export const DESTINATION_MAP: Record<
  string,
  { name: string; code: string; tripType: 'sea' | 'city' | 'mountains' }
> = {
  питер: { name: 'Санкт-Петербург', code: 'LED', tripType: 'city' },
  'санкт-петербург': { name: 'Санкт-Петербург', code: 'LED', tripType: 'city' },
  'санкт петербург': { name: 'Санкт-Петербург', code: 'LED', tripType: 'city' },
  спб: { name: 'Санкт-Петербург', code: 'LED', tripType: 'city' },
  сочи: { name: 'Сочи', code: 'AER', tripType: 'sea' },
  антали: { name: 'Анталия', code: 'AYT', tripType: 'sea' },
  стамбул: { name: 'Стамбул', code: 'IST', tripType: 'city' },
  дубай: { name: 'Дубай', code: 'DXB', tripType: 'city' },
  москв: { name: 'Москва', code: 'MOW', tripType: 'city' },
  казан: { name: 'Казань', code: 'KZN', tripType: 'city' },
  калининград: { name: 'Калининград', code: 'KGD', tripType: 'city' },
  пхукет: { name: 'Пхукет', code: 'HKT', tripType: 'sea' },
  барселон: { name: 'Барселона', code: 'BCN', tripType: 'city' },
  париж: { name: 'Париж', code: 'PAR', tripType: 'city' },
  тбилиси: { name: 'Тбилиси', code: 'TBS', tripType: 'mountains' },
  ереван: { name: 'Ереван', code: 'EVN', tripType: 'mountains' },
};
