import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';

export const alt = 'Devireen Enterprise';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  // Read the logo from the public folder
  const logoData = await readFile(
    join(process.cwd(), 'public', 'images', 'google-logo.png')
  );
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    <div
      style={{
        background: '#111827',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
      }}
    >
      {/* Logo + Brand name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        {/* Logo mark */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoBase64}
          alt="Devireen Logo"
          width={200}
          height={200}
          style={{ objectFit: 'contain' }}
        />

        {/* Divider */}
        <div
          style={{
            width: 4,
            height: 160,
            backgroundColor: '#D31B27',
            borderRadius: 4,
          }}
        />

        {/* Brand text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 100,
              lineHeight: 1,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            Devireen
          </span>
          <span
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: '#D31B27',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginTop: 12,
            }}
          >
            Enterprise
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: 'absolute',
          bottom: 52,
          display: 'flex',
          fontSize: 28,
          color: '#9CA3AF',
          letterSpacing: '0.05em',
        }}
      >
        Kenya&apos;s Trusted B2B Office &amp; School Supplier
      </div>
    </div>,
    {
      ...size,
    }
  );
}
