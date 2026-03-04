import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
serverExternalPackages: ['@libsql/client'],
  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  experimental: {},
}