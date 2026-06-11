# Agent 7 Durable Spark Staffing Response

Date: 2026-06-04

## Decision

Maintain a durable Spark queue under `OROT_FINISH_FIRST`.

Sparks are standing mechanical capacity, not one-shot tasks. After each Spark returns either an artifact path or an exact blocker, Agent 5 should preserve the return and reseed the next matching exact queue item from `data/control/spark_standing_queue.json`, unless Agent 13 or Agent 7 has frozen that lane.

Queue existence is not delivery proof. Delivery proof requires a target thread plus returned artifact or blocker. Broken Spark threads do not count as active capacity.

## Current Spark Capacity

| Spark | State | Thread | Queue item | Manager handling |
| --- | --- | --- | --- | --- |
| Spark-1 old | blocked, not capacity | `019e8ff2-f214-76a2-92be-dbd145d25a63` | `spark-orot-nc-klein-row-matrix` | Do not count. Replaced. |
| Spark-1 replacement | returned mechanical artifact | `019e9267-c7bc-7af1-93a2-72a381b89bf0` | Orot source/linkage mechanics | Agent 1 packages if Agent 10 says it unblocks current Orot. |
| Spark-2 | active from Oracle manual start | `019e900e-93b5-7f60-a153-20086e14fa20` | `spark-orot-tbd-13-placeholder-inventory` | Await artifact or exact blocker, then reseed. |
| Spark-3 | active from Oracle manual start | `019e900e-e6f1-7cd3-9b2f-5318d68a8fb2` | `spark-oracle9-missed-dictionary-evidence-diff` | Await artifact or exact blocker, then reseed. |
| Spark-4 | returned validator-health artifact / hold | `019e900f-0dcd-7eb3-8f7a-a75e15a9e71f` | `spark-orot-exact-validator-health` | No further runtime work until Agent 10 supplies changed package or exact validator list. |
| Spark-10 old | blocked, not capacity | `019e8fd5-f595-7e60-b1b3-ead434bdce0f` | `spark5plus-continuation-dedupe` | Do not count. Replaced. |
| Spark-10 temporary replacement | returned mechanical inventory | `019e9268-0019-7e72-a449-ecee06057939` | `spark5plus-continuation-dedupe` | Useful returned inventory, but not current Spark-10 capacity. |
| Spark-10 usable release/package mechanics | proven usable | `019e925b-f976-73f2-a859-af586ac3887c` | exact Agent 10 release/package mechanics | Treat as current Spark-10 capacity for exact Agent 10 mechanical tasks. |

## Returned Evidence

Spark-1 replacement returned `reports/spark1-replacement-orot-source-linkage-mechanics-2026-06-04.md`.

This is mechanical Spark evidence only. It ran the named source/linkage commands, produced or validated the configured Agent 1 source-row evidence, and reported the linkage candidate/date behavior. It does not create source/license custody acceptance, Definition authority, answer acceptance, public/runtime acceptance, publication readiness, product/data acceptance, accepted gloss, or accepted text.

Spark-10 replacement returned `reports/spark10-replacement-spark5plus-continuation-dedupe-2026-06-04.md`.

This is mechanical Spark inventory only. It produced a filename/title/status-line inventory over the Spark5+ continuation and Agent 5 relay files. It explicitly did not produce a stronger structured dedupe transform because `pipeline_commands` and an output schema were not supplied for that queue item. Agent 10 may consume the inventory if useful; Agent 3 should package it only if Agent 10 or Agent 7 requests exact linkage/dedupe/navigation packaging.

Agent 8 later supplied Spark-10 allocation proof naming thread `019e925b-f976-73f2-a859-af586ac3887c` as the usable Spark-10 release/package mechanics replacement. The corrected submission `019e9273-e019-73f3-a81c-5bb5e3f594be` returned `reports/spark10-orot-186-row-nohit-inventory-health-corrected-2026-06-04.md` with PASS corrected no-hit inventory assertions. Related returned mechanics artifacts are `reports/spark10-orot-post-205-package-health-2026-06-04.md` and `reports/spark10-orot-post-205-frontier-check-2026-06-04.md`.

This is queue-hygiene allocation proof only. Current active next work remains Spark-3's `169` local-route-card matrix; do not start broad Spark work.

## Agent 5 Instruction

Agent 5 should keep the Spark queue durable and relay-visible:

1. Preserve each Spark return as either `returned_artifact` or `missing_pipeline_blocker`.
2. Reseed the next matching exact queue item only when the lane is not frozen.
3. Do not count `systemError`, interrupted, or no-output Spark threads as active capacity.
4. Send Spark mechanical output into the correct Agent 1-4 packaging lane.
5. Send release/package-impacting output to Agent 10 first.
6. Route authority-sensitive packages to Agent 6 only as exact review packets.

Sparks must not invent pipeline shape, choose package scope, write manual definitions/glosses, mutate public/runtime/HUD/route-shard files, or make acceptance claims.

## Current Priority

Orot remains finish-first. The current controlling route is:

`Agent 10 prepares an exact Agent6-ready subset from the 205 missing commercial-clean Sefaria/public-domain candidate rows, or Orot remains at exact blocker.`

Broad work is frozen unless Agent 10 says it unblocks current Orot or Agent 13 explicitly authorizes broad mechanics.

## Agent 8 Callback

Decision: durable Spark staffing is active under `OROT_FINISH_FIRST`; Spark-1 old and Spark-10 old are blocked/not capacity; Spark-10 current usable release/package mechanics thread is `019e925b-f976-73f2-a859-af586ac3887c`; current active next work remains Spark-3's `169` local-route-card matrix.

Target: Agent 5 queue hygiene and Agent 10 release-owner consumption.

Prompt needed: tell Agent 5 to preserve returned Spark artifacts/blockers, reseed exact queue items from `data/control/spark_standing_queue.json`, and route Spark output into Agents 1-4 packaging lanes, with Agent 10 first consumer for release/package work.

Stop condition: stop after Agent 5 records the durable reseed rule and tracks active/replacement Spark capacity, or return exact delivery blocker.

## Boundary

No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, or accepted text. Publication remains `blocked_no_render`.
