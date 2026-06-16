import { Injectable } from '@nestjs/common';
import {
  getFlightOriginCode,
  ORIGIN_CITY_MAP,
  resolveOriginCity,
} from '../travel/origin-cities.data';
import { resolveRouteNode } from '../travel/route-graph.data';
import { DESTINATION_MAP } from '../travel/popular-routes.data';
import { ParsedIntent, TravelPreferences } from '../travel/travel.types';
import { LlmService } from './llm.service';

const MONTHS: Record<string, number> = {
  январ: 0,
  феврал: 1,
  март: 2,
  апрел: 3,
  май: 4,
  июн: 5,
  июл: 6,
  август: 7,
  сентябр: 8,
  октябр: 9,
  ноябр: 10,
  декабр: 11,
};

@Injectable()
export class IntentParserService {
  constructor(private readonly llm: LlmService) {}

  async parse(
    text: string,
    context: Record<string, unknown> = {},
  ): Promise<ParsedIntent> {
    const aiResult = await this.llm.parseIntent(text, context);
    if (aiResult && aiResult.intent !== 'unknown') {
      const merged = this.enrichPreferences(
        this.mergePreferences(
          (context.preferences as TravelPreferences) ?? {},
          aiResult.preferences,
        ),
        text,
      );
      aiResult.preferences = merged;
      aiResult.missingFields = this.getMissingFields(merged);

      if (aiResult.missingFields.length === 0) {
        aiResult.intent = 'search_trip';
      } else {
        aiResult.intent = 'clarify';
        aiResult.clarifyingQuestion = this.buildClarifyingQuestion(
          aiResult.missingFields[0],
          merged,
        );
      }

      return aiResult;
    }

    return this.parseWithRules(text, context);
  }

  parseWithRules(text: string, context: Record<string, unknown> = {}): ParsedIntent {
    const lower = text.toLowerCase();
    const preferences: TravelPreferences = {
      ...(context.preferences as TravelPreferences),
    };

    this.extractDestination(lower, preferences);
    this.extractDates(lower, preferences);
    this.extractWeekend(lower, preferences);
    this.extractBudget(lower, preferences);
    this.extractTripType(lower, preferences);
    this.extractOrigin(lower, preferences);
    this.extractTravelers(lower, preferences);

    const enriched = this.enrichPreferences(preferences, text);
    const missingFields = this.getMissingFields(enriched);

    if (lower.includes('удач') || lower.includes('сюрприз') || lower.includes('случайн')) {
      return {
        intent: 'lucky_start',
        preferences: enriched,
        missingFields: [],
        confidence: 0.9,
      };
    }

    if (context.luckyMode && context.luckyStep !== undefined) {
      return {
        intent: 'lucky_answer',
        preferences: { ...enriched, preferences: [text] },
        missingFields: [],
        confidence: 0.85,
      };
    }

    if (missingFields.length > 0) {
      return {
        intent: 'clarify',
        preferences: enriched,
        missingFields,
        clarifyingQuestion: this.buildClarifyingQuestion(missingFields[0], enriched),
        confidence: 0.7,
      };
    }

    return {
      intent: 'search_trip',
      preferences: enriched,
      missingFields: [],
      confidence: 0.85,
    };
  }

  mapLuckyAnswer(
    questionId: string,
    answer: string,
    preferences: TravelPreferences,
  ): TravelPreferences {
    const updated = { ...preferences };

    if (questionId === 'origin') {
      const map: Record<string, string> = {
        Москва: 'Москва',
        'Санкт-Петербург': 'Санкт-Петербург',
        Казань: 'Казань',
      };
      updated.origin = map[answer] ?? answer;
    }

    if (questionId === 'vibe') {
      if (answer.includes('мор')) updated.tripType = 'sea';
      else if (answer.includes('город') || answer.includes('культур')) updated.tripType = 'city';
      else if (answer.includes('гор') || answer.includes('природ')) updated.tripType = 'mountains';
      else updated.tripType = 'any';
    }

    if (questionId === 'company') {
      if (answer.includes('семь')) updated.travelers = 4;
      else if (answer.includes('друз')) updated.travelers = 3;
      else if (answer.includes('Пара') || answer.includes('пар')) updated.travelers = 2;
      else updated.travelers = 1;
    }

    if (questionId === 'pace') {
      updated.preferences = [...(updated.preferences ?? []), answer];
    }

    return updated;
  }

