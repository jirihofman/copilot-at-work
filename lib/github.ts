/**
 * Fetches the count of merged pull requests created by Copilot for a given user.
 * Uses GitHub GraphQL API to search for PRs authored by copilot-swe-agent[bot].
 * @param username GitHub username
 * @returns Number of merged Copilot PRs across all repositories
 */
export async function getCopilotPRCount(username: string): Promise<number> {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN must be set");
  }

  const query = `is:pr is:merged author:copilot-swe-agent[bot] involves:${username}`;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query CopilotAuthoredMergedPRsAccountWide($q: String!) {
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
    console.error(`Error getting Copilot PRs:`, error);
    throw error;
  }
}
