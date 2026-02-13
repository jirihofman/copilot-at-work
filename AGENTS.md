# Copilot Agents

This document provides an overview of the Copilot agents used in the `Copilot at Work - PR Tracker` application. These agents interact with GitHub's GraphQL API to track merged pull requests worldwide.

## Agents Overview

### `copilot-swe-agent[bot]`
- **Purpose**: Tracks merged pull requests worldwide.
- **Integration**: Queries GitHub's GraphQL API for PR data.
- **Usage**: Data fetched by this agent is stored in Upstash Redis and visualized in the application.
- **Chart Color**: Blue (#2563eb)

### `claude-swe-agent[bot]`
- **Purpose**: Tracks merged pull requests worldwide.
- **Integration**: Queries GitHub's GraphQL API for PR data.
- **Usage**: Data fetched by this agent is stored in Upstash Redis and visualized in the application.
- **Chart Color**: Orange (#f97316)

### `cursoragent`
- **Purpose**: Tracks merged pull requests worldwide.
- **Integration**: Queries GitHub's GraphQL API for PR data.
- **Usage**: Data fetched by this agent is stored in Upstash Redis and visualized in the application.
- **Chart Color**: Green (#16a34a)

## How Agents Work

1. **Daily Cron Job**: The `/api/cron` endpoint is triggered daily by a GitHub Actions workflow.
2. **GitHub API Query**: The endpoint queries GitHub for merged PRs authored by `copilot-swe-agent[bot]`, `claude-swe-agent[bot]`, and `cursoragent`.
3. **Data Storage**: The fetched data is stored in Upstash Redis with a timestamp (separate keys for each agent).
4. **Visualization**: The application fetches historical data for all tracked agents and displays them in an interactive chart with different colors.

## Related Files

- **Server Actions**: `lib/server-actions.js`
  - Fetches historical PR count data from Redis.
- **Cron Job**: `app/api/cron/route.js`
  - Updates PR count data daily for all tracked agents.
- **GitHub API**: `lib/github.js`
  - Contains functions to fetch PR counts for all tracked agents.
- **Chart Component**: `app/components/ChartClient.jsx`
  - Displays all tracked agents' data in the same chart.

## Environment Variables

Ensure the following environment variables are set for the agents to function correctly:

```env
# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# Cron Secret
CRON_SECRET=your_random_secret_string
```

For more details, refer to the [README.md](./README.md).
