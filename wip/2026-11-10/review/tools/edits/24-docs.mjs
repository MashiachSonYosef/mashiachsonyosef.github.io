// The documents that say how the site is made, made true: the build script's header and its broken
// second stage, the pipeline document's first claim, and the README the door writes.
// node 24-docs.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];
edit(join(R, "build.sh"), [
[`# The Tabernacle · synthesis lane · one pass, sources to site
#
# Every published byte that has a generator comes out of this file, and the
# ones that do not are named by tools/pipeline-manifest-v1.mjs at the end of
# every run rather than left for somebody to discover. There is no step that
# edits a zone after it is written, and no step that reaches for anything the
# corpus lane has not sealed. Run it twice on the same inputs and the outputs
# are byte-identical; that is the whole point of it existing.`,
 `# The Tabernacle · synthesis lane · the plan tier's build, sources to site
#
# WHAT THIS IS TODAY (10 November 2026). This file builds the works of the
# plan's tier from the corpus lane's sealed workspace: serve, zone,
# commentary, site. It needs that workspace (a mirror of the sealed corpus)
# and so does not run on a checkout. It is not how the bytes the site
# publishes today are made. The served shelf was built by the route builders
# (tools/serve-from-restore-v5.mjs for the thirty-nine books, tools/serve-
# edition-v1.mjs for an edition work), which need the corpus lane's files
# too, and every served zone has since been written again, many times, by
# the projections tools/round-v1.sh runs and by a few tools run by hand when
# their input arrived. Each of those writes is typed on the zone it changed,
# and tools/pipeline-manifest-v1.mjs reads them back off the bins: its last
# table says which tool wrote which bins and whether a build file runs it.
#
# The paragraph that stood here until that day said every published byte
# with a generator came out of this file and that no step edits a zone after
# it is written. Both were true in August and neither is now, and the second
# stage below had stood broken since a line was put inside its command: it
# ran the store's manifest and then tried to run two unset names as a
# program.
#
# Within its own tier the law is unchanged: no step here edits a zone after
# it is written, and nothing reaches for what the corpus lane has not
# sealed.`],
[`[ -f data/route-store/index.json ] || node tools/build-route-store.mjs \\
# and the pin over what it built: every store file by exact bytes and sha256
node tools/emit-store-manifest-v1.mjs
  "$DEFPOC_RDM" "$DEFPOC_BREADTH" --out data/route-store`,
 `# (the two packages are named in the environment by whoever holds them; a
# checkout that carries the store does not need them)
[ -f data/route-store/index.json ] || node tools/build-route-store.mjs \\
  "\${DEFPOC_RDM:?the sealed RDM definition package}" "\${DEFPOC_BREADTH:?the sealed breadth package}" --out data/route-store
# and the pin over what it built: every store file by exact bytes and sha256
node tools/emit-store-manifest-v1.mjs`],
]);
edit(join(R, "PIPELINE.md"), [
[`# The Tabernacle · synthesis lane · the pipeline

Run \`./build.sh\` and every published byte is rebuilt from sealed inputs. Run it
twice and the outputs are byte-identical. Nothing here edits a zone after it is
written, and nothing reaches for text the corpus lane has not sealed.

Recorded 2026-08-15. Component layer and the deep catalog added 2026-08-16.`,
 `# The Tabernacle · synthesis lane · the pipeline

> **Read this first (10 November 2026).** This document records the pipeline
> as it stood in August 2026, and its opening claim is no longer true of the
> site. \`build.sh\` builds the plan tier's works from the corpus lane's
> workspace and does not run on a checkout. What the site publishes today is
> made in two steps: a route builder writes a work's zone once, from the
> corpus lane's text; and \`tools/round-v1.sh\` projects every served zone
> again over the records this repository holds, each write typed on the zone
> it changes. \`PIPELINE-MANIFEST.md\` is generated from the code and the
> published bins on every round and says what is declared, what is guarded,
> and which tool wrote which bins. The sections below are kept as the record
> of why the rules are what they are.

As recorded on 2026-08-15: run \`./build.sh\` and every published byte is
rebuilt from sealed inputs. Run it twice and the outputs are byte-identical.
Nothing here edits a zone after it is written, and nothing reaches for text
the corpus lane has not sealed.

Recorded 2026-08-15. Component layer and the deep catalog added 2026-08-16.`],
]);
edit(join(R, "tools", "build-front-door-v1.mjs"), [
[`\\\`\\\`\\\`
cd \${ENGINE}
./build.sh <mirror> <bridge.csv.gz> <serves> <YYYY-MM-DD>
tools/run-all-checks.sh
\\\`\\\`\\\`

The build runs from sealed inputs and is re-runnable: the same inputs give the
same bytes. The checks run against the rendered page rather than the source.`,
 `\\\`\\\`\\\`
cd \${ENGINE}
tools/round-v1.sh --stamp <YYYY-MM-DD> [--lattice <folder> --stems <folder>]
tools/run-all-checks.sh
\\\`\\\`\\\`

A work's text is built once, by its route builder, from the corpus lane's
sealed text; that step needs the corpus lane's files. Everything a page says
about the text is projected from the records in this repository by the round,
which is re-runnable: the same inputs and the same date give the same bytes.
The checks run against the rendered page rather than the source.`],
]);
