import { getRequestContext } from '@cloudflare/next-on-pages';

// A minimal structural type for the one KV namespace method set this file
// uses, instead of importing the full `KVNamespace` type from
// `@cloudflare/workers-types`. That package's types describe the whole
// Workers global scope (redefining `Request`/`Response` etc. to match the
// Workers runtime rather than the DOM lib), and get pulled in either way —
// `@cloudflare/next-on-pages`'s own `getRequestContext` type declaration
// carries a `/// <reference types="@cloudflare/workers-types" />` — but
// keeping our own binding's type local avoids adding to that surface.
interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

// `getRequestContext()`'s `env` type comes from this global interface,
// which `@cloudflare/next-on-pages` declares empty for consumers to
// augment via declaration merging — not from a generic type argument.
declare global {
  interface CloudflareEnv {
    GALLERIES_KV: KVNamespaceLike;
  }
}

// `next dev` runs on plain Node, outside the Cloudflare Workers runtime, so
// `getRequestContext()` throws there. This in-memory fallback keeps local UI
// iteration working without wrangler; it is not persisted across restarts.
const devStore = new Map<string, string>();

function getKvNamespace(): KVNamespaceLike | null {
  try {
    return getRequestContext().env.GALLERIES_KV;
  } catch {
    return null;
  }
}

export async function kvGet(key: string): Promise<string | null> {
  const kv = getKvNamespace();
  if (kv) return kv.get(key);
  return devStore.get(key) ?? null;
}

export async function kvPut(key: string, value: string): Promise<void> {
  const kv = getKvNamespace();
  if (kv) {
    await kv.put(key, value);
    return;
  }
  devStore.set(key, value);
}
