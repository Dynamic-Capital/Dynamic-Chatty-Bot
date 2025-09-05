import { mna, nf } from "../_shared/http.ts";
import { optionalEnv, requireEnv } from "../_shared/env.ts";
import { contentType } from "https://deno.land/std@0.224.0/media_types/mod.ts";
import { extname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Env setup
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = requireEnv([
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
]);
const BUCKET = optionalEnv("MINIAPP_BUCKET") ?? "miniapp";
const INDEX_KEY = optionalEnv("MINIAPP_INDEX_KEY") ?? "index.html";
const ASSETS_PREFIX = optionalEnv("MINIAPP_ASSETS_PREFIX") ?? "assets/";
const SERVE_FROM_STORAGE = optionalEnv("SERVE_FROM_STORAGE") ?? "false";
const CACHE_LIMIT = Number(optionalEnv("MINIAPP_CACHE_LIMIT") ?? "100");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Basic security headers (same as _shared/static.ts but with frame-ancestors open)
const SECURITY_HEADERS = {
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "permissions-policy": "geolocation=(), microphone=(), camera=()",
  "content-security-policy":
    "default-src 'self' https://*.telegram.org https://telegram.org; " +
    "script-src 'self' 'unsafe-inline' https://*.telegram.org; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://*.functions.supabase.co https://*.supabase.co wss://*.supabase.co; " +
    "font-src 'self' data:; " +
    "frame-ancestors 'self' https://*.telegram.org https://telegram.org https://*.supabase.co;",
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
  "x-frame-options": "ALLOWALL",
} as const;

function withSecurity(resp: Response, extra: Record<string, string> = {}) {
  const h = new Headers(resp.headers);

  // Preserve original content-type if it exists
  const originalContentType = resp.headers.get("content-type");

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) h.set(k, v);
  for (const [k, v] of Object.entries(extra)) h.set(k, v);

  // Ensure content-type is preserved
  if (originalContentType) {
    h.set("content-type", originalContentType);
  }

  return new Response(resp.body, { status: resp.status, headers: h });
}

// simple mime helper
const mime = (p: string) =>
  (contentType(extname(p)) ?? "application/octet-stream").split(";")[0];

// in-memory cache
type CacheEntry = {
  expires: number;
  body: Uint8Array;
  headers: Record<string, string>;
  status: number;
};

class LRUCache<K, V> {
  #map = new Map<K, V>();
  constructor(private max: number) {}

  get(key: K): V | undefined {
    const value = this.#map.get(key);
    if (value === undefined) return undefined;
    this.#map.delete(key);
    this.#map.set(key, value);
    return value;
  }

