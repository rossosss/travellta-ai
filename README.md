# Travellta AI

Telegram Mini App для подбора идеального отпуска: билеты, отели и маршруты на основе естественного языка.

## Стек

- **Frontend:** Next.js 16, shadcn/ui, Tailwind CSS, Telegram WebApp SDK
- **Backend:** NestJS, TypeORM, PostgreSQL, AITUNNEL (DeepSeek)
- **API:** Travelpayouts (Aviasales, Hotellook, партнёрские ссылки)

## Быстрый старт

### 1. Переменные окружения

```bash
cp .env.example .env
```

Заполните `.env`:
- `TRAVELPAYOUTS_TOKEN` — токен из [Travelpayouts](https://www.travelpayouts.com/)
- `TRAVELPAYOUTS_MARKER` — partner marker
- `TRAVELPAYOUTS_TRS` — ID проекта
- `TELEGRAM_BOT_TOKEN` — токен Telegram-бота
- `AITUNNEL_API_KEY` — ключ [AITUNNEL](https://aitunnel.ru) (модель `deepseek-v4-flash`)

> Без токенов Travelpayouts приложение работает с демо-данными.
> Без AITUNNEL — с rule-based парсером (regex).

### 2. База данных

```bash
npm run db:up
```

### 3. Запуск

```bash
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

## Telegram Mini App

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Настройте Web App URL (Menu Button → ваш домен)
3. Укажите `TELEGRAM_BOT_TOKEN` в `.env`

## Возможности

- **Чат-интерфейс** — опишите отпуск обычным языком
- **Умный парсинг** — даты, бюджет, тип отдыха из текста
- **Подбор пакетов** — перелёты туда-обратно + отель + категории мест
- **Испытать удачу** — несколько вопросов → сюрприз-путешествие
- **Партнёрские ссылки** — покупка билетов и отелей через Travelpayouts

## Структура

```
apps/
  web/     — Next.js Telegram Mini App
  api/     — NestJS REST API
docker-compose.yml — PostgreSQL
```

## API Endpoints

| Method | Path | Описание |
|--------|------|----------|
| POST | `/api/chat/message` | Отправить сообщение |
| POST | `/api/chat/lucky/start` | Начать «Испытать удачу» |
| POST | `/api/chat/lucky/answer` | Ответ на вопрос lucky-режима |
| GET | `/api/chat/session/:id` | История сессии |

Все запросы требуют заголовок `X-Telegram-Init-Data`.
