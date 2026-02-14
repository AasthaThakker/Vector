/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    suppressHydrationWarning: true,
  },
}

export default nextConfig
