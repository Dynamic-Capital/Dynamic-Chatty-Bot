#!/usr/bin/env bash
set -euo pipefail

deno --version

# Trust store: default to system (helps in corp networks)
export DENO_TLS_CA_STORE="${DENO_TLS_CA_STORE:-system}"
export DENO_NO_UPDATE_CHECK=1

CERT_ARG=""
if [ -n "${DENO_CERT_FILE:-}" ] && [ -f "$DENO_CERT_FILE" ]; then
  CERT_ARG="--cert $DENO_CERT_FILE"
fi

# Prefetch (best-effort)
if compgen -G "supabase/functions/*/index.ts" > /dev/null; then
  deno cache $CERT_ARG --reload supabase/functions/*/index.ts || true
fi
if [ -d src ]; then
  find src -name "*.ts" -maxdepth 3 -print0 | xargs -0 -n1 deno cache $CERT_ARG || true
fi

echo "== Type-check Edge Functions =="

if compgen -G "supabase/functions/*/index.ts" > /dev/null; then
  for f in supabase/functions/*/index.ts; do
    echo "-- $f --"
    deno check $CERT_ARG "$f"
  done
fi

# >>> DC BLOCK: typecheck-core (start)
#!/usr/bin/env bash
set -euo pipefail

# Use system trust store (corp proxies), allow optional custom CA
export DENO_TLS_CA_STORE="${DENO_TLS_CA_STORE:-system}"
export DENO_NO_UPDATE_CHECK=1

CERT_ARG=""
if [ -n "${DENO_CERT_FILE:-}" ] && [ -f "$DENO_CERT_FILE" ]; then
  CERT_ARG="--cert $DENO_CERT_FILE"
fi

deno --version

# Prefetch remotes (best-effort)
if compgen -G "supabase/functions/*/index.ts" > /dev/null; then
  deno cache $CERT_ARG --reload supabase/functions/*/index.ts || true
fi
if [ -d src ]; then
  find src -name "*.ts" -maxdepth 4 -print0 | xargs -0 -n1 deno cache $CERT_ARG || true
fi

echo "== Type-check Edge Functions =="
if compgen -G "supabase/functions/*/index.ts" > /dev/null; then
  for f in supabase/functions/*/index.ts; do
    echo "deno check $CERT_ARG --remote $f"
    deno check $CERT_ARG --remote "$f"
  done
else
  echo "No Edge Function entrypoints found."
fi

echo "== Type-check local src/*.ts =="
if [ -d src ]; then
  find src -name "*.ts" -print0 | xargs -0 -n1 deno check $CERT_ARG --remote
else
  echo "No src/ directory."
fi

echo "TypeScript check completed."
# <<< DC BLOCK: typecheck-core (end)
