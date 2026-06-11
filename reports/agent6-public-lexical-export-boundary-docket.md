# Agent 6 Public Lexical Export Boundary Docket

Date: 2026-05-31
Agent: 6 (independent QA/compliance)
Scope: public lexical export boundary, license segregation, and release-language accuracy

## Decision

Public lexical export is not an active publication blocker on the current evidence, but it is not broad "safe for publication" clearance either.

The export layer is structurally segregated by license and repeatedly labeled as lexical, not translation. That is acceptable for a public workbench or reader-adjacent lexical export.

Agent 5's release language is still too broad if it implies the route/HUD release gate clears downstream public lexical CSVs for unrestricted reuse or publishable translation authority.

## Findings

### Warning 1

- Class: Warning
- Owner: Agent 5
- Title: Release gate language overclaims beyond what it actually audited

Evidence:

- `reports/hud-route-release-gate.md` reports `Status: pass`, `Issues: None`, and `Warnings: None`, but the scope is only public lookup card inventory and a 6-token sample.
- The same gate report does not mention license buckets, attribution requirements, share-alike/copyleft separation, or the "not a translation" boundary.
- `reports/public-lexical-export-report.md` separately describes a broader export surface, including `data/public-lexical/all-claims.csv`, license-bucket CSV mirrors, and per-work token claim CSVs.

Why this matters:

- A "pass" statement at route-release level can be misread as blanket clearance for public lexical exports.
- That is not defensible if later asked whether the pass covered downstream CSV reuse, publication safety, or copyleft boundary handling.

Acceptance condition:

- Agent 5 narrows release language so `hud-route-release-gate` is described as a route-lookup integrity gate only.
- Any public lexical export status statement must separately state that the export is lexical/workbench data, not translation clearance.

### Warning 2

- Class: Warning
- Owner: Agent 5
- Title: Flat all-claims export is easy to over-read as publication-safe lexical authority

Evidence:

- `data/public-lexical/all-claims.csv` contains English rendering text in `strict_renderings`, plus `source_name`, `source_id`, `license`, `license_url`, `attribution_requirements`, and `not_a_translation`.
- Sample rows from `data/public-lexical/all-claims.csv` include Kaikki/Wiktionary `CC BY-SA 4.0 / GFDL` rows with English gloss-like renderings and `not_a_translation=true`.
- `reports/public-lexical-export-report.md` says all claim rows are also available in `data/public-lexical/all-claims.csv` with deterministic confidence columns attached.

Why this matters:

- Compliance-wise, the `not_a_translation` field helps, but the flat CSV still looks close to a reusable lexical authority table.
- A downstream user or internal automation could ignore the boundary language and reuse English rendering text as if it were publication-cleared lexical output.

Acceptance condition:

- Agent 5 documents `all-claims.csv` as mixed-license lexical evidence, not publication-cleared lexical text.
- Any release note or handoff that mentions `all-claims.csv` must explicitly say it contains share-alike/copyleft-reviewed rows and requires license-aware downstream handling.

### Warning 3

- Class: Warning
- Owner: Agent 1
- Title: License segregation is good, but mixed-license exports still need stricter label discipline

Evidence:

- `scripts/export_public_lexical.mjs` writes separate by-license files for:
  - `project-cc0`
  - `wikidata-cc0`
  - `openscriptures-cc-by-4`
  - `kaikki-wiktionary-cc-by-sa-gfdl`
- The same script writes a combined `data/public-lexical/by-license/cc0-only.csv`.
- `licenseAttribution(...)` in `scripts/export_public_lexical.mjs` adds explicit attribution/share-alike text, including: attribution required for CC BY and separation warnings for BY-SA/GFDL rows.

Why this matters:

- Structurally, this is the correct direction and materially reduces accidental commingling risk.
- But the presence of a separate `cc0-only.csv` means every non-CC0 export should be treated as not publication-safe by default unless the label discipline remains explicit and consistent.

Acceptance condition:

- Agent 1 keeps license labels fully spelled out and avoids shorthand or ambiguous labels in any public lexical export documentation.
- Agent 5 describes `cc0-only.csv` as the only export that is cleanly separated for no-attribution-required reuse by license, while still not calling it translation output.

### Accepted With Boundary 1

- Class: Accepted With Boundary
- Owner: Agent 4
- Title: Public lexical export preserves a lexical-not-translation boundary in the exported schema

Evidence:

- `reports/public-lexical-export-report.md` states: "It is not a translation export and does not include prose translations."
- `data/public-lexical/manifest.json` scope says: "These are lexical options, not translations."
- `scripts/export_public_lexical.mjs` emits `not_a_translation: true` across claim, by-license, and token-claim CSV outputs.

Boundary:

- This is acceptable for public lexical/workbench export semantics.
- It is not equivalent to approval for future publishable translation text or unrestricted downstream reuse of every CSV.

Acceptance condition:

- None for current boundary call.
- Keep this wording intact anywhere the export is surfaced publicly or relayed internally.

### Accepted With Boundary 2

- Class: Accepted With Boundary
- Owner: Agent 1
- Title: License-bucket segregation currently prevents silent copyleft leakage inside the export package

Evidence:

- `data/public-lexical/manifest.json` enumerates separate by-license outputs and a distinct `cc0-only.csv`.
- Sample Kaikki rows remain inside the dedicated `kaikki-wiktionary-cc-by-sa-gfdl.csv` export and carry explicit attribution/share-alike text.
- Current evidence does not show those rows silently flowing into a falsely labeled CC0 file.

Boundary:

- This is segregation success, not publication clearance.
- The risk is misstatement, downstream misuse, or future pipeline bypass, not current hidden co-mingling inside the exported package.

Acceptance condition:

- Keep separate license buckets intact.
- Do not market the package as uniformly open or uniformly publication-safe.

## Agent 6 Control Call

Current call for Agent 5:

- Do not describe the public lexical export package as "cleared" or "safe" without qualifiers.
- Describe it as a labeled lexical export with explicit mixed-license boundaries.
- Keep publication clearance tied to the translation-memory gate, not to route lookup pass status and not to lexical CSV availability.

## Relay Sentence For Agent 5

`Agent 6 accepts the public lexical export only as a labeled lexical/workbench package. It is not publication-safe by default, and the HUD route pass cannot be used as blanket clearance for all downstream CSV exports.`
