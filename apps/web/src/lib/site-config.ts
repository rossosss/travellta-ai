export const siteConfig = {
  name: 'Travellta',
  title: 'Travellta — AI-навигатор путешествий по России и миру',
  description:
    'Постройте маршрут от дома до курорта: автобус, поезд, перелёт с удобными пересадками. Travellta — умный планировщик поездок для жителей городов и небольших посёлков.',
  tagline: 'От вашего дома — до моря, гор и новых городов',
  url: (process.env.NEXT_PUBLIC_APP_URL ?? 'https://travellta.apsago.com').replace(/\/$/, ''),
  locale: 'ru_RU',
  keywords: [
    'планировщик путешествий',
    'маршрут до аэропорта',
    'как добраться из посёлка',
    'мультимodal маршрут',
    'поезд и самолёт',
    'AI travel',
    'подбор отпуска',
    'Travellta',
    'навигатор отдыха',
    'путешествия по России',
  ],
  ogImage: '/opengraph-image',
  contacts: {
    email: 'hello@travellta.ru',
  },
} as const;

export function absoluteUrl(path: string): string {
  const base = siteConfig.url;
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}
