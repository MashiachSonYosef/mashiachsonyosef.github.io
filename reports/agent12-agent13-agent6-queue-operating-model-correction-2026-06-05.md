# Agent 12 To Agent 13: Agent 6 Queue Operating Model Correction

Mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`

Highest permissible claim: Agent 12 limiter/control-shape advisory only. No QA/source/license/Definition/runtime/publication/product/answer acceptance.

## Correction

Agent 6 should not stop repo work for every incoming validation request. Agent 6 should maintain two alternating work modes:

| mode | cap/allow | reason | exact next useful work | stop condition |
| --- | --- | --- | --- | --- |
| Dirty repo work block | allow | Agent 6 still needs uninterrupted local repo/control cleanup and docket preparation time. | Work a bounded local repo block, for example about 200 words or one small proof/docket chunk, while incoming validation requests are queued rather than interrupting. | Block completes or a true urgent owner/QA boundary appears. |
| Validation intake queue | allow | Any agent may send exact validation items, but intake is queueing, not immediate interruption. | Queue each item with sender, artifact path, requested boundary, required verdict type, and exact blocker if fields are missing. | Item is queued or rejected with exact missing field. |
| Validation drain block | allow | Agent 6 should periodically switch from repo work to validation work and drain queued items in bounded batches. | Validate Agent 6's own next bounded block plus queued exact items, using normal pass/warn/block docket language. | Batch reaches the bounded work limit, queue is empty, or an exact blocker is recorded. |
| Queue quality | cap | Vague asks and 200-word status notes should not displace repo work. | Reject or hold items missing artifact path, requested boundary, or validation question; ask for the missing field only. | Exact field supplied or item remains held. |
| Interruptions | cap | Constant switching makes Agent 6 slower and turns QA into status churn. | Do not interrupt Agent 6 mid-block unless owner, Agent 6, or an urgent QA boundary requires it. | Current block ends, then drain queue. |

One-line rule for Agent 13:

`Agent 6 accepts validation requests into a queue continuously, but works them only during bounded validation-drain blocks between bounded dirty-repo work blocks; missing-field asks do not interrupt him.`
