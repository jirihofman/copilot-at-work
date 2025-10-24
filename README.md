# Copilot at Work - PR Tracker

A Next.js application that tracks the number of merged Copilot PRs worldwide over time using GitHub's GraphQL API and Redis for data storage.

## Features

- 📊 Real-time tracking of merged Copilot PRs worldwide
- 📈 Interactive chart showing PR count over time
- ⏰ Daily automated updates via cron job
- 💾 Data persistence using Upstash Redis
- 🚀 Deployed on Vercel

## Setup

### Prerequisites

1. A GitHub Personal Access Token with appropriate permissions
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

The cron job is configured in `vercel.json` to run daily at midnight UTC.

## API Routes

### `GET /api/fetch-copilot-prs`

Returns all historical PR count data from Redis.

### `GET /api/cron`

Cron endpoint that fetches the current PR count from GitHub (worldwide) and stores it in Redis. This endpoint requires authorization via the `CRON_SECRET`.

## How It Works

1. **Daily Cron Job**: A Vercel cron job runs daily, calling `/api/cron`
2. **GitHub API**: The endpoint queries GitHub's GraphQL API for merged PRs authored by `copilot-swe-agent[bot]` worldwide
3. **Redis Storage**: The count is stored in Upstash Redis with a timestamp
4. **Data Visualization**: The homepage fetches all historical data and displays it in an interactive chart

## License

ISC
