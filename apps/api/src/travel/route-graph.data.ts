import { TransportMode } from './travel.types';

export type NodeKind = 'settlement' | 'city' | 'airport_hub';

export interface RouteNode {
  id: string;
  name: string;
  kind: NodeKind;
  airportCode?: string;
  aliases: string[];
  region?: string;
}

export interface SegmentTemplate {
  id: string;
  mode: TransportMode | 'suburban' | 'local';
  label: string;
  durationMin: number;
  priceFrom: number;
  carrier: string;
  description: string;
  scheduleHint?: string;
  /** 1–5, насколько удобно */
  convenience: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  segments: SegmentTemplate[];
}

/** Узлы графа: посёлки → города → аэропорт-хабы */
export const ROUTE_NODES: RouteNode[] = [
  {
    id: 'tselina',
    name: 'пос. Целина',
    kind: 'settlement',
    aliases: ['целина', 'пос целина', 'поселок целина', 'посёлок целина'],
    region: 'rostov',
  },
  {
    id: 'sal',
    name: 'Сальск',
    kind: 'settlement',
    aliases: ['сальск'],
    region: 'rostov',
  },
  {
    id: 'rostov',
    name: 'Ростов-на-Дону',
    kind: 'city',
    airportCode: 'ROV',
    aliases: ['ростов', 'ростов-на-дону', 'ростов на дону'],
    region: 'south',
  },
  {
    id: 'krasnodar',
    name: 'Краснодар',
    kind: 'city',
    airportCode: 'KRR',
    aliases: ['краснодар', 'крр'],
    region: 'south',
  },
  {
    id: 'stavropol',
    name: 'Ставрополь',
    kind: 'city',
    aliases: ['ставрополь'],
    region: 'south',
  },
  {
    id: 'minvody',
    name: 'Минеральные Воды',
    kind: 'airport_hub',
    airportCode: 'MRV',
    aliases: ['мин вод', 'мин. вод', 'минеральные воды', 'минеральные', 'мрв'],
    region: 'south',
  },
  {
    id: 'moscow',
    name: 'Москва',
    kind: 'airport_hub',
    airportCode: 'MOW',
    aliases: ['москва', 'мск'],
    region: 'central',
  },
  {
    id: 'spb',
    name: 'Санкт-Петербург',
    kind: 'airport_hub',
    airportCode: 'LED',
    aliases: ['питер', 'спб', 'санкт-петербург', 'санкт петербург'],
    region: 'northwest',
  },
  {
    id: 'yaroslavl',
    name: 'Ярославль',
    kind: 'city',
    aliases: ['ярославль'],
    region: 'central',
  },
  {
    id: 'vladimir',
    name: 'Владимир',
    kind: 'city',
    aliases: ['владимир'],
    region: 'central',
  },
  {
    id: 'kazan',
    name: 'Казань',
    kind: 'airport_hub',
    airportCode: 'KZN',
    aliases: ['казань'],
    region: 'volga',
  },
  {
    id: 'nn',
    name: 'Нижний Новгород',
    kind: 'airport_hub',
    airportCode: 'GOJ',
    aliases: ['нижний', 'нижний новгород', 'нн'],
    region: 'volga',
  },
];

