# Codex PR attribution investigation

Measured against GitHub's REST search API on 2026-09-25. These are search-index observations, not verified totals of vendor usage.

## Finding

The previous query required `label:codex`. That misses many merged PRs whose head branch uses `codex/`, including PRs authored under a human's GitHub account. Count the union of these signals, using two disjoint queries per UTC merge day:

```text
is:pr is:merged is:public merged:YYYY-MM-DD label:codex
is:pr is:merged is:public merged:YYYY-MM-DD head:codex/ -label:codex
```

GitHub documents `head:` as matching branch names beginning with the supplied term, along with label, public-visibility, and merge-date filters in [Searching issues and pull requests](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests). The exclusion on the second query prevents double counting. `is:public` makes scope independent of private repositories accessible to the token.

## Measurements

All responses below reported `incomplete_results: false`. The implemented counter reproduced each combined total in a second live check, without Redis writes.

| UTC merge date | Codex label | Codex branch without label | Combined |
| --- | ---: | ---: | ---: |
| 2025-06-01 | 2,750 | 123 | 2,873 |
| 2026-09-17 | 1,833 | 21,966 | 23,799 |
| 2026-09-24 | 1,935 | 28,748 | 30,683 |

On September 24, `head:codex/` alone matched 30,459 PRs and the intersection of branch and label matched 1,711. Thus 1,935 + 30,459 - 1,711 = 30,683, about 15.9 times the label-only count. This demonstrates improved coverage, not a measured attribution-accuracy rate.

Examples inspected through the pull-request API:

- [jaseci-labs/jac#2027](https://github.com/jaseci-labs/jac/pull/2027): merged June 1, 2025, no labels, head `codex/refactor-parser.py-to-replace-subnodelist-usage`, and an explicit Codex task link in the description. Direct evidence of a Codex PR missed by the old method.
- [zukor/photo-notes#107](https://github.com/zukor/photo-notes/pull/107): merged September 24, 2026, no labels, head `codex/ramo-intake-sender`, human PR and commit author. Included as a branch signal; the branch name alone is not proof of authorship.

Reproduce a measurement with authenticated GitHub CLI:

```bash
gh api -X GET search/issues \
  -f q='is:pr is:merged is:public merged:2026-09-24 label:codex' \
  -f per_page=1 --jq '{total_count,incomplete_results}'
gh api -X GET search/issues \
  -f q='is:pr is:merged is:public merged:2026-09-24 head:codex/ -label:codex' \
  -f per_page=1 --jq '{total_count,incomplete_results}'
```

## Other approaches checked

All searches used `is:pr is:merged is:public` and the indicated merge day.

| Additional filter | Date | Count | Assessment |
| --- | --- | ---: | --- |
| `author:app/chatgpt-codex-connector` | 2026-09-24 | 0 | Connector author is not a useful replacement for human-authored PRs. |
| `involves:chatgpt-codex-connector[bot]` | 2026-09-24 | 33,423 | Rejected: includes review/comment participation on other tools' PRs. |
| `"chatgpt.com/codex/tasks" in:body` | 2026-09-24 | 1 | Too narrow to replace branch/label signals. |
| `"chatgpt.com/codex/tasks" in:body -head:codex/ -label:codex` | 2025-06-01 | 25 | Some additional historical coverage; not included in this version. |
| `"chatgpt.com/codex/cloud/tasks" in:body` | 2026-09-24 | 0 | Exact URL search did not reliably retrieve known matching descriptions. |
| `"chatgpt.com/s/cd_" in:body` | 2026-09-24 | 0 | No additional coverage in this sample. |

For a concrete false positive in the involvement approach, [TheBigGooberWebsite#20](https://github.com/digitaltacticalworksheets/TheBigGooberWebsite/pull/20) matched the connector involvement query but has head `claude/vigilant-bell-x2jrvi` and explicit Claude Code attribution. Review participation cannot establish who produced a PR.

The URL-search limitation was visible in [BMET5957#28](https://github.com/youngthugman/BMET5957/pull/28): its description contains a `chatgpt.com/codex/cloud/tasks/` link, but the quoted URL search returned zero for that date. URL text search is not treated as a reliable primary counter. Broader unqualified `codex` text would also include discussion of the product, not necessarily work produced by it.

Commit author/co-author attribution would measure another unit and would require mapping commits back to unique merged PRs. The inspected photo-notes PR's commits had human author identities and no Codex trailers. This was not evaluated as a global replacement.

## Reliability and remaining limits

- `lib/codex-pr.js` supplies the same counter to cron, the live endpoint, and both backfills.
- Each count uses `total_count`, not the returned item list, so fetching one item does not cap the count at one or 1,000.
- Both buckets must succeed with a nonnegative integer count and explicit `incomplete_results: false`. HTTP errors, timeouts, missing fields, and incomplete searches fail the snapshot. The existing day's Codex data is untouched if counting fails.
- GitHub's [REST search documentation](https://docs.github.com/en/rest/search/search) describes search timeouts and a repository search-scope limit. A complete-response flag does not prove worldwide exhaustiveness. Indexing delays, repository visibility changes, mutable labels, and separately executed searches can change results.
- The signals are conventions, not cryptographic provenance: manually named branches and unrelated labels can add false positives; custom branches and missing labels cause false negatives. A representative precision/recall audit has not been performed.
- Codex counts merged PRs while the other series count commits. The UI explicitly states that these units differ.

## History transition

Use the new Redis key `codex:pr:signals-v2:history` for reads and writes. Preserve the old `codex:pr:history` unchanged. Combining old and new observations would manufacture a large growth jump and distort weekly/monthly trends.

The Codex chart initially has no revised history until cron or backfill populates the new key. To rebuild it, run the existing Codex backfill with the updated code, for example:

```bash
BACKFILL_SLEEP_SECONDS=10 bash scripts/codex-backfill-loop.sh 2025-05-16
```

Choose the desired start date. Each date requires two search requests. A failed Codex count stops backfill before writing that day; rerun from that date. The refreshed counts reflect the current index. This PR does not run a production backfill or modify production Redis.
