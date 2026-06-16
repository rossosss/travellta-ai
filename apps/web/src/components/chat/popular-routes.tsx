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
    <div className="space-y-2.5">
      <p className="text-xs font-medium text-muted-foreground px-1">
        Популярные направления
      </p>
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {routes.map((route) => (
          <button
            key={route.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(route.prompt)}
            className="snap-start shrink-0 w-[140px] rounded-2xl overflow-hidden bg-card border border-border/50 shadow-sm text-left active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <div className="relative h-20 w-full">
              <Image
                src={route.imageUrl}
                alt={route.title}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-1.5 left-2 text-white text-xs font-semibold leading-tight">
                {route.title}
              </span>
            </div>
            <div className="p-2">
              <p className="text-[10px] text-muted-foreground truncate">{route.subtitle}</p>
              <p className="text-[10px] text-primary font-medium mt-0.5">
                от {formatPrice(route.priceFrom)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
