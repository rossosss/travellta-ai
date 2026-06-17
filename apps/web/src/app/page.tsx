import { LandingPage } from '@/components/landing/landing-page';
import { absoluteUrl, siteConfig } from '@/lib/site-config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl(siteConfig.ogImage),
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImage)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        email: siteConfig.contacts.email,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { '@id': `${siteConfig.url}/#organization` },
        inLanguage: 'ru-RU',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteConfig.url}/chat?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: siteConfig.name,
        applicationCategory: 'TravelApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'RUB',
        },
        description: siteConfig.description,
        url: `${siteConfig.url}/chat`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Что такое Travellta?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Travellta — AI-навигатор путешествий, который строит маршрут от вашего дома до места отдыха: автобус, поезд и перелёт с удобными стыковками.',
            },
          },
          {
            '@type': 'Question',
            name: 'Для кого подходит Travellta?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Для жителей небольших посёлков и городов, которым сложно добраться до аэропорта, а также для всех, кто хочет спланировать поездку по России и за границу в одном месте.',
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <LandingPage />
    </>
  );
}
