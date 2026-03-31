#!/usr/bin/env bash
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
while read -r url; do
  [[ -z "$url" || "$url" =~ ^# ]] && continue
  code=$(curl -sS -o /dev/null -w "%{http_code}" -L -A "$UA" --max-time 20 "$url" 2>/dev/null || echo "ERR")
  echo "$code $url"
done
