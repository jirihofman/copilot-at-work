# Copilot Agents

This document provides an overview of the agents used in the `Copilot at Work - Agent Commit Tracker` application. These agents interact with GitHub's search APIs to track public commit activity worldwide.

## Agents Overview

### `copilot-swe-agent[bot]`
- **Purpose**: Tracks public commits authored by Copilot.
- **Integration**: Queries GitHub's commit search API for `author:copilot-swe-agent[bot]`.
- **Usage**: Data fetched by this agent is stored in Upstash Redis and visualized in the application.
- **Chart Color**: Blue (#2563eb)

### `claude`
- **Purpose**: Tracks public commits authored by Claude.
- **Integration**: Queries GitHub's commit search API for `author:claude`.
- **Usage**: Data fetched by this agent is stored in Upstash Redis and visualized in the application.
- **Chart Color**: Orange (#f97316)

### `cursoragent`
- **Purpose**: Tracks public commits authored by Cursor.
- **Integration**: Queries GitHub's commit search API for `author:cursoragent`.
- **Usage**: Data fetched by this agent is stored in Upstash Redis and visualized in the application.
- **Chart Color**: Green (#16a34a)

### `Codex`
- **Purpose**: Tracks public commits co-authored by Codex.
- **Integration**: Queries GitHub's commit search API for the exact `"Co-authored-by: Codex"` trailer.
- **Usage**: Data fetched by this agent is stored in Upstash Redis and visualized in the application.
- **Chart Color**: Black (#111827)

## How Agents Work

1. **Daily Cron Job**: The `/api/cron` endpoint is triggered daily by a GitHub Actions workflow.
2. **GitHub API Query**: The endpoint queries GitHub for commit counts matching `copilot-swe-agent[bot]`, `claude`, `cursoragent`, and the Codex co-author trailer.
3. **Data Storage**: The fetched data is stored in Upstash Redis with a timestamp (separate keys for each agent).
4. **Visualization**: The application fetches historical data for all tracked agents and displays them in an interactive chart with different colors.

## Related Files

- **Server Actions**: `lib/server-actions.js`
  - Fetches historical commit count data from Redis.
- **Cron Job**: `app/api/cron/route.js`
  - Updates PR count data daily for all tracked agents.
- **GitHub API**: `lib/github.js`
  - Contains functions to fetch commit counts for all tracked agents.
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
