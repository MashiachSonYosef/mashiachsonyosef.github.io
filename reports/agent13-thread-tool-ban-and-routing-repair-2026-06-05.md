# Agent 13 Thread-Tool Ban And Routing Repair - 2026-06-05

| lane | repo-control source | app-thread tool avoided | exact blocker if any | next repo-control owner | stop condition |
| --- | --- | --- | --- | --- | --- |
| Agent 13 identity/routing | `data/control/agent13_organization_state.json`; `data/control/agent_registry.json`; `data/control/spark_standing_queue.json`; `data/control/agent_goal_board.json` | `list_threads`; `read_thread`; discovery use of `send_message_to_thread`; fake replacement creation | `app_layer_thread_discovery_blocker`: app thread lookup/read failure is not identity evidence and does not authorize a replacement Agent 13 | Agent 13 repo-control mission lane; execution through Agent 7/Agent 5/Agent 10 as named by control files | Stop after file-backed route or exact blocker; do not create or use a replacement Agent 13 from app thread search |
| Oracle 9 / Agent 14 recovery | Same repo-control files plus this report | `read_thread` retry loops and thread-title search | Prior route failure mode was stale-path/app-layer discovery, not missing Agent 13 mission authority | Agent 9/14 must cite repo-control state or return blocker | Stop if the only available proof is app-thread discovery/read status |
| Future agent routing | Same repo-control files | Any app thread discovery used to decide who Agent 13 is | `fake_agent13_non_authoritative` if a new or guessed Agent 13 exists without repo-control backing | Agent 7 for execution/staffing, Agent 5 for proof/queue mechanics, Agent 10 for release/package boundary work | Stop before routing authority, acceptance, public/runtime mutation, or release action |

Rule: Agent 13 is a repo-control mission lane, not a discoverable app thread identity. If app thread lookup fails, future agents must write `app_layer_thread_discovery_blocker` and continue from repo-control artifacts only.

Boundary: routing-control repair only. No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no public/runtime mutation, and no release action.