  private enrichPreferences(prefs: TravelPreferences, text: string): TravelPreferences {
    const enriched = { ...prefs };
    const lower = text.toLowerCase();

    // Правила из текста важнее LLM — явный «из пос. Целина» не должен стать «Москва»
    this.extractDestination(lower, enriched);
    this.extractOrigin(lower, enriched);
    this.applyOriginMeta(enriched);

    if (enriched.destinationCode && !enriched.tripType) {
      const dest = Object.values(DESTINATION_MAP).find(
        (d) => d.code === enriched.destinationCode,
      );
      if (dest) enriched.tripType = dest.tripType;
    }

    if (!enriched.budget && /выходн|weekend/i.test(text)) {
      enriched.budget = 30000;
      enriched.currency = 'RUB';
    }

    return enriched;
  }

  private applyOriginMeta(prefs: TravelPreferences): void {
    const graphNode = resolveRouteNode(prefs.origin);
    if (graphNode) {
      prefs.origin = graphNode.name;
      prefs.originHasAirport =
        Boolean(graphNode.airportCode) && graphNode.kind !== 'settlement';
      if (graphNode.airportCode && graphNode.kind !== 'settlement') {
        prefs.originCode = graphNode.airportCode;
      } else {
        delete prefs.originCode;
      }
      return;
    }

    const info = resolveOriginCity(prefs.origin, prefs.originCode);
    if (!info) return;

    prefs.origin = info.name;
    prefs.originHasAirport = info.hasAirport;
    if (info.hasAirport && info.airportCode) {
      prefs.originCode = info.airportCode;
    } else {
      delete prefs.originCode;
    }
  }

  private extractDestination(text: string, prefs: TravelPreferences): void {
    const toMatch = text.match(
      /(?:^|\s)(?:(?:хочу|еду|лечу|планирую|направляюсь|собираюсь)\s+(?:поехать\s+)?)?(?:в|на|до)\s+([а-яё\-]+(?:\s+[а-яё\-]+)?)/i,
    );
    const candidates = [toMatch?.[1]?.toLowerCase(), text];

    for (const candidate of candidates) {
      if (!candidate) continue;
      for (const [key, dest] of Object.entries(DESTINATION_MAP)) {
        if (candidate.includes(key)) {
          prefs.destination = dest.name;
          prefs.destinationCode = dest.code;
          if (!prefs.tripType) prefs.tripType = dest.tripType;
          return;
        }
      }
    }
  }

  private extractWeekend(text: string, prefs: TravelPreferences): void {
    if (prefs.dateFrom && prefs.dateTo) return;
    if (!/выходн|weekend|на\s+выходные/i.test(text)) return;

    const now = new Date();
    const day = now.getDay();
    let daysUntilFriday = (5 - day + 7) % 7;
    if (daysUntilFriday === 0 && now.getHours() >= 15) daysUntilFriday = 7;

    const friday = new Date(now);
    friday.setDate(now.getDate() + daysUntilFriday);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);

