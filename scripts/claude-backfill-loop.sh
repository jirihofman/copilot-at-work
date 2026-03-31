#!/bin/bash

# Backfill Claude agent data backwards from a start date until count reaches 0
# Usage: ./scripts/claude-backfill-loop.sh [START_DATE]
# Example: ./scripts/claude-backfill-loop.sh 2025-10-28

# Set start date (default to argument or 2025-10-28)
start_date="${1:-2025-10-28}"

echo "Starting Claude agent backfill from $start_date backwards..."
echo "Will stop when PR count reaches 0"
echo ""

current_date="$start_date"
day_count=0

while true; do
  day_count=$((day_count + 1))
  echo "[$day_count] Processing $current_date..."
  
  # Run the backfill script for Claude
  node scripts/backfill-agent.js claude "$current_date"
  exit_code=$?
  
  # Check exit code
  if [ $exit_code -eq 1 ]; then
    echo "❌ Failed to backfill $current_date"
    exit 1
  elif [ $exit_code -eq 2 ]; then
    echo ""
    echo "✓ Reached 0 PRs on $current_date - stopping backfill"
    echo "✓ Successfully backfilled $day_count days of Claude data"
    exit 0
  fi
  
  # Rate limiting - sleep for 2 seconds between requests
  echo "Sleeping for 2 seconds to respect rate limits..."
  sleep 2
  
  # Move to previous day
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS date command
    current_date=$(date -j -v-1d -f "%Y-%m-%d" "$current_date" +"%Y-%m-%d")
  else
    # Linux date command
    current_date=$(date -d "$current_date - 1 day" +%Y-%m-%d)
  fi
done
