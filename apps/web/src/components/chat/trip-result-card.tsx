'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { RouteStage, TransportLeg, TransportRoute, TripPackage } from '@/types/chat';
import {
  Bus,
  Calendar,
  Car,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Hotel,
  MapPin,
  Plane,
  Star,
  Train,
  TramFront,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface TripResultCardProps {
  trip: TripPackage;
}

function formatPrice(price: number, currency = 'RUB') {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency === 'RUB' ? 'RUB' : currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

function formatDateTime(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} мин`;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return rh > 0 ? `${d} д ${rh} ч` : `${d} д`;
  }
  return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
}

function legIcon(mode: TransportLeg['mode']) {
  switch (mode) {
    case 'train':
      return Train;
    case 'bus':
      return Bus;
    case 'suburban':
      return TramFront;
    case 'local':
      return Car;
    default:
      return Plane;
  }
}

function legModeLabel(mode: TransportLeg['mode']) {
  switch (mode) {
    case 'train':
      return 'Поезд';
    case 'bus':
      return 'Автобус';
    case 'suburban':
      return 'Электричка';
    case 'local':
      return 'Добраться';
    default:
      return 'Самолёт';
  }
}

function tagLabel(tag?: TransportRoute['tag']) {
  switch (tag) {
    case 'recommended':
      return 'Рекомендуем';
    case 'cheapest':
      return 'Дешевле';
    case 'fastest':
      return 'Быстрее';
    default:
      return null;
  }
}

function ConvenienceStars({ score }: { score?: number }) {
  if (!score) return null;
  const full = Math.round(score);
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-2.5 h-2.5 ${i < full ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </span>
  );
}

function LegTimeline({ leg }: { leg: TransportLeg }) {
  const Icon = legIcon(leg.mode);
  const dep = formatDateTime(leg.departureAt);
  const arr = formatDateTime(leg.arrivalAt);

  return (
    <div className="flex gap-2.5 lg:gap-3 py-2 lg:py-2.5 border-l-2 border-primary/20 ml-1.5 pl-3 relative">
      <div className="absolute -left-[5px] top-3 w-2 h-2 rounded-full bg-primary/60" />
      <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 text-muted-foreground mt-0.5" />
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] lg:text-xs font-medium text-primary/80 uppercase tracking-wide">
            {legModeLabel(leg.mode)}
          </span>
          {leg.convenience && <ConvenienceStars score={leg.convenience} />}
        </div>
        <p className="text-xs lg:text-sm font-medium leading-snug">
          {leg.from} → {leg.to}
        </p>
        <p className="text-[10px] lg:text-xs text-muted-foreground leading-snug">{leg.description}</p>
        {leg.note && (
          <p className="text-[10px] lg:text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 rounded px-1.5 py-0.5">
            {leg.note}
          </p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] lg:text-xs text-muted-foreground">
          {dep && (
            <span className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
              {dep}
              {arr && ` → ${arr}`}
            </span>
          )}
          <span>{formatDuration(leg.duration)}</span>
          <span>{leg.carrier}</span>
          {leg.scheduleHint && <span className="italic">{leg.scheduleHint}</span>}
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-xs lg:text-sm font-semibold text-primary">{formatPrice(leg.price)}</span>
          <a
            href={leg.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] lg:text-xs text-primary hover:underline"
          >
            Купить <ExternalLink className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function RouteStages({ route }: { route: TransportRoute }) {
  const stages: RouteStage[] =
    route.stages ??
    [{ id: 'all', label: 'Маршрут', legIndexes: route.legs.map((_, i) => i) }];

  return (
    <div className="space-y-1">
      {stages.map((stage) => (
        <div key={stage.id}>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">
            {stage.label}
          </p>
          {stage.legIndexes.map((idx) => (
            <LegTimeline key={route.legs[idx]?.id ?? idx} leg={route.legs[idx]} />
          ))}
        </div>
      ))}
    </div>
  );
}

function RouteCard({
  route,
  defaultExpanded,
}: {
  route: TransportRoute;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);

  return (
    <div className="rounded-xl border border-border/50 bg-muted/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-2.5 lg:p-3.5 flex items-start justify-between gap-2 hover:bg-muted/50 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs lg:text-sm font-medium">{route.label}</p>
            {route.tag && (
              <Badge variant="outline" className="text-[9px] lg:text-[10px] px-1.5 py-0 h-4">
                {tagLabel(route.tag)}
              </Badge>
            )}
            {route.convenienceScore && (
              <ConvenienceStars score={route.convenienceScore} />
            )}
          </div>
          <p className="text-[10px] lg:text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
            {route.summary}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] lg:text-xs text-muted-foreground">
            <span>{route.legs.length} участков</span>
            <span>·</span>
            <span>~{formatDuration(route.totalDuration)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs lg:text-sm font-semibold text-primary">
            {formatPrice(route.totalPrice, route.currency)}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-2.5 pb-2.5 border-t border-border/30">
          <RouteStages route={route} />
        </div>
      )}
    </div>
  );
}

function RouteNavigator({
  title,
  routes,
}: {
  title: string;
  routes: TransportRoute[];
}) {
  const [showAll, setShowAll] = useState(false);

  if (!routes?.length) return null;

  const visible = showAll ? routes : routes.slice(0, 1);
  const hiddenCount = routes.length - 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs lg:text-sm font-medium text-muted-foreground">{title}</p>
        {routes.length > 1 && (
          <span className="text-[10px] lg:text-xs text-muted-foreground">
            {routes.length} вариант{routes.length > 4 ? 'ов' : routes.length > 1 ? 'а' : ''}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {visible.map((route, i) => (
          <RouteCard key={route.id} route={route} defaultExpanded={i === 0 && !showAll} />
        ))}
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="w-full text-center text-xs text-primary py-2 rounded-lg border border-dashed border-primary/30 hover:bg-primary/5 transition-colors"
        >
          {showAll
            ? 'Свернуть варианты'
            : `Показать все ${routes.length} вариант${routes.length > 4 ? 'ов' : 'а'} маршрута`}
        </button>
      )}
    </div>
  );
}

export function TripResultCard({ trip }: TripResultCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-card/95 backdrop-blur-sm h-full flex flex-col">
      <div className="relative h-40 lg:h-48 w-full shrink-0">
        <Image
          src={trip.imageUrl}
          alt={trip.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 lg:bottom-4 lg:left-4 lg:right-4">
          <h3 className="text-white font-semibold text-lg lg:text-xl">{trip.title}</h3>
          <p className="text-white/80 text-xs lg:text-sm mt-0.5">{trip.description}</p>
        </div>
      </div>

      <CardContent className="p-4 lg:p-5 space-y-4 lg:space-y-5 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs lg:text-sm text-muted-foreground space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              {formatDate(trip.dateFrom)} — {formatDate(trip.dateTo)}
            </div>
            <p>Из: {trip.originCity}</p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 shrink-0 text-xs lg:text-sm">
            {formatPrice(trip.totalPrice, trip.currency)}
          </Badge>
        </div>

        {trip.transportNote && (
          <p className="text-[11px] lg:text-sm text-primary/90 bg-primary/5 rounded-lg px-2.5 py-2 lg:px-3 lg:py-2.5 leading-snug">
            {trip.transportNote}
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <RouteNavigator title="🧭 Маршрут туда" routes={trip.outboundRoutes} />
          <RouteNavigator title="🧭 Маршрут обратно" routes={trip.inboundRoutes} />
        </div>

        <div className="flex items-start gap-2.5 p-2.5 lg:p-3 rounded-xl bg-muted/50">
          <Hotel className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs lg:text-sm font-medium truncate">{trip.hotel.name}</p>
            <div className="flex items-center gap-1 text-xs lg:text-sm text-muted-foreground">
              <Star className="w-3 h-3 lg:w-3.5 lg:h-3.5 fill-amber-400 text-amber-400" />
              {trip.hotel.rating} · {formatPrice(trip.hotel.totalPrice, 'RUB')}
            </div>
          </div>
          <a
            href={trip.hotel.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-7 w-7 lg:h-8 lg:w-8 rounded-md hover:bg-accent shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </a>
        </div>

        <div>
          <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
            Что посмотреть
          </p>
          <div className="flex flex-wrap gap-1.5 lg:gap-2">
            {trip.categories.map((cat) => (
              <span
                key={cat.id}
                className="text-xs lg:text-sm px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full bg-secondary text-secondary-foreground"
              >
                {cat.icon} {cat.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 lg:gap-1.5">
          {trip.highlights.map((h) => (
            <Badge key={h} variant="outline" className="text-[10px] lg:text-xs font-normal">
              {h}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
