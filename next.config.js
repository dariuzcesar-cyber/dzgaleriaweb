const NEXTAUTH_URL_FALLBACK = 'https://galeria.dariuzph.com';

// NextAuth (both `next-auth/react` and the core server code) reads
// `process.env.NEXTAUTH_URL` at module-evaluation time via `new URL(...)`.
// An *empty string* (not just "unset") makes that throw "Invalid URL",
// which crashes the build the moment any page imports `next-auth/react`.
// Some CI/build environments (e.g. Cloudflare Pages) define the variable
// with an empty value rather than leaving it unset, so this has to be a
// truthiness check (`||`), not a nullish check (`??`). Setting it here, at
// the top of next.config.js, guarantees it is fixed before any build tool
// (plain `next build` or `@cloudflare/next-on-pages`) loads route modules.
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || NEXTAUTH_URL_FALLBACK;

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
