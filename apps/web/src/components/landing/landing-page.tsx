'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { FeedbackForm } from '@/components/landing/feedback-form';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bus,
  CheckCircle2,
  Compass,
  MapPin,
  MessageSquare,
  Plane,
  Sparkles,
  Train,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
};

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col">
        <div className="absolute inset-0 landing-hero-bg" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(34,211,238,0.2),transparent_55%)]" />

        <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">{siteConfig.name}</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#how" className="hover:text-foreground transition-colors">
                Как работает
              </a>
              <a href="#feedback" className="hover:text-foreground transition-colors">
                Опрос
              </a>
            </nav>
            <Link
              href="/chat"
              className={cn(buttonVariants(), 'rounded-full shadow-md h-9 px-4')}
            >
              Попробовать
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </header>

        <div className="relative z-10 flex-1 flex items-center px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center w-full">
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/10 border border-white/50 backdrop-blur mb-6">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                AI-навигатор отдыха
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight">
                <span className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
                  От дома
                </span>
                <br />
                до курорта — одним маршрутом
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                {siteConfig.tagline}. Travellta строит путь из вашего посёлка или города:
                автобус, поезд, перелёт — с удобными стыковками и понятной ценой.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/chat"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'rounded-full h-12 px-8 bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 shadow-xl shadow-violet-500/25 text-white border-0',
                  )}
                >
                  Спланировать поездку
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  href="#feedback"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'rounded-full h-12 px-8 bg-white/60 backdrop-blur',
                  )}
                >
                  Помочь с продуктом
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative hidden lg:block"
            >
              <div className="rounded-3xl bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-white/60 shadow-2xl p-6 space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Пример маршрута
                </p>
                <div className="flex items-center gap-2 flex-wrap text-sm font-medium">
                  <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                    пос. Целина
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-900 dark:bg-orange-900/40">Ростов</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-900/40">Москва</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="px-3 py-1.5 rounded-full bg-cyan-100 text-cyan-900 dark:bg-cyan-900/40">Пхукет ✈️</span>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { icon: Bus, label: 'Автобус', time: '~2 ч' },
                    { icon: Train, label: 'Поезд', time: '~15 ч' },
                    { icon: Plane, label: 'Перелёт', time: '~10 ч' },
                  ].map(({ icon: Icon, label, time }) => (
                    <div key={label} className="rounded-2xl bg-muted/50 p-3 text-center">
                      <Icon className="w-5 h-5 mx-auto text-primary mb-1" />
                      <p className="text-xs font-medium">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{time}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 rounded-full bg-fuchsia-400/20 blur-3xl" />
              <div className="absolute -z-10 -bottom-8 -left-8 w-72 h-72 rounded-full bg-cyan-400/25 blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Как это работает</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Напишите обычным языком — мы разберём откуда, куда и когда, и соберём мультимodal маршрут
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: MessageSquare,
                title: 'Опишите поездку',
                text: '«Из Егорлыка в Москву 25.06–28.06» или «с пос. Целина на Пхукет»',
                color: 'from-violet-500 to-purple-600',
              },
              {
                step: '02',
                icon: MapPin,
                title: 'Найдём путь',
                text: 'Геокодинг + 200 транспортных хабов + граф маршрутов по России',
                color: 'from-fuchsia-500 to-pink-600',
              },
              {
                step: '03',
                icon: Compass,
                title: 'Выберите вариант',
                text: 'Несколько маршрутов: быстрее, дешевле, через разные города',
                color: 'from-cyan-500 to-teal-600',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-3xl bg-card border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold text-muted-foreground/60">{item.step}</span>
                <h3 className="text-lg font-semibold mt-1 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section id="feedback" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/80 via-fuchsia-50/50 to-cyan-50/80 dark:from-violet-950/20 dark:via-transparent dark:to-cyan-950/20" />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Помогите нам понять
              <span className="text-violet-600"> вашу аудиторию</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Travellta на ранней стадии. Короткий опрос займёт 2 минуты — мы поймём, для кого
              делать продукт в первую очередь: жителей посёлков, путешественников из регионов,
              семей с детьми или частых летающих.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                'Ответы анонимны, email — только если хотите связи',
                'Влияет на приоритеты разработки',
                'Участники опроса — первые в бета-доступе',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
            <FeedbackForm />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 p-8 sm:p-12 text-center text-white shadow-2xl shadow-violet-500/30">
          <h2 className="text-2xl sm:text-3xl font-bold">Готовы спланировать отпуск?</h2>
          <p className="mt-3 text-white/85 max-w-lg mx-auto">
            Откройте навигатор и опишите поездку — AI подберёт маршрут и варианты размещения
          </p>
          <Link
            href="/chat"
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'lg' }),
              'mt-8 rounded-full h-12 px-10 font-semibold',
            )}
          >
            Открыть навигатор
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" />
            <span>{siteConfig.name} © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/chat" className="hover:text-foreground transition-colors">
              Навигатор
            </Link>
            <a href="#feedback" className="hover:text-foreground transition-colors">
              Опрос
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
