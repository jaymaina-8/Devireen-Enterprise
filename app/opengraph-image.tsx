import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Devireen Enterprise';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
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
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        {/* Divider */}
        <div
          style={{
            width: 6,
            height: 180,
            backgroundColor: '#D31B27',
            borderRadius: 4,
          }}
        />
        {/* Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 120,
              lineHeight: 1,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            Devireen
          </span>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
            <span
              style={{
                fontSize: 54,
                fontWeight: 900,
                color: '#D31B27',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Enterprise
            </span>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          display: 'flex',
          fontSize: 32,
          color: '#9CA3AF',
        }}
      >
        Kenya&apos;s trusted B2B procurement platform
      </div>
    </div>,
    {
      ...size,
    }
  );
}
