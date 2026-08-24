import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading dev assets (HMR, etc.) when opening the dev server
  // from another device on the LAN (e.g. phone).
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.40.171.114:3000",
  ],

  // Images: Supabase storage URLs + unoptimized for base64/blob
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cjmkwnisgcmtapsmefuv.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/**',
      },
    ],
    // Allow data: URLs and unoptimized images (for base64 previews)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },

  // WEAKNESS 3: HTTP Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in",
              "media-src 'self' blob:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
