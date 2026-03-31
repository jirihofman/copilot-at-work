#!/bin/bash

# Cursor Backfill Loop (forward)
# Usage: ./scripts/cursor-backfill-loop.sh [START_DATE]
# Example: ./scripts/cursor-backfill-loop.sh 2025-02-17

# disable immediate exit around the node call below so we can
# handle backfill-agent's special exit codes (0,2)
set -e

start_date="${1:-2025-02-17}"

echo "Starting Cursor backfill from $start_date forward to today..."

echo ""
current_date="$start_date"
day_count=0

while true; do
  day_count=$((day_count + 1))
  echo "[$day_count] Processing $current_date..."

  # allow the backfill script to return non-zero (2 means zero-count)
  set +e
  node scripts/backfill-agent.js cursor "$current_date"
  exit_code=$?
  set -e

  if [ $exit_code -eq 2 ]; then
    echo "  (count = 0) — recorded, continuing"
  elif [ $exit_code -ne 0 ]; then
    echo "❌ Failed to backfill $current_date (exit $exit_code)"
    exit 1
  fi

  # Stop when we've reached today
  today=$(date +%Y-%m-%d)
  if [ "$current_date" = "$today" ]; then
    echo ""
    echo "✓ Reached today ($today) - stopping backfill"
    echo "✓ Successfully backfilled $day_count days of Cursor data"
    exit 0
  fi

  # Move to next day
  if [[ "$OSTYPE" == "darwin"* ]]; then
    current_date=$(date -j -v+1d -f "%Y-%m-%d" "$current_date" +%Y-%m-%d)
  else
    current_date=$(date -d "$current_date + 1 day" +%Y-%m-%d)
  fi

  echo "Sleeping for 2 seconds to respect rate limits..."
  sleep 2
  echo ""
done