    prefs.dateFrom = this.formatDateLocal(friday);
    prefs.dateTo = this.formatDateLocal(sunday);
  }

  private extractDates(text: string, prefs: TravelPreferences): void {
    const dotRange = text.match(
      /(\d{1,2})\.(\d{1,2})\s*(?:-|–|—|по)\s*(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?/,
    );

    if (dotRange) {
      const year = dotRange[5]
        ? parseInt(dotRange[5], 10)
        : this.inferYear(parseInt(dotRange[2], 10), parseInt(dotRange[1], 10));
      prefs.dateFrom = this.formatDate(
        year,
        parseInt(dotRange[2], 10) - 1,
        parseInt(dotRange[1], 10),
      );
      prefs.dateTo = this.formatDate(
        year,
        parseInt(dotRange[4], 10) - 1,
        parseInt(dotRange[3], 10),
      );
      return;
    }

    const rangeMatch = text.match(
      /(\d{1,2})\s*(?:-|–|—|по)\s*(\d{1,2})\s*(январ|феврал|март|апрел|ма[йя]|июн|июл|август|сентябр|октябр|ноябр|декабр)/i,
    );

    if (rangeMatch) {
      const year = new Date().getFullYear();
      const monthKey = Object.keys(MONTHS).find((k) =>
        rangeMatch[3].toLowerCase().startsWith(k),
      );
      if (monthKey !== undefined) {
        const month = MONTHS[monthKey];
        prefs.dateFrom = this.formatDate(year, month, parseInt(rangeMatch[1], 10));
        prefs.dateTo = this.formatDate(year, month, parseInt(rangeMatch[2], 10));
      }
    }
  }

  private mergePreferences(
    existing: TravelPreferences,
    incoming: TravelPreferences,
  ): TravelPreferences {
    const merged = { ...existing };
    for (const [key, value] of Object.entries(incoming ?? {})) {
      if (value !== null && value !== undefined && value !== '') {
        (merged as Record<string, unknown>)[key] = value;
      }
    }
    return merged;
  }

  private inferYear(month: number, day: number): number {
    const now = new Date();
    const year = now.getFullYear();
    const candidate = new Date(year, month - 1, day);
    return candidate < now ? year + 1 : year;
  }

  private extractBudget(text: string, prefs: TravelPreferences): void {
    const match = text.match(/(\d[\d\s.]*)\s*(?:руб|₽|rub)/i);
    if (match) {
      prefs.budget = parseInt(match[1].replace(/[\s.]/g, ''), 10);
      prefs.currency = 'RUB';
    }
  }

  private extractTripType(text: string, prefs: TravelPreferences): void {
    if (prefs.destinationCode) return;
    if (/мор|пляж|океан|sea/.test(text)) prefs.tripType = 'sea';
    else if (/город|культур|музе|питер|спб|москв|стамбул|париж/.test(text))
      prefs.tripType = 'city';
    else if (/гор|trek|природ/.test(text)) prefs.tripType = 'mountains';
  }

  private extractOrigin(text: string, prefs: TravelPreferences): void {
    const fromMatch = text.match(
      /(?:^|\s)(?:я\s+)?(?:из|откуда|вылет(?:ом)?\s+из|ехать\s+из|выезжа(?:ю|ем)\s+из)\s+(.+?)(?=\s+(?:хочу|еду|лет(?:им|еть|ю|им)?|планиру|нужно|собира|поед|направля|\d{1,2}\.\d|\d+\s*(?:руб|₽)|(?:в|на|до)\s)|,\s*(?:в|на|до)\s|$)/i,
    );

    if (!fromMatch) return;

    const rawOrigin = this.normalizePlacePhrase(fromMatch[1]);
    const originLower = rawOrigin.toLowerCase();

    const graphNode = resolveRouteNode(rawOrigin);
    if (graphNode) {
      prefs.origin = graphNode.name;
      prefs.originHasAirport = Boolean(graphNode.airportCode) && graphNode.kind !== 'settlement';
      prefs.originCode = graphNode.airportCode;
      return;
    }

    for (const [key, info] of Object.entries(ORIGIN_CITY_MAP)) {
      if (this.isDestinationAlias(key, prefs)) continue;
      if (originLower.includes(key)) {
        prefs.origin = info.name;
        prefs.originHasAirport = info.hasAirport;
        prefs.originCode = getFlightOriginCode(info);
        return;
      }
    }

    // Неизвестный населённый пункт — оставляем как есть для геокодинга
    prefs.origin = rawOrigin;
    delete prefs.originCode;
    delete prefs.originHasAirport;
  }

  private normalizePlacePhrase(phrase: string): string {
    const trimmed = phrase.trim().replace(/\s+/g, ' ');
    if (!trimmed) return trimmed;
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  private isDestinationAlias(key: string, prefs: TravelPreferences): boolean {
    if (prefs.destination?.toLowerCase().includes(key)) return true;
    if (!prefs.destinationCode) return false;
    for (const dest of Object.values(DESTINATION_MAP)) {
      if (dest.code === prefs.destinationCode && dest.name.toLowerCase().includes(key)) {
        return true;
      }
    }
    return false;
  }

  private extractTravelers(text: string, prefs: TravelPreferences): void {
    const match = text.match(/(\d+)\s*(?:человек|чел|пассажир)/i);
    if (match) prefs.travelers = parseInt(match[1], 10);
  }

  private getMissingFields(prefs: TravelPreferences): string[] {
    const missing: string[] = [];
    if (!prefs.origin) missing.push('origin');
    if (!prefs.dateFrom || !prefs.dateTo) missing.push('dates');
    if (!prefs.budget) missing.push('budget');
    if (!prefs.tripType && !prefs.destinationCode) missing.push('tripType');
    return missing;
  }

  private buildClarifyingQuestion(field: string, prefs: TravelPreferences): string {
    if (field === 'origin') {
      return 'Откуда выезжаете? Укажите город или посёлок — построим маршрут до аэропорта: электричка, автобус, поезд и перелёт с удобной стыковкой.';
    }

    if (field === 'dates') {
      if (prefs.destination) {
        return `На какие даты планируете поездку в ${prefs.destination}? (например: 19.06 – 21.06)`;
      }
      return 'На какие даты планируете поездку? (например: 19.06 – 21.06)';
    }

    const questions: Record<string, string> = {
      budget: prefs.destination
        ? `Какой бюджет на поездку в ${prefs.destination}?`
        : 'Какой у вас бюджет на поездку?',
      tripType: 'Куда хотите — на море, в город или на природу?',
    };
    return questions[field] ?? 'Уточните: из какого города, даты и бюджет?';
  }

  private formatDate(year: number, month: number, day: number): string {
    const d = new Date(year, month, day);
    return this.formatDateLocal(d);
  }

  private formatDateLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
