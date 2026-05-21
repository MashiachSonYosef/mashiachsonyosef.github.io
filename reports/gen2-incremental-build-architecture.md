# Generation-2 Incremental Build Architecture

Generated: 2026-05-21

## Current Problem

The corpus has outgrown corpus-wide regeneration. The slow path today is not one operation; it is the multiplication of:

- full lexical cache rebuilds
- full-site HTML rendering
- full overlay/export rewrites
- global report scans
- route rendering coupled to lexical payload generation
- repeated JSON serialization of giant occurrence/index files

The Halakhah batch exposed the failure mode clearly: source import and lexical cache generation completed, but page rendering and lexical payload writing were coupled through the PowerShell renderer. The batch had valid source pages and token indexes, but missing per-work lexical manifests/chunks because the renderer was interrupted.

## Architecture Map

Generation-2 should split the site into explicit artifact phases:

1. Source intake
   - Input: source import config and source API/cache.
   - Output: `data/sources/<work_id>.json`.
   - License boundary: version-level source metadata lives on source units.

2. Overlay/export generation
   - Input: `data/sources/*.json`.
   - Output: `data/overlays/<work_id>.json`, per-work `overlay-export.*`, root `overlay-export.*`.
   - Constraint: preserve existing export schema.

3. Lexical index build
   - Input: source units plus separated lexical source layers.
   - Output: `data/lexical/token-indexes/...`, `data/lexical/occurrences/<work_id>.json`, reports.
   - Constraint: preserve per-row source/license metadata.

4. Route-local lexical payload write
   - Input: one work token index plus lexical source-layer entries.
   - Output: `data/lexical/<work_id>.manifest.json`, `data/lexical/<work_id>-chunks/*.json`.
   - Implemented first-stage tool: `scripts/write_lexical_payloads.mjs`.

5. Static page render
   - Input: source file, overlay file, occurrence file, lexical manifest URL.
   - Output: `<work_slug>/index.html`.
   - Target: route-local render only.

6. Public lexical/search/stats exports
   - Input: token indexes, manifests/chunks, source metadata.
   - Output: `data/public-lexical/*`, `data/search/*`, `corpus_stats.json`, `stats/index.html`.

7. Validation
   - Source/source-unit validation.
   - Lexical DOM validation.
   - Generated JavaScript syntax checks.
   - `git diff --check`.

## Migration Phases

### Phase 1: Decouple Lexical Payload Writes

Status: started.

Implemented:

- `scripts/write_lexical_payloads.mjs`
- It writes per-work lexical manifests/chunks directly from per-work token indexes and separated lexical source-layer files.
- It preserves the existing manifest/chunk schema expected by public pages.
- It mirrors the renderer's primary/secondary source-row filtering so source rows stay tied to rendered claims.

Why this matters:

- Missing or stale lexical payloads can now be repaired in seconds per batch without re-rendering the work page.
- Interrupted page renders no longer force an all-or-nothing rebuild.

### Phase 2: Add Persistent Work Artifact Graph

Next implementation target.

Add `data/build/work-artifact-graph.json` generated from:

- source file hash
- overlay file hash
- token index hash
- occurrence file hash
- lexical manifest hash
- page HTML hash
- public lexical export hash

Each work node should record:

- `work_id`
- `work_slug`
- `source_hash`
- `overlay_hash`
- `token_index_hash`
- `occurrence_hash`
- `lexical_manifest_hash`
- `html_hash`
- `depends_on`
- `invalidated_phases`

### Phase 3: Targeted Queues

Create phase-specific queue files:

- `.build-queue/source-import.txt`
- `.build-queue/overlay-export.txt`
- `.build-queue/lexical-cache.txt`
- `.build-queue/lexical-payload.txt`
- `.build-queue/render.txt`
- `.build-queue/public-export.txt`

Each queue should be resumable and append-only for interrupted sessions.

