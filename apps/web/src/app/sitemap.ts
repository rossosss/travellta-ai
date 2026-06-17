import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const base = siteConfig.url;

  return [
    {
      url: base,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/chat`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
