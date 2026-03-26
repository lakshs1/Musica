import { ImageResponse } from 'next/og';

function MusicaIcon({ size }: { size: number }) {
  const radius = Math.round(size * 0.22);
  const logoRadius = Math.round(size * 0.14);
  const innerPadding = Math.round(size * 0.14);
  const labelSize = Math.max(28, Math.round(size * 0.15));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at 18% 18%, rgba(255,255,255,0.2), transparent 26%), linear-gradient(145deg, #0a0a0a 0%, #050505 48%, #121212 100%)'
      }}
    >
      <div
        style={{
          width: size - innerPadding * 2,
          height: size - innerPadding * 2,
          borderRadius: radius,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: Math.round(size * 0.11),
          border: '1px solid rgba(255,255,255,0.12)',
          background:
            'radial-gradient(circle at top left, rgba(255,255,255,0.14), transparent 30%), linear-gradient(160deg, #ffd400 0%, #ff6b00 36%, #ff1f57 74%, #7a00ff 100%)',
          boxShadow: '0 18px 44px rgba(0,0,0,0.34)'
        }}
      >
        <div
          style={{
            width: Math.round(size * 0.18),
            height: Math.round(size * 0.18),
            borderRadius: 999,
            background: 'rgba(255,255,255,0.22)',
            border: '1px solid rgba(255,255,255,0.16)'
          }}
        />
        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'flex-end',
            justifyContent: 'space-between'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: Math.round(size * 0.56),
              height: Math.round(size * 0.56),
              borderRadius: logoRadius,
              background: 'rgba(0,0,0,0.22)',
              padding: Math.round(size * 0.11)
            }}
          >
            <div
              style={{
                width: Math.round(size * 0.08),
                height: Math.round(size * 0.34),
                borderRadius: 999,
                background: '#ffffff'
              }}
            />
            <div
              style={{
                width: Math.round(size * 0.08),
                height: Math.round(size * 0.24),
                borderRadius: 999,
                background: '#ffffff'
              }}
            />
            <div
              style={{
                width: Math.round(size * 0.08),
                height: Math.round(size * 0.42),
                borderRadius: 999,
                background: '#ffffff'
              }}
            />
          </div>
          <div
            style={{
              color: '#ffffff',
              fontSize: labelSize,
              fontWeight: 700,
              letterSpacing: '-0.06em'
            }}
          >
            M
          </div>
        </div>
      </div>
    </div>
  );
}

export function createPwaIconResponse(size: number) {
  return new ImageResponse(<MusicaIcon size={size} />, {
    width: size,
    height: size
  });
}
