# Copilot at Work - Agent Commit Tracker

A Next.js application that tracks public GitHub commit activity from Copilot and other AI coding agents worldwide over time using GitHub search APIs and Redis for data storage.

## Features

- 📊 Real-time tracking of Copilot, Claude, Cursor commit signals and Codex PR signals worldwide
- 📈 Interactive chart showing commit count over time for all tracked agents
- 🎨 Multi-line visualization: blue for Copilot, orange for Claude, green for Cursor, black for Codex
- ⏰ Daily automated updates via cron job
- 💾 Data persistence using Upstash Redis
- 🚀 Deployed on Vercel

## Setup

### Prerequisites

1. A GitHub Personal Access Token with `public_repo` read access (minimum required permissions)
2. An Upstash Redis instance (free tier available)
3. A Vercel account (for deployment)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# Cron Secret (for securing the cron endpoint)
CRON_SECRET=your_random_secret_string
```

See `.env.example` for a template.

### GitHub Actions Secrets

For the cron job to work, add these secrets to your GitHub repository settings:

- `CRON_SECRET`: The same secret used to secure the cron endpoint
- `APP_URL`: Your deployed application URL (e.g., `https://your-app.vercel.app`)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build

```bash
npm run build
npm start
```

## Deployment

This application is designed to be deployed on Vercel:

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Add the required environment variables in Vercel's project settings
4. Deploy!

The cron job is configured in `.github/workflows/cron.yml` to run daily at midnight UTC via GitHub Actions.

## API Routes

### `GET /api/commits`

Returns live commit counts for all tracked agents for a requested date.

### `GET /api/cron`

Cron endpoint that fetches the previous UTC day's commit counts from GitHub (worldwide) and stores them in Redis. This endpoint requires authorization via the `CRON_SECRET`.

## How It Works

1. **Daily Cron Job**: A GitHub Actions cron job runs daily, calling `/api/cron`
2. **GitHub API**: The endpoint queries GitHub's commit search API for `author:copilot-swe-agent[bot]`, `author:claude`, and `author:cursoragent`, plus two disjoint public PR searches for Codex: `is:pr is:merged is:public merged:YYYY-MM-DD label:codex` and `is:pr is:merged is:public merged:YYYY-MM-DD head:codex/ -label:codex`
3. **Redis Storage**: The counts are stored in Upstash Redis with timestamps (separate keys for each agent)
4. **Data Visualization**: The homepage fetches all historical data and displays all tracked agents in an interactive chart with different colors

## Codex methodology

Codex counts merged public PRs carrying either a `codex` label or a `codex/` head branch. The two searches exclude overlap and use the UTC **merge date**. Cron, live counts, and both backfill scripts share `lib/codex-pr.js`. Incomplete or malformed GitHub responses fail the Codex update instead of storing a partial count or zero.

This is a public attribution proxy: manual labels/branch names can add noise, and custom branches or unmarked PRs can be missed. Review-bot participation is excluded because it also matches PRs written with other tools. Codex PR counts are not directly comparable to the other agents' commit counts. See [the investigation and measured results](docs/codex-pr-methodology.md).

The expanded series uses `codex:pr:signals-v2:history`; the old `codex:pr:history` remains untouched. This prevents the methodology change from appearing as a growth spike. On deployment, the Codex chart starts empty until cron or a backfill populates the new series. Rebuild the dates you want to display using:

```bash
node scripts/backfill-agent.js codex 2026-09-24
# Or rebuild all dates from a chosen starting date (two search requests per day):
BACKFILL_SLEEP_SECONDS=10 bash scripts/codex-backfill-loop.sh 2025-05-16
```

Backfill uses the current search index, so counts can differ from original snapshots. If a search fails or is incomplete, the backfill stops; rerun from that date. No production history is migrated automatically.

## Security

This repository follows security best practices:

- All secrets are stored in environment variables, never in code
- The cron endpoint is protected by authentication (`CRON_SECRET`) and rate limiting (10 requests/hour per IP)
- No sensitive data is exposed to the client-side bundle
- See [SECURITY.md](SECURITY.md) for detailed security guidelines and vulnerability reporting

**Important**: Never use `NEXT_PUBLIC_` prefix for secrets or tokens, as these are embedded in the client-side JavaScript bundle and visible to anyone.

## License

ISC
