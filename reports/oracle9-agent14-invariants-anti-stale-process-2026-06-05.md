# Oracle 9 Agent 14 Invariants And Anti-Stale Process - 2026-06-05

Status: `oracle_watch_correction_preserved`
Source: Agent 14 / owner-requested compact update
Boundary: observation/update only; no routing authority

## Invariants

1. Every useful agent output should reduce ambiguity for the next lane without stealing authority.
2. Required shape: `artifact -> evidence -> blocker -> exact next owner -> stop condition`.
3. Labels are not permission. `commercial_clean_candidate`, `WARN-ACCEPTED`, `validated`, `delivered`, `public domain`, and `planning evidence` must not be overread as export, Definition, answer, runtime, publication, or release authority.
4. Agent lane behavior to preserve:
   - Agent 1 proves lane/source facts.
   - Agent 2 waits or transforms only after boundary.
   - Agent 3 provides linkage/navigation evidence only.
   - Agent 4 validates changed inputs and zero counters.
   - Agent 10 packages exact Agent 6 questions.
   - Agent 6 returns dated pass/warn/block boundaries.
   - Agent 7/5 preserve or publish only exact needed state.
5. Evidence may move forward. Authority must not leak sideways.

## Anti-Stale Process

- Start from current artifact paths and current mtime/current verdict, not old narrative.
- For each lane, record only: current target, files used, row/count snapshot, exact blocker, handoff owner, stop condition.
- If evidence is older than a newer verdict/consumption receipt/control correction, mark it historical and do not route from it.
- If direct thread delivery stalls or cannot be proven, report exact delivery blocker and shortest bridge. Do not create communication architecture.
- Never use `list_threads` as restore proof. Use DB-backed proof/control artifacts or direct known thread ids.
- Refresh only the field that can stale: counts, route id, verdict path, queue status, or blocker. Do not rewrite settled behavior.

## Oracle 9 Use

Use this as a check before restore, contradiction, or route repair work:

`current artifact | current evidence | exact blocker | next owner | stop condition | stale field if any`

If any field is missing, stop at the missing field and record the exact blocker.

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no public/runtime mutation, no release action.
