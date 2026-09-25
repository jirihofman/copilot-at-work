import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { getCodexPRCount } from "./codex-pr.js";

const originalFetch = globalThis.fetch;
const originalToken = process.env.GITHUB_TOKEN;

beforeEach(() => { process.env.GITHUB_TOKEN = "test-token"; });
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalToken === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = originalToken;
});

function respond(body, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

test("counts the union once, with public visibility and the UTC merge date on both searches", async () => {
  const prs = [
    { label: true, branch: false },
    { label: true, branch: true },
    { label: false, branch: true },
    { label: false, branch: false },
  ];
  const queries = [];
  globalThis.fetch = async (url, options) => {
    const parsed = new URL(url);
    const query = parsed.searchParams.get("q");
    queries.push(query);
    assert.equal(parsed.pathname, "/search/issues");
    assert.equal(parsed.searchParams.get("per_page"), "1");
    for (const qualifier of ["is:pr", "is:merged", "is:public", "merged:2026-09-24"]) {
      assert.ok(query.split(" ").includes(qualifier));
    }
    assert.equal(options.headers.Authorization, "Bearer test-token");
    assert.equal(options.cache, "no-store");
    assert.ok(options.signal instanceof AbortSignal);
    const matches = query.includes("head:codex/")
      ? prs.filter(pr => pr.branch && (!query.includes("-label:codex") || !pr.label))
      : prs.filter(pr => pr.label);
    return respond({ total_count: matches.length, incomplete_results: false });
  };
  assert.equal(await getCodexPRCount("2026-09-24"), 3);
  assert.equal(queries.length, 2);
});

test("uses total_count beyond GitHub's 1,000 retrievable results", async () => {
  globalThis.fetch = async url => respond({
    total_count: new URL(url).searchParams.get("q").includes("-label:codex") ? 28_748 : 1_935,
    incomplete_results: false,
    items: [{}],
  });
  assert.equal(await getCodexPRCount("2026-09-24"), 30_683);
});

test("preserves genuine zero counts", async () => {
  globalThis.fetch = async () => respond({ total_count: 0, incomplete_results: false });
  assert.equal(await getCodexPRCount("2026-09-24"), 0);
});

for (const failingBucket of ["label", "branch"]) {
  test(`rejects the snapshot when the ${failingBucket} search is incomplete`, async () => {
    globalThis.fetch = async url => {
      const bucket = new URL(url).searchParams.get("q").includes("-label:codex") ? "branch" : "label";
      return respond({ total_count: 10, incomplete_results: bucket === failingBucket });
    };
    await assert.rejects(getCodexPRCount("2026-09-24"), /incomplete/);
  });
}

test("rejects malformed success responses instead of manufacturing zeros", async () => {
  for (const body of [{}, { total_count: 10 }, ...[undefined, null, -1, 1.5, "10"].map(total_count => ({ total_count, incomplete_results: false }))]) {
    globalThis.fetch = async () => respond(body);
    await assert.rejects(getCodexPRCount("2026-09-24"), /incomplete|invalid total_count/);
  }
});

test("propagates HTTP errors and network failures", async () => {
  for (const status of [403, 422, 429, 500]) {
    globalThis.fetch = async () => respond({}, status);
    await assert.rejects(getCodexPRCount("2026-09-24"), new RegExp(String(status)));
  }
  globalThis.fetch = async () => { throw new Error("network unavailable"); };
  await assert.rejects(getCodexPRCount("2026-09-24"), /network unavailable/);
});

test("rejects invalid dates, query injection and missing credentials before fetching", async () => {
  globalThis.fetch = async () => { assert.fail("must not fetch"); };
  for (const date of ["2026-02-30", "2025-02-29", "2026-13-01", "2026-9-24", "2026-09-24 is:private", ""]) {
    await assert.rejects(getCodexPRCount(date), /Invalid date/);
  }
  delete process.env.GITHUB_TOKEN;
  await assert.rejects(getCodexPRCount("2026-09-24"), /GITHUB_TOKEN/);
});
