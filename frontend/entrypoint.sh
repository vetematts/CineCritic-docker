#!/usr/bin/env sh
set -eu

RUNTIME_FILE="/usr/share/nginx/html/runtime-env.js"

# Write runtime config for the frontend to read (window.__CINECRITIC_RUNTIME__).
# This allows deploy-time env vars (Cloud Run) without rebuilding the image.
cat > "$RUNTIME_FILE" <<EOF
window.__CINECRITIC_RUNTIME__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-}",
};
EOF

exec nginx -g 'daemon off;'

