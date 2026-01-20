/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['cryptologos.cc', 'assets.coingecko.com'],
  },
}

module.exports = nextConfig
