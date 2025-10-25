#!/bin/bash

# Example script showing how to backfill multiple dates
# This is a reference example - modify the dates as needed

# Example 1: Backfill specific dates
echo "Example 1: Backfill specific dates"
for date in 2024-10-20 2024-10-21 2024-10-22; do
  echo "Processing $date..."
  node scripts/backfill.js "$date"
  if [ $? -ne 0 ]; then
    echo "Failed to backfill $date"
    exit 1
  fi
  echo "Sleeping for 2 seconds to respect rate limits..."
  sleep 2
done

echo "✓ Backfill completed successfully"
