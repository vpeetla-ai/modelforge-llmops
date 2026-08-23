/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export — matches Vercel Output Directory `out`
  output: "export",
  images: { unoptimized: true },
};

module.exports = nextConfig;
