'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';

const AUDIENCE_OPTIONS = [
  { value: 'settlement', label: 'Живу в посёлке / маленьком городе' },
  { value: 'regional', label: 'Живу в областном центре' },
  { value: 'capital', label: 'Живу в Москве / Петербурге / миллионнике' },
  { value: 'abroad', label: 'Часто лечу за границу' },
  { value: 'business', label: 'Много езжу по работе' },
  { value: 'family', label: 'Планирую семейный отпуск' },
  { value: 'other', label: 'Другое' },
];

const FREQUENCY_OPTIONS = [
  { value: 'rare', label: 'Редко — 1–2 раза в год' },
  { value: 'often', label: 'Несколько раз в год' },
  { value: 'monthly', label: 'Почти каждый месяц' },
];

export function FeedbackForm() {
  const [audienceType, setAudienceType] = useState('');
  const [travelFrequency, setTravelFrequency] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [painPoint, setPainPoint] = useState('');
  const [wish, setWish] = useState('');
  const [contactOk, setContactOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audienceType) {
      setError('Выберите, кто вы — это поможет нам понять аудиторию');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.sendFeedback({
        name: name || undefined,
        email: email || undefined,
        audienceType,
        travelFrequency: travelFrequency || undefined,
        painPoint: painPoint || undefined,
        wish: wish || undefined,
        contactOk,
        source: 'landing',
      });
      setDone(true);
    } catch {
      setError('Не удалось отправить. Попробуйте позже или напишите на hello@travellta.ru');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl bg-white/90 dark:bg-card/90 backdrop-blur-xl border border-white/60 shadow-xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Спасибо!</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Ваш ответ сохранён. Мы учтём его при разработке Travellta — навигатора, который
          действительно нужен людям.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white/90 dark:bg-card/90 backdrop-blur-xl border border-white/60 shadow-xl p-6 sm:p-8 space-y-5"
      id="feedback"
    >
      <div>
        <label htmlFor="audience" className="block text-sm font-medium mb-2">
          Кто вы? <span className="text-rose-500">*</span>
        </label>
        <select
          id="audience"
          value={audienceType}
          onChange={(e) => setAudienceType(e.target.value)}
          className="w-full h-11 rounded-xl border border-input bg-background/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          required
        >
          <option value="">Выберите вариант</option>
          {AUDIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.label}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="frequency" className="block text-sm font-medium mb-2">
          Как часто путешествуете?
        </label>
        <select
          id="frequency"
          value={travelFrequency}
          onChange={(e) => setTravelFrequency(e.target.value)}
          className="w-full h-11 rounded-xl border border-input bg-background/80 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Не указано</option>
          {FREQUENCY_OPTIONS.map((o) => (
            <option key={o.value} value={o.label}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="pain" className="block text-sm font-medium mb-2">
          Что сложнее всего при планировании поездки?
        </label>
        <Textarea
          id="pain"
          value={painPoint}
          onChange={(e) => setPainPoint(e.target.value)}
          placeholder="Например: добраться из посёлка до аэропорта, стыковки, бюджет..."
          rows={3}
          className="rounded-xl bg-background/80 resize-none"
        />
      </div>

      <div>
        <label htmlFor="wish" className="block text-sm font-medium mb-2">
          Что вы ждёте от Travellta?
        </label>
        <Textarea
          id="wish"
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          placeholder="Идеальный сценарий: написал «из Москвы в Сочи» — получил маршрут..."
          rows={3}
          className="rounded-xl bg-background/80 resize-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Имя
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как к вам обращаться"
            className="rounded-xl h-11 bg-background/80"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="для связи (необязательно)"
            className="rounded-xl h-11 bg-background/80"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={contactOk}
          onChange={(e) => setContactOk(e.target.checked)}
          className="mt-1 rounded border-input"
        />
        <span>Можно связаться со мной, когда запустим бета-версию</span>
      </label>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-violet-500/25"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Отправляем...
          </>
        ) : (
          'Отправить ответ'
        )}
      </Button>
    </form>
  );
}
