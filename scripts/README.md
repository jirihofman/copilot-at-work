# Backfill Script

This script allows you to backfill historical data for the Copilot PR Tracker application. It queries GitHub's GraphQL API for the number of merged PRs authored by `copilot-swe-agent[bot]` up to a specific date and stores the data in Redis.

## Prerequisites

- Node.js installed
- Environment variables configured in `.env.local` or `.env`:
  - `GITHUB_TOKEN`: GitHub Personal Access Token with appropriate permissions
  - `UPSTASH_REDIS_REST_URL`: Upstash Redis REST URL
  - `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis REST Token

## Usage

### Single Date

To backfill data for a single date:

```bash
node scripts/backfill.js YYYY-MM-DD
```

Example:
```bash
node scripts/backfill.js 2024-01-15
```

### Multiple Dates (Loop)

To backfill data for multiple consecutive dates, you can use a shell loop:

**Bash/Zsh:**
```bash
for date in 2024-01-01 2024-01-02 2024-01-03; do
  node scripts/backfill.js $date
  sleep 2  # Rate limiting between requests
done
```

**Generate date range (Linux/Mac):**
```bash
# Backfill from Jan 1 to Jan 31, 2024
for i in {1..31}; do
  date=$(date -d "2024-01-$i" +%Y-%m-%d 2>/dev/null || date -v2024y -v${i}d -v1m +%Y-%m-%d)
  node scripts/backfill.js $date
  sleep 2
done
```

**PowerShell (Windows):**
```powershell
$dates = @("2024-01-01", "2024-01-02", "2024-01-03")
foreach ($date in $dates) {
    node scripts/backfill.js $date
    Start-Sleep -Seconds 2
}
```

## How It Works

1. **Date Validation**: The script validates the date format (YYYY-MM-DD) and ensures it's not a future date
2. **GitHub Query**: Queries GitHub's GraphQL API for PRs merged on or before the specified date using the query:
   ```
   is:pr is:merged author:copilot-swe-agent[bot] merged:<=YYYY-MM-DD
   ```
3. **Data Storage**: Stores the count in Redis with an end-of-day timestamp (23:59:59.999) for the specified date
4. **Error Handling**: Exits with status code 1 on error, 0 on success

## Example Output

```
Backfilling data for 2024-01-15...
Found 150 merged PRs on or before 2024-01-15
✓ Successfully stored data point: 2024-01-15 - 150 PRs (timestamp: 1705363199999)
Backfill completed successfully
```

## Notes

- The script queries for PRs merged **on or before** the specified date (cumulative count)
- Each backfill creates a single data point in Redis
- Consider adding sleep/delay between requests when backfilling multiple dates to respect GitHub's rate limits
- The script will not overwrite existing data for a date; it will add a new entry with the same date but different timestamp

## Troubleshooting

### Missing Environment Variables
```
Error: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set
```
**Solution**: Ensure `.env.local` or `.env` file exists with the required variables.

### Invalid Date Format
```
Backfill failed: Invalid date format: 2024/01/15. Expected YYYY-MM-DD
```
**Solution**: Use the correct date format (YYYY-MM-DD).

### Future Date Error
```
Backfill failed: Cannot backfill future date: 2026-01-01
```
**Solution**: Only use dates that are today or in the past.

### GitHub API Rate Limiting
If you encounter rate limiting errors, add longer delays between requests in your loop.