/** Рёбра графа с вариантами наземного транспорта */
export const ROUTE_EDGES: GraphEdge[] = [
  // --- Юг: посёлки → региональные центры ---
  {
    from: 'tselina',
    to: 'rostov',
    segments: [
      {
        id: 'tselina-rostov-bus',
        mode: 'bus',
        label: 'Автобус до Ростова',
        durationMin: 90,
        priceFrom: 450,
        carrier: 'Автолайн / местные перевозчики',
        description: 'Междугородний автобус до автовокзала Ростова',
        scheduleHint: '≈ каждые 1–2 ч, 06:00–20:00',
        convenience: 4,
      },
      {
        id: 'tselina-rostov-suburban',
        mode: 'suburban',
        label: 'Электричка + автобус',
        durationMin: 120,
        priceFrom: 280,
        carrier: 'РЖД + местный автобус',
        description: 'Электричка до ближайшей станции, далее автобус/маршрутка до Ростова',
        scheduleHint: 'Электрички утром и вечером',
        convenience: 3,
      },
      {
        id: 'tselina-rostov-local',
        mode: 'local',
        label: 'Добраться до Ростова',
        durationMin: 75,
        priceFrom: 2500,
        carrier: 'Такси / попутка / свой транспорт',
        description: 'Из пос. Целина ~70–90 км до Ростова — такси или попутка',
        scheduleHint: 'По договорённости',
        convenience: 5,
      },
    ],
  },
  {
    from: 'tselina',
    to: 'krasnodar',
    segments: [
      {
        id: 'tselina-krasnodar-bus',
        mode: 'bus',
        label: 'Автобус до Краснодара',
        durationMin: 150,
        priceFrom: 650,
        carrier: 'Автолайн',
        description: 'Через Ростов или напрямую до Краснодара',
        scheduleHint: '2–3 рейса в день',
        convenience: 3,
      },
    ],
  },
  {
    from: 'tselina',
    to: 'minvody',
    segments: [
      {
        id: 'tselina-minvody-bus',
        mode: 'bus',
        label: 'Автобус до Минеральных Вод',
        durationMin: 210,
        priceFrom: 900,
        carrier: 'Южные маршруты',
        description: 'Автобус через Ставрополь до аэропорта Минеральные Воды',
        scheduleHint: '1–2 рейса в день',
        convenience: 3,
      },
      {
        id: 'tselina-minvody-via-stav',
        mode: 'bus',
        label: 'Через Ставрополь',
        durationMin: 240,
        priceFrom: 750,
        carrier: 'Автобус + автобус',
        description: 'Автобус до Ставрополя, пересадка на рейс до Мин. Вод',
        scheduleHint: 'Утренние рейсы удобнее для стыковки',
        convenience: 2,
      },
    ],
  },
  {
    from: 'sal',
    to: 'rostov',
    segments: [
      {
        id: 'sal-rostov-train',
        mode: 'train',
        label: 'Электричка / поезд',
        durationMin: 60,
        priceFrom: 200,
        carrier: 'РЖД',
        description: 'Электричка или региональный поезд до Ростова',
        scheduleHint: 'Каждые 1–2 ч',
        convenience: 4,
      },
    ],
  },
  // --- Региональные центры → хабы вылета ---
  {
    from: 'rostov',
    to: 'moscow',
    segments: [
      {
        id: 'rostov-moscow-train-night',
        mode: 'train',
        label: 'Ночной поезд',
        durationMin: 960,
        priceFrom: 3200,
        carrier: 'РЖД / ФПК',
        description: 'Фирменный «Ростов — Москва», спальное место',
        scheduleHint: 'Отправление ~22:00, прибытие ~14:00',
        convenience: 5,
      },
      {
        id: 'rostov-moscow-train-day',
        mode: 'train',
        label: 'Дневной поезд',
        durationMin: 1080,
        priceFrom: 2800,
        carrier: 'РЖД',
        description: 'Сидячий/плацкарт, дневной рейс',
        scheduleHint: 'Отправление ~08:00',
        convenience: 3,
      },
      {
        id: 'rostov-moscow-flight',
        mode: 'flight',
        label: 'Перелёт Ростов → Москва',
        durationMin: 135,
        priceFrom: 4500,
        carrier: 'Аэрофлот / Победа / S7',
        description: 'Прямой рейс из аэропорта Платов (ROV)',
        scheduleHint: 'Несколько рейсов в день',
        convenience: 5,
      },
      {
        id: 'rostov-moscow-bus',
        mode: 'bus',
        label: 'Автобус',
        durationMin: 1200,
        priceFrom: 1800,
        carrier: 'Автолайн',
        description: 'Ночной автобус до Москвы (дольше, но дешевле)',
        scheduleHint: 'Вечерние отправления',
        convenience: 2,
      },
    ],
  },
  {
    from: 'minvody',
    to: 'moscow',
    segments: [
      {
        id: 'minvody-moscow-flight',
        mode: 'flight',
        label: 'Перелёт Мин. Воды → Москва',
        durationMin: 150,
        priceFrom: 3800,
        carrier: 'Аэрофлот / S7 / Победа',
        description: 'Прямой рейс из аэропорта MRV',
        scheduleHint: 'Утренние и дневные рейсы',
        convenience: 5,
      },
      {
        id: 'minvody-moscow-train',
        mode: 'train',
        label: 'Поезд до Москвы',
        durationMin: 1380,
        priceFrom: 3500,
        carrier: 'РЖД',
        description: 'Длинный маршрут через центр России',
        scheduleHint: '1–2 поезда в сутки',
        convenience: 2,
      },
    ],
  },
  {
    from: 'krasnodar',
    to: 'moscow',
    segments: [
      {
        id: 'krasnodar-moscow-flight',
        mode: 'flight',
        label: 'Перелёт Краснодар → Москва',
        durationMin: 140,
        priceFrom: 4200,
        carrier: 'Аэрофлот / S7',
        description: 'Прямой рейс KRR → MOW',
        scheduleHint: 'Много рейсов в день',
        convenience: 5,
      },
      {
        id: 'krasnodar-moscow-train',
        mode: 'train',
        label: 'Ночной поезд',
        durationMin: 1020,
        priceFrom: 3000,
        carrier: 'РЖД',
        description: 'Поезд Краснодар — Москва',
        scheduleHint: 'Вечерние отправления',
        convenience: 4,
      },
    ],
  },
  // --- Центр: города без аэропорта → Москва ---
  {
    from: 'yaroslavl',
    to: 'moscow',
    segments: [
      {
        id: 'yaroslavl-moscow-train',
        mode: 'train',
        label: 'Ласточка / поезд',
        durationMin: 210,
        priceFrom: 900,
        carrier: 'РЖД',
        description: '«Ласточка» или фирменный поезд до Москвы',
        scheduleHint: 'Каждые 1–2 ч',
        convenience: 5,
      },
      {
        id: 'yaroslavl-moscow-bus',
        mode: 'bus',
        label: 'Автобус',
        durationMin: 270,
        priceFrom: 700,
        carrier: 'Автолайн',
        description: 'Автобус до м. ВДНХ или автовокзала',
        scheduleHint: 'Каждый час',
        convenience: 3,
      },
    ],
  },
  {
    from: 'vladimir',
    to: 'moscow',
    segments: [
      {
        id: 'vladimir-moscow-train',
        mode: 'train',
        label: 'Ласточка / поезд',
        durationMin: 180,
        priceFrom: 800,
        carrier: 'РЖД',
        description: 'Высокоскоростная «Ласточка» или обычный поезд',
        scheduleHint: 'Часто, с 06:00',
        convenience: 5,
      },
    ],
  },
  {
    from: 'yaroslavl',
    to: 'nn',
    segments: [
      {
        id: 'yaroslavl-nn-train',
        mode: 'train',
        label: 'Поезд до Н. Новгорода',
        durationMin: 240,
        priceFrom: 850,
        carrier: 'РЖД',
        description: 'Поезд до аэропорта Стригино (GOJ)',
        scheduleHint: '2–3 рейса в день',
        convenience: 4,
      },
    ],
  },
];

