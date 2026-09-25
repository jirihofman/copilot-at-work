// Keep the expanded signal separate from the historical label-only series.
export const CODEX_PR_KEY = "codex:pr:signals-v2:history";

export function getCodexPRQueries(date) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error("Invalid date. Use a valid UTC date in YYYY-MM-DD format.");
  }

  const scope = `is:pr is:merged is:public merged:${date}`;
  // Disjoint buckets: a PR matching both signals is counted only once.
  return [
    `${scope} label:codex`,
    `${scope} head:codex/ -label:codex`,
  ];
}

/**
 * Count public merged PRs with a Codex label or codex/ head branch.
 * This is an attribution proxy, not a complete count of Codex usage.
 * Fail the whole snapshot if either search is incomplete or malformed.
 */
export async function getCodexPRCount(date) {
  const queries = getCodexPRQueries(date);
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN must be set");
  }

  const counts = await Promise.all(queries.map(async (query) => {
    const params = new URLSearchParams({ q: query, per_page: "1" });
    const res = await fetch(`https://api.github.com/search/issues?${params}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      throw new Error(`GitHub Codex PR search failed: ${res.status} ${res.statusText}`);
    }

    const response = await res.json();
    if (response.incomplete_results !== false) {
      throw new Error("GitHub Codex PR search is incomplete; refusing to store a partial count");
    }
    if (!Number.isSafeInteger(response.total_count) || response.total_count < 0) {
      throw new Error("GitHub Codex PR search returned an invalid total_count");
    }
    return response.total_count;
  }));

  return counts.reduce((total, count) => total + count, 0);
}
