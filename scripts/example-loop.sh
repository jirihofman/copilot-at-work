#!/bin/bash

# Example script showing how to backfill multiple dates
# This is a reference example - modify the dates as needed

# Example 1: Backfill specific dates
echo "Example 1: Backfill specific dates"

echo "Example 1: Backfill all days from 2024-10-23 to today"
start_date="2024-10-23"
end_date="$(date +%Y-%m-%d)"
current_date="$start_date"
while [[ "$current_date" < "$end_date" ]]; do
  echo "Processing $current_date..."
  node scripts/backfill.js "$current_date"
  if [ $? -ne 0 ]; then
    echo "Failed to backfill $current_date"
    exit 1
  fi
  echo "Sleeping for 2 seconds to respect rate limits..."
  sleep 2
  current_date=$(date -j -v+1d -f "%Y-%m-%d" "$current_date" +"%Y-%m-%d")
done

echo "✓ Backfill completed successfully"
