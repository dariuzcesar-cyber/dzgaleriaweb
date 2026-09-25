/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages can't run Next's default (Node-based) image optimizer.
  // We only use next/image for local static assets (logo, avatar), so this
  // just serves them as-is — no remote optimization was ever in play.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
