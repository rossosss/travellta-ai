import { siteConfig } from '@/lib/site-config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Навигатор — ${siteConfig.name}`,
  alternates: { canonical: `${siteConfig.url}/chat` },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-svh flex flex-col overflow-hidden bg-gradient-to-b from-sky-50 via-background to-cyan-50/30 dark:from-sky-950 dark:via-background dark:to-cyan-950/20">
      {children}
    </div>
  );
}
