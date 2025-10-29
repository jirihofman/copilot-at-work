/**
 * Fetches the count of merged pull requests created by a specific agent worldwide.
 * Uses GitHub GraphQL API to search for PRs authored by the specified bot.
 * @param {string} agentName - The GitHub bot username (e.g., "copilot-swe-agent[bot]")
 * @returns Number of merged PRs across all repositories worldwide
 */
async function getAgentPRCount(agentName) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN must be set");
  }

  const query = `is:pr is:merged involves:${agentName}`;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query AgentAuthoredMergedPRsAccountWide($q: String!) {
            search(type: ISSUE, query: $q, first: 1) {
              issueCount
            }
          }
        `,
        variables: { q: query },
      }),
    });

    if (!res.ok) {
      console.error(`GitHub GraphQL API returned an error:`, res.status, res.statusText);
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }

    const response = await res.json();

    if (response.errors) {
      console.error(`GraphQL errors:`, response.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
    }

    return response.data?.search?.issueCount || 0;
  } catch (error) {
    console.error(`Error getting ${agentName} PRs:`, error);
    throw error;
  }
}

/**
 * Fetches the count of merged pull requests created by Copilot worldwide.
 * Uses GitHub GraphQL API to search for PRs authored by copilot-swe-agent[bot].
 * @returns Number of merged Copilot PRs across all repositories worldwide
 */
export async function getCopilotPRCount() {
  return getAgentPRCount("copilot-swe-agent[bot]");
}

/**
 * Fetches the count of merged pull requests created by Claude worldwide.
 * Uses GitHub GraphQL API to search for PRs authored by claude-swe-agent[bot].
 * @returns Number of merged Claude PRs across all repositories worldwide
 */
export async function getClaudePRCount() {
  return getAgentPRCount("claude");
}
