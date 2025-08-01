import { ImageResponse } from '@vercel/og'
import Image from 'next/image'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const logoUrl = new URL('/images/zenith-medical-logo new 1.png', req.url).toString()
  const width = 1200
  const height = 630

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
        }}
      >
        <Image
          src={logoUrl}
          alt="Zenith Medical Centre Logo"
          width={200}
          height={200}
          style={{ marginBottom: 40 }}
        />
        <span
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#1e293b',
            fontFamily: 'Inter, Arial, sans-serif',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            textShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          Expert Care, Patient Centered
        </span>
      </div>
    ),
    {
      width,
      height,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    }
  )
} 