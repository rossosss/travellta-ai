'use client';

import type { PopularRoute } from '@/types/chat';
import Image from 'next/image';

interface PopularRoutesProps {
  routes: PopularRoute[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
}

export function PopularRoutes({ routes, onSelect, disabled }: PopularRoutesProps) {
  if (!routes.length) return null;

  return (
    <div className="space-y-2.5 lg:space-y-3">
      <p className="text-xs lg:text-sm font-medium text-muted-foreground px-1">
        Популярные направления
      </p>

      {/* Mobile: horizontal scroll */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
        {routes.map((route) => (
          <PopularRouteCard
            key={route.id}
            route={route}
            onSelect={onSelect}
            disabled={disabled}
            compact
          />
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {routes.map((route) => (
          <PopularRouteCard
            key={route.id}
            route={route}
            onSelect={onSelect}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

function PopularRouteCard({
  route,
  onSelect,
  disabled,
  compact,
}: {
  route: PopularRoute;
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(route.prompt)}
      className={`snap-start shrink-0 rounded-2xl overflow-hidden bg-card border border-border/50 shadow-sm text-left hover:border-primary/30 hover:shadow-md transition-all disabled:opacity-50 ${
        compact ? 'w-[140px] active:scale-[0.98]' : 'w-full'
      }`}
    >
      <div className={`relative w-full ${compact ? 'h-20' : 'h-28'}`}>
        <Image
          src={route.imageUrl}
          alt={route.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span
          className={`absolute bottom-1.5 left-2 text-white font-semibold leading-tight ${
            compact ? 'text-xs' : 'text-sm'
          }`}
        >
          {route.title}
        </span>
      </div>
      <div className={compact ? 'p-2' : 'p-3'}>
        <p className={`text-muted-foreground truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {route.subtitle}
        </p>
        <p
          className={`text-primary font-medium mt-0.5 ${compact ? 'text-[10px]' : 'text-xs'}`}
        >
          от {formatPrice(route.priceFrom)}
        </p>
      </div>
    </button>
  );
}
