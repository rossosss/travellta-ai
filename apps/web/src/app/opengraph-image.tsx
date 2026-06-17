import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site-config';

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 64,
          background: 'linear-gradient(135deg, #6d28d9 0%, #c026d3 45%, #0891b2 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.9, marginBottom: 16 }}>Travellta</div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15, maxWidth: 900 }}>
          AI-навигатор путешествий
        </div>
        <div style={{ fontSize: 28, marginTop: 24, opacity: 0.92, maxWidth: 800 }}>
          От дома до курорта — автобус, поезд, перелёт
        </div>
      </div>
    ),
    { ...size },
  );
}
