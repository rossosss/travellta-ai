'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

interface TelegramContextValue {
  ready: boolean;
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
  } | null;
  colorScheme: 'light' | 'dark';
  expand: () => void;
  haptic: (type?: 'light' | 'medium' | 'heavy') => void;
}

const TelegramContext = createContext<TelegramContextValue>({
  ready: false,
  user: null,
  colorScheme: 'light',
  expand: () => {},
  haptic: () => {},
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<TelegramContextValue['user']>(null);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const init = async () => {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        WebApp.ready();
        // api.ts читает initData из window.Telegram.WebApp
        window.Telegram = { WebApp };
        WebApp.expand();
        WebApp.setHeaderColor('#0c4a6e');
        WebApp.setBackgroundColor('#f0f9ff');

        const tgUser = WebApp.initDataUnsafe?.user;
        if (tgUser) {
          setUser({
            id: tgUser.id,
            firstName: tgUser.first_name,
            lastName: tgUser.last_name,
            username: tgUser.username,
          });
        } else {
          setUser({ id: 123456789, firstName: 'Путешественник' });
        }

        setColorScheme(WebApp.colorScheme === 'dark' ? 'dark' : 'light');
        setReady(true);
      } catch {
        setUser({ id: 0, firstName: 'Путешественник' });
        setReady(true);
      }
    };

    init();
  }, []);

  const expand = () => {
    import('@twa-dev/sdk').then(({ default: WebApp }) => WebApp.expand());
  };

  const haptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    import('@twa-dev/sdk').then(({ default: WebApp }) => {
      if (WebApp.HapticFeedback?.impactOccurred) {
        WebApp.HapticFeedback.impactOccurred(type);
      }
    });
  };

  return (
    <TelegramContext.Provider value={{ ready, user, colorScheme, expand, haptic }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  return useContext(TelegramContext);
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
      };
    };
  }
}
