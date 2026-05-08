#!/bin/bash

# Codex Backfill Loop (forward)
# Usage: ./scripts/codex-backfill-loop.sh [START_DATE]
# Example: ./scripts/codex-backfill-loop.sh 2025-05-16

set -e

start_date="${1:-2025-05-16}"
sleep_seconds="${BACKFILL_SLEEP_SECONDS:-5}"

echo "Starting Codex backfill from $start_date forward to today..."
echo ""

current_date="$start_date"
day_count=0

while true; do
  day_count=$((day_count + 1))
  echo "[$day_count] Processing $current_date..."

  set +e
  node scripts/backfill-agent.js codex "$current_date"
  exit_code=$?
  set -e

  if [ $exit_code -eq 2 ]; then
    echo "  (count = 0) - recorded, continuing"
  elif [ $exit_code -ne 0 ]; then
    echo "Failed to backfill $current_date (exit $exit_code)"
    exit 1
  fi

  today=$(date +%Y-%m-%d)
  if [ "$current_date" = "$today" ]; then
    echo ""
    echo "Reached today ($today) - stopping backfill"
    echo "Successfully backfilled $day_count days of Codex data"
    exit 0
  fi

  if [[ "$OSTYPE" == "darwin"* ]]; then
    current_date=$(date -j -v+1d -f "%Y-%m-%d" "$current_date" +%Y-%m-%d)
  else
    current_date=$(date -d "$current_date + 1 day" +%Y-%m-%d)
  fi

  echo "Sleeping for $sleep_seconds seconds to respect rate limits..."
  sleep "$sleep_seconds"
  echo ""
done