/** Международные хабы вылета для дальних направлений */
export const INTERNATIONAL_FLIGHT_HUBS = ['MOW', 'LED', 'KZN'];

export function resolveRouteNode(query?: string): RouteNode | null {
  if (!query) return null;
  const lower = query.toLowerCase().replace(/ё/g, 'е').trim();

  for (const node of ROUTE_NODES) {
    if (lower.includes(node.name.toLowerCase())) return node;
    for (const alias of node.aliases) {
      if (lower.includes(alias)) return node;
    }
  }

  // «пос. X», «посёлок X», «село X»
  const settlementMatch = lower.match(
    /(?:пос\.?|поселок|посёлок|с\.|село|дер\.|деревня)\s+([а-яa-z\-]+)/,
  );
  if (settlementMatch) {
    const place = settlementMatch[1];
    for (const node of ROUTE_NODES) {
      if (node.aliases.some((a) => a.includes(place)) || node.id.includes(place)) {
        return node;
      }
    }
    return {
      id: `settlement-${place}`,
      name: query.trim(),
      kind: 'settlement',
      aliases: [place],
    };
  }

  return null;
}

export function getNodeById(id: string): RouteNode | undefined {
  return ROUTE_NODES.find((n) => n.id === id);
}

export function getEdgesFrom(nodeId: string): GraphEdge[] {
  return ROUTE_EDGES.filter((e) => e.from === nodeId);
}

/** BFS: пути от origin до целевых хабов вылета (продолжаем через региональные аэропорты) */
export function findPathsToAirportHubs(
  originId: string,
  targetHubCodes?: string[],
  maxHops = 4,
): Array<{ hubNode: RouteNode; path: GraphEdge[]; segmentChoices: SegmentTemplate[][] }> {
  const results: Array<{
    hubNode: RouteNode;
    path: GraphEdge[];
    segmentChoices: SegmentTemplate[][];
  }> = [];

  type QueueItem = {
    nodeId: string;
    path: GraphEdge[];
    segmentChoices: SegmentTemplate[][];
    visited: Set<string>;
  };

  const origin = getNodeById(originId);
  if (!origin) return [];

  const isTargetHub = (code?: string) =>
    !code || !targetHubCodes?.length || targetHubCodes.includes(code);

  if (origin.airportCode && origin.kind !== 'settlement' && isTargetHub(origin.airportCode)) {
    return [{ hubNode: origin, path: [], segmentChoices: [] }];
  }

  const queue: QueueItem[] = [
    { nodeId: originId, path: [], segmentChoices: [], visited: new Set([originId]) },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const edges = getEdgesFrom(current.nodeId);

    for (const edge of edges) {
      if (current.visited.has(edge.to)) continue;

      const nextNode = getNodeById(edge.to);
      if (!nextNode) continue;

      const newPath = [...current.path, edge];
      const newChoices = [...current.segmentChoices, edge.segments];
      const newVisited = new Set(current.visited);
      newVisited.add(edge.to);

      if (nextNode.airportCode && isTargetHub(nextNode.airportCode)) {
        results.push({ hubNode: nextNode, path: newPath, segmentChoices: newChoices });
        continue;
      }

      if (newPath.length < maxHops) {
        queue.push({
          nodeId: edge.to,
          path: newPath,
          segmentChoices: newChoices,
          visited: newVisited,
        });
      }
    }
  }

  return results;
}

export function tutuUrl(from: string, to: string): string {
  const slug = (s: string) =>
    encodeURIComponent(s.replace(/\s+/g, '_').replace(/[.,]/g, ''));
  return `https://www.tutu.ru/poezda/${slug(from)}/${slug(to)}/`;
}

export function aviasalesUrl(fromCode: string, toCode: string, date: string): string {
  return `https://www.aviasales.ru/search/${fromCode}${date.replace(/-/g, '')}${toCode}1`;
}
