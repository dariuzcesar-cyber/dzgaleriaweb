const NEXTAUTH_URL_FALLBACK = 'https://galeria.dariuzph.com';

// NextAuth (both `next-auth/react` and the core server code) reads
// `process.env.NEXTAUTH_URL` at module-evaluation time via `new URL(...)`.
// That throws "Invalid URL" the instant any page imports `next-auth/react`
// if the value is empty, unset, or simply not a valid absolute URL (e.g. a
// value that got mangled into markdown-link syntax when pasted into a
// dashboard field: "[https://x.com](https://x.com)"). Validate it for real
// instead of just checking truthiness, and fix it here, at the very top of
// next.config.js, before any build tool (plain `next build` or
// `@cloudflare/next-on-pages`) loads route modules.
function resolveNextAuthUrl(candidate, fallback) {
  if (!candidate) return fallback;
  try {
    new URL(candidate);
    return candidate;
  } catch {
    return fallback;
  }
}

process.env.NEXTAUTH_URL = resolveNextAuthUrl(process.env.NEXTAUTH_URL, NEXTAUTH_URL_FALLBACK);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

module.exports = nextConfig;
