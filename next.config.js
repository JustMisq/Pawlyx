/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  headers: async () => {
    // ✅ SÉCURITÉ: CORS limité au domaine spécifique
    const allowedOrigins = (process.env.NEXTAUTH_URL || 'http://localhost:3000').split(',').map(url => url.trim())
    
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            // En dev: autoriser localhost, en prod: strictement le domaine
            value: process.env.NODE_ENV === 'development' 
              ? 'http://localhost:3000' 
              : (process.env.NEXTAUTH_URL || 'http://localhost:3000'),
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          // ✅ SÉCURITÉ: Headers supplémentaires
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
        ],
      },
    ]
  },
}

// ✅ SÉCURITÉ: Wrap with Sentry for error tracking (optional)
// Sentry is disabled during Vercel builds to avoid build issues
const shouldUseSentry = 
  process.env.NEXT_PUBLIC_SENTRY_DSN && 
  process.env.NODE_ENV === 'production' &&
  process.env.VERCEL !== '1'

try {
  module.exports = shouldUseSentry
    ? withSentryConfig(nextConfig, {
        org: process.env.SENTRY_ORG || 'groomly',
        project: process.env.SENTRY_PROJECT || 'groomly',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        silent: true,
        widenClientFileUpload: true,
        tunnelRoute: '/monitoring',
        hideSourceMaps: true,
        disableLogger: true,
        skipBrowserBundleWarmup: true,
      })
    : nextConfig
} catch (error) {
  // Fallback if Sentry is not available
  console.warn('⚠️ Sentry config error (non-blocking):', error.message)
  module.exports = nextConfig
}
