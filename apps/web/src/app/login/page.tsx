import { AuthForm } from '@/components/auth/auth-form';
import { siteConfig } from '@/lib/site-config';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Вход',
  robots: { index: false, follow: false },
  alternates: { canonical: `${siteConfig.url}/login` },
};

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-sky-50 via-background to-cyan-50/30 dark:from-sky-950 dark:via-background dark:to-cyan-950/20">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 flex items-center justify-center shadow-lg">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg">{siteConfig.name}</span>
      </Link>

      <Suspense fallback={<div className="text-sm text-muted-foreground">Загрузка…</div>}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
