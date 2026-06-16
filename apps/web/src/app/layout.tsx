import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { TelegramProvider } from '@/components/telegram-provider';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'Travellta — AI Travel Assistant',
  description: 'Подбор идеального отпуска: билеты, отели и маршруты',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0c4a6e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} h-dvh`}>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className="h-dvh overflow-hidden antialiased">
        <TelegramProvider>
          <div className="h-dvh flex flex-col bg-gradient-to-b from-sky-50 via-background to-cyan-50/30 dark:from-sky-950 dark:via-background dark:to-cyan-950/20">
            {children}
          </div>
        </TelegramProvider>
      </body>
    </html>
  );
}
