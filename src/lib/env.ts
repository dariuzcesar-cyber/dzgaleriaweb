import { getRequestContext } from '@cloudflare/next-on-pages';

// On Cloudflare Pages (via @cloudflare/next-on-pages), dashboard environment
// variables are normally proxied into `process.env` for Edge functions —
// but that has been unreliable in practice (this is the fallback that
// diagnosed and fixed the /api/admin/auth/login 500). Checking the Workers
// request-context `env` object directly is the ground truth: it's what
// Cloudflare actually injects per-request, regardless of whether the
// `process.env` proxy layer is working for a given variable name.
declare global {
  interface CloudflareEnv {
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_CLIENT_EMAIL?: string;
    GOOGLE_PRIVATE_KEY?: string;
    SESSION_SECRET?: string;
    ALLOWED_ADMIN_EMAIL?: string;
  }
}

export function getEnvVar(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  try {
    const env = getRequestContext().env as unknown as Record<string, string | undefined>;
    return env[name];
  } catch {
    return undefined;
  }
}

export function requireEnvVar(name: string): string {
  const value = getEnvVar(name);
  if (!value) throw new Error(`Falta la variable de entorno ${name}.`);
  return value;
}