### Phase 4: Persistent Token/Claim Store

Preferred store:

- SQLite if a bundled dependency is available without install friction.
- DuckDB if already available.
- Otherwise, newline JSON shards with deterministic primary keys until a DB dependency is safe.

Minimum schema:

- `works(work_id, work_slug, work_title, category, source_hash, updated_at)`
- `units(work_id, unit_id, anchor_id, source_ref, text_hash)`
- `tokens(work_id, unit_id, paragraph_index, token_index, token_index_id, surface, normalized)`
- `claims(entry_id, hebrew_word, status, source_family, source_id, license, renderings_hash)`
- `token_claims(work_id, token_index_id, entry_id, confidence, status, match_method)`
- `sources(source_family, source_id, source_name, source_url, license, license_url)`
- `artifact_hashes(work_id, artifact_type, path, hash, generated_at)`

### Phase 5: Parallel Workers

Parallelizable phases:

- lexical payload writes by work
- per-work coverage reports
- per-work unresolved CSVs
- per-work page render once route-local render is split out
- per-work public lexical CSV exports

Non-parallel or limited-concurrency phases:

- Sefaria network imports, because remote API failures/rate limits are common.
- Git operations.
- Full-site root overlay export and sitewide public index merge.

### Phase 6: Compressed Occurrence Payloads

Current occurrence files remain JSON for static-host compatibility.

Next safe compression step:

- keep `data/lexical/occurrences/<work_id>.json` for validation/debug
- add optional `*.json.br` or `*.json.gz` during deploy only if hosting supports it
- do not require compressed assets for correctness

## Cache Strategy

Use deterministic hashes:

- Source hash: normalized JSON of `data/sources/<work_id>.json`.
- Token hash: normalized JSON of the per-work token index.
- Claim hash: source-layer file hashes plus `lexicon.json` layer manifest.
- Page hash: source hash + overlay hash + occurrence hash + lexical manifest hash + renderer script hash.
- Public export hash: all included manifests/chunks + export script hash.

Invalidation rules:

- Source changed: invalidate overlay, lexical cache, lexical payload, page, reports, public export.
- Lexical source layer changed: invalidate lexical cache, lexical payload, reports, public export; page rerender only if embedded labels/scripts changed.
- Token index changed: invalidate lexical payload, reports, public export.
- Manifest/chunk missing: invalidate lexical payload only.
- Renderer changed: invalidate page render only.
- Export script changed: invalidate public export only.

## Estimated Rebuild-Time Reductions

Based on the Halakhah interruption:

- PowerShell targeted render for 22 large works: multi-hour and interrupt-prone.
- Node route-local lexical payload write for those 22 works: 17 seconds.
- Expected savings for lexical payload repair: >99%.
- Expected savings once page render is route-local and hash-gated: avoid full-site page writes entirely for source/lexical-only changes.

## Validation Strategy

Every incremental phase must preserve the existing validators:

- `powershell -ExecutionPolicy Bypass -File .\scripts\validate_sources.ps1`
- `powershell -ExecutionPolicy Bypass -File .\scripts\validate_lexical_dom.ps1`
- generated JS syntax checks
- `git diff --check`
- `git diff --cached --check`

Additional Gen-2 validation should check:

- every imported work has source, overlay, occurrence, token index, manifest, chunks, page
- every manifest chunk URL exists
- every chunk source row has license metadata
- every rendered token id in occurrence files exists in the per-work token index
- no source text codepoint changes during rebuild-only phases

## First Concrete Stage Completed

The new `scripts/write_lexical_payloads.mjs` is the first infrastructure leverage point. It completed the missing Halakhah lexical manifests/chunks after the interrupted render, without re-running the full PowerShell renderer.

Recommended next commit after the Halakhah batch:

- add `scripts/generate_build_graph.mjs`
- write `data/build/work-artifact-graph.json`
- make every future build step consume work-id queues generated from that graph