  set(key: K, value: V) {
    if (this.#map.has(key)) this.#map.delete(key);
    this.#map.set(key, value);
    if (this.#map.size > this.max) {
      const oldest = this.#map.keys().next().value;
      if (oldest !== undefined) this.#map.delete(oldest);
    }
  }

  delete(key: K) {
    this.#map.delete(key);
  }
}

const cache = new LRUCache<string, CacheEntry>(
  Number.isFinite(CACHE_LIMIT) && CACHE_LIMIT > 0 ? CACHE_LIMIT : 100,
);

function fromCache(key: string): Response | null {
  const c = cache.get(key);
  if (!c) return null;
  if (c.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return new Response(c.body.slice(), { status: c.status, headers: c.headers });
}

function saveCache(key: string, resp: Response, body: Uint8Array, ttl: number) {
  const headers = Object.fromEntries(resp.headers);
  delete (headers as Record<string, string>)["content-encoding"];
  cache.set(key, {
    expires: Date.now() + ttl,
    body,
    headers,
    status: resp.status,
  });
}

// compression helper for html/json
function maybeCompress(
  body: Uint8Array,
  req: Request,
  type: string,
): { stream: ReadableStream | Uint8Array; encoding?: string } {
  const accept = req.headers.get("accept-encoding")?.toLowerCase() ?? "";

  // Only compress html and json responses
  const compressible = type.startsWith("text/html") ||
    type.startsWith("application/json");
  if (!compressible || !accept) return { stream: body };

  const encodings = accept.split(",").map((e) => e.trim().split(";")[0]);

  for (const enc of ["br", "gzip"] as const) {
    if (!encodings.includes(enc)) continue;
    try {
      const stream = new Blob([body]).stream().pipeThrough(
        new CompressionStream(enc),
      );
      return { stream, encoding: enc };
    } catch {
      // unsupported encoding; try next option
    }
  }

  return { stream: body };
}

async function fetchFromStorage(key: string): Promise<Uint8Array | null> {
  const { data, error } = await supabase.storage.from(BUCKET).download(key);
  if (error || !data) return null;
  return new Uint8Array(await data.arrayBuffer());
}

const FALLBACK_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>Dynamic Capital VIP • Mini App</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: #f8f9fa; color: #212529; }
    .wrap { max-width: 400px; margin: 0 auto; padding: 16px; }
    .card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #0088cc; margin-bottom: 8px; font-size: 1.5rem; }
    h2 { color: #333; margin-bottom: 8px; font-size: 1.2rem; }
    .muted { color: #6c757d; font-size: 0.9rem; line-height: 1.4; }
    .row { display: flex; gap: 8px; margin: 16px 0; }
    .btn { flex: 1; padding: 10px 16px; border: none; border-radius: 8px; background: #0088cc; color: white; cursor: pointer; font-size: 0.9rem; }
    .btn.secondary { background: #6c757d; }
    .btn:hover { opacity: 0.9; }
    .kv { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .kv:last-child { border-bottom: none; }
    code { background: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.8rem; }
    .success { color: #28a745; }
    .error { color: #dc3545; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Dynamic Capital VIP</h1>
      <p class="muted">Welcome to the Mini App. Use the buttons below to verify the backend and your Telegram WebApp context.</p>
      <div class="row">
        <button id="btn-version" class="btn">Check /miniapp/version</button>
        <button id="btn-verify" class="btn secondary" title="Calls /verify-initdata if deployed">Verify initData</button>
      </div>
      <div class="kv"><div>WebApp user</div><div><span id="userName" class="muted">—</span></div></div>
      <div class="kv"><div>Theme</div><div><span id="theme" class="muted">—</span></div></div>
      <div class="kv"><div>Mini App URL</div><div><code id="miniUrl">—</code></div></div>
    </div>

    <div class="card">
      <h2>Status</h2>
      <div id="status" class="muted">No checks yet.</div>
    </div>

    <div class="card">
      <p class="muted">
        Tip: Your bot's WebApp button should link to this exact HTTPS page.<br>
        Example: <code>https://&lt;project-ref&gt;.functions.supabase.co/miniapp/</code>
      </p>
    </div>
  </div>

  <script>
    const tg = window.Telegram?.WebApp;
    if (tg) tg.ready();

    function updateUI() {
      const userName = tg?.initDataUnsafe?.user?.first_name || 'demo_user';
      const theme = tg?.colorScheme || 'light';
      
      document.getElementById('userName').textContent = userName;
      document.getElementById('theme').textContent = theme;
      document.getElementById('miniUrl').textContent = window.location.href;
    }

    function setStatus(message, type = 'info') {
      const statusEl = document.getElementById('status');
      const className = type === 'success' ? 'success' : type === 'error' ? 'error' : 'muted';
      statusEl.innerHTML = \`<span class="\${className}">\${message}</span>\`;
    }

    async function checkVersion() {
      try {
        const response = await fetch('/miniapp/version');
        const data = await response.json();
        setStatus(\`✓ Version: \${data.name} (\${data.ts})\`, 'success');
      } catch (error) {
        setStatus('✗ Version check failed', 'error');
      }
    }

    async function verifyInitData() {
      try {
        const initData = tg?.initData;
        if (!initData) {
          setStatus('✗ No initData available', 'error');
          return;
        }

        const response = await fetch('/verify-initdata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData })
        });
        
        if (response.ok) {
          const data = await response.json();
          setStatus(\`✓ InitData verified: \${data.valid ? 'Valid' : 'Invalid'}\`, 'success');
        } else {
          setStatus(\`✗ Verification failed: \${response.status}\`, 'error');
        }
      } catch (error) {
        setStatus('✗ Verification error', 'error');
      }
    }

    document.getElementById('btn-version').addEventListener('click', checkVersion);
    document.getElementById('btn-verify').addEventListener('click', verifyInitData);
    
    updateUI();
    setStatus('Ready for testing. Use buttons above to verify backend.');
  </script>
</body>
</html>`;

console.log(
  "miniapp: serving index from",
  SERVE_FROM_STORAGE === "true" ? "storage" : "react-bundle",
);

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  url.pathname = url.pathname.replace(/^\/functions\/v1/, "");
  const path = url.pathname;

  // HEAD routes
  if (req.method === "HEAD") {
    if (path === "/miniapp" || path === "/miniapp/") {
      return withSecurity(new Response(null, { status: 200 }));
    }
    if (path === "/miniapp/version") {
      return withSecurity(new Response(null, { status: 200 }));
    }
    if (path.startsWith("/assets/")) {
      const assetPath = path.slice("/assets/".length);
      const key = ASSETS_PREFIX + assetPath;
      const cached = fromCache(key);
      if (!cached) {
        let exists = false;

        // First try static build
        if (SERVE_FROM_STORAGE !== "true") {
          try {
            const staticAssetPath = new URL(
              `./static/assets/${assetPath}`,
              import.meta.url,
            );
            await Deno.stat(staticAssetPath);
            exists = true;
          } catch {
            // not found in static build
          }
        }

        // Fallback to storage
        if (!exists) {
          const arr = await fetchFromStorage(key);
          if (!arr) {
            console.warn(
              `[miniapp] missing asset ${key} in both static and storage`,
            );
            return withSecurity(nf());
          }
        }
      }

      const headers: Record<string, string> = {
        "content-type": mime(path),
        "cache-control": "public, max-age=31536000, immutable",
      };
      return withSecurity(new Response(null, { status: 200, headers }));
    }
    return withSecurity(nf());
  }

  if (req.method !== "GET") return withSecurity(mna());

  // GET /miniapp/ → index.html
  if (path === "/miniapp" || path === "/miniapp/") {
    const cached = fromCache("__index");
    if (cached) return withSecurity(cached);

    let arr: Uint8Array | null = null;

    // First try to serve from React build in static/ directory
    if (SERVE_FROM_STORAGE !== "true") {
      try {
        const staticIndexPath = new URL("./static/index.html", import.meta.url);
        const indexContent = await Deno.readFile(staticIndexPath);
        arr = indexContent;
      } catch (error) {
        console.warn(
          "[miniapp] React build not found in static/, trying simple.html",
          error,
        );
        // Try the simple HTML version
        try {
          const simpleIndexPath = new URL("./static/simple.html", import.meta.url);
          const simpleContent = await Deno.readFile(simpleIndexPath);
          arr = simpleContent;
        } catch (simpleError) {
          console.warn("[miniapp] Simple HTML also not found, falling back to storage", simpleError);
        }
      }
    }

    // Fallback to storage if React build not available
    if (!arr) {
      arr = await fetchFromStorage(INDEX_KEY);
    }

    if (!arr) {
      console.warn(
        `[miniapp] missing index at ${BUCKET}/${INDEX_KEY} and no static builds`,
      );
      const resp = new Response(FALLBACK_HTML, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-cache",
        },
      });
      return withSecurity(resp);
    }

    const type = "text/html; charset=utf-8";
    const { stream, encoding } = maybeCompress(arr, req, type);
    const headers: Record<string, string> = {
      "content-type": type,
      "cache-control": "no-cache",
    };
    if (encoding) headers["content-encoding"] = encoding;

    console.log("[miniapp] Serving index.html with headers:", headers);
    const resp = new Response(stream, { status: 200, headers });
    const cacheBody = encoding
      ? new Uint8Array(await resp.clone().arrayBuffer())
      : arr;
    saveCache("__index", resp, cacheBody, 60_000);
    return withSecurity(resp);
  }

  // GET /miniapp/version
  if (path === "/miniapp/version") {
    const body = new TextEncoder().encode(
      JSON.stringify({ name: "miniapp", ts: new Date().toISOString() }),
    );
    const type = "application/json; charset=utf-8";
    const { stream, encoding } = maybeCompress(body, req, type);
    const headers: Record<string, string> = { "content-type": type };
    if (encoding) headers["content-encoding"] = encoding;
    const resp = new Response(stream, { status: 200, headers });
    return withSecurity(resp);
  }

  // GET /assets/* → try static build first, then storage
  if (path.startsWith("/assets/")) {
    const assetPath = path.slice("/assets/".length);
    const key = ASSETS_PREFIX + assetPath;
    const cached = fromCache(key);
    if (cached) return withSecurity(cached);

    let arr: Uint8Array | null = null;

    // First try to serve from React build in static/assets/
    if (SERVE_FROM_STORAGE !== "true") {
      try {
        const staticAssetPath = new URL(
          `./static/assets/${assetPath}`,
          import.meta.url,
        );
        const assetContent = await Deno.readFile(staticAssetPath);
        arr = assetContent;
      } catch {
        // Asset not found in static build, will try storage
      }
    }

    // Fallback to storage
    if (!arr) {
      arr = await fetchFromStorage(key);
    }

    if (!arr) {
      console.warn(`[miniapp] missing asset ${key} in both static and storage`);
      return withSecurity(nf());
    }

    const type = mime(path);
    const headers: Record<string, string> = {
      "content-type": type,
      "cache-control": "public, max-age=31536000, immutable",
    };
    const resp = new Response(arr, { status: 200, headers });
    saveCache(key, resp, arr, 600_000);
    return withSecurity(resp);
  }

  // unknown
  return withSecurity(nf());
}

if (import.meta.main) {
  Deno.serve(handler);
}

export default handler;
