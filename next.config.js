/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false, // Using pages directory
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  // Enable static export for free hosting
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
