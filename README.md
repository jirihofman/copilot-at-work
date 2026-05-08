# Copilot at Work - Agent Commit Tracker

A Next.js application that tracks public GitHub commit activity from Copilot and other AI coding agents worldwide over time using GitHub search APIs and Redis for data storage.

## Features

- 📊 Real-time tracking of Copilot, Claude, Cursor commit signals and Codex labeled PRs worldwide
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
2. **GitHub API**: The endpoint queries GitHub's commit search API for `author:copilot-swe-agent[bot]`, `author:claude`, and `author:cursoragent`, plus GitHub's issue search API for `is:pr is:merged label:codex` worldwide
3. **Redis Storage**: The counts are stored in Upstash Redis with timestamps (separate keys for each agent)
4. **Data Visualization**: The homepage fetches all historical data and displays all tracked agents in an interactive chart with different colors

## Security

This repository follows security best practices:

- All secrets are stored in environment variables, never in code
- The cron endpoint is protected by authentication (`CRON_SECRET`) and rate limiting (10 requests/hour per IP)
- No sensitive data is exposed to the client-side bundle
- See [SECURITY.md](SECURITY.md) for detailed security guidelines and vulnerability reporting

**Important**: Never use `NEXT_PUBLIC_` prefix for secrets or tokens, as these are embedded in the client-side JavaScript bundle and visible to anyone.

## License

ISC
