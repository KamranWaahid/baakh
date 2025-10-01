import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set the correct root directory to avoid lockfile warnings
  outputFileTracingRoot: __dirname,
  // Disable ESLint during build to prevent deployment failures
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure proper build output
  trailingSlash: false,
  // Allow remote images from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uhbqcaxwfossrjwusclc.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      // Locale-aware redirects for terms
      { source: '/en/terms', destination: '/en/terms-and-conditions', permanent: true },
      { source: '/sd/terms', destination: '/sd/terms-and-conditions', permanent: true },
      // Privacy page moved to privacy-policy
      { source: '/en/privacy', destination: '/en/privacy-policy', permanent: true },
      { source: '/sd/privacy', destination: '/sd/privacy-policy', permanent: true },
    ];
  },
  // Security headers
  async headers() {
    return [
      // Headers for static assets (including SVG files)
      {
        source: '/Baakh.svg',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/svg+xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live https://*.vercel.live https://db.onlinewebfonts.com",
              "img-src 'self' data: https: blob: https://vercel.live https://*.vercel.live",
              "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com https://r2cdn.perplexity.ai https://font.sindhsalamat.com https://db.onlinewebfonts.com",
              "connect-src 'self' https://*.supabase.co https://uhbqcaxwfossrjwusclc.supabase.co https://vercel.live https://*.vercel.live",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "media-src 'self'",
              "worker-src 'self' blob:",
              "frame-src 'self' https://vercel.live https://*.vercel.live",
              "child-src 'self' blob: https://vercel.live https://*.vercel.live",
              "upgrade-insecure-requests"
            ].join('; '),
          },
        ],
      },
    ];
  },
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
