// The chain book is a recording of the cards (tools/card-readings-v1.mjs, tools/build-chain-book-v2.mjs), so the
// round reads it where the page is whole: after the records and the lines, before the door. The search index, which
// the old chain step also baked, gets a step of its own where that step stood. The address check and the pipeline's
// first note name the new builder; and one comment of the page that still named the chapter check's old version
// names the one that stands.
// node 40-the-chain-is-read-off-the-cards.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "zone.html"), [
  [`  // named chOf, as check-chapter-pages-v2's helper is, because that one`,
   `  // named chOf, as check-chapter-pages-v3's helper is, because that one`],
]);

edit(join(R, "tools", "round-v1.sh"), [
  [`# from. A round that cannot read the lines stops there, before the door.
`,
   `# from. A round that cannot read the lines stops there, before the door.
# The chain step needs the same browser: a chained book's links are what
# each word's card prints, read off the page with every word pressed
# (tools/build-chain-book-v2.mjs), so it runs where the page is whole,
# after the records and the lines.
`],
  [`#             [--steps zones,stamps,chain,records,lines,door]   (default: all, in that order)`,
   `#             [--steps zones,stamps,search,records,lines,chain,door]   (default: all, in that order)`],
  [`STAMP=""; LATTICE=""; STEMS=""; STEPS="zones,stamps,chain,records,lines,door"`,
   `STAMP=""; LATTICE=""; STEMS=""; STEPS="zones,stamps,search,records,lines,chain,door"`],
  [`if has chain; then
  echo "── chain · the chain books, from the zones they print ──────────────────"
  # which books have a chain book is the chain's own folder, never a list here
  for d in ../chain/*/; do
    b="$(basename "$d")"
    [ -f "data/zones/$b.bin" ] || continue
    node tools/build-chain-book-v1.mjs --zone "data/zones/$b.bin" --out "../chain/$b" > /dev/null
  done
  node tools/bake-search-index-v1.mjs > /dev/null
  node tools/build-chain-book-v1.mjs --index --dir ../chain > /dev/null
fi
`,
   `if has search; then
  echo "── search · the index the search box reads, from the zones as they stand ─"
  node tools/bake-search-index-v1.mjs > /dev/null
fi
`],
  [`if has door; then
  echo "── door · the front door and every book's own pages ────────────────────"`,
   `if has chain; then
  echo "── chain · the chain books, each word pressed and its card read ────────"
  # which books have a chain book is the chain's own folder, never a list
  # here. A file still of this tree is kept as it is; a book whose page or
  # files have moved is read again, and the index is not written over one
  # that is not of this tree.
  node tools/build-chain-book-v2.mjs > "$WORK/chain.log" 2>&1 || { echo "round-v1: the chain was not read" >&2; grep -E "^FAIL" "$WORK/chain.log" >&2 || true; tail -3 "$WORK/chain.log" >&2; exit 1; }
  tail -2 "$WORK/chain.log" | head -1
fi

if has door; then
  echo "── door · the front door and every book's own pages ────────────────────"`],
]);

edit(join(R, "tools", "check-clean-address-v1.mjs"), [
  [`    // not live under deploy-root — it is published beside the engine, from
    // the zones and the route store, by tools/build-chain-book-v1.mjs — so
    // it is asked for where it actually stands.`,
   `    // not live under deploy-root — it is published beside the engine, read
    // off the reading page by tools/build-chain-book-v2.mjs — so
    // it is asked for where it actually stands.`],
  [`so it must be built: node tools/build-chain-book-v1.mjs --index\`);`,
   `so it must be built: node tools/build-chain-book-v2.mjs\`);`],
]);

edit(join(R, "PIPELINE.md"), [
  [`under every chapter is that recording, and the door refuses one that is not
> of the tree it builds from. \`PIPELINE-MANIFEST.md\` is generated from the code and the`,
   `under every chapter is that recording, and the door refuses one that is not
> of the tree it builds from. Since 13 November the chain books are a
> recording of the same kind (\`tools/build-chain-book-v2.mjs\`, \`../chain/\`):
> every word of a chained book is pressed and the card the page opens is
> read, and the chain's index is not written over a book that is not of the
> tree. \`PIPELINE-MANIFEST.md\` is generated from the code and the`],
]);
