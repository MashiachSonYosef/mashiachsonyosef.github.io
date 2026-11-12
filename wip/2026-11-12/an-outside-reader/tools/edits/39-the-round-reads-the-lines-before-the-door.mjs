// The door prints, under every chapter, the lines the reader itself draws, from a record read off the page
// (tools/bake-resting-lines-v1.mjs), and refuses a record that is not of the tree it builds from. So the round reads
// the lines before it builds the door: a step of its own, after the records and before the door.
// node 39-the-round-reads-the-lines-before-the-door.mjs <reader dir>
import { join } from "node:path";
import { edit } from "./lib.mjs";
const R = process.argv[2];

edit(join(R, "tools", "round-v1.sh"), [
  [`# WHAT IT NEEDS FROM OUTSIDE THE TREE, and only these: the corpus lane's
# lattice (one file per book) and its two binyan files, which are too large
# to keep beside the door. They are named on the command line and never
# guessed; a round with no lattice re-projects nothing and says so.
`,
   `# WHAT IT NEEDS FROM OUTSIDE THE TREE, and only these: the corpus lane's
# lattice (one file per book) and its two binyan files, which are too large
# to keep beside the door. They are named on the command line and never
# guessed; a round with no lattice re-projects nothing and says so. And, for
# the lines step, a browser this machine can open (tools/playwright-v1.mjs):
# the plain list under every chapter is a recording of the lines the reader
# itself draws, read off the page (tools/bake-resting-lines-v1.mjs), and the
# door refuses a recording that is not of the page and the files it builds
# from. A round that cannot read the lines stops there, before the door.
`],
  [`#             [--steps zones,stamps,chain,records,door]   (default: all, in that order)`,
   `#             [--steps zones,stamps,chain,records,lines,door]   (default: all, in that order)`],
  [`STAMP=""; LATTICE=""; STEMS=""; STEPS="zones,stamps,chain,records,door"`,
   `STAMP=""; LATTICE=""; STEMS=""; STEPS="zones,stamps,chain,records,lines,door"`],
  [`if has door; then
  echo "── door · the front door and every book's own pages ────────────────────"`,
   `if has lines; then
  echo "── lines · what the reader draws as each work opens, read off the page ─"
  # a record still of this tree is kept as it is; a work whose page or files
  # have moved is read again. The door, next, refuses any that is not.
  node tools/bake-resting-lines-v1.mjs > "$WORK/lines.log" 2>&1 || { echo "round-v1: the resting lines were not read" >&2; grep -E "^FAIL" "$WORK/lines.log" >&2 || true; tail -3 "$WORK/lines.log" >&2; exit 1; }
  tail -1 "$WORK/lines.log"
fi

if has door; then
  echo "── door · the front door and every book's own pages ────────────────────"`],
]);

edit(join(R, "PIPELINE.md"), [
  [`again over the records this repository holds, each write typed on the zone
> it changes. \`PIPELINE-MANIFEST.md\` is generated from the code and the`,
   `again over the records this repository holds, each write typed on the zone
> it changes. Since 12 November 2026 the round also opens the reader itself
> and keeps the lines it draws as each work first opens
> (\`tools/bake-resting-lines-v1.mjs\`, \`data/resting-lines/\`): the plain list
> under every chapter is that recording, and the door refuses one that is not
> of the tree it builds from. \`PIPELINE-MANIFEST.md\` is generated from the code and the`],
]);
