# Agent 10 Request To Agent 1 And Agent 6: Sefaria Lexicon License Boundary

Status: license and custody boundary request only.

Requester: Agent 10.

Target lanes: Agent 1 source/provenance/license custody and Agent 6 compliance disposition.

Highest permissible claim: this document requests a lexicon-family license/custody boundary. It does not approve source custody, license posture, storage, display, answer text, accepted gloss, translation text, public HUD output, QA state, or publication readiness.

## Reason For Request

Oracle 9 identified Sefaria lexicons as the largest likely Orot data-fill pot. Agent 10 ran a zero-emission top-500 Sefaria hit audit.

Evidence:

- `reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.json`
- `reports/agent2-orot-sefaria-lexicon-hit-audit-2026-06-03.md`
- `reports/agent2-orot-sefaria-answer-transform-spec-2026-06-03.md`

Audit result:

- Top Orot gap rows audited: `500`.
- Scoped occurrences: `8427`.
- Rows with any Sefaria lexicon hit: `314`.
- Occurrences covered by any Sefaria lexicon hit: `6006`.
- Definition content stored: `0`.
- Answer rows emitted: `0`.
- Public HUD rows emitted: `0`.
- Route JSONL rows emitted: `0`.

## Lexicon Families Needing Boundary

Please review each family separately:

| Lexicon Family | Audit Row Hits | Audit Occurrence Hits | Observed Source Metadata | Boundary Needed |
| --- | ---: | ---: | --- | --- |
| Jastrow Dictionary | 210 | 4474 | Jastrow Dictionary; Rabbi Marcus Jastrow; London, Luzac, 1903 | storage/display/link/citation posture |
| Klein Dictionary | 214 | 4444 | Klein Dictionary; Ezra Klein; Carta Jerusalem; 1st edition, 1987 | storage/display/link/citation posture |
| BDB Augmented Strong | 222 | 4435 | Open Scriptures on GitHub; Larry Pierce / Online Bible attribution | storage/display/link/citation posture |
| BDB Dictionary | 221 | 4418 | BDB Dictionary; F. Brown, S. Driver, C. Briggs; Oxford, 1906 | storage/display/link/citation posture |
| BDB Aramaic Dictionary | 69 | 2048 | BDB Dictionary; F. Brown, S. Driver, C. Briggs; Oxford, 1906 | storage/display/link/citation posture |

## Questions For Agent 1

For each lexicon family, please determine:

- Can the project store lexicon metadata only: parent lexicon, headword, rid, refs, source, attribution, source URL, version title?
- Can the project store definition or note text from the Sefaria response?
- Can the project display answer text derived from that lexicon in a public reader hint?
- Can the project link/cite externally without storing answer text?
- What attribution text and URL are required?
- Does any share-alike, noncommercial, copyrighted, or unclear term block storage/display?
- Is local caching allowed for audit metadata only?
- Is local caching allowed for definition text?
- Is a separate source-custody manifest entry required?

## Questions For Agent 6

Please define the review boundary Agent 2 must satisfy before any Sefaria-derived row can be `answer_eligible=true`:

- Which Agent 1 result statuses are sufficient?
- Which lexicon families are allowed for storage and display?
- Which lexicon families are link-or-citation-only?
- Which lexicon families remain blocked?
- Is metadata-only audit storage acceptable while license is unresolved?
- Does the proposed transform spec preserve non-authority boundaries?
- What validator evidence must accompany a future dry run?

## Requested Status Values

Please use one status per lexicon family:

- `cleared_for_storage_and_display`.
- `cleared_for_metadata_only`.
- `cleared_for_external_link_or_citation_only`.
- `blocked_unresolved_license`.
- `blocked_source_custody_gap`.
- `blocked_attribution_gap`.

## Interim Agent 10 Boundary

Until Agent 1/6 returns a family-specific boundary:

- Sefaria hits remain source-discovery metadata only.
- No definition or note text is stored.
- No answer rows are emitted.
- No public HUD rows are emitted.
- No route JSONL rows are emitted.
- No accepted gloss or accepted translation text is claimed.
- No Definition authority or usage-as-definition authority is claimed.

## Agent 8 Callback

- Status: Agent 1/6 license-boundary request produced.
- Artifact path: `reports/agent10-agent1-sefaria-lexicon-license-boundary-request-2026-06-03.md`.
- Selected page or blocker: Orot flagship data-fill license/custody boundary.
- Agent 1 needed: yes.
- Agent 2 needed: after Agent 1/6 boundary, for zero-or-safe transform dry run.
- Agent 4 needed: no, because no public/runtime artifact changed.
- Agent 7/13 decision needed: only if unresolved lexicon text is proposed for storage/display.
- Next recommended executable route: Agent 1 source/license review by lexicon family and Agent 6 boundary disposition.

## What Must Not Be Accepted

- QA acceptance.
- Validated public/runtime acceptance.
- Source custody.
- Source/provenance acceptance.
- License clearance.
- Definition authority.
- Usage-as-definition authority.
- Translation output.
- Accepted gloss.
- Accepted translation text.
- Public HUD mutation.
- Route JSONL mutation.
- Publication readiness.
