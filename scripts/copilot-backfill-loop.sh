#!/bin/bash

# Copilot Backfill Loop Script
# This script backfills the copilot:pr:history key from today backwards until zero PRs

set -e  # Exit on error

echo "Starting Copilot backfill from today backwards until zero..."

# Get today's date in YYYY-MM-DD format
current_date=$(date +%Y-%m-%d)

# Counter for consecutive zero days (stop after hitting zero)
consecutive_zeros=0
max_consecutive_zeros=1  # Stop after 1 day of zero

# Counter for total days processed
days_processed=0

while [ $consecutive_zeros -lt $max_consecutive_zeros ]; do
  echo ""
  echo "Processing date: $current_date"
  
  # Run the backfill script and capture output
  output=$(node scripts/backfill.js "$current_date" 2>&1)
  echo "$output"
  
  # Extract the count from the output using sed (compatible with macOS)
  count=$(echo "$output" | sed -n 's/^Found \([0-9]*\) merged PRs.*/\1/p')
  
  # Default to 0 if no count found
  if [ -z "$count" ]; then
    count=0
  fi
  
  echo "Count for $current_date: $count"
  
  if [ "$count" -eq 0 ]; then
    echo "Hit zero PRs on $current_date. Stopping backfill."
    consecutive_zeros=$((consecutive_zeros + 1))
  else
    consecutive_zeros=0
  fi
  
  days_processed=$((days_processed + 1))
  
  # Move to previous day
  current_date=$(date -v-1d -j -f "%Y-%m-%d" "$current_date" +%Y-%m-%d)
  
  # Rate limiting - wait 2 seconds between requests
  if [ $consecutive_zeros -lt $max_consecutive_zeros ]; then
    echo "Waiting 2 seconds before next request..."
    sleep 2
  fi
done

echo ""
echo "✓ Backfill completed!"
echo "Total days processed: $days_processed"
echo "Stopped at date: $current_date (first zero day)"
