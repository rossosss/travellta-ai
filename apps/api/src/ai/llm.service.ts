import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { getFlightOriginCode, resolveOriginCity } from '../travel/origin-cities.data';
import { resolveRouteNode } from '../travel/route-graph.data';
import { ParsedIntent, TravelPreferences } from '../travel/travel.types';

const SYSTEM_PROMPT = `Ты — ассистент travel-приложения Travellta. Извлекай параметры поездки из сообщения пользователя на русском языке.

Ответь ТОЛЬКО валидным JSON без markdown:
{
  "intent": "search_trip" | "clarify" | "lucky_start" | "unknown",
  "preferences": {
    "origin": "город вылета или null",
    "originCode": "IATA код (MOW, LED, ...) или null",
    "destination": "город назначения или null",
    "destinationCode": "IATA код или null",
    "dateFrom": "YYYY-MM-DD или null",
    "dateTo": "YYYY-MM-DD или null",
    "budget": число или null,
    "currency": "RUB",
    "tripType": "sea" | "mountains" | "city" | "nature" | "any" | null,
    "travelers": число или null
  },
  "missingFields": ["dateFrom", "dateTo", "budget", "tripType", "origin"],
  "clarifyingQuestion": "вопрос на русском если intent=clarify, иначе null",
  "confidence": 0.0-1.0
}

Правила:
- "на море" → tripType: "sea"
- "город", "культура" → tripType: "city"
- "горы", "природа" → tripType: "mountains"
- "испытать удачу", "сюрприз" → intent: "lucky_start"
- Если не хватает ключевых данных — intent: "clarify" и один КОНКРЕТНЫЙ вопрос только про недостающее поле
- НИКОГДА не спрашивай про «маршруты», «интересы», «предпочтения» — только даты, бюджет или направление
- "на выходные" → ближайшие пятница-воскресенье
- "в Питер", "в Сочи" → destination + destinationCode (LED, AER...)
- Если указан город назначения — tripType можно вывести автоматически (Питер=city, Сочи=sea)
- Если указаны destination + budget + dates — сразу intent: "search_trip"
- origin — ОБЯЗАТЕЛЬНО. Не подставляй Москву по умолчанию. Принимай посёлки (пос. Целина, с. X)
- Система — навигатор отдыха: электричка/автобус → поезд → перелёт с удобной стыковкой
- Даты в текущем или следующем году
- Формат дат DD.MM или DD.MM.YYYY (например "19.06 - 21.06")
- В context переданы уже известные параметры — объединяй с новыми, не затирай null-ом
- Если после объединения все поля заполнены — intent: "search_trip"`;

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('AITUNNEL_API_KEY', '');
    this.baseUrl = this.config
      .get<string>('AITUNNEL_BASE_URL', 'https://api.aitunnel.ru/v1/')
      .replace(/\/$/, '');
    this.model = this.config.get<string>('AITUNNEL_MODEL', 'deepseek-v4-flash');
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async parseIntent(
    text: string,
    context: Record<string, unknown> = {},
  ): Promise<ParsedIntent | null> {
    if (!this.apiKey) return null;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: JSON.stringify({
                message: text,
                context: context.preferences ?? {},
              }),
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) return null;

      const parsed = JSON.parse(content) as {
        intent: ParsedIntent['intent'];
        preferences: TravelPreferences;
        missingFields?: string[];
        clarifyingQuestion?: string | null;
        confidence?: number;
      };

      const preferences = this.normalizePreferences(
        parsed.preferences,
        (context.preferences as TravelPreferences) ?? {},
      );

      if (!preferences.originCode && preferences.origin) {
        this.applyOriginFromName(preferences);
      }

      return {
        intent: parsed.intent ?? 'unknown',
        preferences,
        missingFields: parsed.missingFields ?? [],
        clarifyingQuestion: parsed.clarifyingQuestion ?? undefined,
        confidence: parsed.confidence ?? 0.8,
      };
    } catch (error) {
      this.logger.warn('AITUNNEL LLM failed, falling back to rule-based parser');
      return null;
    }
  }

  private normalizePreferences(
    raw: TravelPreferences,
    existing: TravelPreferences = {},
  ): TravelPreferences {
    const prefs: TravelPreferences = { ...existing };

    for (const [key, value] of Object.entries(raw ?? {})) {
      if (value !== null && value !== undefined && value !== '') {
        (prefs as Record<string, unknown>)[key] = value;
      }
    }

    prefs.currency = prefs.currency ?? 'RUB';

    if (prefs.budget && typeof prefs.budget === 'string') {
      prefs.budget = parseInt(String(prefs.budget).replace(/\s/g, ''), 10);
    }

    return prefs;
  }

  private applyOriginFromName(prefs: TravelPreferences): void {
    const graphNode = resolveRouteNode(prefs.origin);
    if (graphNode) {
      prefs.origin = graphNode.name;
      prefs.originHasAirport = Boolean(graphNode.airportCode) && graphNode.kind !== 'settlement';
      prefs.originCode = graphNode.airportCode;
      return;
    }

    const info = resolveOriginCity(prefs.origin);
    if (!info) return;
    prefs.origin = info.name;
    prefs.originHasAirport = info.hasAirport;
    prefs.originCode = getFlightOriginCode(info);
  }
}
