#!/bin/sh
# ponytail: sync admin from env on boot so schema/seed can run without SSH DB lock
set -eu
if [ -n "${POCKETBASE_ADMIN_EMAIL:-}" ] && [ -n "${POCKETBASE_ADMIN_PASSWORD:-}" ]; then
  /app/pocketbase admin update "$POCKETBASE_ADMIN_EMAIL" "$POCKETBASE_ADMIN_PASSWORD" --dir=/pb_data \
    || /app/pocketbase admin create "$POCKETBASE_ADMIN_EMAIL" "$POCKETBASE_ADMIN_PASSWORD" --dir=/pb_data \
    || true
fi
exec /app/pocketbase serve --http=0.0.0.0:8080 --dir=/pb_data
